import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

// buoc cau hinh cloudinary  , su dung v2
const cloudinaryV2 = cloudinary.v2

cloudinaryV2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
  
})
// khoi tao mot cai function de thuc hiep updaload file len Cloudinary 
const streamUpload = (fileBuffer,folderName) =>{
    return new Promise((resolve, reject) => {
        // Tạo một cái luồng stream upload lên cloudinary
        const stream = cloudinaryV2.uploader.upload_stream({ folder: folderName }, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
    
        // Thực hiện upload cái lu ồng trên bằng lib streamifier
        streamifier.createReadStream(fileBuffer).pipe(stream)
      })

}
export const CloudinaryProvider = {
    streamUpload
}
