import { asyncHandler } from "../utils/asynccHandeler.js";
import nodemailer from "nodemailer";
import { ApiError } from "../utils/apieror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
const sendEmail = asyncHandler(async (req, res) => {
    console.log("send email called");
    // console.log(req.body);
    // console.log(process.env.USERMAIL, process.env.USERPASSWORD);
  const { email, otp, username } = req.body;

    if (await User.findOne({ username })) {
   
      throw new ApiError(409, "Username already exists");
      return;
    }
    if (await User.findOne({ email })) {
   
      throw new ApiError(409, "email already exists");
    }
 
  

  if (!email) throw new ApiError(400, "Email is required");
  if (!otp) throw new ApiError(400, "OTP is required");

  // Gmail SMTP transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USERMAIL,      // e.g., yourname@gmail.com
      pass: process.env.USERPASSWORD   // App Password (16-char)
    }
  });
  
  const mailOptions = {
    from: `"No Reply" <${process.env.USERMAIL}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <p>Your OTP code is: <b>${otp}</b></p>
      <p>This code is valid for 5 minutes.</p>
      <p>Please do not share it with anyone.</p>
    `
  };

  const info = await transporter.sendMail(mailOptions);

  if (!info.accepted || info.accepted.length === 0) {
    throw new ApiError(500, "Failed to send email");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, info, "Email sent successfully"));
});

export { sendEmail };
