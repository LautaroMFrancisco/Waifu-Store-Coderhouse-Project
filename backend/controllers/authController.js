const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const { createTransport } = require("nodemailer");
const loggerConsole = require("../utils/loggerSetup");

// Register A User => /api/v1/register

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "Avatars",
    width: 150,
    crop: "scale",
  });

  const { name, email, password, country, age, phone, address } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    country,
    age,
    phone,
    address,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });

  // SENDING GMAIL NOTIFICATION:

  const transporter = createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: process.env.NODE_EMAIL,
      pass: process.env.NODE_PASS,
    },
  });
  const mailOptions = {
    from: "Waifu Store",
    to: process.env.NODE_EMAIL,
    subject: `A new user has been registered on Waifu Store!, welcome ${user.email}`,
    html: `<h1 style="color: purple;">We have a new user in our website!</h1>
      <p>please welcome ${user.name}. </p>
      
      <p> His/Her email address is: ${user.email} and He/She is from ${user.country} </p>
      
      <p> Also, He/She is ${user.age} years old, and His/Her phone number is ${user.phone} </p>
      
      <p> It-it's not like I wanted to tell you all of this. B-Baka! </p>`,
  };
  //EMAILING ADMIN ABOUT NEW USER - - - -
  await transporter.sendMail(mailOptions);

  //Notifying the server
  loggerConsole.trace(
    "A new user has been created under the email of: " + user.email
  );

  sendToken(user, 200, res);
});

// Login User => /api/v1/login

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check If Email And Password Is Entered By User
  if (!email || !password)
    return next(new ErrorHandler("Please Enter Email & password"), 400);

  // Finding User In Database (We Use Select Because On The Schema We Used Select: False)
  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid Email or Password"), 401);

  // Check If Password Is Correct Or Not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid Email or Password"), 401);

  // Assign JWT Token

  sendToken(user, 200, res);
});

// Forgot Password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new ErrorHandler("User not found for this email address."),
      401
    );

  // Get Reset Token
  const resetToken = user.getPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // Create Reset Password Url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is as follow: \n\n ${resetUrl} if you have not requested this email, then ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email was successfully sent to ${user.email}`,
    });
  } catch (e) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(e.message, 500));
  }
});

// Reset Password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hast URL Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return next(
      new ErrorHandler("Password Reset Token is Invalid os has expired", 400)
    );

  if (req.body.password !== req.body.confirmPassword)
    return next(new ErrorHandler("Password does not match", 400));

  // Setup New Password
  user.password = req.body.password;

  // Reset Token
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Logout User => /api/v1/logout

exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "User logged out",
  });
});

// Get Currently Logged Used In User Details => /api/v1/me
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id); // Middleware gives us this info

  res.status(200).json({
    success: true,
    user,
  });
});

// Update / Change Password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check Previous User Password
  const isMatched = await user.comparePassword(req.body.oldPassword);
  if (!isMatched) return next(new ErrorHandler("Old Password is Invalid"), 400);
  user.password = req.body.password;
  await user.save();
  sendToken(user, 200, res);
});

// Update User Profile => /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  // Update Avatar: TODO
  await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true });
});

// Admin Routes

// Get All Users => /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, users });
});

// Get User Details => /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new Error(`User not found with id :${req.params.id}`));

  res.status(200).json({ success: true, user });
});

// Update User Profile => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  // Update Avatar: TODO
  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true });
});

// Delete User => /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new Error(`User not found with id :${req.params.id}`));

  // Remove avatar from Cloud - TODO

  await user.remove();

  res.status(200).json({ success: true, user });
});
