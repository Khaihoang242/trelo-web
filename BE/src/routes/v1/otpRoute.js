import express from "express";
import { sendOtpByPhone, verifyOtpByPhone } from "~/controllers/otpController";

const Router = express.Router();

Router.post("/send-sms", sendOtpByPhone);
Router.post("/verify-sms", verifyOtpByPhone);

export const otpRoute = Router
