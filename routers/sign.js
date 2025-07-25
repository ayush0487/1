import express from 'express';
import { index } from '../controller/auth.js';


const router = express.Router();
router.post('/',index)


export default router; 
