const db = require("../models");
const { Op } = require("sequelize");
const sequelize = db.sequelize;
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const secretKey = "jomcommunity-key";

// 질문 전체 조회하기
// 질문 리스트 조회 (카테고리별, 조회순, 공감순, 최신순)
// 인기글 조회 (조회수별 공감수별 TOP 10)
exports.getQuestions = async (req, res) => {
  try {
    // JWT 토큰
    const token = req.cookies.authorization
      ? req.cookies.authorization.split(" ")[1]
      : null;
    let userId = null;
    let loginOrNot = false;
    if (token) {
      // 토큰이 존재하는 경우, 토큰을 검증하여 사용자 정보를 확인
      const decoded = jwt.verify(token, secretKey);
      userId = decoded.userId;
      loginOrNot = true;
    }

    const searchWord = req.query.word ? req.query.word : ""; // 검색어
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 6;

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
    if (searchWord !== "") {
      whereCondition.title = {
        [Op.like]: `%${searchWord}%`,
      };
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
      loginOrNot: loginOrNot,
    };
    res.render("question/questions", resData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 개별 조회
exports.getQuestion = async (req, res) => {
  try {
    // JWT 토큰
    const token = req.cookies.authorization
      ? req.cookies.authorization.split(" ")[1]
      : null;

    // 추출된 사용자 정보
    const userId = token ? jwt.verify(token, secretKey).userId : null;
    const questionId = req.params.question_id;
    const loginOrNot = userId ? true : false; // 현재 로그인한 상태를 확인하는 변수

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
    const yourQuestion = parseInt(userId) == parseInt(result.user_id); // 현재 로그인한 회원의 게시물인지 확인하는 변수

    // 조회수 증가
    result.views += 1;
    await result.save();

    // 좋아요를 눌렀는지 여부를 판별
    const userFavorite = await db.favorite.count({
      where: {
        user_id: userId,
        question_id: questionId,
      },
    });

    const isLiked = userFavorite > 0;
    const answers = result.answers;

    // 본인이 작성한 댓글인지 확인
    // 현재 로그인한 사용자와 답변 작성자의 ID 비교하여 isYourAnswer 값 설정
    if (loginOrNot) {
      for (const answer of answers) {
        answer.isYourAnswer = parseInt(userId) === parseInt(answer.user_id);
      }
    }
    // 응답 데이터
    const resData = {
      question: result,
      answers: answers,
      isLiked: isLiked,
      loginOrNot: loginOrNot,
      yourQuestion: yourQuestion,
    };
    res.render("question/question", resData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 작성 페이지 렌더링
exports.getQuestionWritePage = async (req, res) => {
  // JWT 토큰
  const token = req.cookies.authorization
    ? req.cookies.authorization.split(" ")[1]
    : null;

  const decoded = jwt.verify(token, secretKey);

  if (!token) {
    // 로그인 안됨
    return res
      .status(401)
      .send('<script>alert("로그인 후 이용해주세요.");</script>');
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      // 토큰 인증 실패
      return res
        .status(401)
        .send('<script>alert("로그인 상태를 확인하여 주세요");</script>');
    }

    const loginOrNot = true;

    const resData = {
      patch: false,
      loginOrNot: loginOrNot,
    };
    // 로그인 상태
    res.render("question/write", resData);
  });
};

// 질문 작성
exports.postQuestion = async (req, res) => {
  try {
    // JWT 토큰
    const token = req.cookies.authorization
      ? req.cookies.authorization.split(" ")[1]
      : null;

    if (!token) {
      return res
        .status(401)
        .send('<script>alert("로그인 상태를 확인하여 주세요");</script>');
    }
    // JWT 토큰을 검증하여 사용자 정보 추출
    const decodedToken = jwt.verify(token, secretKey);

    // 추출된 사용자 정보
    const userId = decodedToken.userId;

    if (!userId) {
      return res.status(404).send("로그인한 후 사용해주세요");
    }
    const result = await db.question.create({
      title: req.body.title,
      content: req.body.content,
      created_at: new Date(),
      user_id: userId,
      newcomer: req.body.newcomer,
      category_id: parseInt(req.body.categoryId),
      favorite: 0,
      views: 0,
    });

    // 예외 처리
    if (!result) {
      return res.status(404).send("질문 작성에 실패하였습니다.");
    }

    const questionId = result.dataValues.id;
    const resData = {
      message: "질문 작성이 완료되었습니다.",
      redirectURL: "/questions/" + questionId,
      loginOrNot: true, // 로그인 상태임을 알려주기 위해 추가
      userId: userId, // 로그인한 사용자 ID 전달
    };
    res.send(resData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 수정 페이지
exports.getQuestionPatchPage = async (req, res) => {
  // JWT 토큰
  const token = req.cookies.authorization
    ? req.cookies.authorization.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }
  // JWT 토큰을 검증하여 사용자 정보 추출
  const decodedToken = jwt.verify(token, secretKey);

  // 추출된 사용자 정보
  const userId = decodedToken.userId;

  const questionId = req.params.question_id;
  const question = await db.question.findByPk(questionId);
  if (!question) {
    return res.status(404).send("존재하지 않는 질문입니다.");
  }

  // 작성자만 질문 수정 가능
  if (question.userId !== userId) {
    return res.status(403).send("권한이 없습니다.");
  }

  const resData = {
    patch: true,
    question: question,
    loginOrNot: true, // 로그인 상태임을 알려주기 위해 추가
    userId: userId, // 로그인한 사용자 ID 전달
  };
  res.render("question/write", resData);
};

// 질문 수정
exports.patchQuesiton = async (req, res) => {
  try {
    const questionId = req.params.question_id;
    // JWT 토큰
    const token = req.cookies.authorization
      ? req.cookies.authorization.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    // JWT 토큰을 검증하여 사용자 정보 추출
    const decodedToken = jwt.verify(token, secretKey);

    // 추출된 사용자 정보
    const userId = decodedToken.userId;

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
      category_id: req.body.categoryId,
    };
    // 질문 업데이트
    await db.question.update(data, {
      where: {
        id: questionId,
      },
    });
    const resData = {
      message: "수정되었습니다.",
      redirectURL: "/questions/" + questionId,
    };
    res.send(resData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 질문 삭제
exports.deleteQuesiton = async (req, res) => {
  try {
    const questionId = req.params.question_id;
    // JWT 토큰
    const token = req.cookies.authorization
      ? req.cookies.authorization.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }
    // JWT 토큰을 검증하여 사용자 정보 추출
    const decodedToken = jwt.verify(token, secretKey);

    // 추출된 사용자 정보
    const userId = decodedToken.userId;

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
    // JWT 토큰
    const token = req.cookies.authorization
      ? req.cookies.authorization.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "로그인 후 사용해주세요" });
    }

    // JWT 토큰을 검증하여 사용자 정보 추출
    const decodedToken = jwt.verify(token, secretKey);
    // 추출된 사용자 정보
    const userId = decodedToken.userId;

    // 질문이 존재하는지 확인
    const question = await db.question.findByPk(questionId);
    const countQuestionLike = question.favorite + 1;
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
      const resData = {
        result: "공감하였습니다.",
        countQuestionLike: countQuestionLike,
      };
      res.send(resData);
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
    // JWT 토큰
    const token = req.cookies.authorization
      ? req.cookies.authorization.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }
    // JWT 토큰을 검증하여 사용자 정보 추출
    const decodedToken = jwt.verify(token, secretKey);

    // 추출된 사용자 정보
    const userId = decodedToken.userId;
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
      return res.status(404).send("공감하지 않은 게시물입니다.");
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
    const countQuestionLike = question.favorite - 1;
    const resData = {
      result: "공감을 취소하였습니다.",
      countQuestionLike: countQuestionLike,
    };
    res.send(resData);
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
