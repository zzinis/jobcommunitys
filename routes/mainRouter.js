const express = require("express");
const router = express.Router();
const mainCtrl = require("../controllers/mainCtrl");

router.get("/", mainCtrl.getMain);

module.exports = router;
