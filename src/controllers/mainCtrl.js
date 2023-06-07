const db = require("../models");
const { Op } = require("sequelize");

exports.getMain = async (req, res) => {
  try {
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
    };
    // res.send(resData);
    res.render("main", resData);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
