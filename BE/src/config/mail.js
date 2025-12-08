import nodemailer from "nodemailer"
import { env } from "./environment.js"

export const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: Number(env.MAIL_PORT),
  secure: false, // port 587
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS
  },
  tls: {
    rejectUnauthorized: false   // ✅ FIX self-signed certificate
  }
})
