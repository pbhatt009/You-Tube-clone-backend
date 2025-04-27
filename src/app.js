import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
///route decleartion
app.get("/", (req, res) => {
  res.send("Welcome to YouTube clone");
});
app.use("/api/v1/user", userRouter);
