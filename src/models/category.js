const Category = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "category",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        comment: "id",
      },
      category_name: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "카테고리명",
      },
    },
    {
      tableName: "category",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};

module.exports = Category;
