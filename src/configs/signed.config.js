import { config } from "dotenv";
import signed from "signed";

config()

const siganure = signed.default({
    secret: process.env.SIGN_URL_SECRET,
});

export default siganure;