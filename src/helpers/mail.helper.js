// import transporter from "../configs/mail.config.js";


// export const sendEmail = async (to, subject, content) => {
//     const info = await transporter.sendMail({
//         from: `"My App" <${process.env.GMAIL_USER}>`,
//         to,
//         subject,
//         text: content,
//     });




//     return info;
// };


import transporter from "../configs/mail.config.js";

export const sendEmail = async (to, subject, content) => {
    try {
        const info = await transporter.sendMail({
            from: `"My App" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            text: content,
        });
        return info;
    } catch (error) {
        console.log("Email sending failed:", error.message);
    }
};