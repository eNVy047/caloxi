import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "./user.controller.js";
import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        throw new ApiError(400, "Google ID Token is required");
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const { email, name, picture, sub } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if not exists
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            user = await User.create({
                fullName: name,
                email,
                username: email.split("@")[0].toLowerCase() + Math.random().toString(36).slice(-4),
                avatar: picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${email}`,
                password: randomPassword,
                isSocialLogin: true, // You might want to add this field to your schema optionally
            });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser, accessToken, refreshToken
                    },
                    "Google Login Successful"
                )
            );

    } catch (error) {
        throw new ApiError(401, "Invalid Google ID Token: " + error.message);
    }
});

const appleLogin = asyncHandler(async (req, res) => {
    const { identityToken, user: userInfo } = req.body;
    // userInfo contains name if it's the first login, useful for Apple since token might not have name

    if (!identityToken) {
        throw new ApiError(400, "Apple Identity Token is required");
    }

    try {
        // Verify the identity token
        const { sub: userAppleId, email } = await appleSignin.verifyIdToken(identityToken, {
            audience: process.env.APPLE_CLIENT_ID,
            ignoreExpiration: true, // Optional
        });

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if not exists
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            let fullName = "Apple User";
            if (userInfo && userInfo.name) {
                fullName = `${userInfo.name.firstName} ${userInfo.name.lastName}`.trim();
            }

            user = await User.create({
                fullName,
                email,
                username: email.split("@")[0].toLowerCase() + Math.random().toString(36).slice(-4),
                avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${email}`,
                password: randomPassword,
                isSocialLogin: true,
            });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser, accessToken, refreshToken
                    },
                    "Apple Login Successful"
                )
            );

    } catch (error) {
        throw new ApiError(401, "Invalid Apple Identity Token: " + error.message);
    }
});

export {
    googleLogin,
    appleLogin
};
