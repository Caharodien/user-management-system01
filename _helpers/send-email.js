const nodemailer = require('nodemailer');
const config = require('config.json');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from }) {
    let transporter;

    // Check if config has smtpOptions
    if (config.smtpOptions && config.emailFrom) {
        transporter = nodemailer.createTransport(config.smtpOptions);
        from = from || config.emailFrom;
    } else {
        // Fallback: use Ethereal test account
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        from = from || testAccount.user;

        console.log('✉️ Using Ethereal test account');
        console.log('Login:', testAccount.user);
        console.log('Password:', testAccount.pass);
    }

    try {
        const info = await transporter.sendMail({ from, to, subject, html });

        console.log('✅ Message sent:', info.messageId);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log('🔗 Preview URL:', previewUrl);
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw 'Email sending failed';
    }
}
