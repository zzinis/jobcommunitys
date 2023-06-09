const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const db = require("./src/models");
const PORT = 8000;
const indexRouter = require("./src/routes/indexRouter");

const { sequelize } = require("./src/models");
const root = process.cwd();

// TODO: 해당 부분 삭제
// DB 동기화
// sequelize 설정 - 동기화 진행
sequelize
  .sync({ force: false }) //true면 서버 실행마다 테이블 재생성
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

// forien key 조건에 의해 데이터가 안들어갈 수 있어서 초기값을 미리 설정하고 진행한다.
async function initData() {
  try {
    const category1 = await db.category.findOne({
      where: { category_name: "취업" },
    });
    const category2 = await db.category.findOne({
      where: { category_name: "이직" },
    });
    if (!category1) {
      await db.category.create({
        category_name: "취업",
      });
    }
    if (!category2) {
      await db.category.create({
        category_name: "이직",
      });
    }
  } catch (error) { }
}
initData();
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use("/views", express.static(path.join(__dirname, "src", "views")));
app.use("/public", express.static(__dirname + "public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", indexRouter);

app.get("*", (req, res) => {
  res.render("404");
});

app.listen(PORT, () => {
  console.log(PORT + "포트로 실행");
});