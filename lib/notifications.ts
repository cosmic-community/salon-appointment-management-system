import { Resend } from 'resend'
import { Client } from '@/types'

// Initialize Twilio client
let twilioClient: any = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const twilio = require('twilio');
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Initialize Resend client
let resendClient: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

// SMS notification via Twilio
export async function sendSMSReminder(client: Client, message: string): Promise<boolean> {
  if (!twilioClient) {
    console.warn('Twilio not configured - SMS not sent');
    return false;
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: client.mobile
    });

    console.log('SMS sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

// WhatsApp notification via Twilio
export async function sendWhatsAppReminder(client: Client, message: string): Promise<boolean> {
  if (!twilioClient) {
    console.warn('Twilio not configured - WhatsApp not sent');
    return false;
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${client.mobile}`
    });

    console.log('WhatsApp sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return false;
  }
}

// Email notification via Resend
export async function sendEmailReminder(
  client: Client, 
  subject: string, 
  message: string
): Promise<boolean> {
  if (!resendClient) {
    console.warn('Resend not configured - Email not sent');
    return false;
  }

  try {
    const result = await resendClient.emails.send({
      from: 'Salon Appointment <appointments@yoursalon.com>',
      to: [client.email],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ec4899;">Salon Appointment Reminder</h2>
          <p>Dear ${client.name},</p>
          <div style="background-color: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${message}
          </div>
          <p>Thank you for choosing our salon!</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    });

    console.log('Email sent successfully:', result.data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Generate reminder messages
export function generateReminderMessage(client: Client, daysUntil: number): string {
  const isOverdue = daysUntil < 0;
  const absoluteDays = Math.abs(daysUntil);

  if (isOverdue) {
    return `Hi ${client.name}! Your salon appointment was due ${absoluteDays} day${absoluteDays !== 1 ? 's' : ''} ago. Please call us to schedule your next visit. We miss you! 💇‍♀️✨`;
  } else if (daysUntil === 0) {
    return `Hi ${client.name}! Your salon appointment is due today! Time to pamper yourself. Book your appointment now! 💅✨`;
  } else {
    return `Hi ${client.name}! Your salon appointment is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}. Book your appointment to keep looking fabulous! 💇‍♀️✨`;
  }
}

// Send reminder based on client preferences
export async function sendClientReminder(
  client: Client,
  methods: ('sms' | 'whatsapp' | 'email')[] = ['sms']
): Promise<{ success: boolean; results: Record<string, boolean> }> {
  const daysUntil = Math.ceil((client.nextDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const message = generateReminderMessage(client, daysUntil);
  
  const results: Record<string, boolean> = {};
  let overallSuccess = false;

  for (const method of methods) {
    try {
      let sent = false;
      
      switch (method) {
        case 'sms':
          sent = await sendSMSReminder(client, message);
          break;
        case 'whatsapp':
          sent = await sendWhatsAppReminder(client, message);
          break;
        case 'email':
          const subject = daysUntil < 0 
            ? 'Overdue Salon Appointment Reminder' 
            : 'Upcoming Salon Appointment Reminder';
          sent = await sendEmailReminder(client, subject, message);
          break;
      }
      
      results[method] = sent;
      if (sent) overallSuccess = true;
    } catch (error) {
      console.error(`Error sending ${method} reminder:`, error);
      results[method] = false;
    }
  }

  return { success: overallSuccess, results };
}

// Bulk reminder function for dashboard automation
export async function sendBulkReminders(
  clients: Client[],
  methods: ('sms' | 'whatsapp' | 'email')[] = ['sms']
): Promise<{ sent: number; failed: number; details: Array<{ clientId: string; success: boolean; methods: Record<string, boolean> }> }> {
  let sent = 0;
  let failed = 0;
  const details: Array<{ clientId: string; success: boolean; methods: Record<string, boolean> }> = [];

  for (const client of clients) {
    try {
      const result = await sendClientReminder(client, methods);
      
      details.push({
        clientId: client._id,
        success: result.success,
        methods: result.results
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Add small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error sending reminder to client:', client._id, error);
      failed++;
      details.push({
        clientId: client._id,
        success: false,
        methods: {}
      });
    }
  }

  return { sent, failed, details };
}