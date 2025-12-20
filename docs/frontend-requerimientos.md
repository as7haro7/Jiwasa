# Requisitos del Frontend – JIWASA

## 1. Descripción general

El frontend de **JIWASA** es una aplicación web desarrollada con **Next.js** que permite a usuarios de La Paz y turistas descubrir puestos callejeros, mercados, restaurantes y cafés de la ciudad, visualizar su ubicación en un mapa, consultar reseñas, menús y promociones, y aportar contenido mediante reseñas y sugerencias.[1][2]

La app consumirá la API REST del backend (Node + Express + MongoDB) previamente definida.

---

## 2. Alcance del frontend

- Plataforma: Web responsive (desktop, tablet, móvil).
- Público objetivo:
  - Habitantes de La Paz que buscan comida cercana, económica o típica.
  - Turistas que desean explorar comida callejera paceña (salteñas, api, anticuchos, etc.).[3][4]
- Ubicación: La aplicación está centrada exclusivamente en **La Paz – Bolivia**, usando nombres de zonas, mercados y platos locales.[5][6]

---

## 3. Requerimientos funcionales del frontend (RF-F)

### 3.1. Navegación y estructura

- **RF-F1 – Página principal (Home)**

  - Debe existir una página `/` que muestre:
    - Un **mapa de La Paz** con markers de lugares de comida.
    - Una **lista** de lugares con datos básicos (nombre, tipo, zona, rating promedio, rango de precios y una foto).[2][1]

- **RF-F2 – Página de detalle del lugar**

  - Debe existir una página `/lugares/[id]` que muestre:
    - Información completa del lugar (nombre, tipo, dirección, zona, horario, descripción, rango de precios).
    - Ubicación en mapa centrada en el lugar.
    - Menú/platos asociados, con nombre, descripción, precio y categoría.
    - Reseñas con rating, comentario y fotos (si existen).
    - Promociones activas del lugar.[7][2]

- **RF-F3 – Páginas de autenticación**

  - Deben existir páginas:
    - `/auth/register` para registro de usuarios.
    - `/auth/login` para inicio de sesión.
  - Deben validar formularios (campos requeridos, formato de email) antes de enviar al backend.

- **RF-F4 – Página de perfil de usuario**
  - Debe existir una página `/perfil` donde el usuario autenticado pueda:
    - Ver y editar sus datos básicos (nombre, foto).
    - Ver su lista de **favoritos**.
    - Ver sus reseñas realizadas.

---

### 3.2. Mapa y geolocalización

- **RF-F5 – Visualización de mapa**

  - La página principal debe integrar **React-Leaflet** con tiles de **OpenStreetMap** para mostrar un mapa centrado en La Paz con markers de lugares de comida.[8][9]

- **RF-F6 – Interacción con markers**

  - Al hacer clic en un marker, se debe mostrar un popup con:
    - Nombre del lugar.
    - Rating promedio.
    - Botón/enlace “Ver detalle” que navegue a `/lugares/[id]`.

- **RF-F7 – Mi ubicación**
  - Si el usuario da permiso al navegador, la app debe:
    - Obtener la ubicación actual y centrar el mapa aproximadamente en su posición.
    - Opcionalmente, priorizar en la lista los lugares cercanos (cuando el backend lo soporte).

---

### 3.3. Búsqueda, filtros y listas

- **RF-F8 – Búsqueda por texto**

  - Debe haber una barra de búsqueda en la página principal que permita:
    - Buscar por nombre de lugar.
    - Buscar por tipo de comida (ej. “salteñas”, “anticuchos”).[10][2]

- **RF-F9 – Filtros de lugares**

  - La interfaz debe permitir filtrar la lista/mapa por:
    - Zona (Centro, Sopocachi, Miraflores, San Pedro, etc.).[6][5]
    - Tipo de lugar (callejero, mercado, restaurante, café).
    - Rango de precios (bajo, medio, alto).
    - Rating mínimo (ej. solo lugares con >= 4 estrellas).

- **RF-F10 – Actualización dinámica**
  - Al cambiar filtros o términos de búsqueda, la lista y el mapa deben actualizarse sin recargar toda la página (interacción SPA).

---

### 3.4. Reseñas, menús y promociones

- **RF-F11 – Visualización de reseñas**

  - En la página de detalle de un lugar, se debe mostrar:
    - Listado de reseñas con nombre/alias del usuario, rating, comentario, fecha y fotos si existen.
    - Soporte para paginación o botón “cargar más reseñas”.[11][12]

