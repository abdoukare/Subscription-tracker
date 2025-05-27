import {Router} from "express";
import authorize from "../middlewares/auth.middleware.js";
import {createSubscription, GetUserSub} from "../Controller/subscription.js";

const router = Router();

router.get('/', (req,res)=> res.send({title: 'get all subscriptions'}));
router.get('/:id', (req,res)=> res.send({title: 'get subscription by id'}));
router.post('/', authorize, createSubscription);
router.put('/:id', (req,res)=> res.send({title: 'update subscription'}));
router.delete('/:id', (req,res)=> res.send({title: 'delete subscription'}));
router.get('/user/:id', authorize, GetUserSub); // Correct path
router.put('/:id/cancel', (req,res)=> res.send({title: 'cancel subscription'}));
router.get('upcoming-renewals', (req,res)=> res.send({title: 'get upcoming renewals'}));
export default router;
