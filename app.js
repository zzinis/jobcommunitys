const express = require("express");
const app = express();
const PORT = 8000;
const mainRouter = require("./routes/mainRouter");

app.set("view engine", "ejs");
app.use("/views", express.static(__dirname + "/views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", mainRouter);

app.get("*", (req, res) => {
  res.render("404");
});

app.listen(PORT, () => {
  console.log(PORT + "포트로 실행");
});
