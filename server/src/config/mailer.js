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
        console.log(resetLink);
    }catch(error){
        console.log("Email send error:", error.message);
        throw error; // let the controller handle it
    }
}

export async function sendWelcomeEmail(email, organizationName, inviteLink){
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
        await resend.emails.send({
            from: 'Columbus <noreply@domain.com>',
            to: email,
            subject: `Welcome to ${organizationName}`,
            html: `<h2>You've been invited!</h2>
                <p>You have been added to ${organizationName} on Columbus. Click the link below to start your onboarding.</p>
                <a href="${inviteLink}">Accept Invitation & Start Onboarding.</a>
                <p>If you weren't expecting this invitation, you can safely ignore this email.</p>`
        });
        console.log('invite link for new hire: ', inviteLink);
    } catch(error) {
        console.log('Enail send error: ', error.message);
        throw error;
    }
}