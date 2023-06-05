const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/userCtrl");

router.get("/signin", userCtrl.getSignin);
router.get("/signup", userCtrl.getSignup);
router.get("/profile", userCtrl.getUser);

router.post("/signin", userCtrl.postSignin);
router.post("/signup", userCtrl.postSignup);

router.patch("/profile", userCtrl.updateUser);
router.delete("/", userCtrl.getUser);
module.exports = router;
