const express = require("express");
const controller = require("../controllers/jobInfoCtrl");
const router = express.Router();

// 경로: /jobinfo

// 질문 조회
router.get("/", controller.getExternalData); // 질문 전체 조회

module.exports = router;
