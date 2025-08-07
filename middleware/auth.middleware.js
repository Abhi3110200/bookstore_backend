import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req , res , next) => {
    try {
        const token = req.headers("Authorization").replace("Bearer ", "");
        if(!token){
            return res.status(401).json({message : "No authentication token, access denied"});
        }
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({message : "User not found, access denied"});
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({message : "Token is not valid"});
    }
}

