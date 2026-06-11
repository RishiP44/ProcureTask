import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Set SendGrid API Key if present
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to send email via SendGrid, SMTP, or fallback to simulated-emails.json
const sendMailHelper = async (to: string, subject: string, html: string, text?: string) => {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.FROM_EMAIL || 'noreply@procuretask.com';

    // 1. SendGrid Mode
    if (apiKey) {
        try {
            const msg = { to, from: fromEmail, subject, html, text };
            await sgMail.send(msg);
            console.log(`✅ Email sent via SendGrid to ${to}`);
            return;
        } catch (error: any) {
            console.error('❌ Error sending email via SendGrid:', error.response?.body || error.message);
            throw error;
        }
    }

    // 2. SMTP/Nodemailer Mode
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    if (smtpHost && smtpUser && smtpPass) {
        try {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: { user: smtpUser, pass: smtpPass }
            });

            await transporter.sendMail({
                from: fromEmail,
                to,
                subject,
                html,
                text
            });
            console.log(`✅ Email sent via SMTP to ${to}`);
            return;
        } catch (error: any) {
            console.error('❌ Error sending email via SMTP:', error.message);
            throw error;
        }
    }

    // 3. Simulation Fallback: Append to simulated-emails.json
    console.log(`📧 Simulation Mode: Logging email to simulated-emails.json (Recipient: ${to})`);
    console.log(`Subject: ${subject}`);
    
    try {
        const filePath = path.join(__dirname, '../../simulated-emails.json');
        let emails: any[] = [];
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            try {
                emails = JSON.parse(fileData);
            } catch {
                emails = [];
            }
        }
        emails.push({
            to,
            subject,
            html,
            sentAt: new Date().toISOString()
        });
        fs.writeFileSync(filePath, JSON.stringify(emails, null, 2), 'utf-8');
        console.log(`📝 Email successfully stored in: backend/simulated-emails.json`);
    } catch (err: any) {
        console.error('❌ Failed to write to simulated-emails.json:', err.message);
    }
};

interface InviteEmailParams {
    to: string;
    name: string;
    invitedBy: string;
    token: string;
}

export const sendInviteEmail = async ({ to, name, invitedBy, token }: InviteEmailParams) => {
    const registrationLink = `${process.env.APP_URL || 'http://localhost:5173'}/register?token=${token}`;
    const subject = `Welcome to ProcureTask! Join your workspace`;
    const html = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #1e3a8a; font-size: 24px; margin-bottom: 10px;">Hello ${name},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                You have been invited by <strong>${invitedBy}</strong> to join the <strong>ProcureTask</strong> workspace.
            </p>
            <div style="margin: 30px 0; text-align: center;">
                <a href="${registrationLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Complete Registration</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px;">
                If you did not expect this invitation, you can safely ignore this email. This link will expire soon.
            </p>
        </div>
    `;

    await sendMailHelper(to, subject, html, `Hi ${name}, you have been invited by ${invitedBy} to join ProcureTask. Registration link: ${registrationLink}`);
};

interface TaskAssignmentEmailParams {
    to: string;
    employeeName: string;
    workflowName: string;
    assignedBy: string;
    assignmentId: string;
}

export const sendTaskAssignmentEmail = async ({
    to,
    employeeName,
    workflowName,
    assignedBy,
    assignmentId,
}: TaskAssignmentEmailParams) => {
    const assignmentLink = `${process.env.APP_URL || 'http://localhost:5173'}/assignments/${assignmentId}`;
    const subject = `New Workflow Assigned: ${workflowName}`;
    const html = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #1e3a8a; font-size: 24px; margin-bottom: 10px;">Hello ${employeeName},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                You have been assigned a new workflow: <strong>${workflowName}</strong> by <strong>${assignedBy}</strong>.
            </p>
            <p style="color: #4b5563; font-size: 16px;">
                Please click the button below to view details and start tasks.
            </p>
            <div style="margin: 30px 0; text-align: center;">
                <a href="${assignmentLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">View Workflow Tasks</a>
            </div>
        </div>
    `;

    await sendMailHelper(to, subject, html, `Hi ${employeeName}, you have been assigned a new workflow "${workflowName}" by ${assignedBy}. Link: ${assignmentLink}`);
};

interface OfferLetterEmailParams {
    to: string;
    candidateName: string;
    position: string;
    department: string;
    salary: number;
    token: string;
    message?: string;
}

export const sendOfferLetterEmail = async ({
    to,
    candidateName,
    position,
    department,
    salary,
    token,
    message,
}: OfferLetterEmailParams) => {
    const offerLink = `${process.env.APP_URL || 'http://localhost:5173'}/offer-letter/${token}`;
    const subject = `Employment Offer: ${position} at ProcureTask`;
    const html = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 40px;">🎉</span>
            </div>
            <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 10px; font-family: 'Outfit', sans-serif;">Employment Proposal</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 25px;">
                Congratulations, <strong>${candidateName}</strong>! We are thrilled to offer you the position of <strong>${position}</strong> in our <strong>${department}</strong> department.
            </p>
            
            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Offer Summary</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="color: #64748b; padding: 6px 0; font-weight: 500;">Role:</td>
                        <td style="color: #0f172a; padding: 6px 0; font-weight: 700; text-align: right;">${position}</td>
                    </tr>
                    <tr>
                        <td style="color: #64748b; padding: 6px 0; font-weight: 500;">Department:</td>
                        <td style="color: #0f172a; padding: 6px 0; font-weight: 700; text-align: right;">${department}</td>
                    </tr>
                    ${salary ? `
                    <tr>
                        <td style="color: #64748b; padding: 6px 0; font-weight: 500;">Compensation:</td>
                        <td style="color: #0f172a; padding: 6px 0; font-weight: 700; text-align: right;">$${salary.toLocaleString()} / year</td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            ${message ? `
            <div style="border-left: 4px solid #3b82f6; background-color: #eff6ff; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
                <p style="color: #1e40af; font-size: 14px; font-style: italic; margin: 0;">"${message}"</p>
            </div>
            ` : ''}

            <p style="color: #475569; font-size: 14px; text-align: center; margin-bottom: 30px;">
                Please click the button below to review your complete offer letter, accept the terms, and set up your onboarding account.
            </p>

            <div style="text-align: center; margin-bottom: 25px;">
                <a href="${offerLink}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Review & Respond to Offer</a>
            </div>

            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 30px;">
                This link expires 7 days after issue or upon response. If you have questions, please reach out to HR.
            </p>
        </div>
    `;

    await sendMailHelper(to, subject, html, `Congratulations ${candidateName}! You have been offered the position of ${position} in ${department}. Review and accept here: ${offerLink}`);
};

/**
 * Send general emails using SendGrid or SMTP helper.
 */
export const sendGeneralEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    await sendMailHelper(to, subject, html);
};
