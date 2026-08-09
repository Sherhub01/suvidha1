import nodemailer from "nodemailer";

const BRAND = "#6D28D9";
const BRAND_DARK = "#4C1D95";
const ACCENT = "#EC4899";
const TEXT = "#111827";
const MUTED = "#6B7280";
const LIGHT_BG = "#F5F3FF";
const BORDER = "#E5E7EB";

let transporter = null;

// Creates one reusable Gmail transporter.
export const getTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 300000,
            dnsTimeout: 30000,
            tls: {
                servername: "smtp.gmail.com",
                minVersion: "TLSv1.2",
            },
            pool: false,
            defaults: {
                from: `"Suvidha1" <${process.env.EMAIL_USER}>`,
            },
        });
    }

    return transporter;
};

const resetTransporter = () => {
    try {
        if (transporter) transporter.close();
    } catch (error) {
        console.warn("SMTP close error:", error.message);
    }

    transporter = null;
};

// Checks Gmail SMTP when the server starts.
export const verifyMailer = async () => {
    try {
        await getTransporter().verify();
        console.log("✅ Nodemailer is ready to send emails");
        return true;
    } catch (error) {
        console.error("❌ Nodemailer connection failed:", error.message);
        console.error("SMTP code:", error.code || "UNKNOWN");
        resetTransporter();
        return false;
    }
};

const escapeHtml = (value = "") => {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const base = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>Suvidha1</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT};">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F6;">
<tr>
<td align="center" style="padding:40px 16px;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:#FFFFFF;border-radius:18px;overflow:hidden;border:1px solid ${BORDER};">

<tr>
<td style="background:linear-gradient(135deg,${BRAND_DARK},${BRAND},${ACCENT});padding:34px 32px;text-align:center;">

<div style="display:inline-block;width:52px;height:52px;line-height:52px;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.25);border-radius:15px;color:#FFFFFF;font-size:24px;font-weight:800;margin-bottom:14px;">
S
</div>

<div style="color:#FFFFFF;font-size:26px;font-weight:800;">
Suvidha1
</div>

<div style="margin-top:6px;color:rgba(255,255,255,0.82);font-size:13px;font-weight:500;">
Trusted services, delivered simply.
</div>

</td>
</tr>

<tr>
<td style="padding:36px 34px 30px;">
${content}
</td>
</tr>

<tr>
<td style="border-top:1px solid ${BORDER};background:#FAFAFA;padding:22px 30px;text-align:center;">

<div style="color:${MUTED};font-size:12px;line-height:19px;">
This is an automated message from <strong style="color:${TEXT};">Suvidha1</strong>.<br>
Please do not reply directly to this email.<br><br>
<span style="color:#9CA3AF;">© ${new Date().getFullYear()} Suvidha1. All rights reserved.</span>
</div>

</td>
</tr>

</table>

<div style="max-width:620px;padding:18px 20px 0;text-align:center;color:#9CA3AF;font-size:11px;line-height:17px;">
You are receiving this email because an action was performed on your Suvidha1 account.
</div>

</td>
</tr>
</table>

</body>
</html>
`;

const button = (url, text) => `
<a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND};color:#FFFFFF !important;text-decoration:none;font-size:14px;font-weight:700;padding:13px 22px;border-radius:10px;margin-top:10px;">
${escapeHtml(text)}
</a>
`;

const infoBox = (rows) => `
<div style="margin:24px 0;border:1px solid ${BORDER};border-radius:12px;background:#FAFAFA;overflow:hidden;">

${rows.map((row, index) => `
<div style="padding:13px 16px;${index > 0 ? `border-top:1px solid ${BORDER};` : ""}">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>

<td style="color:${MUTED};font-size:13px;width:42%;">
${escapeHtml(row.label)}
</td>

<td align="right" style="color:${TEXT};font-size:13px;font-weight:700;">
${escapeHtml(row.value)}
</td>

</tr>
</table>

</div>
`).join("")}

