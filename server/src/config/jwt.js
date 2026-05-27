import jwt from "jsonwebtoken";
import crypto from "crypto"

export function generateAccessToken(user){
    return jwt.sign(
        {
            userId: user._id,
            organizationId: user.organizationId,
            role: user.role,
            status: user.status,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_TTL
        }
    )
}

export function generateRefreshToken(user){
    return jwt.sign(
        {
            userId: user._id,
            organizationId: user.organizationId
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_TTL
        }
    )
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}