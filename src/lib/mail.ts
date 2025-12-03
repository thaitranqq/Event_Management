import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const sendOTP = async (email: string, otp: string) => {
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || ''
  const logoUrl = base ? `${base.replace(/\/$/, '')}/images/logo.png` : '/images/logo.png'

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"FPT Event Management" <noreply@fpt.edu.vn>',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <div style="margin-bottom:12px;">
          <img src="${logoUrl}" alt="FPT University" style="height:40px;" />
        </div>
        <p>Your OTP code is: <b style="font-size:18px">${otp}</b></p>
        <p>It will expire in 10 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};
