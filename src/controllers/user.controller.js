const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const userService = require('../services/user.service');
const { ACCESS_TOKEN, REFRESH_TOKEN, COOKIE_OPTIONS } = require('../config/constants');
const { registrationSchema, loginSchema, changePasswordSchema } = require('../config/validationSchema');

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await userService.findById(userId, true);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return {accessToken, refreshToken};
  } catch(error) {
    throw new ApiError(500, "Something went wrong while generating Access/Refresh token");
  }
}

const registerUser = asyncHandler( async (req, res) => {
  // Validate user data
  const { error } = registrationSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message, error.details);
  }
  
  // Get user data from request body
  const { username, email, name, password } = req.body;

  // check if yser already exists: username, email
  const existedUser = await userService.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }

  // check for images, avatar
  let avatarLocalPath;
  let coverImageLocalPath;
  if (req.files) {
    if (req.files.avatar && req.files.avatar.length > 0) {
      avatarLocalPath = req.files?.avatar[0]?.path;
    } else {
      throw new ApiError(409, 'Avatar is required!!');
    }

    if (req.files.coverImage && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
  }
  
  // Upload images to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(409, 'Avatar file is required!!');
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // create user object - entry in db
  const user = await userService.create({
    name,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check for user creation
  // remove password and refresh token fields
  const createdUser = await userService.findById(user._id);
  if (!createdUser) {
    throw new ApiError(500, 'Something went worng while registering the user.');
  }

  // Add Access/Refresh Token into Response
  const {accessToken, refreshToken } = await generateAccessAndRefreshToken(createdUser._id);

  // send res
  return res
    .status(201)
    .cookie(ACCESS_TOKEN, accessToken, COOKIE_OPTIONS)
    .cookie(REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200, 
        {
          accessToken,
          refreshToken,
          createdUser
        },
        "User registered successfully!!"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }
  
  const { email, password } = req.body;

  const user = await userService.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loogedInUser = await userService.findById(user._id);
  
  return res
    .status(200)
    .cookie(ACCESS_TOKEN, accessToken, COOKIE_OPTIONS)
    .cookie(REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          user: loogedInUser,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Clear refresh token
  await userService.findByIdAndUpdate(
    userId,
    {
      refreshToken: ""
    }
  );

  return res
    .status(200)
    .clearCookie(ACCESS_TOKEN, COOKIE_OPTIONS)
    .clearCookie(REFRESH_TOKEN, COOKIE_OPTIONS)
    .json(
      new ApiResponse(200, {}, "User logged out")
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.regreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
    const user = await userService.findById(decodedToken?._id, true);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh Token is Expired or used');
    }
  
    const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  
    return res
      .status(200)
      .cookie(ACCESS_TOKEN, accessToken, COOKIE_OPTIONS)
      .cookie(REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token Refreshed" 
        )
      );
  } catch (error) {
    throw new ApiError(error.statusCode, error.messgae);
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { oldPassword, newPassword } = req.body;

  const user = await userService.findById(req.user?._id, true);
  const isCorrectPassword = await user.isPasswordCorrect(oldPassword);
  if (!isCorrectPassword) {
    throw new ApiError(400, 'Invalid old Password');
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      req.user,
      "Current User fetched successfully!!"
    ));
});

module.exports = { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser
};
