const express = require("express");
const controller = require("../controllers/jobInfoCtrl");
const router = express.Router();

// 경로: /jobinfo

router.get("/", controller.getExternalData);

module.exports = router;
