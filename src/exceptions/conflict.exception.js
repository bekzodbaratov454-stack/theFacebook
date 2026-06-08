import { BaseException } from "./base.exception.js";

export class ConflictException extends BaseException {
    constructor(message) {
        super(message);
        this.status = 409;
        this.name = "Conflict Request Exception"
    }
}


// --> 409 bulgan barcha conflict requestlarga throw qilib ConflictException shu nomini yozib 
// ishlatsak buladi faqat usha xatolikni ichidagi nomini ushanga moslab tug'rlab quyamiz