"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};
const Question = require("./question");
const User = require("./user");
const Answer = require("./answer");
const Category = require("./category");
const Favorite = require("./favorite");

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// 데이터베이스 관계 설정
db.user = User(sequelize, Sequelize);
db.category = Category(sequelize, Sequelize);
db.question = Question(sequelize, Sequelize);
db.answer = Answer(sequelize, Sequelize);
db.favorite = Favorite(sequelize, Sequelize);


db.user.hasMany(db.question, { as: "questions", foreignKey: "user_id" });
db.user.hasMany(db.answer, { as: "answers", foreignKey: "user_id" });
db.user.hasMany(db.favorite, { as: "favorites", foreignKey: "user_id" });

db.question.belongsTo(db.category, {as: "category", foreignKey: "category_id"});
db.question.hasMany(db.answer, { as: "answers", foreignKey: "question_id" });
db.question.hasMany(db.favorite, {as: "favorites", foreignKey: "question_id"});
db.question.belongsTo(db.user, { as: "user", foreignKey: "user_id" });

db.category.hasMany(db.question, { as: "questions", foreignKey: "category_id"});

db.answer.belongsTo(db.question, { as: "question", foreignKey: "question_id" });
db.answer.belongsTo(db.user, { as: "user", foreignKey: "user_id" });

db.favorite.belongsTo(db.question, {as: "question", foreignKey: "question_id"});
db.favorite.belongsTo(db.user, { as: "user", foreignKey: "user_id" });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
