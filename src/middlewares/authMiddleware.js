const jwt = require("jsonwebtoken");
const model = require("../models");

module.exports = async (req, res, next) => {
  const { authorization } = req.cookies;
  //null 병합 문자열을 이용해서 authorization 이 undefined 일 경우 빈 문자열을 할당하여 에러를 막아줌
  const [authType, authToken] = (authorization ?? "").split(" ");
  if (authType !== "Bearer" || !authToken) {
    res.status(401).json({ errMessage: "로그인 후 이용할 수 있습니다." });
    return;
  }

  //try catch를 이용한 에러핸들링
  try {
    // 1. authToken이 만료되었는지 확인
    // 2. authToken이 서버가 발급한 토큰이 맞는지 검증 (비밀키)
    const { userId } = jwt.verify(authToken, "jobcommunity-key");

    // 3. authToken에 있는 userId에 해당하는 사용자가 db에 있는지 확인
    const user = await model.user.findByPk(userId);
    if (!user) {
      return res
        .status(401)
        .json({ message: "토큰에 해당하는 사용자가 없습니다." });
    }
    res.locals.user = user;

    next();
  } catch (err) {
    res.clearCookie("authorization"); //인증에 실패 할 경우 쿠키 삭제
    console.error(error);
    res
      .status(401)
      .json({ errMessage: "로그인 후에 사용할 수 있는 기능입니다." });
  }
};