- **RF-F12 – Creación de reseñas**

  - Usuarios autenticados deben poder:
    - Crear reseñas desde un formulario en la página del lugar (rating 1–5, comentario, fotos opcionales).
    - Ver mensajes claros de éxito o error según respuesta del backend.

- **RF-F13 – Menú / platos del lugar**

  - En la ficha del lugar se debe:
    - Mostrar lista de platos con nombre, descripción, precio y categoría (desayuno, almuerzo, snack, etc.).[13][2]

- **RF-F14 – Promociones**
  - Si el backend indica que hay promociones activas para el lugar:
    - Deben visualizarse claramente con título, descripción y fechas de vigencia.
    - Opcional: destacar visualmente las promos en la lista de lugares (icono o etiqueta).

---

### 3.5. Participación del usuario

- **RF-F15 – Registro e inicio de sesión**

  - El frontend debe:
    - Permitir registro y login usando formularios conectados con la API.
    - Guardar de forma segura el token JWT (modo exacto a definir en la implementación).

- **RF-F16 – Favoritos**

  - En la ficha del lugar, el usuario autenticado debe poder:
    - Marcar/desmarcar el lugar como favorito.
  - En la página de perfil se debe mostrar la lista de lugares favoritos.

- **RF-F17 – Sugerir nuevos lugares**
  - Debe existir un formulario (accesible desde el menú o la portada) para que usuarios autentificados sugieran nuevos lugares en La Paz, indicando:
    - Nombre del lugar.
    - Tipo (callejero, mercado, restaurante, etc.).
    - Zona y dirección.
    - Ubicación aproximada seleccionando un punto en el mapa.
    - Descripción breve y tipos de comida.

---

## 4. Requerimientos no funcionales del frontend (RNF-F)

### 4.1. Usabilidad y experiencia de usuario

- **RNF-F1 – Responsive design**

  - La interfaz debe funcionar correctamente en:
    - Teléfonos móviles (Android gama media, resolución típica 360×640).
    - Tablets.
    - Escritorios.[14][2]

- **RNF-F2 – Lenguaje y contexto local**

  - Todo el texto de la interfaz debe estar en español.
  - Deben usarse nombres reales de zonas paceñas y mercados conocidos (ej. Mercado Lanza, Mercado Rodríguez).[5][6]
  - Formatos orientados a Bolivia:
    - Moneda en bolivianos (Bs).
    - Horario en formato 24 horas.
    - Direcciones con estilo local (“esquina de…”, “cerca de la Plaza Murillo”).

- **RNF-F3 – Claridad visual**
  - La información clave (tipo, zona, horario, precio y rating) debe ser visible rapidamente sin navegar por varias pantallas.[15][14]

### 4.2. Rendimiento

- **RNF-F4 – Tiempo de carga**

  - La página inicial (lista + mapa) debe cargar en menos de ~3 segundos en una conexión móvil 4G promedio de La Paz, con una cantidad razonable de lugares por defecto.[16][17]

- **RNF-F5 – Interacción fluida**
  - El mapa y la lista deben reaccionar sin bloqueos perceptibles al aplicar filtros, hacer zoom o moverse por el mapa.

### 4.3. Seguridad

- **RNF-F6 – Manejo de autenticación**

  - El frontend no debe exponer credenciales sensibles ni secretos de backend.
  - Debe manejar tokens JWT de manera que se minimice el riesgo de XSS (decisión concreta se detalla en el diseño técnico).

- **RNF-F7 – Validación en cliente**
  - Formularios clave (registro, login, reseñas, sugerencias) deben validar campos antes de llamar al backend para evitar envíos con datos vacíos o claramente incorrectos.[18]

### 4.4. Mantenibilidad

- **RNF-F8 – Organización del código**

  - El frontend debe:
    - Usar componentes reutilizables (`MapView`, `LugarCard`, `FilterBar`, `ReviewList`, etc.).[1][14]
    - Separar la lógica de llamadas a la API en módulos o hooks (`useLugares`, `useAuth`, etc.).

- **RNF-F9 – Configuración**
  - URLs base del backend (ej. `NEXT_PUBLIC_API_URL`) deben ir en variables de entorno para facilitar despliegue en distintos entornos (desarrollo, producción).