</div>
`;

const send = async (to, subject, html) => {
    if (!to) {
        throw new Error("Recipient email is required.");
    }

    const message = {
        from: `"Suvidha1" <${process.env.EMAIL_USER}>`,
        to: to.trim(),
        subject,
        html,
        headers: {
            "X-Mailer": "Suvidha1",
        },
    };

    try {
        const info = await getTransporter().sendMail(message);
        console.log(`📧 Email sent → ${to}`);
        return info;
    } catch (error) {
        console.error(`⚠️ Email failed → ${to}`);
        console.error("SMTP error:", error.code || error.message);

        const retryableErrors = [
            "ECONNRESET",
            "ECONNREFUSED",
            "ETIMEDOUT",
            "ESOCKET",
            "EPIPE",
            "ECONNABORTED",
            "ENETUNREACH",
            "EAI_AGAIN",
        ];

        if (!retryableErrors.includes(error.code)) {
            throw error;
        }

        resetTransporter();
        await sleep(1200);

        try {
            const info = await getTransporter().sendMail(message);
            console.log(`📧 Email sent after retry → ${to}`);
            return info;
        } catch (retryError) {
            console.error(`❌ Email retry failed → ${to}`);
            console.error(
                "SMTP retry error:",
                retryError.code || retryError.message
            );

            resetTransporter();
            throw retryError;
        }
    }
};

export const sendOtpEmail = async (
    email,
    otp,
    subject = "Verify Your Suvidha1 Account",
    heading = "Email Verification"
) => {
    const html = base(`
<h1 style="margin:0 0 10px;font-size:24px;line-height:32px;color:${TEXT};font-weight:800;">
${escapeHtml(heading)}
</h1>

<p style="margin:0 0 8px;color:${TEXT};font-size:15px;line-height:24px;">
Hello!
</p>

<p style="margin:0;color:${MUTED};font-size:15px;line-height:24px;">
Use the verification code below to continue securely with your Suvidha1 account.
</p>

<div style="margin:28px 0;padding:26px 20px;text-align:center;background:${LIGHT_BG};border:1px solid #DDD6FE;border-radius:16px;">

<div style="color:${MUTED};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">
Verification Code
</div>

<div style="display:inline-block;padding:14px 22px;background:linear-gradient(135deg,${BRAND},${ACCENT});color:#FFFFFF;border-radius:12px;font-size:30px;line-height:36px;font-weight:800;letter-spacing:9px;">
${escapeHtml(otp)}
</div>

<div style="margin-top:14px;color:${MUTED};font-size:12px;">
This code expires in <strong>5 minutes</strong>.
</div>

</div>

<p style="margin:0;color:${MUTED};font-size:13px;line-height:21px;">
If you did not request this code, you can safely ignore this email. Never share your verification code with anyone.
</p>

<div style="margin-top:24px;padding:14px 16px;background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;color:#9A3412;font-size:12px;line-height:19px;">
<strong>Security notice:</strong> Suvidha1 will never ask you to share your OTP over phone, chat, or email.
</div>
`);

    return send(email, subject, html);
};

export const sendApplicationSubmittedEmail = async ({
    staffEmail,
    staffName,
    adminEmail,
}) => {
    const staffHtml = base(`
<h1 style="margin:0 0 10px;font-size:24px;color:${TEXT};">
Application Submitted
</h1>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
Hi <strong>${escapeHtml(staffName)}</strong>,
</p>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
Your professional profile has been successfully submitted and is now under review.
</p>

${infoBox([
    { label: "Status", value: "Under Review" },
    { label: "Expected Review", value: "24–48 hours" },
])}

<p style="color:${MUTED};font-size:14px;line-height:22px;">
We will email you once your application has been reviewed.
</p>
`);

    const adminHtml = base(`
<h1 style="margin:0 0 10px;font-size:24px;color:${TEXT};">
New Staff Application
</h1>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
A new staff application is waiting for review.
</p>

${infoBox([
    { label: "Applicant", value: staffName },
    { label: "Email", value: staffEmail },
    { label: "Status", value: "Pending Review" },
])}

${button(
    `${process.env.ADMIN_URL || "http://localhost:5174"}/admin/staff-approval`,
    "Review Application →"
)}
`);

    const jobs = [];

    if (staffEmail) {
        jobs.push(
            send(
                staffEmail,
                "Application Submitted | Suvidha1",
                staffHtml
            )
        );
    }

    if (adminEmail) {
        jobs.push(
            send(
                adminEmail,
                `New Staff Application: ${staffName} | Suvidha1`,
                adminHtml
            )
        );
    }

    await Promise.all(jobs);
};

export const sendApprovalEmail = async ({
    staffEmail,
    staffName,
}) => {
    const html = base(`
