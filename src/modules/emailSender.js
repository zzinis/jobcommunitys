const nodemailer = require("nodemailer"); //npm 으로 설치한 nodemailer 모듈을 가져온다.

const email = {
  //메일 발송을 하기 위한 설정 객체를 만들어준다.
  host: "sandbox.smtp.mailtrap.io", //mailtrap에서 제공하는 SMTP 메일서버 정보를 바탕으로 객체 완성
  port: 2525,
  secure: false,
  auth: {
    user: "206f7c62055760",
    pass: "48c7770d5d2fd9",
  },
};

const sendEmail = async (data) => {
  try {
    const transporter = nodemailer.createTransport(email);
    const info = await transporter.sendMail(data);
    console.log("이메일 발송에 성공하였습니다.", info.response);
  } catch (error) {
    console.error("이메일 발송에 실패하였습니다.", error);
    throw error;
  }
};

module.exports = sendEmail;
