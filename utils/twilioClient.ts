// utils/twilioClient.ts
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

export const twilioClient = twilio(accountSid, authToken);
export const TWILIO_MESSAGING_SERVICE_SID = messagingServiceSid;
