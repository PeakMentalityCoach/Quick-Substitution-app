import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMagicLink = async (email: string, token: string): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const magicLink = `${frontendUrl}/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@substitution-optimizer.com',
    to: email,
    subject: 'Login to Substitution Optimizer',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Login to Substitution Optimizer</h2>
        <p>Click the link below to login to your account. This link will expire in 15 minutes.</p>
        <a href="${magicLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Login Now
        </a>
        <p style="color: #666; font-size: 14px;">If you didn't request this login link, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 12px;">Or copy and paste this link: ${magicLink}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Magic link sent to ${email}`);
  } catch (error) {
    console.error('Error sending magic link:', error);
    throw new Error('Failed to send magic link email');
  }
};
