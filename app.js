const express = require("express");
const app = express();
const path = require("path");

const PORT = 8000;
const indexRouter = require("./src/routes/indexRouter");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use("/views", express.static(path.join(__dirname, "src", "views")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", indexRouter);

app.get("*", (req, res) => {
  res.render("404");
});

app.listen(PORT, () => {
  console.log(PORT + "포트로 실행");
});
