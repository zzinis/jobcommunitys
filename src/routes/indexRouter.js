const express = require("express");
const router = express.Router();
const mainCtrl = require("../controllers/mainCtrl");
const userRouter = require("./userRouter");
const questionRouter = require("./questionRouter");

router.get("/", mainCtrl.getMain);
router.use("/users", userRouter);
router.use("/questions", questionRouter);

module.exports = router;
