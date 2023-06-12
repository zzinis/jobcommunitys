const db = require("../models");
const { Op } = require("sequelize");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const secretKey = "jomcommunity-key";

exports.getMain = async (req, res) => {
  try {
    // JWT 토큰
    const token = req.cookies.authorization
      ? req.cookies.authorization.split(" ")[1]
      : null;

    let userId = null;
    let loginOrNot = false;
    if (token) {
      // 토큰이 존재하는 경우, 토큰을 검증하여 사용자 정보를 확인
      const decoded = jwt.verify(token, secretKey);
      userId = decoded.userId;
      loginOrNot = true;
    }

    // 조회순 TOP 10
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const viewsTops = await db.question.findAll({
      //   where: {
      //     created_At: {
      //       [Op.gte]: today,
      //     },
      //   },
      order: [["views", "DESC"]],
      limit: 5,
    });

    // 공감순 TOP 10
    const favoriteTops = await db.question.findAll({
      //   where: {
      //     created_At: {
      //       [Op.gte]: today,
      //     },
      //   },
      order: [["favorite", "DESC"]],
      limit: 5,
    });

    const resData = {
      viewsTops: viewsTops,
      favoriteTops: favoriteTops,
      loginOrNot: loginOrNot,
      userId: userId,
    };

    res.render("main", resData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
