const db = require("../models");
const { Op } = require("sequelize");
const question = require("../models/question");
const sequelize = db.sequelize;

// 답변 조회
exports.getAnswers = async (req, res) => {
  try {
    const questionId = req.params.question_id;
    const result = await db.answer.findAll({
      attributes: [
        "id",
        "question_id",
        "content",
        "user_id",
        "created_at",
        "updated_at",
      ],
      where: { question_id: questionId },
    });
    res.send(result);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// 답변 작성
exports.postAnswer = async (req, res) => {
  try {
    // 해당하는 질문이 있는지 조회
    const questionId = req.params.question_id;
    const question = await db.question.findByPk(questionId);
    if (!question) {
      return res.status(404).send("존재하지 않는 질문입니다.");
    }

    // 질문이 존재하면 답변 작성 진행
    const data = {
      questionId: questionId,
      content: req.body.content,
      userId: req.body.user_id,
    };

    const result = await db.answer.create({
      question_id: data.questionId,
      content: data.content,
      user_id: data.userId,
      created_at: new Date(),
    });

    if (!result) {
      return res.status(404).send("답변 작성을 실패하였습니다.");
    }
    res.send("답변 작성이 완료되었습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 답변 수정
exports.patchAnswer = async (req, res) => {
  try {
    const answerId = req.params.answer_id;
    const questionId = req.params.question_id;
    const userId = req.body.user_id;

    // 해당 답변이 존재하는지 조회
    const answer = await db.answer.findByPk(answerId);
    if (!answer) {
      return res.status(404).send("존재하지 않는 답변입니다.");
    }

    // 작성자만 답변 수정
    if (answer.user_id !== parseInt(userId)) {
      return res.status(403).send("권한이 없습니다.");
    }

    // 수정할 내용 가져오기
    const { content } = req.body;

    // UPDATE answer SET content = data.content, updated_at = now()
    // WHERE id= answerId AND user_id= data.userId AND question_id= questionId
    const result = await db.answer.update(
      { content, updated_at: new Date() },
      {
        where: {
          id: answerId,
          user_id: userId,
          question_id: questionId,
        },
      }
    );

    if (result === 0) {
      return res.status(404).send("존재하지 않는 답변입니다.");
    }
    res.send("수정되었습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// 답변 삭제
exports.deleteAnswer = async (req, res) => {
  try {
    const answerId = req.params.answer_id;
    const questionId = req.params.question_id;
    const userId = req.body.user_id;

    // 해당 답변이 존재하는지 조회
    const answer = await db.answer.findByPk(answerId);
    if (!answer) {
      return res.status(404).send("존재하지 않는 답변입니다.");
    }

    // 작성자만 답변 삭제
    if (answer.user_id !== parseInt(userId)) {
      return res.status(403).send("권한이 없습니다.");
    }
    // 답변 삭제
    const result = await db.answer.destroy({
      where: {
        id: answerId,
        question_id: questionId,
      },
    });
    if (result === 0) {
      return res.status(404).send("답변을 삭제하지 못했습니다.");
    }
    res.send("삭제되었습니다.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
