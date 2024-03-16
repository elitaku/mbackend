import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import { asyncError } from "../middlewares/error.js";

export const login = async(req, res, next) => {
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

  res.status(200).json({
    success:true,
    message:`Welcome Back, ${user.name}` 
  })
};

export const signup = async (req, res, next) => {
  const { name, email, password, address, city, country, pinCode } = req.body;

  // Add cloudinary here

  await User.create({
    name,
    email,
    password,
    address,
    city,
    country,
    pinCode,
  });
  res.status(201).json({
    success: true,
    message: "User created successfully",
  });
};
