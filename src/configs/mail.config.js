// import nodemailer from "nodemailer";

// const testAccount = await nodemailer.createTestAccount();

// const transporter = nodemailer.createTransport({
//     host: testAccount.smtp.host,
//     port: testAccount.smtp.port,
//     secure: testAccount.smtp.secure,

//     // service : "gmail",                  --> agar akkountizmni ulash kerak bulsa qushamiz
//     auth: {
//         pass: testAccount.pass,          // parolimiz google akountimizni
//         user: testAccount.user,                          // nik                                         
//     },
// });

// export default transporter;




import nodemailer from "nodemailer";
 
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
 
export default transporter;