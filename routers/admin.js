import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  getTeacherSchedule,
  getTeachersList,
  getTeacherData,
  addScheduleItem,
  saveFullSchedule,
  getLeaveRequests,
  handleLeaveRequest
} from '../controller/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// ✅ POST: Get schedule of specific teacher by email
router.post('/teacher-schedule', getTeacherSchedule);

// ✅ GET: List of all teachers for dropdown
router.get('/teachers', getTeachersList);

// ✅ GET: Get all teacher data
router.get('/dash', getTeacherData);

// ✅ POST: Add a single schedule item
router.post('/form', addScheduleItem);

// ✅ POST: Save full schedule
router.post('/save-schedule', saveFullSchedule);

// ✅ GET: Get leave requests
router.get('/leave-requests', getLeaveRequests);

// ✅ POST: Handle leave request (approve/reject)
router.post('/handle-leave-request', handleLeaveRequest);

// ✅ Admin Home Page
router.get('/', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, '../public/form.html'));
});

router.get('/form', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login.html');
  }
  res.sendFile(path.join(__dirname, '../public/addLecture.html'));
});

export default router;