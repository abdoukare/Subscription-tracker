import { Router } from "express";
import { getUser, getUsers } from "../Controller/user.js";
import authorize from "../middlewares/auth.middleware.js";
const router = Router();

router.get('/', getUsers); // not working 
router.get('/:id', authorize, getUser);
router.post('/', (req, res) => res.send({title: 'create a new user'}));
router.put('/:id', (req, res) => res.send({title: 'update user'}));
router.delete('/:id', (req, res) => res.send({title: 'delete user'}));

export default router;
