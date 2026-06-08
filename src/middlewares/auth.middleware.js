import jwt from "jsonwebtoken";
 
export const authMiddleware = (req, res, next) => {
    let token = req.headers.authorization?.split(" ")[1];
 
    if (!token) {
        token = req.signedCookies?.accessToken;
    }
 
    if (!token) {
        return res.status(401).send({
            success: false,
            message: "Token not provided",
        });
    }
 
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send({
            success: false,
            message: "Token is invalid",
        });
    }
};