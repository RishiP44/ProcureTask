import nodemailer from 'nodemailer';

const createTransporter = () => {
    // Use real SMTP credentials from .env if available, otherwise use Ethereal (test account)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    // Fallback: Gmail app password
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });
    }
    // Development fallback: log emails to console
    return null;
};

const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@procuretask.com';

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    const transporter = createTransporter();

    if (!transporter) {
        // Dev mode: log to console
        console.log('\n========== EMAIL (Dev Mode) ==========');
        console.log(`TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`BODY: ${html.replace(/<[^>]+>/g, '')}`);
        console.log('======================================\n');
        return;
    }

    await transporter.sendMail({
        from: `"ProcureTask" <${FROM_EMAIL}>`,
        to,
        subject,
        html,
    });
};

// ---- Email Templates ----

export const sendOfferLetterEmail = async (opts: {
    to: string;
    candidateName: string;
    position: string;
    department: string;
    startDate: string;
    salary?: string;
    message?: string;
    token: string;
}) => {
    const acceptUrl = `${APP_URL}/offer-letter/${opts.token}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr><td style="background:#1e40af;padding:40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">BHR Organization</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Your New Job Offer</p>
            </td></tr>
            <!-- Body -->
            <tr><td style="padding:48px 40px;">
              <h2 style="margin:0 0 8px;color:#1e3a5f;font-size:24px;">Good News, ${opts.candidateName}!</h2>
              <p style="color:#64748b;font-size:16px;line-height:1.6;margin:16px 0;">We have a job offer for you. Please check the details of your offer below.</p>
              
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin:24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:8px 0;color:#64748b;font-size:14px;width:40%;">Job Role</td>
                      <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">${opts.position}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Department</td>
                      <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">${opts.department}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Start Date</td>
                      <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">${opts.startDate}</td></tr>
                  ${opts.salary ? `<tr><td style="padding:8px 0;color:#64748b;font-size:14px;">Salary</td>
                      <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;">${opts.salary}</td></tr>` : ''}
                </table>
              </div>
              
              ${opts.message ? `<p style="color:#475569;font-size:15px;line-height:1.7;font-style:italic;border-left:3px solid #1e40af;padding-left:16px;margin:24px 0;">${opts.message}</p>` : ''}
              
              <p style="color:#64748b;font-size:15px;line-height:1.6;">To accept this offer, please click the button below.</p>
              
              <div style="text-align:center;margin:32px 0;">
                <a href="${acceptUrl}" style="display:inline-block;background:#1e40af;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:600;">Accept Offer →</a>
              </div>
            </td></tr>
            <!-- Footer -->
            <tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 BHR Organization</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

    await sendEmail(opts.to, `🎉 Your Offer Letter — ${opts.position} at ProcureTask`, html);
};

export const sendInviteEmail = async (opts: {
    to: string;
    name: string;
    invitedBy: string;
    token: string;
}) => {
    const signupUrl = `${APP_URL}/signup?token=${opts.token}&email=${encodeURIComponent(opts.to)}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">ProcureTask</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">HR & Workforce Management</p>
            </td></tr>
            <tr><td style="padding:48px 40px;">
              <h2 style="margin:0 0 8px;color:#1e3a5f;font-size:24px;">You've been invited!</h2>
              <p style="color:#64748b;font-size:16px;line-height:1.6;">${opts.invitedBy} has invited you to join ProcureTask. Create your account to get started.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${signupUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:600;">Accept Invitation →</a>
              </div>
              <p style="color:#94a3b8;font-size:13px;text-align:center;">This link expires in 48 hours.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

    await sendEmail(opts.to, `You're invited to join ProcureTask`, html);
};

export const sendTaskAssignmentEmail = async (opts: {
    to: string;
    employeeName: string;
    workflowName: string;
    assignedBy: string;
    assignmentId: string;
}) => {
    const taskUrl = `${APP_URL}/assignments/${opts.assignmentId}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">ProcureTask</h1>
            </td></tr>
            <tr><td style="padding:48px 40px;">
              <h2 style="margin:0 0 8px;color:#1e3a5f;">New Task Assigned</h2>
              <p style="color:#64748b;font-size:16px;line-height:1.6;">Hi ${opts.employeeName}, <strong>${opts.assignedBy}</strong> has assigned you a new workflow: <strong>${opts.workflowName}</strong>.</p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${taskUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:600;">View Tasks →</a>
              </div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

    await sendEmail(opts.to, `New Task Assigned: ${opts.workflowName}`, html);
};
