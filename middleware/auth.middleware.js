import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req , res , next) => {
    try {
        const authHeader = req.get("Authorization"); // ✅ gets the header safely
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No authentication token, access denied" });
    }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
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

