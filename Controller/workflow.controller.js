import dayjs from 'dayjs';
import Subscription from '../models/subscription.model.js';
import {createRequire} from 'module';
import { sendReminderEmail } from '../utils/email.js';  // Note: function name is sendReminderEmail, not SendReminderEmail
//import subscription from "../models/subscription.model.js";
const require = createRequire(import.meta.url);
const {serve} = require('@upstash/workflow/express');

const REMINDERS = [7,5,2,1];

export const SendReminder = async (req, res) => {
    try {
        console.log('Received reminder request:', {
            body: req.body,
            headers: req.headers
        });

        const { subscriptionId } = req.body;
        if (!subscriptionId) {
            return res.status(400).json({
                success: false,
                error: 'No subscriptionId provided'
            });
        }

        // Fetch subscription with user details
        const subscription = await Subscription.findById(subscriptionId)
            .populate('user', 'name email');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                error: `Subscription not found: ${subscriptionId}`
            });
        }

        console.log('Processing subscription:', {
            id: subscription._id,
            status: subscription.status,
            renewalDate: subscription.renewalDate
        });

        const renewalDate = dayjs(subscription.renewalDate).startOf('day');
        const today = dayjs().startOf('day');
        const daysUntilRenewal = renewalDate.diff(today, 'day');

        // Only send reminder if it matches our reminder days
        if (REMINDERS.includes(daysUntilRenewal)) {
            await sendReminderEmail({
                to: subscription.user.email,
                type: `${daysUntilRenewal}_days_reminder`, // e.g., "3_days_reminder"
                subscription: {
                    name: subscription.name,
                    renewalDate: subscription.renewalDate,
                    price: subscription.price,
                    daysUntilRenewal,
                    user: { name: subscription.user.name }
                }
            });

            console.log(`Sent reminder email for subscription ${subscriptionId} - ${daysUntilRenewal} days until renewal`);
        }

        return res.json({
            success: true,
            data: {
                subscription: subscription._id,
                daysUntilRenewal,
                emailSent: REMINDERS.includes(daysUntilRenewal)
            }
        });

    } catch (error) {
        console.error('Reminder processing failed:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
/*
export const SendReminder = serve(async (context) => {
    try {
        console.log('Workflow started with context:', {
            id: context.id,
            startedAt: context.startedAt,
            payload: context.requestPayload
        });

        const {subscriptionId} = context.requestPayload;
        if (!subscriptionId) {
            throw new Error('No subscriptionId provided');
        }

        const subscription = await fetchSub(context, subscriptionId);
        console.log('Fetched subscription details:', {
            id: subscription?._id,
            status: subscription?.status,
            renewalDate: subscription?.renewalDate,
            userEmail: subscription?.user?.email
        });

        if (!subscription) {
            throw new Error(`Subscription not found: ${subscriptionId}`);
        }

        if (subscription.status !== 'active') {
            throw new Error(`Subscription is not active: ${subscriptionId}`);
        }

        const renewalDate = dayjs(subscription.renewalDate);

        if (renewalDate.isBefore(dayjs())) {
            console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
            return;
        }
        for(const daysBefore of REMINDERS){
            const reminderDate = renewalDate.subtract(daysBefore, 'day');
            if(reminderDate.isAfter(dayjs())){
                await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
            }
            if (dayjs().isSame(reminderDate, 'day')) {
                await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
            }
        }
    } catch (error) {
        console.error('Workflow execution failed:', {
            error: error.message,
            stack: error.stack,
            subscriptionId: context.requestPayload?.subscriptionId
        });
        throw error; // Re-throw to ensure Upstash knows the workflow failed
    }
});
    const fetchSub = async (context, subscriptionId) => {
        return await context.run('get subscription', async () => {
            return Subscription.findById(subscriptionId).populate('user', 'name email');
        })
    }

    const sleepUntilReminder = async (context, label, date) => {
        console.log(`Sleeping until ${label} reminder at ${date}`);
        await context.sleepUntil(date.toDate());
    }
const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);

        await sendReminderEmail({  // Changed to match the exported function name
            to: subscription.user.email,
            type: label,
            subscription,
        });
    });
}

*/