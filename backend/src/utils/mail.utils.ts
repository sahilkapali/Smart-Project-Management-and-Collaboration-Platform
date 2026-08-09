import transporter from "../config/mail";

export const sendPasswordResetOTP = async (
  email: string,
  otp: string
) => {
  await transporter.sendMail({
    from: `"Smart Project Management" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset</h2>

        <p>
          You requested to reset your password.
        </p>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing: 5px;">
          ${otp}
        </h1>

        <p>
          This OTP will expire in 10 minutes.
        </p>

        <p>
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  });
};