import jwt from "jsonwebtoken"
import RefreshToken from "../models/RefreshToken.js";
import { hashToken } from "../config/jwt.js";

export function verifyAccesToken(req, res, next){
    const authHeader = req.headers.authorization;
      if (!authHeader) {
        console.log("NO access token");
            return res.status(401).json({ error: "No access token" });
        }

     const token = authHeader.split(" ")[1];
    if(!token){
        console.log("Malformed Authorization Header");
        return res.status(401).json({error: "Malformed Authorization Header"})
    }else{
        try{
           const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
           req.user = decoded;
           next();
        }catch(error){
            console.log("Invalid access token");
            return res.status(401).json({error: "NO access token"})
        }
    }
}

export async function verifyRefreshToken(req, res, next){
    const token = req.cookies.refreshToken
    if(!token){
        console.log("NO refresh token");
        return res.status(401).json({error: "NO refresh token"})
    }else{
        try{
           const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

           const tokenHash = hashToken(token);
            const storedToken = await RefreshToken.findOne({ tokenHash });

            if (!storedToken) {
              return res.status(401).json({ error: "Refresh token revoked" });
            }

           req.user = decoded;
           next();
        }catch(error){
            console.log("Invalid refresh token");
            return res.status(401).json({error: "Invalid refresh token"})
        }
    }
}