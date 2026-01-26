import User from "./User.js";
import Place from "./Place.js";
import Review from "./Review.js";
import Favorite from "./Favorite.js";
import Dish from "./Dish.js";
import Promotion from "./Promotion.js";
import Report from "./Report.js";
import SponsoredPlacement from "./SponsoredPlacement.js";

// Define associations here to avoid circular dependency issues in model files

// User - Place (Ownership)
User.hasMany(Place, { foreignKey: "propietarioId", as: "lugares" });
Place.belongsTo(User, { foreignKey: "propietarioId", as: "propietario" });

// User - Review
User.hasMany(Review, { foreignKey: "usuarioId" });
Review.belongsTo(User, { foreignKey: "usuarioId", as: "usuario" });

// Place - Review
Place.hasMany(Review, { foreignKey: "lugarId" });
Review.belongsTo(Place, { foreignKey: "lugarId" });

// User - Favorite - Place
User.hasMany(Favorite, { foreignKey: "usuarioId" });
Favorite.belongsTo(User, { foreignKey: "usuarioId" });
Place.hasMany(Favorite, { foreignKey: "lugarId" });
Favorite.belongsTo(Place, { foreignKey: "lugarId", as: "lugar" });

// Place - Dish
Place.hasMany(Dish, { foreignKey: "lugarId", as: "platos" });
Dish.belongsTo(Place, { foreignKey: "lugarId" });

// Place - Promotion
Place.hasMany(Promotion, { foreignKey: "lugarId" });
Promotion.belongsTo(Place, { foreignKey: "lugarId" });

// Dish - Promotion
Dish.hasMany(Promotion, { foreignKey: "platoId" });
Promotion.belongsTo(Dish, { foreignKey: "platoId", as: "plato" });

// Place - SponsoredPlacement
Place.hasMany(SponsoredPlacement, { foreignKey: "lugarId" });
SponsoredPlacement.belongsTo(Place, { foreignKey: "lugarId", as: "lugar" });

// Report relationships
User.hasMany(Report, { foreignKey: "usuarioId" });
Report.belongsTo(User, { foreignKey: "usuarioId", as: "usuario" });

Place.hasMany(Report, { foreignKey: "lugarId" });
Report.belongsTo(Place, { foreignKey: "lugarId" });

Review.hasMany(Report, { foreignKey: "reseñaId" });
Report.belongsTo(Review, { foreignKey: "reseñaId" });

export { User, Place, Review, Favorite, Dish, Promotion, Report, SponsoredPlacement };
