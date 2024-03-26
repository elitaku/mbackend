import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";
import { asyncError } from "./error.js";
import {OAuth2Client} from 'google-auth-library';

const client = new OAuth2Client();
export const isAuthenticated = asyncError(async (req, res, next) => {
    // const token = req.cookies.token;

    const { token } = req.cookies;
    
    if (!token) return next(new ErrorHandler("Not Logged In", 401));

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData._id);

    next();
});

export const isAdmin = asyncError(async (req, res, next) => {
    if (req.user.role !== "admin")
        return next(new ErrorHandler("Only Admin allowed", 401));
    next();
});


export const verifyIdToken = asyncError(async (req, res, next) => {
    const token = req.body.idToken;

    if (!token){
      return res.status(400).send('No ID token provided')
    }

    try{
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: [process.env.CLIENT_ID_ANDROID, process.env.CLIENT_ID_IOS, process.env.CLIENT_ID_WEB],
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
      const email = payload['email']
     
      const user = await User.findOne({email: email});
      if (user){
        
        if (user.googleId){
          req.payload = payload
          next()
        }
        else{
          console.log('walang google id', userid)
          user.googleId = userid;
          user.signInMethod = 'local';
          await user.save()
          req.payload = payload
          next()
        }
        
      }
      else{
        return res.status(401).json({newUser: true, payload: payload})
      }
    }catch(error){
      console.log(error)
        res.status(401).send('Invalid ID token');
    }
  })