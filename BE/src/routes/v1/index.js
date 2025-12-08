import express from "express";
import { StatusCodes } from "http-status-codes";
import { userRoute } from "./userRoute";
import {otpRoute} from "./otpRoute";
const Router = express.Router();
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({ message: " API v1" });
});

// user api
Router.use("/users", userRoute);
// otp api
Router.use("/otp", otpRoute);
export const APIs_V1 = Router;
