/* eslint-disable no-empty */
import JWT from 'jsonwebtoken'
// tao token can 3 tham so vao
// userInfo : thong tin muon dinh kem vao token
// secretSignature : chu ki bi mat tren docs thi de ten la privateKey
// tokenLife : thoi gian song cua token
const generateToken = async (userInfo, secretSignature, tokenLife) =>{
    try {
        return JWT.sign(userInfo,secretSignature,{ algorithm: 'HS256', expiresIn: tokenLife})
        
    } catch (error) { throw new Error(error)}    
}
// function kiem tra co hop le hay khong 
// hop le owr dau la cai token dc tao co dung voi chu ky bi mat secretSignature trong du an hay khong 
const verifyToken = async (token, secretSignature) =>{
    try {
        // ham verify cua thu vien jwt
        return JWT.verify(token,secretSignature)
    } catch (error) { throw new Error(error)}    
}
export const JwtProvider ={
    generateToken,
    verifyToken
}