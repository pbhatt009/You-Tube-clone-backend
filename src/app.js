import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/apieror.js";
export const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));
app.use(cookieParser());

//////routes
import userRouter from "./routes/user.routes.js";
import videorouter from "./routes/video.router.js";
import subscripitionRouter from "./routes/subscripition.routers.js";
import Commentrouter  from "./routes/comment.route.js"
import likerouter from "./routes/like.router.js"
///route decleartion

app.get('/api', (req, res) => {
  console.log("hi")
  res.send('Hello World!')
})
app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videorouter);
app.use("/api/v1/subscription", subscripitionRouter);
app.use("/api/v1/comment",Commentrouter);
app.use("/api/v1/like",likerouter);

app.use((err, req, res, next) => {

  if (err instanceof ApiError) {
    // console.log("here is a eror")
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  // Default error handler for uncaught errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});


