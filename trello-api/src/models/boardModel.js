/* eslint-disable indent */
import Joi from "joi";
import { ObjectId, ReturnDocument } from "mongodb";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { GET_DB } from "~/config/mongodb";
import { ClientSession } from "mongodb";
import { sync } from "rimraf";
import { BOARD_TYPES } from "~/utils/constants";
import { columnModel } from "./columnModel";
import { cardModel } from "./cardModel";
import { userModel } from "./userModel";
import { pagingSkipValue } from "~/utils/algorithms";

// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = "boards";
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
    //nhung admin cua board
  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
    // thanh vien cua board
  memberIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});
// chi dinh nhung truong khong muon cap nhap trong ham update
const INVALID_UPDATE_FIELDS =['_id','createAt']
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const createNew = async (userId,data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const newBoardToAdd ={
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }

    const createdBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(newBoardToAdd);
    return createdBoard;
  } catch (error) {
    throw new Error(error);
  }
};
const findOneById = async (id) => {
  try {
    console.log(id);
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (userId, boardId) => {
  console.log("getDetails id:", boardId);
  try {
    const queryConditions =[
      {_id: new ObjectId(boardId),},
      {_destroy : false},
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { $and : queryConditions} },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "columns"
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "cards"
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'ownerIds',
            foreignField: '_id',
            as: 'owners',
            // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'memberIds',
            foreignField: '_id',
            as: 'members',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        }
        
      ])
      .toArray()


    return result[0] || null 
  } catch (error) {
    throw new Error(error)
  }
}
// push gia tri columnId vao cuoi mang columOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(column.boardId),
        },
        {
          $push: { columnOrderIds: new ObjectId(column._id) },
        },
        {
          ReturnDocument: "after",
        }
      );
    return result
  } catch (error) {
    throw new Error(error);
  }
};
// lay mot ptu columnId ra khoi mang columnOrderIds
// dung $pull de lay mot ptu ra khoi mang va xoa no di 
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(column.boardId),
        },
        {
          $pull: { columnOrderIds: new ObjectId(column._id) },
        },
        {
          ReturnDocument: "after",
        }
      );
    return result
  } catch (error) {
    throw new Error(error);
  }
};

const deleteOneById = async (id) => {
  try {
    // Kiểm tra ID hợp lệ trước khi convert
    if (!ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ – phải là chuỗi hex 24 ký tự");
    }

    const newId = new ObjectId(id);
    console.log("newId:", newId);

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: newId },
        { $set: { _destroy: true } },
        { returnDocument: "after" }
      );

    return result.value;
  } catch (error) {
    console.error("Lỗi trong deleteOneById:", error);
    throw error;
  }
};

const update = async (boardId, updateData) => {
  try {
    // loc nhung field khong cho phep cap nhap
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    if (updateData.cardOrderIds) {
      updateData.columnOrderIds = updateData.cardOrderIds.map(_id => ( new ObjectId(_id)))
    }
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(boardId),
        },
        {
          $set: updateData },
        {
          ReturnDocument: "after",
        }
      );
    return result
  } catch (error) {
    throw new Error(error);
  }
};
const getBoards = async (userId, page, itemsPerPage,queryFilters) => {
  try {
    const queryConditions =[
      // dk 1 : Board chua bi xoa
      {_destroy : false},
      // dk 2 cai userId dang thuc hien request no phai thuoc vao mot trong hai cai mang ownerIds hoac memberIds , su dung toan tu $all cua mongodb
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]
    // xu li qureyFilters cho tung truong hop searchBoard 
    if (queryFilters) {
     
     Object.keys(queryFilters).forEach( key => {
      // co phan biet chu hoa chu thuong 
      // queryConditions.push({ [key] : { $regex: queryFilters[key] } })
      // khong phan biet chu hoa va thuong
      queryConditions.push({ [key] : { $regex: new RegExp(queryFilters[key], 'i') } })
     })

    }

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and : queryConditions} },
        // sort title cua board theo A-Z 
        { $sort: { title: 1 } },
        // $facet de xu li nhieu luong trong 1 query
        {$facet: { 
          // luong thu 1 : query boards
          'queryBoards' : [
            { $skip: pagingSkipValue(page, itemsPerPage)}, // bo qua so luong ban ghi cua nhung page truoc do 
            { $limit: itemsPerPage} // Gioi han toi da so luong ban ghi tra ve tren 1 page 

          ],
          // Luong thu 2 : query den tong so luong ban ghi board trong db va tra ve vao bien countedAllBoards
          'queryTotalBoards': [{ $count: 'countedAllBoards' } ]
        } }
    ],
    // Khai bao them thuoc tinh collation locale 'en' de fix vu chu B hoa va a thuong o tren
    { collation: { locale: 'en' } }
  ).toArray()
  console.log('query', query)
  const res= query[0]
  return {
    boards: res.queryBoards || [],
    totalBoards: res.queryTotalBoards?.countedAllBoards || 0
  }
  } catch (error) {
    throw new Error(error);
  }
};
const pushMemberIds = async ( boardId ,userId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(boardId),
        },
        {
          $push: { memberIds: new ObjectId(userId) },
        },
        {
          ReturnDocument: "after",
        }
      );
    return result
  } catch (error) {
    throw new Error(error);
  }
};
export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  deleteOneById,
  update,
  pullColumnOrderIds,
  getBoards,
  pushMemberIds
};
