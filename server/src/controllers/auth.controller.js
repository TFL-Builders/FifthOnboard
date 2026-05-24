import User from "../models/User.js";
import Invite from "../models/Invite.js";
import RefreshToken from "../models/RefreshToken.js";
import {generateAccessToken, generateRefreshToken, hashToken} from "../config/jwt.js";
import crypto from "crypto"
import { sendResetEmail } from "../config/mailer.js";
import passport from "../config/passport.js";


export async function signupUser(req, res){
    try{
        const user = req.body;
        const {email, password, name} = user;
        const exist = await User.findOne({email: email});
        if (exist){
            return res.status(409).json({error: "Email already registered"})
        }else{
            const invite = await Invite.findOne({ email });
             const user = await User.create({
                email,
                passwordHash: password,
                name: name,
                role: invite ? invite.role : 'hr',
                organizationId: invite ? invite.organizationId : null,
                status: "active",
            })
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            await storeRefreshToken(user._id, refreshToken);

            res.cookie('refreshToken', refreshToken,{
                httpOnly: true,    
                sameSite: 'lax',
                maxAge: parseInt(process.env.COOKIE_MAX_AGE)
            })
            res.status(201).json({
              accessToken,
              user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: user.organizationId
              }
            });
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}


export async function loginUser(req, res){

    try{
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if (!user){
            console.log("user doesn't exist")
            return res.status(404).json({error: "Invalid Username or Password"});
        }else if(user.googleId){
            console.log("Sign in using Google sign in");
            return res.status(400).json({ 
                       error: "This account uses Google sign in. Please sign in with Google." 
                    });
        }
        else{
            const valid = await user.comparePassword(password)
            if (valid){
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                await storeRefreshToken(user._id, refreshToken);
                res.cookie('refreshToken', refreshToken,{
                    httpOnly: true,    
                    sameSite: 'lax',
                    maxAge: parseInt(process.env.COOKIE_MAX_AGE)
                })
                res.status(200).json({
                  accessToken,
                  user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    organizationId: user.organizationId
                  }
                });
            }else{
                console.log("invalid password");
                return res.status(400).json({error: "Invalid Username or Password"})
            }
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error);
    }
}

export async function refreshUserAccessToken(req, res){
    try{
        const user = await User.findById(req.user.userId);
        if (!user){
            return res.status(404).json({error: "User doesn't exist"});
        }
        const accessToken = generateAccessToken(user);
        res.status(200).json({
          accessToken,
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId
          }
        });
    }catch (error) {
            console.log(error);
            res.status(500).json({ error: "Server error" });
  }

}

export async function storeRefreshToken(userId, refreshToken){
    const tokenHash = hash(refreshToken);

    await RefreshToken.deleteMany({ userId })

    await RefreshToken.create({
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + parseInt(process.env.COOKIE_MAX_AGE))
    })
}

export async function logoutUser(req, res){
    try{
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
          const tokenHash = hashToken(refreshToken);
          await RefreshToken.deleteOne({ tokenHash }); // revoke from DB
        }

        res.clearCookie("refreshToken", {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production"
        });
        res.status(200).json({message: "Successful Logout"});

    }catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    } 
}

export async function forgotPassword(req, res){
    try{
        const {email} = req.body;
        const user = await User.findOne({email: email});
        if (!user){
            return res.status(200).json({message: "If that email exists you will receive a reset link shortly" })
        }
    
        const resetToken = crypto.randomBytes(32).toString("hex");
    
        const hashedToken = hashToken(resetToken)
    
        user.passwordResetToken = hashedToken;
        user.passwordResetExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();
    
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        await sendResetEmail(email, resetLink);
        res.status(200).json({message: "If that email exists you will receive a reset link shortly" })
    }catch(error){
        console.log(error)
        res.status(500).json({error: "Server error"});
    }
}

export async function resetPassword(req, res){
    
    
    try{
        const {password} = req.body;
        const token = req.query.token;
         if (!token) {
            return res.status(400).json({ error: "Reset token is required" });
        }
          const hashedToken = hashToken(token);
          const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpiry: {$gt: Date.now()}
        });
    
          if (!user){
            return res.status(400).json({error: "Invalid or Expired reset token"});
          }
    
          user.passwordHash = password;
          user.passwordResetToken = null;
          user.passwordResetExpiry = null;
    
          await user.save();
          res.status(200).json({message: "Successful password reset"});
      }catch(error){
        console.log(error);
        res.status(500).json({ error: "Server error" });
      }

}

// authController.js
export async function googleCallback(req, res) {
  try {
    const accessToken = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);

    await storeRefreshToken(req.user._id, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE)
    });

    res.status(200).json({
      accessToken,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        organizationId: req.user.organizationId
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
}

// routes
