import nodemailer from "nodemailer";

const BRAND  = "#6D28D9";
const ACCENT = "#EC4899";

export const getTransporter = () =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const base = (content) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body{margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;}
  .wrap{max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  .hdr{background:linear-gradient(135deg,${BRAND},${ACCENT});padding:32px 32px 24px;text-align:center;}
  .hdr h1{margin:0;color:#fff;font-size:22px;font-weight:700;}
  .hdr p{margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;}
  .bdy{padding:28px 32px;}
  .bdy p{margin:0 0 14px;color:#374151;font-size:14px;line-height:1.6;}
  .box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:16px 0;}
  .row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:13px;}
  .row:last-child{border-bottom:none;}
  .lbl{color:#6b7280;font-weight:500;}
  .val{color:#111827;font-weight:600;}
  .btn{display:inline-block;background:linear-gradient(135deg,${BRAND},${ACCENT});color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;margin:16px 0;}
  .badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;}
  .bs{background:#dcfce7;color:#166534;}
  .bw{background:#fef3c7;color:#92400e;}
  .bd{background:#fee2e2;color:#991b1b;}
  .ftr{background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;}
  .ftr p{margin:0;color:#9ca3af;font-size:11px;line-height:1.6;}
</style></head><body>
<div class="wrap">
  <div class="hdr">
    <h1>&#9889; Suvidha<span style="color:#fbbf24">1</span></h1>
    <p>India's Trusted Home Services Platform</p>
  </div>
  <div class="bdy">${content}</div>
  <div class="ftr">
    <p>&copy; ${new Date().getFullYear()} Suvidha1. All rights reserved.<br/>
    Automated email &mdash; do not reply.<br/>
    Help? <a href="mailto:support@suvidha1.app" style="color:${BRAND};">support@suvidha1.app</a></p>
  </div>
</div>
</body></html>`;

const send = (to, subject, html) =>
  getTransporter().sendMail({
    from: `"Suvidha1" <${process.env.EMAIL_USER}>`,
    to, subject, html,
  });

// OTP
export const sendOtpEmail = async (email, otp, subject, heading) => {
  const html = base(`
    <p style="font-size:16px;font-weight:600;color:#111827;">Hello!</p>
    <p>${heading}. Use the OTP below &mdash; it expires in <strong>5 minutes</strong>.</p>
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background:linear-gradient(135deg,${BRAND},${ACCENT});border-radius:12px;padding:16px 36px;">
        <span style="font-size:32px;font-weight:800;letter-spacing:10px;color:#fff;">${otp}</span>
      </div>
    </div>
    <p style="color:#6b7280;font-size:13px;">If you didn't request this, ignore this email.</p>`);
  await send(email, subject, html);
};

// Staff submitted — staff + admin
export const sendApplicationSubmittedEmail = async ({ staffEmail, staffName, adminEmail }) => {
  const staffHtml = base(`
    <p>Hi <strong>${staffName}</strong>,</p>
    <p>Your professional profile has been <strong>submitted</strong> and is under review.</p>
    <div class="box">
      <div class="row"><span class="lbl">Status</span><span class="badge bw">Under Review</span></div>
      <div class="row"><span class="lbl">Expected TAT</span><span class="val">24&#8211;48 hours</span></div>
    </div>
    <p>We will email you once reviewed. Thank you for joining Suvidha1!</p>`);

  const adminHtml = base(`
    <p>Hi Admin,</p>
    <p>A new staff application is waiting for your review.</p>
    <div class="box">
      <div class="row"><span class="lbl">Applicant</span><span class="val">${staffName}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${staffEmail}</span></div>
      <div class="row"><span class="lbl">Status</span><span class="badge bw">Pending</span></div>
    </div>
    <a href="http://localhost:5174/admin/staff-approval" class="btn">Review Application &#8594;</a>`);

  const jobs = [send(staffEmail, "Application Submitted | Suvidha1", staffHtml)];
  if (adminEmail) jobs.push(send(adminEmail, `New Staff Application: ${staffName} | Suvidha1`, adminHtml));
  await Promise.all(jobs);
};

// Staff approved
export const sendApprovalEmail = async ({ staffEmail, staffName }) => {
  const html = base(`
    <p>Hi <strong>${staffName}</strong>,</p>
    <p>&#127881; Congratulations! Your application has been <strong>approved</strong>.</p>
    <div class="box">
      <div class="row"><span class="lbl">Account Status</span><span class="badge bs">Approved &#10003;</span></div>
      <div class="row"><span class="lbl">Dashboard Access</span><span class="val">Active</span></div>
    </div>
    <p>Log in to manage bookings and start earning.</p>
    <a href="http://localhost:5173/login" class="btn">Access Dashboard &#8594;</a>`);
  await send(staffEmail, "Application Approved — Welcome to Suvidha1!", html);
};

// Staff rejected
export const sendRejectionEmail = async ({ staffEmail, staffName, reason }) => {
  const html = base(`
    <p>Hi <strong>${staffName}</strong>,</p>
    <p>We have reviewed your application and it has not been approved at this time.</p>
    <div class="box">
      <div class="row"><span class="lbl">Status</span><span class="badge bd">Rejected</span></div>
      <div class="row"><span class="lbl">Reason</span><span class="val">${reason}</span></div>
    </div>
    <p>You may re-apply after addressing the reason above.</p>
    <a href="mailto:support@suvidha1.app" class="btn">Contact Support</a>`);
  await send(staffEmail, "Application Status Update | Suvidha1", html);
};

// Booking created — consumer + staff
export const sendBookingEmail = async ({ consumerEmail, consumerName, staffEmail, staffName, booking }) => {
  const details = `
    <div class="box">
      <div class="row"><span class="lbl">Booking ID</span><span class="val">#${String(booking._id).slice(-8).toUpperCase()}</span></div>
      <div class="row"><span class="lbl">Service</span><span class="val">${booking.service}</span></div>
      <div class="row"><span class="lbl">Date</span><span class="val">${booking.date}</span></div>
      <div class="row"><span class="lbl">Time</span><span class="val">${booking.time}</span></div>
      <div class="row"><span class="lbl">Address</span><span class="val">${booking.address}</span></div>
      <div class="row"><span class="lbl">Amount</span><span class="val">${booking.price || "To be confirmed"}</span></div>
      <div class="row"><span class="lbl">Status</span><span class="badge bw">Scheduled</span></div>
    </div>`;

  const consumerHtml = base(`
    <p>Hi <strong>${consumerName}</strong>,</p>
    <p>Your booking is confirmed. Here are the details:</p>
    ${details}
    <p>Your professional <strong>${staffName || "will be assigned shortly"}</strong> will contact you before the appointment.</p>`);

  const staffHtml = base(`
    <p>Hi <strong>${staffName}</strong>,</p>
    <p>You have a new job booking. Please review and accept it from your dashboard.</p>
    ${details}
    <p><strong>Customer:</strong> ${consumerName}</p>
    <a href="http://localhost:5173/staff/bookings" class="btn">Manage Booking &#8594;</a>`);

  const jobs = [];
  if (consumerEmail) jobs.push(send(consumerEmail, `Booking Confirmed — ${booking.service} | Suvidha1`, consumerHtml));
  if (staffEmail)    jobs.push(send(staffEmail,    `New Job Booking — ${booking.service} | Suvidha1`,    staffHtml));
  await Promise.all(jobs);
};
