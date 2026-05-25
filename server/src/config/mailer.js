import { Resend } from 'resend';


export async function sendResetEmail(email, resetLink){
    const resend = new Resend(process.env.RESEND_API_KEY);
    try{
       await resend.emails.send({
          from: "Columbus <noreply@yourdomain.com>",
          to: email,
          subject: 'Reset your password',
          html: `<h2>Password Reset Request</h2>
            <p>You requested a password reset. Click the link below to reset your password.</p>
            <p>This link expires in 15 minutes.</p>
            <a href="${resetLink}">Reset Password</a>
            <p>If you didn't request this, ignore this email.</p>`
        });
    }catch(error){
        console.log("Email send error:", error.message);
        throw error; // let the controller handle it
    }
}