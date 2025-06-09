import { Router } from "express";
import { SendReminder } from "../Controller/workflow.controller.js";
import { verifyQStashSignature } from "../middlewares/verfication.js";

const WorkflowRouter = Router();

WorkflowRouter.post('/subscription/reminder', verifyQStashSignature, SendReminder);

export default WorkflowRouter;