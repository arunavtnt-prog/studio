import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendApplicationConfirmation(
  email: string,
  creatorName: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Application Received - 8origin Studios",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>8origin Studios</h1>
                <p>Empowering New-Gen Creator Brands</p>
              </div>
              <div class="content">
                <h2>Thank You for Your Application!</h2>
                <p>Hi ${creatorName},</p>
                <p>We've received your application to join the 8origin Studios accelerator program. Our team is excited to review your submission!</p>

                <h3>What's Next?</h3>
                <ul>
                  <li>Our team will review your application within 5-7 business days</li>
                  <li>You'll receive an email update when there's a status change</li>
                  <li>You can track your application status in your dashboard</li>
                </ul>

                <p style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
                </p>

                <p>If you have any questions, feel free to reach out to our team.</p>

                <p>Best regards,<br>The 8origin Studios Team</p>
              </div>
              <div class="footer">
                <p>© 2025 8origin Studios. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendAdminNotification(
  applicationId: string,
  creatorName: string
): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

  if (adminEmails.length === 0) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmails.join(","),
      subject: `New Application: ${creatorName} - 8origin Studios`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1a1a1a; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>New Application Submitted</h2>
              </div>
              <div class="content">
                <p><strong>Creator:</strong> ${creatorName}</p>
                <p><strong>Application ID:</strong> ${applicationId}</p>
                <p style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" class="button">Review in Admin Panel</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return false;
  }
}
