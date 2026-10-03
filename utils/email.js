const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    host: process.env.SMTP_HOST,

    port: process.env.SMTP_PORT,

    secure: false,

    auth: {

        user: process.env.SMTP_EMAIL,

        pass: process.env.SMTP_PASSWORD

    }

});

const sendEmail = async (to, subject, html) => {

    await transporter.sendMail({

        from: `"Charging CMS" <${process.env.SMTP_EMAIL}>`,

        to,

        subject,

        html

    });

};

module.exports = sendEmail;