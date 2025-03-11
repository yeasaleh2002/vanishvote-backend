require("dotenv").config();
const { Sequelize, DataTypes, Op } = require("sequelize");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "";
const DB_NAME = process.env.DB_NAME || "polls_db";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection error:", err));

const Poll = require("./poll")(sequelize, DataTypes);
const Comment = require("./comment")(sequelize, DataTypes);

Poll.hasMany(Comment, { foreignKey: "pollId", onDelete: "CASCADE" });
Comment.belongsTo(Poll, { foreignKey: "pollId" });

sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Database synchronized");
});

module.exports = {
  sequelize,
  Sequelize,
  Op,
  Poll,
  Comment,
};
