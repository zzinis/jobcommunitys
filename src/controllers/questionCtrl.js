const db = require("../models");
const { Op } = require("sequelize");
const sequelize = db.sequelize;

exports.getQuestions = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 10;

    const offset = (page - 1) * limit;
    const whereCondition = {};
    const sort = req.query.sort ? req.query.sort : "";
    const category_id = req.query.category ? parseInt(req.query.category) : "";
    let order = [["id", "DESC"]];

    if (sort === "" || sort === "reg_dt") {
      order = [["id", "DESC"]];
    } else if (sort === "favorite") {
      order = [
        ["favorite", "DESC"],
        ["id", "DESC"],
      ];
    } else if (sort === "views") {
      order = [
        ["views", "DESC"],
        ["id", "DESC"],
      ];
    }

    if (category_id !== "" && !isNaN(category_id)) {
      whereCondition.category_id = category_id;
    }

    const totalQuestion = await db.question.count({
      where: whereCondition,
    });
    const totalPages = Math.ceil(totalQuestion / limit);
    const result = await db.question.findAll({
      attributes: [
        "id",
        "title",
        "content",
        "favorite",
        "category_id",
        "created_at",
        "views",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM answer WHERE answer.question_id = question.id)`
          ),
          "answerCount",
        ],
      ],
      include: [
        {
          model: db.user,
          attributes: ["nickname"],
          as: "user",
        },
        {
          model: db.category,
          attributes: ["category_name"],
          as: "category",
        },
      ],
      where: whereCondition,
      order: order,
      offset: offset,
      limit: limit,
      raw: true,
    });

    const questions = result.map((question) => {
      return {
        id: question.id,
        title: question.title,
        content: question.content,
        favorite: question.favorite,
        category_id: question.category_id,
        created_at: formatDate(question.created_at),
        answerCount: question.answerCount,
        views: question.views,
        user: {
          nickname: question["user.nickname"],
        },
        category: {
          category_name: question["category.category_name"],
        },
      };
    });
    const popularResult = await db.question.findAll({
      attributes: [
        "id",
        "title",
        "content",
        "favorite",
        "category_id",
        "views",
        [
          sequelize.literal(
            `(SELECT COUNT(*) FROM answer WHERE answer.question_id = question.id)`
          ),
          "answerCount",
        ],
      ],
      include: [
        {
          model: db.user,
          attributes: ["nickname"],
          as: "user",
        },
        {
          model: db.category,
          attributes: ["category_name"],
          as: "category",
        },
      ],
      order: [
        ["views", "DESC"],
        ["favorite", "DESC"],
      ],
      offset: 0,
      limit: 10,
      raw: true,
    });
    const popular = popularResult.map((question) => {
      return {
        id: question.id,
        title: question.title,
        content: question.content,
        favorite: question.favorite,
        category_id: question.category_id,
        answerCount: question.answerCount,
        views: question.views,
        user: {
          nickname: question["user.nickname"],
        },
        category: {
          category_name: question["category.category_name"],
        },
      };
    });
    const resData = {
      questions: questions,
      currentPage: page,
      totalPages: totalPages,
      sort: sort,
      category_id: category_id,
      popular: popular,
    };
    res.render("question/questions", resData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 검색
exports.searchQuestions = async (req, res) => {
  try {
    const search = req.query.word; // 검색어
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 10;

    // 검색어로 질문 수 계산
    const totalQuestion = await db.question.count({
      where: {
        title: {
          [Op.like]: `%${search}%`,
        },
      },
    });

    const totalPages = Math.ceil(totalQuestion / limit);
    const offset = (page - 1) * limit;

    const result = await db.question.findAll({
      attributes: ["id", "title", "content", "views", "favorite", "created_at"],
      where: {
        title: {
          [Op.like]: `%${search}%`,
        },
      },
      order: [["id", "DESC"]],
      offset: offset,
      limit: limit,
    });

    const resData = {
      total: totalQuestion, // 해당하는 질문 수
      questions: result, // 해당하는 질문 데이터
      currentPage: page, // 현재 페이지
      totalPages: totalPages, // 총 페이지
    };

    res.send(resData);
    // res.render("question/search", resData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 개별 조회
// 질문 내용
// 답변 내용
// 좋아요 갯수
// 현재 로그인한 사용자가 좋아요를 이미 눌렀는지 여부 확인
exports.getQuestion = async (req, res) => {
  try {
    const questionId = req.params.question_id;
    const userId = req.user ? req.user.id : null; // 현재 사용자의 ID
    const result = await db.question.findByPk(questionId, {
      attributes: [
        "id",
        "title",
        "content",
        "user_id",
        "views",
        "favorite",
        "category_id",
      ],
      include: [
        {
          model: db.answer,
          as: "answers",
          include: {
            model: db.user,
            as: "user",
            attributes: ["id", "nickname"],
          },
        },
        {
          model: db.user,
          as: "user",
          attributes: ["id", "nickname"],
        },
        {
          model: db.favorite,
          as: "favorites",
          where: {
            user_id: userId,
            question_id: questionId,
          },
          required: false, // 조인된 모델이 없어도 결과에 포함시킴
          attributes: ["id"], // 필요한 속성만 가져옴
        },
      ],
      order: [["answers", "id", "DESC"]],
    });

    if (!result) {
      return res.status(404).send("존재하지 않는 질문입니다.");
    }
    // 조회수 증가
    result.views += 1;
    await result.save();

    // 좋아요를 눌렀는지 여부를 판별
    const isLiked = result.favorites.length > 0;

    // 응답 데이터
    const resData = {
      question: result,
      answers: result.answers,
      isLiked: isLiked,
    };

    // res.send(resData);

    res.render("question/question", resData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 작성 페이지 렌더링
exports.getQuestionWritePage = async (req, res) => {
  res.render("question/write");
};
// 질문 작성
exports.postQuestion = async (req, res) => {
  try {
    const result = await db.question.create({
      title: req.body.title,
      content: req.body.content,
      created_at: new Date(),
      user_id: req.body.userId,
      newcomer: req.body.newcomer,
      category_id: req.body.categoryId,
      favorite: 0,
      views: 0,
    });

    // 예외 처리
    if (!result) {
      return res.status(404).send("질문 작성에 실패하였습니다.");
    }
    const postId = result.dataValues.id;
    // res.redirect(`/questions/list/${postId}`);
    res.send("질문 작성이 완료되었습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 수정
exports.patchQuesiton = async (req, res) => {
  try {
    const questionId = req.params.question_id;
    const userId = req.body.user_id;
    // 해당 질문이 존재하는지 조회
    const question = await db.question.findByPk(questionId);

    // 없으면 404 에러
    if (!question) {
      return res.status(404).send("존재하지 않는 질문입니다.");
    }
    // 작성자만 질문 수정
    if (question.user_id !== parseInt(userId)) {
      return res.status(403).send("권한이 없습니다.");
    }
    // reqeust data
    const data = {
      title: req.body.title,
      content: req.body.content,
      user_id: userId,
      updated_at: new Date(),
      newcomer: req.body.newcomer,
      question_pw: req.body.question_pw,
      category_id: req.body.category_id,
    };
    const [result] = await db.question.update(data, {
      where: {
        id: questionId,
      },
    });

    res.send("수정되었습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 삭제
exports.deleteQuesiton = async (req, res) => {
  try {
    const questionId = req.params.question_id;
    const userId = req.body.user_id;

    // 해당 질문이 존재하는지 조회
    const question = await db.question.findByPk(questionId);

    if (!question) {
      return res.status(404).send("존재하지 않는 질문입니다.");
    }

    // 작성자만 질문 삭제
    if (question.user_id !== parseInt(userId)) {
      return res.status(403).send("권한이 없습니다.");
    }

    // 트랜잭션 시작
    const result = await sequelize.transaction(async (transaction) => {
      // 질문과 관련된 좋아요를 모두 삭제
      await db.favorite.destroy({
        where: {
          question_id: req.params.question_id,
        },
        transaction,
      });
      // 질문과 관련된 답변을 모두 삭제
      await db.answer.destroy({
        where: {
          question_id: req.params.question_id,
        },
        transaction,
      });

      // 질문 삭제
      await db.question.destroy({
        where: {
          id: req.params.question_id,
        },
        transaction,
      });
    });

    res.send("삭제되었습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 공감
exports.likeQuestion = async (req, res) => {
  try {
    const questionId = req.params.question_id;
    const userId = req.body.user_id;

    // 질문이 존재하는지 확인
    const question = await db.question.findByPk(questionId);
    if (!question) {
      return res.status(404).send("존재하지 않는 질문입니다.");
    }
    // 이미 공감했는지 확인
    const userLike = await db.favorite.findOne({
      where: {
        question_id: questionId,
        user_id: userId,
      },
    });

    if (userLike) {
      return res.status(404).send("이미 공감하였습니다.");
    }

    const t = await sequelize.transaction();

    try {
      await db.question.update(
        { favorite: sequelize.literal("favorite + 1") },
        { where: { id: questionId }, transaction: t }
      );

      await db.favorite.create(
        { user_id: userId, question_id: questionId },
        { transaction: t }
      );
      await t.commit();

      res.send("공감하였습니다.");
    } catch (error) {
      console.error("rollback transaction", error);
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 공감 취소
exports.unlikeQuestion = async (req, res) => {
  try {
    const questionId = req.params.question_id;
    const userId = req.body.user_id;

    // 질문 찾기
    const question = await db.question.findByPk(questionId);
    if (!question) {
      return res.status(404).send("존재하지 않는 질문입니다.");
    }

    // 공감 찾기
    const favorite = await db.favorite.findOne({
      where: { user_id: userId, question_id: questionId },
    });

    if (!favorite) {
      return res.status(404).send("해당 공감을 찾을 수 없습니다.");
    }

    // Managed transaction를 이용해 원자적 처리
    await sequelize.transaction(async (transaction) => {
      // UPDATE question SET favorite = favorite - 1 WHERE id = questionId
      await db.question.update(
        { favorite: sequelize.literal("favorite - 1") },
        { where: { id: questionId }, transaction }
      );

      // DELETE FROM favorite WHERE user_id = userId AND question_id = questionId
      await db.favorite.destroy({
        where: { user_id: userId, question_id: questionId },
        transaction,
      });
    });

    res.send("공감을 취소하였습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 날짜 포맷 변환 함수
formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
