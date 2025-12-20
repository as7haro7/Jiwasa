# Documentación de Endpoints - JIWASA API

Base URL: `/api`

## 1. Autenticación (`/auth`)

| Método | Endpoint         | Descripción                  | Acceso  |
| ------ | ---------------- | ---------------------------- | ------- |
| `POST` | `/auth/register` | Registrar nuevo usuario      | Público |
| `POST` | `/auth/login`    | Iniciar sesión (retorna JWT) | Público |
| `POST` | `/auth/google`   | Iniciar sesión con Google    | Público |

## 2. Usuarios (`/users`)

| Método | Endpoint    | Descripción                            | Acceso  |
| ------ | ----------- | -------------------------------------- | ------- |
| `GET`  | `/users/me` | Obtener perfil del usuario actual      | Privado |
| `PUT`  | `/users/me` | Actualizar perfil (foto, preferencias) | Privado |

## 3. Lugares (`/lugares`)

| Método   | Endpoint               | Descripción                          | Acceso  |
| -------- | ---------------------- | ------------------------------------ | ------- |
| `GET`    | `/lugares`             | Listar lugares (filtros: zona, tipo) | Público |
| `POST`   | `/lugares`             | Crear lugar                          | Admin   |
| `POST`   | `/lugares/sugerencias` | Sugerir nuevo lugar                  | Privado |
| `GET`    | `/lugares/:id`         | Ver detalles de un lugar             | Público |
| `PUT`    | `/lugares/:id`         | Actualizar lugar                     | Admin   |
| `DELETE` | `/lugares/:id`         | Eliminar/Cerrar lugar                | Admin   |

## 4. Platos (`/lugares/:lugarId/platos` y `/platos`)

| Método   | Endpoint                   | Descripción              | Acceso  |
| -------- | -------------------------- | ------------------------ | ------- |
| `GET`    | `/lugares/:lugarId/platos` | Ver menú de un lugar     | Público |
| `POST`   | `/lugares/:lugarId/platos` | Agregar plato a un lugar | Admin   |
| `PUT`    | `/platos/:id`              | Actualizar plato         | Admin   |
| `DELETE` | `/platos/:id`              | Eliminar plato           | Admin   |

## 5. Reseñas (`/lugares/:lugarId/resenas` y `/resenas`)

| Método | Endpoint                    | Descripción             | Acceso  |
| ------ | --------------------------- | ----------------------- | ------- |
| `GET`  | `/lugares/:lugarId/resenas` | Ver reseñas de un lugar | Público |
| `POST` | `/lugares/:lugarId/resenas` | Publicar reseña         | Privado |
| `POST` | `/resenas/:id/util`         | Marcar reseña como útil | Privado |

## 6. Promociones (`/lugares/:lugarId/promociones` y `/promociones`)

| Método | Endpoint                        | Descripción                  | Acceso  |
| ------ | ------------------------------- | ---------------------------- | ------- |
| `GET`  | `/lugares/:lugarId/promociones` | Ver promociones de un lugar  | Público |
| `POST` | `/lugares/:lugarId/promociones` | Crear promoción              | Admin   |
| `GET`  | `/promociones/activas`          | Ver todas las promos activas | Público |
| `PUT`  | `/promociones/:id`              | Editar promoción             | Admin   |

## 7. Favoritos (`/favoritos`)

| Método   | Endpoint                    | Descripción                  | Acceso  |
| -------- | --------------------------- | ---------------------------- | ------- |
| `GET`    | `/favoritos`                | Listar mis lugares favoritos | Privado |
| `POST`   | `/favoritos`                | Agregar lugar a favoritos    | Privado |
| `DELETE` | `/favoritos/lugar/:lugarId` | Eliminar lugar de favoritos  | Privado |

## 8. Reportes (`/reportes`)

| Método | Endpoint        | Descripción                  | Acceso  |
| ------ | --------------- | ---------------------------- | ------- |
| `POST` | `/reportes`     | Reportar un lugar o reseña   | Privado |
| `GET`  | `/reportes`     | Ver reportes                 | Admin   |
| `PUT`  | `/reportes/:id` | Actualizar estado de reporte | Admin   |
