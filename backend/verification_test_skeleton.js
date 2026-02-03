
import { spawn } from 'child_process';
import http from 'http';

const API_URL = 'http://localhost:4001/api';

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 4001,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
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
            PORT: '4001',
            JWT_EXPIRES_IN: '5s',
            JWT_SECRET: 'testsecret'
        },
        cwd: process.cwd(),
        stdio: 'inherit' // Show output
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        console.log(`Registering user: ${email}`);
        const regRes = await request('POST', '/auth/register', {
            nombre: 'Test User',
            email,
            password
        });

        if (regRes.status !== 201) {
            throw new Error(`Registration failed: ${regRes.status} - ${JSON.stringify(regRes.body)}`);
        }

        const token = regRes.body.token;
        console.log('Token obtained. Verifying immediate access...');

        // Access protected route (e.g., /users/me or via authMiddleware check)
        // We don't have /users/me defined in the list I saw earlier? 
        // Wait, AuthContext calls /users/me. Let's check routes.
        // userRoutes.js usually has it.

        // Let's assume there is a protected route. Or use one.
        // userController has what?

    } catch (error) {
        console.error('Test Setup Failed:', error);
        server.kill();
        process.exit(1);
    }

    // Clean up
    server.kill();
}

// I need to check if /users/me exists or what protected route exists.
// Viewing userRoutes.js first.
