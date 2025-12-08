import multer from "multer";
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from "~/utils/validators";

// function kiem tra cac loai file dc chap nhan 
const customFileFilter = (req, file , callback) =>{
    console.log('Multer file :', file)

    // doi voi thang multer , kiem tra kieu file thi su dung mimetype
    if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
        const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
        return callback(errMessage, null)
      }
      // neu kieu fiel hop le
      return callback(null, true)

}
// khoi tao function upload dc boc boi thk multer 
const upload = multer({
    limits: { fileSize: LIMIT_COMMON_FILE_SIZE},
    fileFilter: customFileFilter
})
export const multerUploadMiddleware ={ upload }