const express = require("express");
const router = express.Router();
const mainCtrl = require("../controllers/mainCtrl");
const userRouter = require("./userRouter");

router.get("/", mainCtrl.getMain);
router.use("/users", userRouter);

module.exports = router;
