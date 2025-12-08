import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const isAdmin = (req, res, next) => {
  // kiểm tra middleware auth đã decode chưa
  console.log('JWT decoded:', req.jwtDecoded)

  if (!req.jwtDecoded || !req.jwtDecoded.role) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ hoặc thiếu role'))
  }

  if (req.jwtDecoded.role !== 'admin') {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Chỉ ADMIN được đổi role'))
  }

  next()
}

export const roleMiddleware = {
  isAdmin
}
