import { verifyToken } from "../helpers/auth.js";
import { getUserById } from "../controllers/user.js";
import { authError } from "../helpers/utils.js";

// Middleware for isAuthenticated user only accessing
export async function isUserAuthenticated(req, res, next) {
    if (req.headers["x-auth-token"]) {
        try {
            const reqToken = await req.headers["x-auth-token"];
            const userId = verifyToken(reqToken);
            if (!userId) {
                return authError(res, "InvalidToken")
            };
            const userData = await getUserById(userId.id);
            req.user = userData;
            next();
        } catch (error) {
            return authError(res, "Authentication Failed");
        }
    } else {
        return authError(res, "Authentication Failed")
    }
};

