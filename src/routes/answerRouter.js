const express = require("express");
const controller = require("../controllers/answerCtrl");
const router = express.Router({ mergeParams: true });

// 경로: /questions/:question_id/answers

router.get("/", controller.getAnswers); // 답변 조회
router.post("/", controller.postAnswer); // 답변 작성
router.patch("/:answer_id", controller.patchAnswer); // 답변 수정
router.delete("/:answer_id", controller.deleteAnswer); //답변 삭제

module.exports = router;
