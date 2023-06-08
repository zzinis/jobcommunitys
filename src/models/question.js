const Question = (Sequelize, DataTypes) => {
  return Sequelize.define(
    "question",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        comment: "id",
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "질문글 제목",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "질문글 내용",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "생성일시",
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "생성자(회원id)",
        references: {
          model: "user",
          key: "id",
        },
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "수정일시",
      },
      newcomer: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: "신입/경력 여부",
      },
      favorite: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "좋아요 수",
        defaultValue: 0,
      },
      views: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "조회수",
        defaultValue: 0,
      },
      question_pw: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "패스워드",
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "카테고리 id",
        references: {
          model: "category",
          key: "id",
        },
      },
    },
    {
      tableName: "question",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "FK_question_user_id_user_id",
          using: "BTREE",
          fields: [{ name: "user_id" }],
        },
        {
          name: "FK_question_category_id_category_id",
          using: "BTREE",
          fields: [{ name: "category_id" }],
        },
      ],
    }
  );
};

module.exports = Question;
