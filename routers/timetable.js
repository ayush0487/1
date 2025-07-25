import express from 'express';
import { index } from '../controller/auth.js';
import { formateData } from '../controller/timetable.js';
import path from 'path';


const router = express.Router();
router.post('/add', async (req, res) => {
    try {
        const newData = req.body;
        const result = await formateData(newData,path.join("./",'model', 'form.json'));
        if (result) {
            res.status(201).json({ message: "Data added successfully" });
        }
        else {
            res.status(400).json({ message: "Failed to add data" });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ message: "Internal server error" });
    }

})

router.get('/get', async (req, res) => {
    const { teacher } = req.query;
    
    if (!teacher) {
        return res.status(400).json({ message: 'Teacher email is required' });
    }

    try {
        const fs = await import('fs/promises');
        const dataPath = path.join('./', 'model', 'data.json');
        const fileContent = await fs.readFile(dataPath, 'utf-8');
        const users = JSON.parse(fileContent);
        
        const user = users.find(u => u.email === teacher);
        
        if (!user) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Return empty schedule structure if no schedule exists
        const emptySchedule = {
            Monday: new Array(8).fill(''),
            Tuesday: new Array(8).fill(''),
            Wednesday: new Array(8).fill(''),
            Thursday: new Array(8).fill(''),
            Friday: new Array(8).fill(''),
            Saturday: new Array(8).fill('')
        };

        res.json(user.schedule || emptySchedule);
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router; 
