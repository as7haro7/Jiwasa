
import { sequelize } from "./src/config/db.js";
import Place from "./src/models/Place.js";

async function debug() {
    try {
        await sequelize.authenticate();
        console.log("Connected");

        const places = await Place.findAll({
            where: { estado: "activo" },
            attributes: [
                "id",
                "nombre",
                "tipo",
                "coordenadas",
                "nivelVisibilidad",
                "promedioRating",
                "direccion",
                "zona",
                "fotos",
            ],
        });
        console.log(`Found ${places.length} places with controller query.`);
        
        places.forEach(p => {
            const json = p.toJSON();
            console.log(`Place ${json.nombre}: coords type=${typeof json.coordenadas}, isArray=${Array.isArray(json.coordenadas)}`);
            console.log(`Value:`, JSON.stringify(json.coordenadas));
            
            if (json.coordenadas && !json.coordenadas.coordinates && !Array.isArray(json.coordenadas)) {
                 console.error("ALERT: Coordenadas object missing coordinates property!");
            }
        });
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.close();
    }
}

debug();
