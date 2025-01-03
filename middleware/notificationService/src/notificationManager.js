const CREDENTIALS = require('../credentials');
const nodemailer = require('nodemailer');

const EMAIL = CREDENTIALS.email;
const PASSWORD = CREDENTIALS.email_app_password;

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: EMAIL,
        pass: PASSWORD
    }
})

async function notifyCancelation(recipientEmail) {
    let emailOptions = {
        from: EMAIL,
        to: recipientEmail,
        subject: 'Appointment Cancellation Alert',
        text: 'Your appointment has been cancelled.'
    }

    transporter.sendMail(emailOptions, function (error, info) {
        if(error){
            console.log(error);
        } else {
            console.log('Email sent:' + info.response);
        }
    })


}



module.exports = {
    notifyCancelation,
}