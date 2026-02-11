import { clerkClient } from "@clerk/express";

// Middleware to protect Educator routes
export const protectEducator = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const user = await clerkClient.users.getUser(userId);
        if(user.publicMetadata.role !== "educator"){
            return res.status(403).json({ success: false, message: "Unauthorised access" });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}