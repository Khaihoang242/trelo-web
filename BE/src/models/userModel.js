/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '~/utils/validators'

// Define tạm 2 roles cho user, tuỳ việc mở rộng dự án như thế nào mà mọi người có thể thêm role tuỳ ý sao cho phù hợp sau.
const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
}


// Define Collection (name & schema)
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE), // unique
  password: Joi.string().required(),
  displayName: Joi.string().required().trim().strict(),
  phone: Joi.string()
    .pattern(/^(0|\+84)[0-9]{9}$/)
    .message("Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)"),
  address: Joi.string(),
  // username cắt ra từ email sẽ có khả năng không unique bởi vì sẽ có những tên email trùng nhau nhưng từ domain khác nhau
  username: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(''),
  role: Joi.string().valid(...Object.values(USER_ROLES)).default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  blocked: Joi.boolean().default(false),
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verifyOtp: String,
  verifyOtpExpires: Date,
})

// Chỉ định ra những Fields mà chúng ta không muốn cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', 'email', 'username', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) { throw new Error(error) }
}

const findOneById = async (userId) => {
  try {
    console.log('userId param:', userId)

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(userId) })
    return result
  } catch (error) { throw new Error(error) }
}

const findOneByEmail = async (emailValue) => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: emailValue })
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (userId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' } // sẽ trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) { throw new Error(error) }
}
const countByRole = async (role) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .countDocuments({ role })

    return result
  } catch (error) {
    throw error
  }
}
const findOneByIdentifier = async (identifier) => {
  const db = GET_DB().collection(USER_COLLECTION_NAME)
  // detect email hay phone dựa pattern
  const isEmail = identifier.includes('@')
  const query = isEmail ? { email: identifier } : { phone: identifier }
  const r = await db.findOne(query)
  return r
}

const updateVerifyInfo = async (userId, data) => {
  try {
    // Chỉ cho phép cập nhật các field verify
    const allowedFields = [
      "verifyOtp",
      "verifyOtpExpires",
      "resetPasswordToken",
      "resetPasswordExpires"
    ]

    Object.keys(data).forEach(field => {
      if (!allowedFields.includes(field)) {
        delete data[field] // Xoá field không hợp lệ
      }
    })

    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: data },
        { returnDocument: "after" }
      )

    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  update,
  countByRole,
  findOneByIdentifier,
  updateVerifyInfo
}
