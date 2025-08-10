import { asyncHandler } from "../utils/asynccHandeler.js";
import nodemailer from "nodemailer";
import { ApiError } from "../utils/apieror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";
const resetPasswordmail = asyncHandler(async (req, res) => {
    console.log("send email called");
    
    const{email} = req.body;
    // console.log(req.body);
    // console.log(process.env.USERMAIL, process.env.USERPASSWORD);
    if (!email) throw new ApiError(400, "Email is required");
    const user = await User.findOne({email});
    if(!user) throw new ApiError(404, "User not found");
    /// genreate a token
    // console.log(user)
    const forgotPasswordToken = crypto.randomBytes(32).toString("hex");
    // console.log(forgotPasswordToken)
    user.forgotPasswordToken = forgotPasswordToken;
    user.forgotPasswordTokenExpiry = Date.now() + 3600000;
    await user.save();
 
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
     <h1>Hello ${user.username}</h1>
     <p>Your forgot password token is <a href="${process.env.FRONT}/resetpassword?token=${forgotPasswordToken}&email=${email}">${forgotPasswordToken}</a></p>
     <p>This token will expire in 1 hour</p>
     <p>If you did not request this, please ignore this email</p>
     <p>Thank you</p>
   
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

export { resetPasswordmail };
