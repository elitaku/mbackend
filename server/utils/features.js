import DataUriParser from "datauri/parser.js";
import path from "path";
import { createTransport } from "nodemailer";
import axios from 'axios'
export const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export const imageUriToDataUri = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  return `data:${response.headers['content-type']};base64,${base64}`;
}
    
export const sendToken = (user, res, message, statusCode) => {
  const token = user.generateToken();
  
  res
    .status(200)
    .cookie("token", token, {
      ...cookieOptions,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      message: message,
    });
};

export const cookieOptions = {
  secure: process.env.NODE_ENV === "Development" ? true : false,
  httpOnly: process.env.NODE_ENV === "Development" ? false : true,
  sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
};

export const sendEmail = async (subject, to, html) => {
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

await transporter.sendMail({
    to,
    subject,
    html,
    });
};


