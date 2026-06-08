import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../exceptions/unauthorized.exception.js";

export const Protected = (isProtected = true) => {
    
    return (req, res, next) => {
        if (!isProtected) return next();

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) throw new UnauthorizedException("Token not provided");

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch {
            throw new UnauthorizedException("Token is invalid");
        }
    };
};
