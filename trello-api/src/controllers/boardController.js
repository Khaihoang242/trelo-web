import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { boardService } from "~/services/boardService";
import { ObjectId } from "mongodb";
const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // dieu huong du lieu sang tang service
    const createdBoard = await boardService.createNew(userId,req.body);
    //co ket qua tra ve phia client
    res.status(StatusCodes.CREATED).json(createdBoard);
  } catch (error) {
    next(error);
  }
};
const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id;
    const board = await boardService.getDetails(userId,boardId);
    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};
const deleteBoard = async (req, res, next) => {
  try {
    const boardId = req.params.id;
    const board = await boardService.deleteBoard(boardId);
    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    next(error);
  }
};
const update = async (req, res, next) => {
  try {
    const boardId = req.params.id;
    const data = req.body;
    const updatedBoard = await boardService.update(boardId, data);
    res.status(StatusCodes.OK).json(updatedBoard);
  } catch (error) {
    next(error);
  }
};
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await boardService.moveCardToDifferentColumn(data);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const getBoards = async( req, res ,next) =>{
  try {
    const userId = req.jwtDecoded._id
    // page va itemsPerPage dc truyen vao trong query url tu phia FE nen BE lay thong qua req.query
    const { page, itemsPerPage, q} = req.query 
    const queryFilters = q
    const result = await boardService.getBoards(userId, page , itemsPerPage,queryFilters)
    // console.log("userId",userId)
    // console.log("page",page)
    // console.log("itemsPerPage",itemsPerPage)
    
    res.status(StatusCodes.OK).json(result)
    
  } catch (error) { next(error)
  }

}
export const boardController = {
  createNew,
  getDetails,
  deleteBoard,
  update,
  moveCardToDifferentColumn,
  getBoards
};
