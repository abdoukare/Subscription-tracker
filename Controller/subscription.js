//import subscription from '../models/subscription.model.js';
/*
import {workflowClient} from "../Config/upstash.js";
import {SERVER_URL} from '../Config/env.js';
// Import Subscription model (ensure you have it defined in your project)
import Subscription from '../models/subscription.model.js'; // Adjust path as per your project structure

const CONTENT_TYPE_HEADER = {'content-type': 'application/json'};

async function triggerSubscriptionReminder(subscriptionId) {
    console.log('Attempting to trigger workflow for:', subscriptionId);
    try {
        const workflowUrl = `${SERVER_URL}/api/v1/workflows/subscription/reminder`;
        console.log('Workflow URL:', workflowUrl);

        const response = await workflowClient.trigger({
            url: workflowUrl,
            body: {
                subscriptionId: subscriptionId,
            },
            headers: CONTENT_TYPE_HEADER,
            retries: 3
        });

        console.log('Workflow trigger response:', response);
        return response;
    } catch (error) {
        console.error('Workflow trigger failed:', {
            error: error.message,
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            subscriptionId
        });
        throw error;
    }
}

export const createSubscription = async (req, res, next) => {
    try {
        const subscriptionPayload = {...req.body, user: req.user._id};

        // Create subscription in database
        const subscription = await Subscription.create(subscriptionPayload);

        try {
            // Trigger subscription reminder workflow
            const {workflowRunId} = await triggerSubscriptionReminder(subscription._id); // Fix: use _id instead of id
            console.log(`Workflow triggered successfully: ${workflowRunId}`);
            
            // Respond with created data
            res.status(201).json({
                success: true, 
                data: {subscription, workflowRunId}
            });
        } catch (workflowError) {
            console.error('Workflow trigger failed:', workflowError);
            // Still return success since subscription was created
            res.status(201).json({
                success: true,
                data: {subscription},
                warning: 'Subscription created but reminder workflow failed'
            });
        }
    } catch (error) {
        console.error('Subscription creation failed:', error);
        next(error);
    }
};



export const GetUserSub = async (req, res, next) => {
	try {
		// chek if the user is the same as the one in the token
		if(req.user.id !== req.params.id){
			const error= new Error('You are not authorized to perform this action');
			error.statusCode = 401;
			throw error;
		}
		const Usersubscription = await Subscription.find({user: req.params.id});
		res.status(200).json({success: true, data: Usersubscription});
	}catch(error){
		next(error);
	}
}
	*/

import { workflowClient } from "../Config/upstash.js";
import { SERVER_URL } from '../Config/env.js';
import Subscription from '../models/subscription.model.js';

const CONTENT_TYPE_HEADER = { 'content-type': 'application/json' };

async function triggerSubscriptionReminder(subscriptionId) {
    console.log('Attempting to trigger workflow for:', subscriptionId);
    try {
        const workflowUrl = `${SERVER_URL}/api/v1/workflows/subscription/reminder`;
        console.log('Workflow URL:', workflowUrl);

        const response = await workflowClient.trigger({
            url: workflowUrl,
            body: {
                subscriptionId: subscriptionId,
            },
            headers: CONTENT_TYPE_HEADER,
            retries: 3
        });

        console.log('Workflow trigger response:', response);
        return response;
    } catch (error) {
        console.error('Workflow trigger failed:', {
            error: error.message,
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            subscriptionId
        });
        throw error;
    }
}

export const createSubscription = async (req, res, next) => {
    try {
        const subscriptionPayload = { ...req.body, user: req.user.id }; // Changed from _id to id

        // Create subscription in database
        const subscription = await Subscription.create(subscriptionPayload);

        try {
            // Trigger subscription reminder workflow
            const { workflowRunId } = await triggerSubscriptionReminder(subscription.id); // Changed from _id to id
            console.log(`Workflow triggered successfully: ${workflowRunId}`);
            
            // Respond with created data
            res.status(201).json({
                success: true, 
                data: { subscription, workflowRunId }
            });
        } catch (workflowError) {
            console.error('Workflow trigger failed:', workflowError);
            // Still return success since subscription was created
            res.status(201).json({
                success: true,
                data: { subscription },
                warning: 'Subscription created but reminder workflow failed'
            });
        }
    } catch (error) {
        console.error('Subscription creation failed:', error);
        next(error);
    }
};

export const GetUserSub = async (req, res, next) => {
    try {
        // Check if the user is the same as the one in the token
        // Note: PostgreSQL returns numeric id, ensure comparison works
        if (req.user.id !== parseInt(req.params.id)) {
            const error = new Error('You are not authorized to perform this action');
            error.statusCode = 401;
            throw error;
        }
        
        const userSubscriptions = await Subscription.find({ user: req.params.id });
        res.status(200).json({ success: true, data: userSubscriptions });
    } catch (error) {
        next(error);
    }
};

export const getSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user owns this subscription
        if (subscription.user_id !== req.user.id) {
            const error = new Error('You are not authorized to view this subscription');
            error.statusCode = 403;
            throw error;
        }
        
        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

export const updateSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user owns this subscription
        if (subscription.user_id !== req.user.id) {
            const error = new Error('You are not authorized to update this subscription');
            error.statusCode = 403;
            throw error;
        }
        
        const updatedSubscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            req.body
        );
        
        res.status(200).json({ success: true, data: updatedSubscription });
    } catch (error) {
        next(error);
    }
};

export const deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user owns this subscription
        if (subscription.user_id !== req.user.id) {
            const error = new Error('You are not authorized to delete this subscription');
            error.statusCode = 403;
            throw error;
        }
        
        await Subscription.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ 
            success: true, 
            message: 'Subscription deleted successfully' 
        });
    } catch (error) {
        next(error);
    }
};

export const getExpiringSoon = async (req, res, next) => {
    try {
        const daysAhead = parseInt(req.query.days) || 7;
        const subscriptions = await Subscription.findExpiringSoon(req.user.id, daysAhead);
        
        res.status(200).json({ 
            success: true, 
            data: subscriptions,
            count: subscriptions.length
        });
    } catch (error) {
        next(error);
    }
};