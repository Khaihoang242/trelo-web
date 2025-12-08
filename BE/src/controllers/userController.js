import { StatusCodes } from "http-status-codes";
import {userService} from '~/services/userService'
import ms from "ms";
import ApiError from "~/utils/ApiError";
import { registerSchema, loginSchema, updateRoleSchema, UPDATE_PROFILE_SCHEMA } from "~/validations/userValidation";
const createNew = async(req, res , next) =>{
    try {
        const createdUser = await userService.createNew(req.body)
        res.status(StatusCodes.CREATED).json(createdUser)
    } catch (error) { next(error) }
}
const verifyAccount = async (req, res, next) => {
    try {
      const result = await userService.verifyAccount(req.body)
      res.status(StatusCodes.OK).json(result)
    } catch (error) {
      next(error)
    }
  }
  
  const login = async (req, res, next) => {
    try {
      const result = await userService.login(req.body)
  
      // xử lý trả về http only cookie cho phía trình duyệt
      
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: false,   // ✅
        sameSite: 'lax', // ✅
        maxAge: ms('14 days')
      })
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: ms('14 days')
      })
      

  
      res.status(StatusCodes.OK).json(result)
    } catch (error) {
      next(error)
    }
  }
  const logout = async (req, res, next) => {
    try {
      // xoa cookie
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')

      res.status(StatusCodes.OK).json({ loggedOut: true})

    } catch (error) {
      next(error)
    }
  }
  const refreshToken = async (req, res, next) => {
    try {
      const result = await userService.refreshToken(req.cookies?.refreshToken)
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: ms('14 days')
      })
      res.status(StatusCodes.OK).json(result)
    } catch (error) {
      next(new ApiError(StatusCodes.FORBIDDEN, 'Please Sign In! (Error from refresh Token)'))
    }
  }
  const update = async (req,res,next) =>{
    try {
      const userId = req.jwtDecoded._id
      const userAvatarFile = req.file
      // console.log('controller userA', userAvatarFile)
      const updateUser = await userService.update(userId,req.body, userAvatarFile)
      console.log('userId', userId)
      res.status(StatusCodes.OK).json(updateUser)
    } catch (error) { next(error)}
  }
  const updateRole = async (req, res, next) => {
    try {
      const userId = req.params.userId  // ✅ đúng
      const { role } = req.body
  
      const result = await userService.updateRole(userId, role)

  
      res.status(StatusCodes.OK).json({
        message: 'Cập nhật role thành công',
        user: result
      })
    } catch (error) {
      next(error)
    }
  }
  const getProfile = async (req, res, next) => {
    try {
      const userId = req.jwtDecoded._id   // lấy từ token
  
      const profile = await userService.getProfile(userId)
  
      res.status(StatusCodes.OK).json(profile)
    } catch (error) {
      next(error)
    }
  }
  const updateProfile = async (req, res, next) => {
    try {
      const userId = req.jwtDecoded._id
      const userAvatarFile = req.file
  
      const updated = await userService.updateProfile(userId, req.body, userAvatarFile)
  
      res.status(StatusCodes.OK).json(updated)
    } catch (error) {
      next(error)
    }
  }
  const changePassword = async (req, res, next) => {
    try {
      const userId = req.jwtDecoded._id
      const { current_password, new_password } = req.body
  
      await userService.changePassword(userId, current_password, new_password)
  
      return res.status(StatusCodes.OK).json({
        message: 'Đổi mật khẩu thành công'
      })
    } catch (error) {
      return next(error)
    }
  }
  const requestVerify = async (req, res, next) => {
    try {
      // req.body: { email?, phone?, type }
      const result = await userService.createVerifyToken(req.body)
      // result có thể chứa { sent: true } hoặc token (test)
      return res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
  }
  
  const verifyOtp = async (req, res, next) => {
    try {
      const { identifier, token } = req.body
      const result = await userService.verifyToken(identifier, token)
      return res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
  }
  const getRoles = async (req, res) => {
      try {
        const userRole = req.jwtDecoded.role;
        console.log(userRole)
 
        const rolePermissions = {
          admin: ["manage_users", "manage_orders", "view_reports"],
          employee: ["manage_orders", "view_reports"],
          client: ["view_products", "make_order"],
        };
  
        return res.status(200).json({
          role: userRole,
          permissions: rolePermissions[userRole] || [],
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }

export const userController ={
    createNew,
    verifyAccount,
    login,
    logout,
    refreshToken,
    update,
    updateRole,
    getProfile,
    updateProfile,
    changePassword,
    requestVerify,
    verifyOtp,
    getRoles
}