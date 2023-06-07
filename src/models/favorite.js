const Favorite = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "favorite",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: "id",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "사용자 id",
        references: {
          model: "user",
          key: "id",
        },
      },
      question_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "질문글 id",
        references: {
          model: "question",
          key: "id",
        },
      },
    },
    {
      tableName: "favorite",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "FK_favorite_user_id_user_id",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "FK_favorite_question_id_question_id",
          using: "BTREE",
          fields: [{ name: "question_id" }],
        },
      ],
    }
  );
};

module.exports = Favorite;
