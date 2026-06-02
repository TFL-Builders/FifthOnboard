import { Resend } from 'resend';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const resend = new Resend(process.env.RESEND_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadTemplate(templateName, context) {
    const filePath = path.join(__dirname, 'email-templates', `${templateName}.hbs`);
    const source = fs.readFileSync(filePath, 'utf8');
    const compiled = handlebars.compile(source);
    return compiled(context);
}

export async function sendResetEmail(email, resetLink) {
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

export async function sendOnboardingEmail(email, organizationName, portalLink) {
    const html = loadTemplate('onboarding-welcome', { organizationName, portalLink })
    try {
        await resend.emails.send({
            from: 'Columbus <noreply@domain.com>',
            to: email,
            subject: `Welcome to ${organizationName}`,
            html
        });
        console.log('Portal link for new hire: ', portalLink);
    } catch(error) {
        console.log('Email send error: ', error.message);
        throw error;
    }
}

export async function sendtaskAssignedEmail(email) {
    const html = loadTemplate('task-assigned', {})
    try {
        await resend.emails.send({
            from: 'Columbus <noreply@gomain.com>',
            to: email,
            subject: 'Task Assigned',
            html
        });
    } catch(error){
        console.log('Email send error: ', error.message);
        throw error;
    }
}

export async function sendTaskDueSoonEmail(email) {
    const html = loadTemplate('task-due-soon', {})
    try {
        await resend.emails.send({
            from: 'Columbus <noreply@gomain.com>',
            to: email,
            subject: 'Task Due Soon',
            html
        });
    } catch(error){
        console.log('Email send error: ', error.message);
        throw error;
    }
}

export async function sendOverdueEmail(email) {
    const html = loadTemplate('task-overdue', {})
    try {
        await resend.emails.send({
            from: 'Columbus <noreply@gomain.com>',
            to: email,
            subject: 'Task Overdue',
            html
        });
    } catch(error){
        console.log('Email send error: ', error.message);
        throw error;
    }
}