<h1 style="margin:0 0 10px;font-size:25px;color:${TEXT};">
Application Approved 🎉
</h1>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
Hi <strong>${escapeHtml(staffName)}</strong>,
</p>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
Congratulations! Your professional application has been approved.
</p>

${infoBox([
    { label: "Account Status", value: "Approved ✓" },
    { label: "Dashboard", value: "Active" },
])}

<p style="color:${MUTED};font-size:14px;line-height:22px;">
You can now sign in and manage your bookings through your Suvidha1 dashboard.
</p>

${button(
    `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
    "Access Dashboard →"
)}
`);

    await send(
        staffEmail,
        "Application Approved — Welcome to Suvidha1!",
        html
    );
};

export const sendRejectionEmail = async ({
    staffEmail,
    staffName,
    reason,
}) => {
    const html = base(`
<h1 style="margin:0 0 10px;font-size:24px;color:${TEXT};">
Application Status Update
</h1>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
Hi <strong>${escapeHtml(staffName)}</strong>,
</p>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
We have reviewed your professional application. Unfortunately, it has not been approved at this time.
</p>

${infoBox([
    { label: "Status", value: "Not Approved" },
    { label: "Reason", value: reason || "Please contact support." },
])}

<p style="color:${MUTED};font-size:14px;line-height:22px;">
You may address the reason above and re-apply when eligible.
</p>

${button(
    "mailto:support@suvidha1.app",
    "Contact Support"
)}
`);

    await send(
        staffEmail,
        "Application Status Update | Suvidha1",
        html
    );
};

export const sendBookingEmail = async ({
    consumerEmail,
    consumerName,
    staffEmail,
    staffName,
    booking,
}) => {
    const bookingId = String(booking._id)
        .slice(-8)
        .toUpperCase();

    const details = infoBox([
        { label: "Booking ID", value: `#${bookingId}` },
        { label: "Service", value: booking.service || "Service" },
        { label: "Date", value: booking.date || "To be confirmed" },
        { label: "Time", value: booking.time || "To be confirmed" },
        { label: "Address", value: booking.address || "To be confirmed" },
        { label: "Amount", value: booking.price || "To be confirmed" },
        { label: "Status", value: "Scheduled" },
    ]);

    const consumerHtml = base(`
<h1 style="margin:0 0 10px;font-size:24px;color:${TEXT};">
Booking Confirmed
</h1>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
Hi <strong>${escapeHtml(consumerName)}</strong>,
</p>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
Your service booking has been successfully scheduled.
</p>

${details}

<p style="color:${MUTED};font-size:14px;line-height:22px;">
Your professional <strong>${escapeHtml(
        staffName || "will be assigned shortly"
    )}</strong> will contact you before the appointment.
</p>
`);

    const staffHtml = base(`
<h1 style="margin:0 0 10px;font-size:24px;color:${TEXT};">
New Job Booking
</h1>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
Hi <strong>${escapeHtml(staffName)}</strong>,
</p>

<p style="color:${MUTED};font-size:15px;line-height:24px;">
You have received a new service booking. Please review it from your dashboard.
</p>

${details}

<p style="color:${MUTED};font-size:14px;">
<strong>Customer:</strong> ${escapeHtml(consumerName)}
</p>

${button(
    `${process.env.FRONTEND_URL || "http://localhost:5173"}/staff/bookings`,
    "Manage Booking →"
)}
`);

    const jobs = [];

    if (consumerEmail) {
        jobs.push(
            send(
                consumerEmail,
                `Booking Confirmed — ${booking.service || "Service"} | Suvidha1`,
                consumerHtml
            )
        );
    }

    if (staffEmail) {
        jobs.push(
            send(
                staffEmail,
                `New Job Booking — ${booking.service || "Service"} | Suvidha1`,
                staffHtml
            )
        );
    }

    await Promise.all(jobs);
};

export default {
    getTransporter,
    verifyMailer,
    sendOtpEmail,
    sendApplicationSubmittedEmail,
    sendApprovalEmail,
    sendRejectionEmail,
    sendBookingEmail,
};