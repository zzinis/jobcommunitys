const axios = require("axios");
exports.getExternalData = async (req, res) => {
  try {
    // http://openapi.seoul.go.kr:8088/6d425a6e6964706633346d76686c73/JSON/GetJobInfo/1/5
    const API_URL = "http://openapi.seoul.go.kr:8088"; // api url
    const API_KEY = "6d425a6e6964706633346d76686c73"; // 인증키
    const API_TYPE = "json"; // 요청파일 타입
    const API_SERVICE = "GetJobInfo"; // 서비스명
    let API_START_INDEX = 1; // 요청시작위치
    let API_END_INDEX = 8; // 요청종료위치

    // 학력코드 (J00108:전문대학, J00104:중학교, J00106:고등학교, J00102:초등학교, J00110:대학_대학교, J00100:관계없음, J00114:박사과정)
    // education_type
    // const API_ACDMCR_CMMN_CODE_SE = req.body.education_type ? req.body.education_type : '';

    // 고용형태코드 (J01102:계약직, J01105:상용직(시간제), J01101:상용직, J01103:계약직(시간제))
    // employment_type
    // const API_EMPLYM_STLE_CMMN_CODE_SE = req.body.employment_type ? req.body.employment_type : '';

    // 경력조건코드(J01301: 신입, J01302: 경력, J01300: 무관)
    // career_condition
    // const API_CAREER_CND_CMMN_CODE_SE = req.body.career_condition ? req.body.career_condition : '';

    const API_ACDMCR_CMMN_CODE_SE = "J00108";
    const API_EMPLYM_STLE_CMMN_CODE_SE = "J01102";
    const API_CAREER_CND_CMMN_CODE_SE = "J01301";

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

    const resData = response.data.GetJobInfo;
    const data = {
      total: resData.list_total_count,
      result_code: resData.RESULT.CODE,
      result_message: resData.RESULT.MESSAGE,
      row: resData.row,
    };
    // 데이터 에러처리
    if (data.result_code !== "INFO-000") {
      // 에러 처리 로직을 여기에 작성합니다.
      console.error("API 오류:", data.result_message);
      res.writeHead(200, { "Content-Type": "text/html;charset=UTF-8" });
      res.write(
        "<script>alert('해당하는 데이터가 없습니다') window.location = document.referrer;</script>"
      );

      // res.redirect('/jobInfo');
      // 예를 들면, 사용자에게 오류 메시지를 표시하거나 로깅할 수 있습니다.
    } else {
      // 에러가 없는 경우 정상적인 처리 로직을 여기에 작성합니다.
      console.log("데이터:", data.row);

      // res.send(data);
      res.render("jobInfo", resData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
/**
 * 출력할 데이터
 * CMPNY_NM                   기업명칭
 * BSNS_SUMRY_CN              사업요약내용
 * JOBCODE_NM                 모집직종코드명
 * ACDMCR_NM                  학력코드명
 * EMPLYM_STLE_CMMN_MM        고용형태코드명
 * WORK_PARAR_BASS_ADRES_CN   근무예정지 주소
 * DTY_CN                     직무내용
 * CAREER_CND_NM              경력조건코드명
 * HOPE_WAGE                  급여조건
 * RET_GRANTS_NM              퇴직금구분
 * WORK_TIME_NM               근무시간
 * WORK_TM_NM                 근무형태
 * JO_FEINSR_SBSCRB_NM        4대보험
 * RCEPT_CLOS_NM              마감일
 * MODEL_MTH_NM               전형방법
 * RCEPT_MTH_NM               접수방법
 * PRESENTN_PAPERS_NM         제출서류
 * MNGR_PHON_NO               담당 상담사 전화번호
 * MNGR_INSTT_NM              담당 상담사 소속기관명
 * BASS_ADRES_CN              기업 주소
 */
