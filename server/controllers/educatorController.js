import { clerkClient } from "@clerk/express";

// Controller to update user role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId;
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: "educator"
            }
        });
        res.status(200).json({ success: true, message: "You are now an Educator" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}