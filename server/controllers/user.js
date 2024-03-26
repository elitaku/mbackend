import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import { asyncError } from "../middlewares/error.js";
import { cookieOptions, getDataUri, sendEmail, sendToken, imageUriToDataUri } from "../utils/features.js";
import { passwordResetEmailTemplate } from "../utils/emailHTMLTemplate.js";

import cloudinary from "cloudinary";


export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Incorrect Email or Password", 400));
  }

  if (!password) return next(new ErrorHandler("Please Enter Password", 400));

  // Handle error
  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    return next(new ErrorHandler("Incorrect Password"));
  }

  sendToken(user, res, `Welcome Back, ${user.name}`, 200);
};

export const signup = asyncError(async (req, res, next) => {
  const { name, email, password, address, city, country, pinCode, googleId } = req.body;

  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User Already Exist", 400));
  let signInMethod = 'local';
  if (googleId !== undefined) {
    signInMethod = 'google'

  }


  let avatar = undefined;

  if (req.file) {


    const file = getDataUri(req.file);
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };


  }
  else {
    let dataUri;
  
    console.log(req.body.file)
    if (req.body.file) {
      if (googleId !== undefined) {
        dataUri = await imageUriToDataUri(req.body.file);
      }

      const myCloud = await cloudinary.v2.uploader.upload(dataUri);
      avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

  }

  user = await User.create({
    avatar,
    name,
    email,
    password,
    address,
    city,
    country,
    pinCode,
    googleId,
    signInMethod,
  });

  sendToken(user, res, `Registered Successfully`, 201);
});


export const getMyProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const logOut = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

export const updateProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email, address, city, country, pinCode } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCode = pinCode;
  if (user.googleId){
    user.signInMethod = 'google';
  }
  else{
    user.signInMethod = 'local';
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});

export const changePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(
      new ErrorHandler("Please Enter Old Password & New Password", 400)
    );

  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) return next(new ErrorHandler("Incorrect Old Password", 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successully",
  });
});

export const updatePic = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const file = getDataUri(req.file);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Avatar Updated Successfully",
  });
});


export const forgetPassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("Incorrect Email", 404));

  const randomNumber = Math.random() * (999999 - 100000) + 100000;
  const otp = Math.floor(randomNumber);
  const otp_expire = 15 * 60 * 1000;

  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expire);
  await user.save();

  const message = passwordResetEmailTemplate.replace('{{OTP}}', otp);

  try {
    await sendEmail("OTP For Resetting Password", user.email, message);
  } catch (error) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(error);
  }

  res.status(200).json({
    success: true,
    message: `Email Sent To ${user.email}`,
  });
});

// export const forgetPassword = asyncError(async (req, res, next) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });

//   if (!user) return next(new ErrorHandler("Incorrect Email", 404));
//   // max,min 2000,10000
//   // math.random()*(max-min)+min

//   const randomNumber = Math.random() * (999999 - 100000) + 100000;
//   const otp = Math.floor(randomNumber);
//   const otp_expire = 15 * 60 * 1000;

//   user.otp = otp;
//   user.otp_expire = new Date(Date.now() + otp_expire);
//   await user.save();

//   const message = `Your OTP for Reseting Password is ${otp}.\n Please ignore if you haven't requested this.`;
//   try {
//     await sendEmail("OTP For Reseting Password", user.email, message);
//   } catch (error) {
//     user.otp = null;
//     user.otp_expire = null;
//     await user.save();
//     return next(error);
//   }

//   res.status(200).json({
//     success: true,
//     message: `Email Sent To ${user.email}`,
//   });
// });


export const resetPassword = asyncError(async (req, res, next) => {
  const { otp, password } = req.body;

  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Incorrect OTP or has been expired", 400));

  if (!password)
    return next(new ErrorHandler("Please Enter New Password", 400));

  user.password = password;
  user.otp = undefined;
  user.otp_expire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully, You can login now",
  });
});

export const googleLogin = asyncError(async (req, res, next) => {
  const user = await User.findOne({ googleId: req.payload.sub });


  if (!user) {

    return next(new ErrorHandler("Invalid ID", 400));
  }

  sendToken(user, res, `Welcome Back, ${user.name}`, 200);
})
