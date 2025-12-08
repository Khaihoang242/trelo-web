/* eslint-disable no-useless-catch */
import ApiError from "~/utils/ApiError";
import { slugify } from "~/utils/formatters";
import { boardModel } from "~/models/boardModel";
import { StatusCodes } from "http-status-codes";
import { cloneDeep } from "lodash";
import { ObjectId } from "mongodb";
import { columnModel } from "~/models/columnModel";
import { cardModel } from "~/models/cardModel";
import { DEFAULT_ITEMS_PER_PAGE,DEFAULT_PAGE } from "~/utils/constants";
const createNew = async (userId,reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    };
    // goi toi tang model xu li ban luu newboard vao trong db
    const createdBoard = await boardModel.createNew(userId,newBoard);
    console.log("createdBoard ben service ");
    console.log(createdBoard);

    const getNewBoard = await boardModel.findOneById(
      createdBoard.insertedId.toString()
    );
    console.log("getNewBoard ben service");
    console.log(getNewBoard);
    //tra ket qua ve
    return getNewBoard;
  } catch (error) {
    throw error;
  }
};
const getDetails = async (userId,boardId) => {
  console.log("boardId",boardId)
  try {
    const board = await boardModel.getDetails(userId,boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found!")
    }

    // deep clone để xử lý tránh ảnh hưởng dữ liệu gốc
    const resBoard = cloneDeep(board)

    // gán card về đúng column
    resBoard.columns.forEach((column) => {
      column.cards = resBoard.cards.filter(
        (card) => card.columnId.toString() === column._id.toString()
      )
    })

    // xóa mảng cards tổng, chỉ giữ cards trong từng column
    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}


const deleteBoard = async (boardId) => {
  console.log(boardId);
  try {
    const board = await boardModel.deleteOneById(boardId);
    return board;
  } catch (error) {
    throw error;
  }
};
const update = async (boardId, reqBody) => {

  try {
    const updateData ={
      ...reqBody,
      updateAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData);
    return updatedBoard;
  } catch (error) {
    throw error;
  }
};
const moveCardToDifferentColumn = async ( reqBody) => {

  try {
    // B1: Cap nhap mang cardorderIds cua column ban dau chua no
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds:reqBody.prevCardOrderIds,
      updateAt: Date.now()
    });
    //B2: Cap nhap mang cardOrderIds cua column tiep theo
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds:reqBody.nextCardOrderIds,
      updateAt: Date.now()
    });
    //B3: Cap nhap lai truong columnId moi cua card da keo
await cardModel.update(reqBody.currentCardId,{
  columnId: reqBody.nextColumnId
})
    return {updateResult : 'Suscessfully'};
  } catch (error) {
    throw error;
  }
};
const getBoards = async (userId, page, itemsPerPage,queryFilters) => {
  try {
    // Nếu không tồn tại page hoặc itemsPerPage từ phía FE thì BE sẽ cần phải luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    console.log("page",page)
    console.log("itemsPerPage",itemsPerPage)
    const results = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10),queryFilters)

    return results
  } catch (error) { throw error }
}


export const boardService = {
  createNew,
  getDetails,
  deleteBoard,
  update,
  moveCardToDifferentColumn,
  getBoards
};
