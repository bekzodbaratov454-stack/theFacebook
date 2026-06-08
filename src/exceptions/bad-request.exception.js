import { BaseException } from "./base.exception.js";

export class BadRequestException extends BaseException {
    constructor(message) {
        super(message);
        this.status = 400;
        this.name = "Bad Request Exception"
    }
}


// --> 400 bulgan barcha bad requestlarga throw qilib BadRequestException shu nomini yozib 
// ishlatsak buladi faqat usha xatolikni ichidagi nomini ushanga moslab tug'rlab quyamiz