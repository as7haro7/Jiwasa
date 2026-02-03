
import { spawn } from 'child_process';
import http from 'http';

const API_PORT = 4001;
const API_PREFIX = '/api';

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: API_PORT,
            path: API_PREFIX + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 2000
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request context timeout'));
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTest() {
    console.log('Starting verification test...');

    // Start backend server on port 4001 with 5s expiration
    const server = spawn('node', ['src/index.js'], {
        env: {
            ...process.env,
            PORT: API_PORT.toString(),
            JWT_EXPIRES_IN: '5s',
            JWT_SECRET: 'testsecret'
        },
        cwd: process.cwd(),
        stdio: 'ignore' // Suppress server output to keep test clean, or 'inherit' for debug
    });

    console.log('Server process spawned. Waiting 3s for startup...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        console.log(`1. Registering user: ${email}`);
        const regRes = await request('POST', '/auth/register', {
            nombre: 'Test User',
            email,
            password
        });

        if (regRes.status !== 201) {
            console.error('Registration failed body:', regRes.body);
            throw new Error(`Registration failed with status ${regRes.status}`);
        }
        console.log('   Registration successful.');

        const token = regRes.body.token;
        if (!token) throw new Error('No token received');

        console.log('2. Verifying immediate access (should succeed)...');
        const access1 = await request('GET', '/users/me', null, token);

        if (access1.status !== 200) {
            console.error('Immediate access failed body:', access1.body);
            throw new Error(`Immediate access failed with status ${access1.status}`);
        }
        console.log('   Immediate access successful (200 OK).');

        console.log('3. Waiting 6 seconds for token expiration...');
        await new Promise((resolve) => setTimeout(resolve, 6000));

        console.log('4. Verifying access after expiration (should fail)...');
        const access2 = await request('GET', '/users/me', null, token);

        if (access2.status === 401) {
            console.log('   SUCCESS: Access denied with 401 as expected.');
        } else {
            console.error('Access after expiration response:', access2.body);
            throw new Error(`Expected 401 but got ${access2.status}`);
        }

        console.log('VERIFICATION PASSED!');

    } catch (error) {
        console.error('VERIFICATION FAILED:', error.message);
        process.exitCode = 1;
    } finally {
        console.log('Killing test server...');
        server.kill();
    }
}

runTest();
