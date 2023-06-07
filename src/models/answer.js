const Answer = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "answer",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: "id",
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
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "내용",
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "생성일시",
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "수정일시",
      },
    },
    {
      tableName: "answer",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "FK_answer_question_id_question_id",
          using: "BTREE",
          fields: [{ name: "question_id" }],
        },
        {
          name: "FK_answer_user_id_user_id",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
      ],
    }
  );
};

module.exports = Answer;
