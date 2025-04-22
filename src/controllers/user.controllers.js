import { asyncHandler } from "../utils/asynccHandeler.js";

export const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "User registered successfully",
  });
});
