import twilio from 'twilio';

interface SMSParams {
    to: string;
    body: string;
}

export const sendSMS = async ({ to, body }: SMSParams): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        console.log(`📱 Simulation: Sending SMS to ${to}`);
        console.log(`Body: ${body}`);
        console.log('----------------------------------------------------');
        return { success: true, messageId: 'simulated-sms-id' };
    }

    try {
        const client = twilio(accountSid, authToken);
        const response = await client.messages.create({
            body,
            from: fromNumber,
            to,
        });

        console.log(`✅ SMS successfully sent to ${to}. SID: ${response.sid}`);
        return { success: true, messageId: response.sid };
    } catch (error: any) {
        console.error(`❌ Failed to send SMS to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};
