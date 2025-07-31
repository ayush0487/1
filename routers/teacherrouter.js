import express from 'express';
import { serveTeacherPage, getCurrentTeacher } from '../controller/teacherctrl.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const leaveRequestsPath = path.join(__dirname, '../model/leave_requests.json');

const router = express.Router();

// API: Get current teacher info and schedule
router.get('/me', getCurrentTeacher);

// Serve Teacher Page
router.get('/', serveTeacherPage);

// POST /teacher/request-leave
router.post('/request-leave', async (req, res) => {
  try {
    const { date, reason } = req.body;

    // Validate input
    if (!date || !reason.trim()) {
      return res.status(400).send('Date and reason are required.');
    }

    // Get teacher info from session
    const teacher = req.session.user;
    console.log('LEAVE REQUEST SESSION:', teacher);

    if (!teacher || teacher.role !== 'user') { // Changed from 'teacher' to 'user'
      return res.status(401).send('Unauthorized');
    }

    // Read existing leave requests
    let leaveRequests = [];
    try {
      const fileContent = fs.readFileSync(leaveRequestsPath, 'utf-8');
      leaveRequests = JSON.parse(fileContent);
    } catch (err) {
      // File doesn't exist, start with empty array
      leaveRequests = [];
    }

    // Create new leave request
    const leaveRequest = {
      id: Date.now(),
      teacherName: teacher.username,
      email: teacher.email,
      date: date,
      reason: reason,
      status: 'Pending',
      timestamp: new Date().toISOString()
    };

    leaveRequests.push(leaveRequest);

    // Save to file
    fs.writeFileSync(leaveRequestsPath, JSON.stringify(leaveRequests, null, 2));

    console.log('LEAVE REQUEST SAVED:', leaveRequest);

    res.status(200).send('Leave request submitted successfully.');
  } catch (err) {
    console.error('LEAVE REQUEST ERROR:', err);
    res.status(500).send('Failed to submit leave request.');
  }
});

export default router;