import {asyncHandler } from "../utils/asynccHandeler.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/apieror.js"
import dotenv from "dotenv"
import { User } from "../models/user.model.js"
dotenv.config({
path:"./.env"
})
    export const verifyToken = asyncHandler( (req, _, next) => {
   try {
         console.log("req.cookies", req.cookies)
            console.log("req.headers", req.header("Cookie"))
     const token= req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
     if(!token) {
         throw new ApiError(401,"Unauthorized access")
     }
     const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,)
     const user=User.findById(decodedToken?._id).select("-password -refreshToken")
     if(!user) {
         throw new ApiError(401,"Unauthorized access")
     }
            req.user=user
            next()
   } catch (error) {
     throw new ApiError(401,error?.message||"Unauthorized access")
   }
})