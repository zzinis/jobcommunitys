const models = require("../models");
const { Op, NUMBER } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = {
  getSignup: (req, res) => {
    //views/signup.ejs
    res.render("signup");
  },

  getSignin: (req, res) => {
    res.render("signin");
  },
  getUser: async (req, res) => {
    try {
      const { id } = req.query;
      const user = await models.user.findOne({
        where: { id },
      });
      console.log(user);
      res.status(200).render("profile", { user });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errMesage: "조회 실패" });
    }
  },

  postSignup: async (req, res) => {
    try {
      const { email, username, pw, newcomer, nickname } = req.body;
      const requiredData = [email, username, pw, newcomer, nickname];

      if (!requiredData.every((data) => data)) {
        return res
          .status(400)
          .json({ errMessage: "필수값을 모두 입력해주세요." });
      }
      const isExistEmail = await models.user.findOne({
        where: { email },
      });

      if (isExistEmail) {
        return res
          .status(401)
          .json({ errMessage: "이미 존재하는 이메일입니다." });
      }

      const saltRounds = 10;
      const hashedPw = await bcrypt.hash(pw, saltRounds);

      await models.user.create({
        email,
        username,
        password: hashedPw,
        newcomer,
        nickname,
      });
      res.status(200).json({ message: "회원가입에 성공하였습니다" });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errMessage: "회원가입 실패" });
    }
  },

  postSignin: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await models.user.findOne({
        where: { email },
      });
      if (!user) {
        return res
          .status(401)
          .json({ errMessage: "아이디나 비밀번호가 일치하지 않습니다." });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ errMessage: "아이디나 비밀번호가 일치하지 않습니다." });
      }

      // let expires = new Date();
      // expires.setMinutes(expires.getMinutes() + 60);
      //jwt 를 이용한 토큰 발급
      const token = jwt.sign({ userId: user.id }, "jomcommunity-key", {
        expiresIn: "1h",
      });

      res.cookie("authorization", `Bearer ${token}`);
      res.status(200).json({ message: "로그인 성공" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ errMessage: "로그인 실패" });
    }
  },

  updateUser: async (req, res) => {
    console.log(req.body);
    try {
      const { id, email, username, password, newcomer, nickname } = req.body;

      await models.user.update(
        { email, username, password, newcomer, nickname },
        { where: { id } }
      );
      res.status(200).render("profile", { user: { id, password } });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errMessage: "수정 실패" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.query;

      await models.User.destroy({
        where: { id },
      });
      res.status(200).json({ message: "탈퇴 완료" });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errMessage: "탈퇴 실패" });
    }
  },
};
