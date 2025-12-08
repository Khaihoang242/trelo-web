import { StatusCodes } from "http-status-codes"
import { JwtProvider } from "~/providers/JwtProvider"
import { env } from "~/config/environment"
import ApiError from "~/utils/ApiError"

const isAuthorized = async (req, res, next) => {

  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
  }

  try {
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    // ✅ GẮN ĐÚNG CHUẨN
    req.jwtDecoded = accessTokenDecoded

    next()

  } catch (error) {

    if (error?.message?.includes('jwt expired')) {
      return next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
    }

    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}
