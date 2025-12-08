import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const OTP_COLLECTION_NAME = 'otps'

const createOtp = async (data) => {
  return await GET_DB()
    .collection(OTP_COLLECTION_NAME)
    .insertOne(data)
}

const findByPhone = async (phone) => {
  return await GET_DB()
    .collection(OTP_COLLECTION_NAME)
    .findOne({ phone })
}

const updateOtp = async (phone, otp, expiresAt) => {
  return await GET_DB()
    .collection(OTP_COLLECTION_NAME)
    .findOneAndUpdate(
      { phone },
      { $set: { otp, expiresAt } },
      { upsert: true, returnDocument: 'after' }
    )
}

const deleteByPhone = async (phone) => {
  return await GET_DB()
    .collection(OTP_COLLECTION_NAME)
    .deleteOne({ phone })
}

export const otpModel = {
  createOtp,
  findByPhone,
  updateOtp,
  deleteByPhone
}
