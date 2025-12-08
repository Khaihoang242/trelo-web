import twilio from "twilio";
import { env } from "~/config/environment";

const client = twilio(env.TWILIO_SID, env.TWILIO_TOKEN);

export const sendOTPviaSMS = async (phone, otp) => {
    console.log("SID:", env.TWILIO_SID);
    console.log("TOKEN:", env.TWILIO_TOKEN);
    console.log("PHONE:", env.TWILIO_PHONE);
    

  return client.messages.create({
    from: env.TWILIO_PHONE,
    to: phone,
    body: `Ma OTP cua ban la: ${otp}. Het han sau 15 phut.`
    
  });
};
