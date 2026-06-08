// // // qiladigan ishlarim 
// // 1-- blogga create amalini qushaman
// // 2-- blogga get va getAll amalini qushaman
// // 3-- blogga delete id qushaman 
// // 4-- blogga put amalini qushaman

// // -- Asosiy maqsadim validatsiya --
// // -- register va login qismini qushaman va bular username va password orqali ishlataman


import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { ForbiddenException } from "../exceptions/forbidden.exception.js";
import { UnauthorizedException } from "../exceptions/unauthorized.exception.js";
import { sendEmail } from "../helpers/mail.helper.js";

import { config } from "dotenv"


import siganure from "../configs/signed.config.js";

config()


class blogController {
    #_userModel;
    constructor() {
        this.#_userModel = User;
    }




    login = async (req, res, next) => { 

    try {



        const { username, password } = req.body;
        const existingUser = await this.#_userModel.findOne({ username });

        if (!existingUser) {
            throw new NotFoundException("User not found");
        }

        const isPassSame = await this.#_comparePass(password, existingUser.password);

        if (!isPassSame) {
            throw new UnauthorizedException("Password is incorrect");
        }

        if (!existingUser.isActive) {
            throw new ForbiddenException("Account is deactivated");
        }

        const accessToken = jwt.sign(
            { id: existingUser._id, role: existingUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
            { id: existingUser._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );


        

        

        
        res.cookie("accessToken" , accessToken , {
        signed : true,
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 kun
        });




res.cookie("refreshToken", refreshToken, {
    signed: true,
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 kun
});





const userObj = existingUser.toObject();
delete userObj.password;

res.send({ success: true, data: { accessToken, refreshToken, user: userObj } });



    } catch (error) {
        next(error);                   
    }
};






    forgotPassword = async(req , res , next) => {

        try {
        const {email} = req.body;
        
        const existingUser = await this.#_userModel.findOne({email});

        if(!existingUser) {
            throw new NotFoundException("User not Found")
        }


        const signedUrl = siganure.sign(`/blog/reset-password?userId=${existingUser._id}` , {
            ttl: 180,
        });

        sendEmail(email, "Password reset", `Password reset link: ${signedUrl}`);


        res.send({
            success : true,
            data: {
                signedUrl,
            },
        });

    } catch (error) {
      next(error);
    }
  };







  resetPassword = async (req, res, next) => {
    try {
      
      const isValid = siganure.verify(req.originalUrl);
      if(!isValid) {
        throw new UnauthorizedException("Invalid or expired link")
      }


      const { userId } = req.query;
      const { password } = req.body;

      if (!password || password.length < 6) {
      throw new ForbiddenException("Password must be at least 6 characters");
    }



    const user = await this.#_userModel.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

      const hashedPass = await this.#_hashPassword(password);


  
      await this.#_userModel.updateOne(
        { _id: userId },
        { password: hashedPass },
      );

 res.send({
      success: true,
      message: "Password successfully updated",
    });

  } catch (error) {
    next(error);
  }
};








register = async (req, res, next) => {
  try {                                      
    const { name, age, username, password, email } = req.body;

    if (!password || password.length < 6) {
      throw new ForbiddenException("Password must be at least 6 characters");
    }

    const existingUser = await this.#_userModel.findOne({ username });

    if (existingUser) {
      throw new ConflictException("Username has already taken");
    }

    const hashedPass = await this.#_hashPassword(password);
    const newUser = await this.#_userModel.create({
      name,
      username,
      email,
      password: hashedPass,
      age,
      isActive: true,
      role: "USER",
    });

    const accessToken = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = newUser.toObject();
    delete userObj.password;

    res.send({
      success: true,
      data: { user: userObj, accessToken, refreshToken },
    });

  } catch (error) {
    next(error);                               
  }
};















refresh = async (req, res, next) => {
    try {

        const refreshToken = req.body.refreshToken || req.signedCookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token not provided");
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        const user = await this.#_userModel.findById(decoded.id);
        if (!user) throw new NotFoundException("User not found");

        const accessToken = jwt.sign(
            { id: decoded.id, role: user.role }, 
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );



        res.cookie("accessToken", accessToken, {
            signed: true,
            httpOnly: true,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 kun
        });

           res.send({ success: true, data: { accessToken } });
    } catch (error) {
        next(error);
    }
};




    #_hashPassword = async (pass) => {
        return await bcrypt.hash(pass, 10);
    };

    #_comparePass = async (originalPass, hashedPass) => {
        return await bcrypt.compare(originalPass, hashedPass);
    };
}

export default new blogController()