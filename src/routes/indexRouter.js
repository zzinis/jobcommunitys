const express = require("express");
const router = express.Router();
const mainCtrl = require("../controllers/mainCtrl");
const userRouter = require("./userRouter");
const questionRouter = require("./questionRouter");
const jobInfoRouter = require("./jobInfoRouter");

router.get("/", mainCtrl.getMain);
router.use("/users", userRouter);
router.use("/questions", questionRouter);
router.use("/jobInfo", jobInfoRouter);

module.exports = router;
