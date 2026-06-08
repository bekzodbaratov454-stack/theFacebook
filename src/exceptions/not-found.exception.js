import { BaseException } from "./base.exception.js";

export class NotFoundException extends BaseException {
    constructor(message) {
        super(message);
        this.status = 404;
        this.name = "Not Found Exception"
    }
}

// --> 404 bulgan barcha not found requestlarga throw qilib NotFoundException shu nomini yozib 
// ishlatsak buladi faqat usha xatolikni ichidagi nomini ushanga moslab tug'rlab quyamiz