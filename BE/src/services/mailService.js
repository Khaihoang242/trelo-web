import { transporter } from "~/config/mail"
import { env } from "~/config/environment"

export const sendVerifyMail = async (to, otp, link) => {
  await transporter.sendMail({
    from: `Support <${env.MAIL_USER}>`,
    to,
    subject: "Xác thực và đặt lại mật khẩu",
    html: `
      <h3>Mã OTP của bạn</h3>
      <h2 style="color:red">${otp}</h2>
      <p>Hiệu lực 15 phút</p>
      <hr/>
      <p>Hoặc bấm link để đặt lại mật khẩu:</p>
      <a href="${link}">${link}</a>
    `
  })
}
