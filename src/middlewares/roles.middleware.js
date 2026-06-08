import { ForbiddenException } from "../exceptions/forbidden.exception.js";

export const Roles = (...roles) => {
    return (req , res , next) => {
        if(!roles.includes(req.user?.role)) {
            throw new ForbiddenException("You don't have any accesses")
        }

        next()
    }
}