import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb' // Giả định đường dẫn
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators' // Giả định đường dẫn
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants' // Giả định đường dẫn
import { userModel } from './userModel'
import { boardModel } from './boardModel' // Import boardModel để lấy tên collection
const INVITATION_COLLECTION_NAME = 'invitations'

// Giả định: Sử dụng thư viện Joi để định nghĩa Schema
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // người đi mời
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // người được mời
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),

  // Lời mời là board thì sẽ thêm dữ liệu boardInvitation - optional
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// Chỉ định ra những Fields mà chúng ta không muốn cho phép cập nhật trong update()
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

// Hàm validate dữ liệu trước khi tạo mới (Giả định)
const validateBeforeCreate = async (data) => {
  // Giả định: INVITATION_COLLECTION_SCHEMA.validateAsync là hàm của Joi
  // Cần biến đổi inviterId và inviteeId sang ObjectId trước khi validate nếu Joi Schema là string,
  // nhưng ở đây giả định Joi Schema là string và việc validate ObjectId được thực hiện qua pattern.
  // Tuy nhiên, đối với việc insert vào DB, cần chuyển sang ObjectId.
  // Để đơn giản, ta sẽ chỉ chuyển đổi khi insert (ở hàm createNewBoardInvitation).
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// Hàm insert vào DB
const createNewBoardInvitation = async (newInvitationToAdd) => {
  try {
    const validatedData = await validateBeforeCreate(newInvitationToAdd) // Giả định

    // Chuyển đổi inviterId và inviteeId từ string sang ObjectId trước khi insert
    const dataToInsert = {
      ...validatedData,
      inviterId: new ObjectId(validatedData.inviterId),
      inviteeId: new ObjectId(validatedData.inviteeId)
    }

    // Nếu có boardInvitation, boardId cũng cần được chuyển sang ObjectId
    if (dataToInsert.boardInvitation && dataToInsert.boardInvitation.boardId) {
      dataToInsert.boardInvitation = {
        ...dataToInsert.boardInvitation,
        boardId: new ObjectId(dataToInsert.boardInvitation.boardId)
      }
    }

    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(dataToInsert)
    return createdInvitation
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (invitationId) => {
  try {
    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({
      _id: new ObjectId(invitationId)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (invitationId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho phép cập nhật tĩnh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    // Đối với những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.boardInvitation && updateData.boardInvitation.boardId) {
      // Chỉ cần biến đổi boardId, các field khác (như status) sẽ được giữ nguyên
      updateData.boardInvitation.boardId = new ObjectId(updateData.boardInvitation.boardId)
    }

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(invitationId) },
      { $set: updateData },
      { returnDocument: 'after' } // sẽ trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Query tổng hợp lấy những bản invitions thuộc về một user cụ thể
const findByUser = async (userId) => {
  try {
    // SỬA ĐỔI: Chuyển userId sang ObjectId NGAY LÚC ĐẦU để sử dụng trong $match
    const userObjectId = new ObjectId(userId)

    const queryConditions = [
      // SỬA ĐỔI: So sánh trực tiếp với ObjectId
      { inviteeId: userObjectId }, // tìm theo người được mời là người đang thực hiện request này
      { _destroy: false }
    ]

    const results = await GET_DB()
      .collection(INVITATION_COLLECTION_NAME)
      .aggregate([
        { $match: { $and: queryConditions } },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME, // Lấy tên collection từ userModel
            localField: 'inviterId',
            foreignField: '_id',
            as: 'inviter',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME, // Lấy tên collection từ userModel
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee',
            pipeline: [{ $project: { password: 0, verifyToken: 0 } }]
          }
        },
        {
          $lookup: {
            from: boardModel.BOARD_COLLECTION_NAME, // SỬA ĐỔI: Tên collection phải lấy từ boardModel
            localField: 'boardInvitation.boardId', // thông tin của board
            foreignField: '_id',
            as: 'board'
          }
        }
      ])
      .toArray()
    return results
  } catch (error) {
    throw new Error(error)
  }
}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
  findByUser
}