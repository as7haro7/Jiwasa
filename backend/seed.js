
import dotenv from "dotenv";
import { sequelize } from "./src/config/db.js";
import { User, Place, Dish, Review, Favorite, Promotion, SponsoredPlacement } from "./src/models/associations.js";

dotenv.config();

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL para seeding...");

    // Enable PostGIS extension for geometry types
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    console.log("Extensión PostGIS habilitada.");

    // Force sync to drop tables and recreate them
    await sequelize.sync({ force: true });
    console.log("Tablas creadas.");

    // 1) Usuarios
    const usersData = [
      {
        nombre: "Carlos Mamani",
        email: "carlos@jiwasa.com",
        password: "password123", // Will be hashed by hook
        authProvider: "local",
        biografia: "Paceño fan de la comida callejera y mercados.",
        telefono: "+59170123456",
        rol: "usuario",
        fotoPerfil: "",
        preferenciasComida: ["salteñas", "anticuchos", "sopa de maní"],
        esPropietario: false
      },
      {
        nombre: "Doña Rita Anticuchos",
        email: "rita@jiwasa.com",
        password: "password123",
        authProvider: "local",
        biografia: "Atiendo anticuchos en Sopocachi hace más de 20 años.",
        telefono: "+59171111111",
        rol: "usuario",
        fotoPerfil: "",
        preferenciasComida: ["anticuchos", "api con buñuelo"],
        esPropietario: true
      },
      {
        nombre: "Admin Jiwasa",
        email: "erick@jiwasa.com",
        password: "password123",
        authProvider: "local",
        biografia: "Administrador de la plataforma Sabores de La Paz.",
        telefono: "+59170000000",
        rol: "admin",
        fotoPerfil: "",
        preferenciasComida: [],
        esPropietario: false
      },
      {
        nombre: "María Quispe",
        email: "maria@jiwasa.com",
        password: "password123",
        authProvider: "local",
        biografia: "Me encantan los desayunos con api y pastel.",
        telefono: "+59178900001",
        rol: "usuario",
        fotoPerfil: "",
        preferenciasComida: ["api", "pasteles", "sándwich de chola"],
        esPropietario: false
      },
      {
        nombre: "José Fernández",
        email: "jose@jiwasa.com",
        password: "password123",
        authProvider: "local",
        biografia: "Fan de los almuerzos de mercado y sopas calientes.",
        telefono: "+59178900002",
        rol: "usuario",
        fotoPerfil: "",
        preferenciasComida: ["sopa de maní", "chairo", "pique macho"],
        esPropietario: false
      },
      {
        nombre: "Anna Traveler",
        email: "anna.traveler@jiwasa.com",
        password: "password123",
        authProvider: "local",
        biografia: "Turista que está descubriendo la comida callejera de La Paz.",
        telefono: "+59178900003",
        rol: "usuario",
        fotoPerfil: "",
        preferenciasComida: ["street food", "anticuchos", "salchipapas"],
        esPropietario: false
      }
    ];

    // Create users individually to trigger hooks
    const users = [];
    for (const u of usersData) {
        users.push(await User.create(u));
    }
    const [carlos, donaRita, admin, maria, jose, turista] = users;

    // 2) Lugares
    const placesData = [
      {
        propietarioId: donaRita.id,
        nombre: "Anticuchos Doña Rita",
        tipo: "callejero",
        direccion: "Av. 20 de Octubre esquina Aspiazu",
        zona: "Sopocachi",
        coordenadas: { type: "Point", coordinates: [-68.1285, -16.513] },
        descripcion: "Puesto tradicional de anticuchos paceños con papita y ají de maní.",
        tiposComida: ["anticuchos", "comida nocturna", "comida típica", "street food"],
        rangoPrecios: "bajo",
        horario: {
          lunes: { apertura: "18:00", cierre: "23:30", cerrado: false },
          martes: { apertura: "18:00", cierre: "23:30", cerrado: false },
          miercoles: { apertura: "18:00", cierre: "23:30", cerrado: false },
          jueves: { apertura: "18:00", cierre: "23:30", cerrado: false },
          viernes: { apertura: "18:00", cierre: "23:59", cerrado: false },
          sabado: { apertura: "18:00", cierre: "23:59", cerrado: false },
          domingo: { apertura: "19:00", cierre: "22:30", cerrado: true }
        },
        fotos: ["https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800"],
        promedioRating: 4.8,
        cantidadResenas: 15,
        estado: "activo",
        destacado: true,
        nivelVisibilidad: "premium",
        telefonoContacto: "+59171111111",
        emailContacto: "rita.anticuchos@jiwasa.com"
      },
      {
        propietarioId: admin.id,
        nombre: "Salteñería Paceña La Salteña",
        tipo: "restaurante",
        direccion: "Calle Comercio esquina Ayacucho",
        zona: "Centro",
        coordenadas: { type: "Point", coordinates: [-68.133, -16.4975] },
        descripcion: "Salteñas de pollo y carne con ají, jugosas y tradicionales.",
        tiposComida: ["salteñas", "desayuno", "snack", "típico"],
        rangoPrecios: "medio",
        fotos: ["https://images.unsplash.com/photo-1626804475297-411db7015403?w=800"],
        promedioRating: 4.6,
        cantidadResenas: 42,
        estado: "activo",
        destacado: true,
        nivelVisibilidad: "patrocinado",
        telefonoContacto: "+59171234567"
      },
      {
        propietarioId: admin.id,
        nombre: "Comedor Doña Elvira - Mercado Lanza",
        tipo: "mercado",
        direccion: "Mercado Lanza, piso 2, puesto 45",
        zona: "Centro",
        coordenadas: { type: "Point", coordinates: [-68.135, -16.496] },
        descripcion: "Comidas típicas paceñas: sopas, segundos y sándwich de chorizo.",
        tiposComida: ["almuerzo", "sopa de maní", "plato paceño", "fricase", "chairo"],
        rangoPrecios: "bajo",
        fotos: ["https://images.unsplash.com/photo-1547592180-85f173990554?w=800"],
        promedioRating: 4.4,
        cantidadResenas: 8,
        estado: "activo",
        destacado: false,
        nivelVisibilidad: "normal"
      },
      {
        propietarioId: admin.id,
        nombre: "Café Typica",
        tipo: "café",
        direccion: "Calle Enrique Peñaranda, San Miguel",
        zona: "Sur",
        coordenadas: { type: "Point", coordinates: [-68.0799, -16.5408] },
        descripcion: "Café de especialidad con ambiente vintage y postres artesanales.",
        tiposComida: ["café", "postres", "jugos", "masitas"],
        rangoPrecios: "medio",
        fotos: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"],
        promedioRating: 4.7,
        cantidadResenas: 120,
        estado: "activo",
        destacado: true,
        nivelVisibilidad: "normal"
      },
      {
        propietarioId: admin.id,
        nombre: "Las Cholas",
        tipo: "callejero",
        direccion: "Parque de La Florida, Calacoto",
        zona: "Sur",
        coordenadas: { type: "Point", coordinates: [-68.0876, -16.5385] },
        descripcion: "El tradicional sandwich de chola.",
        tiposComida: ["sandwich de chola", "típico"],
        rangoPrecios: "medio",
        fotos: ["https://images.unsplash.com/photo-1550547660-d9450f859349?w=800"],
        promedioRating: 4.6,
        cantidadResenas: 250,
        estado: "activo",
        destacado: true,
        nivelVisibilidad: "premium"
      },
      {
        propietarioId: admin.id,
        nombre: "Api Oruro",
        tipo: "restaurante",
        direccion: "Calle Murillo, Centro",
        zona: "Centro",
        coordenadas: { type: "Point", coordinates: [-68.136, -16.5] },
        descripcion: "El mejor api morado y blanco.",
        tiposComida: ["api", "pastel", "desayuno", "cena", "típico"],
        rangoPrecios: "bajo",
        fotos: ["https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800"],
        promedioRating: 4.5,
        cantidadResenas: 30,
        estado: "activo",
        destacado: false,
        nivelVisibilidad: "normal"
      }
    ];

    const places = [];
    for(const p of placesData) {
        places.push(await Place.create(p));
    }
    const [anticuchosRita, saltenasCentro, comedorLanza, cafeTypica, lasCholas, apiOruro] = places;

    // 3) Platos
    const dishesData = [
      { lugarId: anticuchosRita.id, nombre: "Anticucho de corazón", precio: 12, categoria: "cena", disponible: true },
      { lugarId: anticuchosRita.id, nombre: "Chorizo a la parrilla", precio: 10, categoria: "cena", disponible: true },
      { lugarId: saltenasCentro.id, nombre: "Salteña de carne", precio: 8, categoria: "desayuno", disponible: true },
      { lugarId: saltenasCentro.id, nombre: "Salteña de pollo", precio: 8, categoria: "desayuno", disponible: true },
      { lugarId: comedorLanza.id, nombre: "Sopa de maní", precio: 14, categoria: "almuerzo", disponible: true },
      { lugarId: apiOruro.id, nombre: "Api morado", precio: 6, categoria: "desayuno", disponible: true },
      { lugarId: cafeTypica.id, nombre: "Capuccino", precio: 18, categoria: "bebidas", disponible: true }
    ];

    const dishes = await Dish.bulkCreate(dishesData);
    const [anticucho, chorizo, saltenaCarne, saltenaPollo, sopaMani, apiMorado, capuccino] = dishes;

    // 4) Reseñas
    const reviewsData = [
        { usuarioId: carlos.id, lugarId: anticuchosRita.id, rating: 5, comentario: "Excelente" },
        { usuarioId: maria.id, lugarId: anticuchosRita.id, rating: 4, comentario: "Muy bueno" },
        { usuarioId: turista.id, lugarId: cafeTypica.id, rating: 5, comentario: "Great coffee", util: 4 }
    ];
    await Review.bulkCreate(reviewsData);

    // 5) Favoritos
    const favoritesData = [
        { usuarioId: carlos.id, lugarId: anticuchosRita.id },
        { usuarioId: carlos.id, lugarId: saltenasCentro.id },
        { usuarioId: turista.id, lugarId: cafeTypica.id }
    ];
    await Favorite.bulkCreate(favoritesData);

    console.log("Seed completado.");
    process.exit(0);
  } catch (err) {
    console.error("Error en seed:", err);
    process.exit(1);
  }
}

seed();
