import {Router} from "express";
import {SendReminder } from "../Controller/workflow.controller.js";
const WorkflowRouter = Router();

WorkflowRouter.post('/subscription/reminder', SendReminder);
export default WorkflowRouter;