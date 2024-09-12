import jwt from "jsonwebtoken";

// Create New Token
export function generateToken(id) {
    return jwt.sign({id}, process.env.SECRET_KEY);
};

// Verify existing Token
export function verifyToken(token) {
    return jwt.verify(token, process.env.SECRET_KEY);
}