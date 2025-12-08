/* eslint-disable indent */
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE,PHONE_RULE } from '~/utils/validators'

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
const updateRole = async (req, res, next) => {
  const correctCondition = Joi.object({
    role: Joi.string()
      .valid('admin', 'employee', 'client')
      .required()
      .messages({
        'any.only': 'Role không hợp lệ (chỉ: admin, employee, client)',
        'any.required': 'Role là bắt buộc'
      })
  }).strict()

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const UPDATE_PROFILE_SCHEMA = async (req, res, next) => {
  const correctCondition = Joi.object({
    displayName: Joi.string().trim().strict().optional(),
    phone: Joi.string()
      .pattern(/^(0|\+84)[0-9]{9}$/)
      .message('Số điện thoại không hợp lệ')
      .optional(),
    address: Joi.string().allow('').optional()
  }).strict()

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const changePassword = (req, res, next) => {
  const schema = Joi.object({
    current_password: Joi.string().required().min(8),
    new_password: Joi.string().required().min(8)
  })

  const { error } = schema.validate(req.body)
  if (error) return next(error)

  next()
}


const requestVerify = async (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().pattern(EMAIL_RULE).messages({ 'string.pattern.base': 'Email không hợp lệ' }).optional(),
    phone: Joi.string().trim().pattern(PHONE_RULE).messages({ 'string.pattern.base': 'SĐT không hợp lệ' }).optional(),
    type: Joi.string().valid('email','phone').required() // xác định gửi tới đâu
  }).xor('email','phone') // bắt buộc 1 trong 2

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}

const verifyOtp = async (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    identifier: Joi.string().required() // email hoặc phone
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
  }
}
const getRoles = async (req, res, next) => {
  const correctCondition = Joi.object({}) // không có field nào
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update,
  updateRole,
  UPDATE_PROFILE_SCHEMA,
  changePassword,
  verifyOtp,
  requestVerify,
  getRoles
}
