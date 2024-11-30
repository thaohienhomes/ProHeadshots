'use server'

import sgMail from '@sendgrid/mail';
import { MailDataRequired } from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface EmailData {
  to: string;
  from: string;
  templateId: string;
  sendAt?: number;
}

//Template ID
export async function sendEmail({ to, from, templateId, sendAt }: EmailData) {
  try {
    const msg: MailDataRequired = {
      to,
      from,
      templateId,
      ...(sendAt && { sendAt }),
    };

    await sgMail.send(msg);
    return { success: true, message: 'Email sent successfully' };
  } catch (error: any) {
    console.error('Error sending email:', error);
    if (error.response && error.response.body && error.response.body.errors) {
      console.error('SendGrid errors:', error.response.body.errors);
    }
    return { 
      success: false, 
      error: error.message, 
      details: error.response?.body?.errors 
    };
  }
}