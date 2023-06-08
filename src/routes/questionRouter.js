const express = require("express");
const controller = require("../controllers/questionCtrl");
const router = express.Router();
const answerRouter = require("./answerRouter");

// 경로: /questions

// 질문 조회
router.get("/", controller.getQuestions); // 질문 전체 조회
router.get("/search", controller.searchQuestions); // 질문 검색

router.get("/write", controller.getQuestionWritePage); // 질문 작성 페이지 렌더링
router.post("/write", controller.postQuestion); // 질문 작성 post

router.get("/:question_id", controller.getQuestion); // 질문 개별 조회
router.get("/complete/:question_id", controller.getQuestion); // 질문 개별 조회

router.patch("/:question_id", controller.patchQuesiton); // 질문 수정
router.delete("/:question_id", controller.deleteQuesiton); // 질문 삭제

// 공감
router.patch("/:question_id/likes", controller.likeQuestion); // 질문 공감
router.patch("/:question_id/unlikes", controller.unlikeQuestion); // 질문 공감 취소

// 답변 (경로: /questions/:question_id/answers)
router.use("/:question_id/answers", answerRouter);

module.exports = router;
