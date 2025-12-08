/* eslint-disable space-before-blocks */
/* eslint-disable no-useless-catch */
/* eslint-disable indent */
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { userModel } from '~/models/userModel';
import { pickUser } from '~/utils/formatters';
import { WEBSITE_DOMAIN } from '~/utils/constants';
import { BrevoProvider } from '~/providers/BrevoProvider';
import { version } from 'joi';
import { env } from '~/config/environment';
import { JwtProvider } from '~/providers/JwtProvider';
import { CloudinaryProvider } from '~/providers/CloudinaryProvider';
import { sendVerifyMail } from "~/services/mailService"
import crypto from 'crypto'
import ms from "ms"

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!');
    }

    // Tạo dữ liệu để lưu vào database
    const nameFromEmail = reqBody.email.split('@')[0];
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // Tham số 2 là độ phức tạp
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4(),
    };

    // Lưu thông tin user vào database
    const createdUser = await userModel.createNew(newUser);
    const getNewUser = await userModel.findOneById(createdUser.insertedId);

    // TODO: Gửi email xác thực tài khoản cho người dùng
     const verificationLink =`${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    

     const customSubject ='Please verify your email before using our services'
     const htmlContent =` 
     <h3>Here is your verification link:</h3>
     <h3>${verificationLink}</h3>
     <h3> Sincerely, <br/>Khaihoangdev </h3>
     `
     //goi toi provider gui mail
     await BrevoProvider.sendEmail(getNewUser.email , customSubject,htmlContent)


    // Trả dữ liệu về controller
    return pickUser(getNewUser);
  } catch (error) {
    throw error
  }
};
const verifyAccount = async (reqBody) => { 
    try {
        // Query user trong db
        const existUser =  await userModel.findOneByEmail(reqBody.email)
        // cac buoc kiem tra du lieu can thiet 
        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found ')
        if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active')
        if (reqBody.token !== existUser.verifyToken) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid')
        }
        // neu ok thi bat dau update lai thong tin user der verify account
        const updateData ={
            isActive : true ,
            verifyToken: null
        }
        const updatedUser = await userModel.update(existUser._id, updateData)
        return pickUser(updatedUser)

    } catch (error) {throw error}
}
const login = async (reqBody) =>{
    try {
            // Query user trong db
            const existUser =  await userModel.findOneByEmail(reqBody.email)
            // cac buoc kiem tra du lieu can thiet 
            if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found ')
            if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active')
            if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
                throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect')
            }
            // neu moi thu ok thi tao token tra ve FE
            
            //  Tao thong tin se dinh kerm trong JWT Token gom _id va email cua user 
            const userInfo = {
                _id : existUser._id,
                email: existUser.email,
                role: existUser.role 
            }
            // Tao ra 2 loai token , accessToken de tra ve FE
            const accessToken = await JwtProvider.generateToken(
                userInfo,
                env.ACCESS_TOKEN_SECRET_SIGNATURE,
                // 5
                env.ACCESS_TOKEN_LIFE
            )
            const refreshToken = await JwtProvider.generateToken(
                userInfo,
                env.REFRESH_TOKEN_SECRET_SIGNATURE,
                // 15
                env.REFRESH_TOKEN_LIFE 
            )
            // Tra ve thong tin cua User kem theo 2 cai token da tao 
            return {accessToken, refreshToken, ...pickUser(existUser)}
            
    } catch (error) {throw error}
}
const refreshToken = async (clientRefreshToken) =>{
  try {
    // giai ma cai refreshtoken xem cos hop le ko
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    // chung ta chi luu thong ti unique va co dinh cua user vao token roi, vi vay co the lay luon tu decoded ra, ko can query va db lay ra
    const userInfo ={
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }
    //Tao accessToken moi
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )
    return {accessToken}
    
  } catch (error) { throw error}
}
const update = async(userId, reqBody, userAvatarFile) =>{
  try {
    // query user va kiem tra cho chac chan 
    const existUser = await userModel.findOneById(userId)
    if(!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if( !existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    // khoi tao ket qua update user ban dau la empty
    let updateUser ={}
    // truong hop change password
    if (reqBody.current_password && reqBody.new_password){
      // kiem tra xem current_password cos dung hay ko
      // eslint-disable-next-line no-trailing-spaces
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Current Password is incorrect')
      }
      // neu dung thi hash mot cai mat khau moi va update lai trong db
      updateUser = await userModel.update(existUser._id, {
        password : bcryptjs.hashSync(reqBody.new_password, 8)
      })

    } else if (userAvatarFile){
      // truong hop upload file len cloud Storage 
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      console.log('updateResult', uploadResult)
      // luu lai url (secure_url) cua cai file anh vao trong DB
      updateUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })

    }
    else {
      //TH update cac thong tin chung vd nhu diaplayName
      updateUser = await userModel.update(existUser._id, reqBody)
    }
    return pickUser(updateUser)
  } catch (error) { throw error}

}
const updateRole = async (userId, newRole) => {
  // 1. check có user không
  const user = await userModel.findOneById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')
  }

  // 2. Không cho hạ quyền admin duy nhất
  if (user.role === 'admin' && newRole !== 'admin') {
    const countAdmin = await userModel.countByRole('admin')
    if (countAdmin === 1) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Không thể hạ quyền admin duy nhất')
    }
  }

  // 3. update
  const updatedUser = await userModel.update(userId, { role: newRole })

  return {
    _id: updatedUser._id,
    email: updatedUser.email,
    role: updatedUser.role
  }
}
const getProfile = async (userId) => {
  const user = await userModel.findOneById(userId)

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')
  }

  return {
    name: user.displayName || '',
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    avatar: user.avatar || ''
  }
}
const updateProfile = async (userId, data, avatarFile) => {
  const user = await userModel.findOneById(userId)
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')

  let updateData = { ...data }

  if (avatarFile) {
    const uploadResult = await CloudinaryProvider.streamUpload(avatarFile.buffer, 'users')
    updateData.avatar = uploadResult.secure_url
  }

  const updatedUser = await userModel.update(userId, updateData)

  return {
    name: updatedUser.displayName || '',
    email: updatedUser.email,
    phone: updatedUser.phone || '',
    address: updatedUser.address || '',
    avatar: updatedUser.avatar || ''
  }
}
const changePassword = async (userId, currentPassword, newPassword) => {
  // 1. Tìm user
  const user = await userModel.findOneById(userId)
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User không tồn tại')

  // 2. So mật khẩu cũ
  const isMatch = bcryptjs.compareSync(currentPassword, user.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Mật khẩu hiện tại không đúng')
  }

  // 3. Hash mật khẩu mới
  const newHashedPassword = bcryptjs.hashSync(newPassword, 10)

  // 4. Update DB
  await userModel.update(userId, { password: newHashedPassword })

  return true
}
// import SMSProvider if you have


// helper: hoặc token dài
const genToken = (len = 48) => crypto.randomBytes(len).toString('hex')

// hash token/otp để lưu DB
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

/**
 * req: { email?, phone?, type: 'email'|'phone' }
 */
const createVerifyToken = async ({ email, phone, type }) => {
  
  const identifier = type === 'email' ? email : phone

  if (!identifier || !type) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Thiếu email/phone hoặc type")
  }

  // ✅ Kiểm user tồn tại
  const user = await userModel.findOneByEmail(
    email
  )

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Người dùng không tồn tại")
  }

  // ✅ OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpExpire = new Date(Date.now() + ms("15m"))

  // ✅ Reset token link
  const resetToken = crypto.randomBytes(32).toString("hex")
  const resetExpire = new Date(Date.now() + ms("15m"))

  // ✅ Lưu DB
  user.verifyOtp = otp
  user.verifyOtpExpires = otpExpire
  user.resetPasswordToken = resetToken
  user.resetPasswordExpires = resetExpire
  await userModel.updateVerifyInfo(user._id, {
    verifyOtp: otp,
    verifyOtpExpires: otpExpire,
    resetPasswordToken: resetToken,
    resetPasswordExpires: resetExpire
  })

  // ✅ Link reset
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`

  // ✅ Gửi email
  if (type === 'email') {
    await sendVerifyMail(
      email,
      otp,
      resetLink
    )
  }

  // ✅ Trả về (debug dev có thể trả OTP)
  return {
    sent: true,
    expiredIn: "15 phút",
    ...(process.env.NODE_ENV === 'development' && { otp, resetToken })
  }
}
/**
 * Xác thực token/otp: identifier là email hoặc phone
 */
const verifyToken = async (identifier, tokenPlain) => {
  // tìm user
  const user = await userModel.findOneByIdentifier(identifier)
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'Tài khoản không tồn tại')

  if (!user.verifyToken || !user.verifyTokenExpiry) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không có token để xác thực')
  }

  if (Date.now() > user.verifyTokenExpiry) {
    throw new ApiError(StatusCodes.GONE, 'Token đã hết hạn')
  }

  const hashed = hashToken(tokenPlain)
  if (hashed !== user.verifyToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token không hợp lệ')
  }

  // nếu thành công: xoá token / set isActive tùy mục đích
  await userModel.update(user._id, { verifyToken: null, verifyTokenExpiry: null })

  return { verified: true }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken ,
  update,
  updateRole,
  getProfile,
  updateProfile,
  changePassword,
  createVerifyToken,
  verifyToken,
  genToken
};
