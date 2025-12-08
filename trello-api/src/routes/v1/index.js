import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardRoute } from "~/routes/v1/boardRoute";
import { columnRoute } from "~/routes/v1/columnRoute";
import { cardRoute } from "~/routes/v1/cardRoute";
import { userRoute } from "./userRoute";
import { invitationRoute } from "./invitationRoute";
const Router = express.Router();
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({ message: " API v1" });
});
// boards api
Router.use("/boards", boardRoute);
// column api
Router.use("/columns", columnRoute);
// card api
Router.use("/cards", cardRoute);
// user api
Router.use("/users", userRoute);
// invitition api
Router.use("/invitations", invitationRoute);
export const APIs_V1 = Router;
