import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  template: 'payment-success' | 'new-purchase';
  data: Record<string, any>;
}

export async function sendEmail({ to, subject, template, data }: EmailOptions) {
  try {
    const html = await renderEmailTemplate(template, data);
    
    await resend.emails.send({
      from: 'Veridie <no-reply@veridie.com>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

async function renderEmailTemplate(template: string, data: Record<string, any>) {
  switch (template) {
    case 'payment-success':
      return `
        <h1>Thank you for your purchase!</h1>
        <p>Dear ${data.customerName},</p>
        <p>Your payment of $${data.amount} for ${data.packageTitle} has been processed successfully.</p>
        <p>Next Steps:</p>
        <ol>
          <li>Schedule your session using <a href="${data.calendlyLink}">this link</a></li>
          <li>Prepare any necessary materials for your consultation</li>
          <li>Check your calendar for the scheduled time</li>
        </ol>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      `;

    case 'new-purchase':
      return `
        <h1>New Purchase Alert!</h1>
        <p>You have a new purchase for ${data.packageTitle}.</p>
        <p>Customer Details:</p>
        <ul>
          <li>Name: ${data.customerName}</li>
          <li>Email: ${data.customerEmail}</li>
        </ul>
        <p>Amount: $${data.amount}</p>
        <p>The customer will schedule their session through Calendly. You'll receive a notification when they do.</p>
      `;

    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}
