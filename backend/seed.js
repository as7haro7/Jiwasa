import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";

dotenv.config();

// IMPORTA TUS MODELOS REALES (Corrected to English filenames)
import Usuario from "./src/models/User.js";
import Lugar from "./src/models/Place.js";
import Plato from "./src/models/Dish.js";
import Review from "./src/models/Review.js";
import Favorito from "./src/models/Favorite.js";
import Promocion from "./src/models/Promotion.js";
import SponsoredPlacement from "./src/models/SponsoredPlacement.js";


async function seed() {
  try {
    await connectDB();
    // console.log("Conectado a MongoDB"); // connectDB already logs this

    // Limpia colecciones (opcional)
    await Promise.all([
      Usuario.deleteMany({}),
      Lugar.deleteMany({}),
      Plato.deleteMany({}),
      Review.deleteMany({}),
      Favorito.deleteMany({}),
      Promocion.deleteMany({}),
      SponsoredPlacement.deleteMany({})
    ]);

    // 1) Usuarios
    const [carlos, donaRita, admin] = await Usuario.insertMany([
      {
        nombre: "Carlos Mamani",
        email: "carlos@jiwasa.com",
        password: "$2b$10$QYPflmw6F0wEIHtb9efDa.x1StKsYgFR4F18QPa3ZedV24U0nU/vC",
        // googleId: null, // Removed to avoid unique index conflict if sparse doesn't handle explicit nulls well in this setup
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
        password: "$2b$10$QYPflmw6F0wEIHtb9efDa.x1StKsYgFR4F18QPa3ZedV24U0nU/vC",
        // googleId: null,
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
        password: "$2b$10$QYPflmw6F0wEIHtb9efDa.x1StKsYgFR4F18QPa3ZedV24U0nU/vC",
        // googleId: null,
        authProvider: "local",
        biografia: "Administrador de la plataforma Sabores de La Paz.",
        telefono: "+59170000000",
        rol: "admin",
        fotoPerfil: "",
        preferenciasComida: [],
        esPropietario: false
      }
    ]);

    // 2) Lugares
    const [anticuchosRita, saltenasCentro, comedorLanza, cafeTypica, lasCholas, apiOruro] = await Lugar.insertMany([
      {
        propietarioId: donaRita._id,
        nombre: "Anticuchos Doña Rita",
        tipo: "callejero",
        direccion: "Av. 20 de Octubre esquina Aspiazu",
        zona: "Sopocachi",
        coordenadas: {
          type: "Point",
          coordinates: [-68.1285, -16.5130]
        },
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
        emailContacto: "rita.anticuchos@jiwasa.com",
        sitioWeb: "",
        redesSociales: { instagram: "https://instagram.com/anticuchos_dona_rita" }
      },
      {
        propietarioId: admin._id,
        nombre: "Salteñería Paceña La Salteña",
        tipo: "restaurante",
        direccion: "Calle Comercio esquina Ayacucho",
        zona: "Centro",
        coordenadas: {
          type: "Point",
          coordinates: [-68.1330, -16.4975]
        },
        descripcion: "Salteñas de pollo y carne con ají, jugosas y tradicionales.",
        tiposComida: ["salteñas", "desayuno", "snack", "típico"],
        rangoPrecios: "medio",
        horario: {
            lunes: { apertura: "08:00", cierre: "13:00", cerrado: false },
            martes: { apertura: "08:00", cierre: "13:00", cerrado: false },
            miercoles: { apertura: "08:00", cierre: "13:00", cerrado: false },
            jueves: { apertura: "08:00", cierre: "13:00", cerrado: false },
            viernes: { apertura: "08:00", cierre: "13:00", cerrado: false },
            sabado: { apertura: "08:00", cierre: "12:00", cerrado: false },
            domingo: { apertura: "00:00", cierre: "00:00", cerrado: true }
        },
        fotos: ["https://images.unsplash.com/photo-1626804475297-411db7015403?w=800"], // Generic empanada/salteña
        promedioRating: 4.6,
        cantidadResenas: 42,
        estado: "activo",
        destacado: true,
        nivelVisibilidad: "patrocinado",
        telefonoContacto: "+59171234567",
        emailContacto: "contacto@lasaltena.com",
        sitioWeb: "https://lasaltena.com",
        redesSociales: { facebook: "https://facebook.com/lasaltena" }
      },
      {
        propietarioId: admin._id,
        nombre: "Comedor Doña Elvira - Mercado Lanza",
        tipo: "mercado",
        direccion: "Mercado Lanza, piso 2, puesto 45",
        zona: "Centro",
        coordenadas: {
          type: "Point",
          coordinates: [-68.1350, -16.4960]
        },
        descripcion: "Comidas típicas paceñas: sopas, segundos y sándwich de chorizo.",
        tiposComida: ["almuerzo", "sopa de maní", "plato paceño", "fricase", "chairo"],
        rangoPrecios: "bajo",
        horario: {
            lunes: { apertura: "07:00", cierre: "16:00", cerrado: false },
            martes: { apertura: "07:00", cierre: "16:00", cerrado: false },
            miercoles: { apertura: "07:00", cierre: "16:00", cerrado: false },
            jueves: { apertura: "07:00", cierre: "16:00", cerrado: false },
            viernes: { apertura: "07:00", cierre: "16:00", cerrado: false },
            sabado: { apertura: "07:00", cierre: "16:00", cerrado: false },
            domingo: { apertura: "07:00", cierre: "14:00", cerrado: false }
        },
        fotos: ["https://images.unsplash.com/photo-1547592180-85f173990554?w=800"], // Soup/stew
        promedioRating: 4.4,
        cantidadResenas: 8,
        estado: "activo",
        destacado: false,
        nivelVisibilidad: "normal",
        telefonoContacto: "",
        emailContacto: "",
        sitioWeb: "",
        redesSociales: {}
      },
      {
        propietarioId: admin._id,
        nombre: "Café Typica",
        tipo: "café",
        direccion: "Calle Enrique Peñaranda, San Miguel",
        zona: "Sur",
        coordenadas: {
          type: "Point",
          coordinates: [-68.0799, -16.5408]
        },
        descripcion: "Café de especialidad con ambiente vintage y postres artesanales.",
        tiposComida: ["café", "postres", "jugos", "masitas"],
        rangoPrecios: "medio",
        horario: {
            lunes: { apertura: "08:00", cierre: "22:00", cerrado: false },
            martes: { apertura: "08:00", cierre: "22:00", cerrado: false },
            miercoles: { apertura: "08:00", cierre: "22:00", cerrado: false },
            jueves: { apertura: "08:00", cierre: "22:00", cerrado: false },
            viernes: { apertura: "08:00", cierre: "22:00", cerrado: false },
            sabado: { apertura: "09:00", cierre: "22:00", cerrado: false },
            domingo: { apertura: "09:00", cierre: "21:00", cerrado: false }
        },
        fotos: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"],
        promedioRating: 4.7,
        cantidadResenas: 120,
        estado: "activo",
        destacado: true,
        nivelVisibilidad: "normal",
        telefonoContacto: "+5912222222",
        emailContacto: "info@typica.com",
        sitioWeb: "https://typicacafe.com",
        redesSociales: { instagram: "https://instagram.com/typicacafe" }
      },
      {
        propietarioId: admin._id,
        nombre: "Las Cholas",
        tipo: "callejero",
        direccion: "Parque de La Florida, Calacoto",
        zona: "Sur",
        coordenadas: {
          type: "Point",
          coordinates: [-68.0876, -16.5385]
        },
        descripcion: "El tradicional sandwich de chola: cerdo al horno, escabeche y quirquiña.",
        tiposComida: ["sandwich de chola", "típico", "comida rápida", "callejero"],
        rangoPrecios: "medio",
        horario: {
            lunes: { apertura: "09:00", cierre: "18:00", cerrado: false },
            martes: { apertura: "09:00", cierre: "18:00", cerrado: false },
            miercoles: { apertura: "09:00", cierre: "18:00", cerrado: false },
            jueves: { apertura: "09:00", cierre: "18:00", cerrado: false },
            viernes: { apertura: "09:00", cierre: "18:00", cerrado: false },
            sabado: { apertura: "09:00", cierre: "18:00", cerrado: false },
            domingo: { apertura: "09:00", cierre: "18:00", cerrado: false }
        },
        fotos: ["https://images.unsplash.com/photo-1550547660-d9450f859349?w=800"], // Sandbox/burger ish
        promedioRating: 4.6,
        cantidadResenas: 250,
        estado: "activo",
        destacado: true,
        nivelVisibilidad: "premium",
        telefonoContacto: "",
        emailContacto: "",
        sitioWeb: "",
        redesSociales: {}
      },
      {
        propietarioId: admin._id,
        nombre: "Api Oruro",
        tipo: "restaurante",
        direccion: "Calle Murillo, Centro",
        zona: "Centro",
        coordenadas: {
          type: "Point",
          coordinates: [-68.1360, -16.5000]
        },
        descripcion: "El mejor api morado y blanco con pastel de queso inflado.",
        tiposComida: ["api", "pastel", "desayuno", "cena", "típico"],
        rangoPrecios: "bajo",
        horario: {
            lunes: { apertura: "07:00", cierre: "11:00", cerrado: false },
            martes: { apertura: "07:00", cierre: "11:00", cerrado: false },
            miercoles: { apertura: "07:00", cierre: "11:00", cerrado: false },
            jueves: { apertura: "07:00", cierre: "11:00", cerrado: false },
            viernes: { apertura: "07:00", cierre: "11:00", cerrado: false },
            sabado: { apertura: "07:00", cierre: "11:00", cerrado: false },
            domingo: { apertura: "07:00", cierre: "11:00", cerrado: false }
        },
        fotos: ["https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800"], // Coffee/drink ish
        promedioRating: 4.5,
        cantidadResenas: 30,
        estado: "activo",
        destacado: false,
        nivelVisibilidad: "normal",
        telefonoContacto: "",
        emailContacto: "",
        sitioWeb: "",
        redesSociales: {}
      }
    ]);

    // 3) Platos
    const [anticucho, saltenaCarne, saltenaPollo, sopaMani] = await Plato.insertMany([
      {
        lugarId: anticuchosRita._id,
        nombre: "Anticucho de corazón",
        descripcion: "Brochetas de corazón de res con papa y ají de maní.",
        precio: 12,
        categoria: "cena",
        etiquetas: ["anticuchos", "típico", "picante"],
        disponible: true,
        destacado: true
      },
      {
        lugarId: saltenasCentro._id,
        nombre: "Salteña de carne",
        descripcion: "Salteña jugosa de carne con papa y ají.",
        precio: 8,
        categoria: "desayuno",
        etiquetas: ["salteñas", "típico"],
        disponible: true,
        destacado: true
      },
      {
        lugarId: saltenasCentro._id,
        nombre: "Salteña de pollo",
        descripcion: "Salteña de pollo ligeramente picante.",
        precio: 8,
        categoria: "desayuno",
        etiquetas: ["salteñas"],
        disponible: true,
        destacado: false
      },
      {
        lugarId: comedorLanza._id,
        nombre: "Sopa de maní",
        descripcion: "Sopa de maní con papas y carne, estilo paceño.",
        precio: 14,
        categoria: "almuerzo",
        etiquetas: ["sopa de maní", "típico"],
        disponible: true,
        destacado: true
      }
    ]);

    // 4) Reseñas
    await Review.insertMany([
      {
        usuarioId: carlos._id,
        lugarId: anticuchosRita._id,
        rating: 5,
        comentario: "Los mejores anticuchos de Sopocachi, ají de maní brutal.",
        fotos: [],
        util: 3
      },
      {
        usuarioId: carlos._id,
        lugarId: saltenasCentro._id,
        rating: 4,
        comentario: "Salteñas muy buenas, pero se acaban rápido si llegas tarde.",
        fotos: [],
        util: 1
      },
      {
        usuarioId: carlos._id,
        lugarId: comedorLanza._id,
        rating: 4,
        comentario: "Almuerzo barato en el Mercado Lanza, sopa de maní recomendada.",
        fotos: [],
        util: 0
      }
    ]);

    // 5) Favoritos
    await Favorito.insertMany([
      { usuarioId: carlos._id, lugarId: anticuchosRita._id },
      { usuarioId: carlos._id, lugarId: saltenasCentro._id }
    ]);

    // 6) Promoción
    await Promocion.insertMany([
      {
        lugarId: saltenasCentro._id,
        platoId: saltenaCarne._id,
        titulo: "Promo desayuno paceño",
        descripcion: "2 salteñas de carne + jugo de naranja.",
        precioPromo: 18,
        descuentoPorcentaje: 10,
        tipo: "combo",
        fechaInicio: new Date("2025-01-05T00:00:00Z"),
        fechaFin: new Date("2025-01-31T23:59:59Z"),
        activa: true
      }
    ]);

    // 7) Sponsored placement
    await SponsoredPlacement.insertMany([
      {
        lugarId: saltenasCentro._id,
        posicion: "home_top",
        fechaInicio: new Date("2025-01-10T00:00:00Z"),
        fechaFin: new Date("2025-02-10T23:59:59Z"),
        activo: true,
        peso: 10
      }
    ]);

    console.log("Seed completado.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error en seed:", err);
    process.exit(1);
  }
}

seed();
