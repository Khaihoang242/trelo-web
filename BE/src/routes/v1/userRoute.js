import express from 'express'
import {userValidation} from '~/validations/userValidation'
import {userController} from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/AuthMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
import {roleMiddleware} from '~/middlewares/roleMiddleware'
const Router = express.Router()
Router.route('/register')
.post(userValidation.createNew, userController.createNew)

Router.route('/verify')
  .put(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/login')
  .post(userValidation.login, userController.login)
Router.route('/logout')
  .delete(userController.logout)
Router.route('/refresh_token')
  .get(userController.refreshToken)
Router.route('/update')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('avatar'),
    userValidation.update,
    userController.update,
    
  )
  Router.route(
    "/:userId/role")
    .patch(   
      authMiddleware.isAuthorized,   // check JWT
      roleMiddleware.isAdmin,            // chỉ admin
      userValidation.updateRole,
      userController.updateRole
    )
    .get(
      authMiddleware.isAuthorized,   // bắt buộc login
      userValidation.getRoles,       // validation (trống)
      userController.getRoles   
    )
    Router.route('/profile')
    .get(authMiddleware.isAuthorized, userController.getProfile)
    .put(
      authMiddleware.isAuthorized,
      multerUploadMiddleware.upload.single('avatar'), // upload ảnh nếu có
      userValidation. UPDATE_PROFILE_SCHEMA,
      userController.updateProfile
    )
Router.route('/change-password')
      .put(
      authMiddleware.isAuthorized,
      userValidation.changePassword,
      userController.changePassword
    )

Router.post('/request-verify', userValidation.requestVerify, userController.requestVerify)
Router.post('/verify-otp', userValidation.verifyOtp, userController.verifyOtp)
export const userRoute = Router