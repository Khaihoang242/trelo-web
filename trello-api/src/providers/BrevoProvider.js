const SibApiV3Sdk = require ('@getbrevo/brevo')
import { env } from '~/config/environment'



let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY
console.log(env.BREVO_API_KEY)
const sendEmail = async (recipientEmail,customSubject ,customHtmlContent) =>{
    // khoi tao mot cai sendSmtpemail voi nhung thong tin can thiet 
    let sendSmtpEMail = new SibApiV3Sdk.SendSmtpEmail()
    // tai khoan gui mail la cai email tao tai khoan tren brevo 
    sendSmtpEMail.sender ={ email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME}

    // Nhung tai khoan nhan mail 
    // 'to phai la mot array de sau co the gui mail toi nhieu user
    sendSmtpEMail.to = [{email: recipientEmail}]

    // tieu de cua email 
    sendSmtpEMail.subject = customSubject

    //Noi dung email 
    sendSmtpEMail.htmlContent= customHtmlContent
    // goi hanh dong gui mail 
    // tra ve mot promise 
    return apiInstance.sendTransacEmail(sendSmtpEMail)

}
export const BrevoProvider ={
    sendEmail
}