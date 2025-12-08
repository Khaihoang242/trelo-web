import dayjs from "dayjs";
import { otpModel } from "~/models/OtpModel"
import { sendOTPviaSMS } from "~/services/smsService";

export const sendOtpByPhone = async (req, res, next) => {
  try {

    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Thiếu số điện thoại" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = dayjs().add(15, "minute").toDate();

    await otpModel.updateOtp(
      { phone },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await sendOTPviaSMS(phone, otp);

    return res.json({
      message: "Đã gửi OTP qua SMS",
      expiredAt: expiresAt
    });
  } catch (err) {
    next(err);
  }
};
export const verifyOtpByPhone = async (req, res, next) => {
    try {
      const { phone, otp } = req.body;
  
      const record = await otpModel.findOne({ phone });
  
      if (!record) return res.status(400).json({ message: "OTP không tồn tại" });
  
      if (record.otp !== otp)
        return res.status(400).json({ message: "OTP sai" });
  
      if (dayjs().isAfter(record.expiresAt))
        return res.status(400).json({ message: "OTP đã hết hạn" });
  
      await otpModel.deleteOne({ phone });
  
      res.json({ message: "OTP hợp lệ" });
    } catch (err) {
      next(err);
    }
  };
  