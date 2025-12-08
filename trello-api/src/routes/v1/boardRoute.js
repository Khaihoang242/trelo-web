import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardValidation } from "~/validations/boardValidation";
import { boardController } from "~/controllers/boardController";
import { authMiddleware } from "~/middlewares/AuthMiddleware";
const Router = express.Router();
Router.route("/")
  .get(authMiddleware.isAuthorized,boardController.getBoards
  )
  .post(authMiddleware.isAuthorized,boardValidation.createNew, boardController.createNew);
Router.route("/:id")
  .get(authMiddleware.isAuthorized,boardController.getDetails)
  .put(authMiddleware.isAuthorized,boardValidation.update, boardController.update)
  .delete(boardController.deleteBoard);
// Api ho tro di chuyen card giua column khac nhau   
Router.route('/supports/moving_card')
.put(authMiddleware.isAuthorized,boardValidation.moveCardToDifferentColumn,boardController.moveCardToDifferentColumn)
export const boardRoute = Router;
