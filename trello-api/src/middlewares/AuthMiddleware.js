import { StatusCodes } from "http-status-codes";
import { JwtProvider } from "~/providers/JwtProvider";
import { env } from "~/config/environment";
import ApiError from "~/utils/ApiError";
// middleware nay dam nhan nhiem vu quan trong : xac thuc JWT accessToken nhan dc tu phia FE co hop le khong 
const isAuthorized = async (req, res, next) =>{
    // lay accesToken nan trong req cookie tu phia client gui len
    const clientAccessToken = req.cookies?.accessToken

    // kiem tra neu nhu cai clientAccessToken ko ton tai thi tra loi ve 
    if(!clientAccessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED,'Unauthorized! (token not found)'))
        return
    } 
    try {
        // 1 kiem tra giai ma token xem co hop le khong 
        const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken,env.ACCESS_TOKEN_SECRET_SIGNATURE)
        // console.log(accessTokenDecoded)

        // 2 neu nhu token hop le thi can phai luu thong tin giai ma dc vao cai req.jwtDecoded, de su dung cho cac tang can xu li phia sau
        req.jwtDecoded = accessTokenDecoded

        //3 cho phep req di tiep  
        next()

        
    } catch (error) { 
        // console.log(error)
        // Nếu cái accessToken nó bị hết hạn (expired) thì mình cần trả về một cái mã lỗi cho phía FE biết để gọi api refreshToken
        if (error?.message?.includes('jwt expired')) {
            next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
            return
        }
        // Nếu như cái accessToken nó không hợp lệ do bất kỳ điều gì khác vụ hết hạn thì chúng ta cứ thẳng tay trả về mã 401 cho phía FE gọi api sign_out luôn
        next(new ApiError(StatusCodes.UNAUTHORIZED,'Unauthorized!'))

        
    }

}
export const authMiddleware ={
    isAuthorized
}






