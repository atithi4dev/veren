import { Schema, model } from "mongoose";
import IUser from '../types/user.js'
import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken'

const userSchema = new Schema<IUser>({
    githubId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    provider: {
        type: String,
        enum: ["github"],
        default: "github"
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        index: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index:true
    },
    avatar: {
        type: String,
        required: true,
    },
    projects: [
        {
            type: Schema.Types.ObjectId,
            ref: "Project",
        }
    ],
    tokenVersion: {
        type: Number,
        default: 0
    }

}, { timestamps: true })

userSchema.methods.generateAccessToken = function ():string {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    const ACCESS_TOKEN_EXPIRY = "7d";
    
    if (!ACCESS_TOKEN_SECRET) {
        throw new Error("Access Token is not defined");
    }

    const options: SignOptions = {
        expiresIn: ACCESS_TOKEN_EXPIRY
    }

    return jwt.sign(
        {
            sub: this._id.toString(),
            provider: this.provider,
            type: "access"
        },
        ACCESS_TOKEN_SECRET,
        options
    )
}

userSchema.methods.generateRefreshToken = function ():string {
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
    const REFRESH_TOKEN_EXPIRY = "7d";

    if (!REFRESH_TOKEN_SECRET) {
        throw new Error("Refresh token is not defined");
    }
    const options: SignOptions ={
        expiresIn: REFRESH_TOKEN_EXPIRY
    }
    return jwt.sign(
        {
            sub: this._id.toString(),
            provider: this.provider,
            type: "refresh",
            tokenVersion: this.tokenVersion
        },
        REFRESH_TOKEN_SECRET,
        options    
    )
}

const User = model<IUser>('User', userSchema);

export default User;