import Subscription from '../models/subscription.model.js';
import { workflowClient } from '../Config/upstash.js';
import dayjs from 'dayjs';
import { sendReminderEmail } from '../utils/email.js';

const REMINDER_DAYS = [1, 3, 5, 7];

export const createSubscription = async (req, res, next) => {
    try {
        // Calculate status based on renewal date
        const renewalDate = dayjs(req.body.renewalDate).startOf('day');
        const today = dayjs();
        // Use floating point diff and round up to include partial days
        const daysUntilRenewal = renewalDate.diff(today, 'day');
        const status = daysUntilRenewal < 0 ? 'expired' : 'active';

        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
            status
        });

        console.log('Created subscription:', {
            id: subscription._id,
            name: subscription.name,
            renewalDate: subscription.renewalDate,
            status: subscription.status,
            user: subscription.user,
            daysUntilRenewal
        });
		await sendReminderEmail({
			to:req.user.email,
			type: 'New subscription',
			subscription:{
				...subscription.toObject(),
				user: {name: req.user.name}
			}
		});
        // Schedule immediate check and daily checks with QStash
        const response = await workflowClient.publishJSON({
            url: `${process.env.QSTASH_DESTINATION_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription._id,
                name: subscription.name,
                renewalDate: subscription.renewalDate,
                status: subscription.status,
                reminderDays: REMINDER_DAYS
            },
            options: {
                retries: 3,
                delay: '0s', // Immediate first check
                cron: '0 0 * * *', // Then daily at midnight
                headers: {
                    'Content-Type': 'application/json',
                    'X-Subscription-Name': subscription.name,
                    'X-Subscription-Status': subscription.status
                }
            }
        });

        console.log('QStash workflow scheduled:', {
            subscriptionId: subscription._id,
            messageId: response.messageId,
            status: subscription.status,
            schedule: '0 0 * * *',
            destination: process.env.QSTASH_DESTINATION_URL,
            daysUntilRenewal
        });

        // 3. Respond to frontend (success)
        res.status(201).json({ success: true, message: "Subscription created", data: subscription });

        // 4. Call Qstash (do not await, or catch errors separately)
        workflowClient.publishJSON({ 
            url: `${process.env.QSTASH_DESTINATION_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription._id,
                name: subscription.name,
                renewalDate: subscription.renewalDate,
                status: subscription.status,
                reminderDays: REMINDER_DAYS
            },
            options: {
                retries: 3,
                delay: '0s', // Immediate first check
                cron: '0 0 * * *', // Then daily at midnight
                headers: {
                    'Content-Type': 'application/json',
                    'X-Subscription-Name': subscription.name,
                    'X-Subscription-Status': subscription.status
                }
            }
        }).catch(err => {
            console.error("Qstash error:", err);
        });

    } catch (err) {
        // Only catch errors from subscription creation/email sending
        res.status(500).json({ success: false, message: "Failed to create subscription" });
    }
};

export const GetUserSub = async (req, res, next) => {
    try {
        // Check if the user is the same as the one in the token
        if(req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id });

        res.status(200).json({ success: true, data: subscriptions });
    } catch (e) {
        next(e);
    }
};