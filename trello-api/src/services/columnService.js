/* eslint-disable no-useless-catch */
import { get } from "lodash";
import { columnModel } from "~/models/columnModel";
import { boardModel } from "~/models/boardModel";
import { cardModel } from "~/models/cardModel";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody,
    };
    const createdColumn = await columnModel.createNew(newColumn);
    const getNewColumn = await columnModel.findOneById(
      createdColumn.insertedId.toString()
    );
    if (getNewColumn) {
      getNewColumn.cards = [];
      // cap nhap mang columnOrderIds
      await boardModel.pushColumnOrderIds(getNewColumn);
    }
    return getNewColumn;
  } catch (error) {
    throw error;
  }
};
const update = async (columnId, reqBody) => {

  try {
    const updateData ={
      ...reqBody,
      updateAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData);
    return updatedColumn;
  } catch (error) {
    throw error;
  }
};
const deleteItem = async (columnId) => {

  try {
    const targetColumn = await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column Not Found!')
    }
// xoa column 
await columnModel.deleteOneById(columnId)

// xoa toan bo card  thuoc column tren 
await cardModel.deleteManyByColumnId(columnId)
// xoa columnId trong mang columnOrderIdsIds cua Boards
await boardModel.pullColumnOrderIds(targetColumn)
    return {deleteResult : 'Column and Cards deleted successfully'};
  } catch (error) {
    throw error;
  }
};
export const columnService = {
  createNew,
  update,
  deleteItem
}