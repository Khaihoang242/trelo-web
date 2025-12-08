/* eslint-disable indent */
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const verifyAccount = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    token: Joi.string().required()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const update = async (req, res, next) => {
  // Định nghĩa Schema (Điều kiện đúng) cho dữ liệu cập nhật
  const correctCondition = Joi.object({
      // Tên hiển thị: là chuỗi, loại bỏ khoảng trắng dư thừa, là tùy chọn
      displayName: Joi.string().trim().strict().optional(), 
      current_password: Joi.string().pattern(PASSWORD_RULE).message('current_password: ${PASSWORD_RULE_MESSAGE}').optional(),   
      new_password: Joi.string().pattern(PASSWORD_RULE).message('new_password: ${PASSWORD_RULE_MESSAGE}').optional(),
  }).strict() // strict() đảm bảo không có trường nào ngoài các trường đã định nghĩa được gửi lên

  try {
      // Lưu ý đối với trường hợp update, cho phép Unknown để không cần đẩy một số field lên
      // validateAsync(req.body): Thực hiện kiểm tra tính hợp lệ của dữ liệu
      // { allowUnknown: true }: Cho phép các trường không được định nghĩa trong schema vẫn tồn tại
      // { abortEarly: false }: Báo cáo tất cả các lỗi thay vì dừng lại ở lỗi đầu tiên
      await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
      
      // Nếu validation thành công, chuyển sang middleware hoặc controller tiếp theo
      next()
  } catch (error) {
      // Nếu validation thất bại (dữ liệu không hợp lệ), trả về lỗi 422 UNPROCESSABLE_ENTITY
      next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update
}
