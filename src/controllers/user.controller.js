const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const User = require('../models/user.model');

const registerUser = asyncHandler( async (req, res) => {
  // Get user data from request body
  const { username, email, name, password } = req.body;

  // Validate user data
  if ([name, email, username, password].some(field => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // check if yser already exists: username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existedUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }

  // check for images, avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(409, 'Avatar file is required!!');
  }

  let coverImageLocalPath;
  if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }
  
  // Upload images to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(409, 'Avatar file is required!!');
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // create user object - entry in db
  const user = await User.create({
    name,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check for user creation
  // remove password and refresh token fields
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, 'Something went worng while registering the user.');
  }

  // send res
  res.status(201).json(
    new ApiResponse(true, 200, createdUser, "User registered successfully!!")
  );
});

module.exports = { registerUser };
