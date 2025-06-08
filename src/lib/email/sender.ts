// Simple implementation - you can enhance later
export class EmailService {
  static async sendEmail({
    to,
    subject,
    text,
    html,
  }: {
    to: string
    subject: string
    text: string
    html?: string
  }) {
    // Use your preferred email service (Resend, SendGrid, etc.)
    console.log('Email would be sent:', { to, subject, text })
  }
}