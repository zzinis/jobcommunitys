const axios = require("axios");
exports.getExternalData = async (req, res) => {
  try {
    const apiKey = "6d425a6e6964706633346d76686c73"; // api 사용을 위한 인증키
    const apiUrl = "url"; // api url
    const url = "url"; // axios get할 url
    const response = await axios.get(url);
    const data = response.data;
    // 데이터 처리 작업 수행
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
