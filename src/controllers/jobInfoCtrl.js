const axios = require("axios");
const jwt = require("jsonwebtoken");
const secretKey = "jomcommunity-key";

exports.getExternalData = async (req, res) => {
  try {
    // 로그인 유무 판별용
    // JWT 토큰
    const token = req.cookies.authorization
      ? req.cookies.authorization.split(" ")[1]
      : null;

    let loginOrNot = false;
    if (token) {
      // 토큰이 존재하는 경우, 토큰을 검증하여 사용자 정보를 확인
      const decoded = jwt.verify(token, secretKey);
      userId = decoded.userId;
      loginOrNot = true;
    }

    const limit = 8; // 한 화면에 출력될 게시물 수
    const currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지
    // API 호출
    const API_URL = "http://openapi.seoul.go.kr:8088"; // api url
    const API_KEY = "6d425a6e6964706633346d76686c73"; // 인증키
    const API_TYPE = "json"; // 요청파일 타입
    const API_SERVICE = "GetJobInfo"; // 서비스명
    let API_START_INDEX = currentPage > 1 ? (currentPage - 1) * limit + 1 : 1; // 요청시작위치
    let API_END_INDEX =
      currentPage > 1 ? (currentPage - 1) * limit + (limit + 1) : limit; // 요청종료위치

    // 아무 값이 없으면 " " 한칸 띄어쓰기 필요
    // 학력코드 (J00108:전문대학, J00104:중학교, J00106:고등학교, J00102:초등학교, J00110:대학_대학교, J00100:관계없음, J00114:박사과정)
    const API_ACDMCR_CMMN_CODE_SE = req.query.EDU_TYPE
      ? req.query.EDU_TYPE
      : " ";

    // 고용형태코드 (J01102:계약직, J01105:상용직(시간제), J01101:상용직, J01103:계약직(시간제))
    const API_EMPLYM_STLE_CMMN_CODE_SE = req.query.EMP_TYPE
      ? req.query.EMP_TYPE
      : " ";

    // 경력조건코드(J01301: 신입, J01302: 경력, J01300: 무관)
    const API_CAREER_CND_CMMN_CODE_SE = req.query.CAR_TYPE
      ? req.query.CAR_TYPE
      : " ";

    const REQ_URL =
      API_URL +
      "/" +
      API_KEY +
      "/" +
      API_TYPE +
      "/" +
      API_SERVICE +
      "/" +
      API_START_INDEX +
      "/" +
      API_END_INDEX +
      "/" +
      API_ACDMCR_CMMN_CODE_SE +
      "/" +
      API_EMPLYM_STLE_CMMN_CODE_SE +
      "/" +
      API_CAREER_CND_CMMN_CODE_SE;

    const response = await axios.get(REQ_URL);

    if (
      response.data.GetJobInfo === undefined ||
      response.data.GetJobInfo.RESULT.CODE !== "INFO-000"
    ) {
      console.error("API 오류:", response.data.GetJobInfo.RESULT.MESSAGE);
      return res.status(500).send(response.data.GetJobInfo.RESULT.MESSAGE);
    } else {
      const resData = response.data.GetJobInfo;
      const data = {
        total: resData.list_total_count,
        result_code: resData.RESULT.CODE,
        result_message: resData.RESULT.MESSAGE,
        row: resData.row,
      };

      // 토탈 게시물 수
      const totalCount = parseInt(data.total);
      // 페이징 용
      const countPage = 7; // 한 화면에 출력될 페이지 수
      let totalPages = parseInt(totalCount / limit); // 총페이지 수

      if (totalCount % limit > 0) {
        totalPages = totalPages + 1;
      }
      if (totalPages < currentPage) {
        currentPage = totalPages;
      }
      const startPage =
        currentPage > 2 ? ((currentPage - 1) / countPage) * countPage + 1 : 1;
      const endPage = totalPages > 2 ? startPage + countPage - 1 : totalPages;
      const renderData = {
        total: data.total,
        result_code: data.result_code,
        result_message: data.result_message,
        row: data.row,
        page: { totalPages, currentPage, startPage, endPage },
        searchType: {
          EDU_TYPE: API_ACDMCR_CMMN_CODE_SE,
          EMP_TYPE: API_EMPLYM_STLE_CMMN_CODE_SE,
          CAR_TYPE: API_CAREER_CND_CMMN_CODE_SE,
        },
        loginOrNot: loginOrNot,
      };
      res.render("jobInfo", renderData);
    }
  } catch (error) {
    console.log("err!!");
    console.error("일반 오류:", error);
    res.status(500).send("일반 오류 발생");
  }
};
