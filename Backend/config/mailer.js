import nodemailer from "nodemailer";

export const getTransporter = () => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    return transporter;
};

export const sendOtpEmail = async (email, otp, subject, heading) => {
    const transporter = getTransporter();

    console.log(`\n📧 Sending OTP to: ${email}`);
    console.log(`🔐 OTP: ${otp}\n`);

    await transporter.sendMail({
        from: `"Suvidha1" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: `
        <div style="font-family:sans-serif; max-width:400px; margin:auto; padding:20px; border:1px solid #eee; border-radius:10px;">
          <h2 style="color:#6d28d9;">${heading}</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:8px; color:#ec4899;">${otp}</h1>
          <p style="color:#888;">This OTP expires in <b>5 minutes</b>.</p>
        </div>`,
    });

    console.log(`✅ OTP email sent successfully to ${email}`);
};
