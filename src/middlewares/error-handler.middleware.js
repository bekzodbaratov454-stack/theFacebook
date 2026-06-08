import logger from "../helpers/logger.helper.js";

export const ErrorHandlerMiddleware = (err , req , res , next) => {

    logger.error(JSON.stringify(err));


    if (err.isException) {
        return res.status(err.status).json({
            success : false,
            message : err.message,
        });
    }



res.status(500).send({
    success : false,
    message : "Internal server error",
    
});
};



// umumiy try va catch xatoliklar bulsa serverda hammasi shu yerga keb tushadi , 
// agar boshqa xatolik bulsa 500 request yani serverda muammo bor degani bizda emas

// buni ishlatish uchun main.js ga use qib quyamiz 