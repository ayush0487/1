import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataFilePath = path.join(__dirname, '../model/data.json');

// Fixed time slots for each lecture period
const lectureTimeSlots = {
  1: "9:00 AM – 9:50 AM",
  2: "9:50 AM – 10:40 AM", 
  3: "10:40 AM – 11:30 AM",
  4: "11:30 AM – 12:20 PM",
  5: "12:20 PM – 1:10 PM",
  6: "1:10 PM – 2:00 PM",
  7: "2:00 PM – 2:50 PM",
  8: "2:50 PM – 3:40 PM"
};

// Helper function to read data from JSON file
async function readDataFile() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (err) {
    console.error('Error reading data file:', err);
    return [];
  }
}

// Helper function to write data to JSON file
async function writeDataFile(data) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing data file:', err);
    throw err;
  }
}

export const getTeacherSchedule = async (req, res) => {
  const { email } = req.body;
  console.log('Fetching teacher schedule for email:', email);

  if (!email) return res.status(400).json({ message: 'Missing email' });

  try {
    const users = await readDataFile();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'user');

    if (!user) return res.status(404).json({ message: 'Teacher not found' });

    res.json({
      name: user.username,
      email: user.email,
      schedule: Array.isArray(user.schedule) ? user.schedule : []
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch teacher schedule' });
  }
};

export const getTeachersList = async (req, res) => {
  console.log('Fetching teachers list');

  try {
    const users = await readDataFile();
    const teachers = users.filter(u => u.role === 'user')
                         .map(t => ({ name: t.username, email: t.email }));

    res.json(teachers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch teacher list' });
  }
};

export const getTeacherData = async (req, res) => {
  try {
    const users = await readDataFile();
    const teachers = users.filter(u => u.role === 'user');
    res.json(teachers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch teacher data' });
  }
};

export const addScheduleItem = async (req, res) => {
  const { email, day, lectureNumber, subject, room, timeSlot } = req.body;
  console.log('Received data:', req.body);
  
  if (!email || !day || !lectureNumber || !subject) {
    return res.status(400).json({ message: 'Missing required fields (email, day, lectureNumber, subject)' });
  }

  try {
    const users = await readDataFile();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'user');

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Initialize schedule array if it doesn't exist
    if (!users[userIndex].schedule) {
      users[userIndex].schedule = [];
    }

    // Convert lectureNumber to number to ensure consistency
    const lectureNum = parseInt(lectureNumber);

    // Create lecture object
    const lectureObj = {
      day: day,
      lectureNumber: lectureNum,
      subject: subject,
      room: room || '',
      slot: timeSlot || '',
      timestamp: new Date().toISOString()
    };

    // Check if lecture already exists for this day and period
    const existingLectureIndex = users[userIndex].schedule.findIndex(
      item => item.day === day && parseInt(item.lectureNumber) === lectureNum
    );

    if (existingLectureIndex !== -1) {
      // Update existing lecture
      users[userIndex].schedule[existingLectureIndex] = lectureObj;
      console.log('Updated existing lecture');
    } else {
      // Add new lecture
      users[userIndex].schedule.push(lectureObj);
      console.log('Added new lecture');
    }

    await writeDataFile(users);
    res.json({ message: 'Lecture added/updated successfully', lecture: lectureObj });
  } catch (err) {
    console.error('Error in addScheduleItem:', err);
    return res.status(500).json({ message: 'Failed to add schedule item' });
  }
};



export const saveFullSchedule = async (req, res) => {
  const { email, schedule } = req.body;

  try {
    const users = await readDataFile();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'user');
    
    if (userIndex === -1) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Overwrite the schedule with the new schedule (no append, no duplicate)
    users[userIndex].schedule = schedule;
    await writeDataFile(users);
    return res.json({ message: "Schedule saved successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to save schedule" });
  }
};

export const getteacherdata = async (req, res) => {
  try {
    const users = await readDataFile();
    const teachers = users.filter(u => u.role === 'user')
                         .map(t => ({ 
                           name: t.username, 
                           email: t.email, 
                           schedule: t.schedule || [] 
                         }));
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve teachers' });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const leaveRequestsPath = path.join(__dirname, '../model/leave_requests.json');
    const fileContent = await fs.readFile(leaveRequestsPath, 'utf-8');
    const leaveRequests = JSON.parse(fileContent);
    res.json(leaveRequests);
  } catch (err) {
    console.error('Error reading leave requests:', err);
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
};

export const handleLeaveRequest = async (req, res) => {
  const { requestId, status } = req.body;
  
  try {
    const leaveRequestsPath = path.join(__dirname, '../model/leave_requests.json');
    const fileContent = await fs.readFile(leaveRequestsPath, 'utf-8');
    let leaveRequests = JSON.parse(fileContent);
    
    // Find the leave request
    const requestIndex = leaveRequests.findIndex(req => req.id == requestId);
    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    leaveRequests[requestIndex].status = status;
    
    // Only for direct rejection, not for approval through assignment
    if (status === 'Rejected') {
      await fs.writeFile(leaveRequestsPath, JSON.stringify(leaveRequests, null, 2));
    }
    
    res.json({ message: `Leave request ${status.toLowerCase()} successfully` });
  } catch (err) {
    console.error('Error handling leave request:', err);
    res.status(500).json({ message: 'Failed to handle leave request' });
  }
};

export const getLeaveRequestById = async (req, res) => {
  const { requestId } = req.params;
  
  try {
    const leaveRequestsPath = path.join(__dirname, '../model/leave_requests.json');
    const fileContent = await fs.readFile(leaveRequestsPath, 'utf-8');
    const leaveRequests = JSON.parse(fileContent);
    
    const leaveRequest = leaveRequests.find(req => req.id == requestId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    res.json(leaveRequest);
  } catch (err) {
    console.error('Error fetching leave request:', err);
    res.status(500).json({ message: 'Failed to fetch leave request' });
  }
};

export const getTeacherLecturesForDay = async (req, res) => {
  const { email, date } = req.body;
  
  try {
    const users = await readDataFile();
    const teacher = users.find(u => u.email === email && u.role === 'user');
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // Get day name from date
    const leaveDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[leaveDate.getDay()];
    
    // Filter lectures for that specific day and exclude existing leave entries
    const dayLectures = (teacher.schedule || []).filter(lecture => 
      lecture.day === dayOfWeek && !lecture.isLeave
    );
    
    res.json(dayLectures);
  } catch (err) {
    console.error('Error fetching teacher lectures:', err);
    res.status(500).json({ message: 'Failed to fetch teacher lectures' });
  }
};

// New function to get teacher availability and workload for a specific day
export const getTeacherAvailabilityForDay = async (req, res) => {
  const { date } = req.query;
  
  try {
    const users = await readDataFile();
    const teachers = users.filter(u => u.role === 'user');
    
    // Get day name from date
    const targetDate = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[targetDate.getDay()];
    
    const teacherAvailability = teachers.map(teacher => {
      const daySchedule = (teacher.schedule || []).filter(lecture => 
        lecture.day === dayOfWeek && !lecture.isLeave
      );
      
      // Create availability array for all 8 periods
      const availability = {};
      const workload = daySchedule.length;
      
      // Mark occupied periods
      daySchedule.forEach(lecture => {
        availability[lecture.lectureNumber] = {
          occupied: true,
          subject: lecture.subject,
          room: lecture.room
        };
      });
      
      // Mark free periods
      for (let period = 1; period <= 8; period++) {
        if (!availability[period]) {
          availability[period] = { occupied: false };
        }
      }
      
      return {
        email: teacher.email,
        username: teacher.username,
        workload: workload,
        maxWorkload: 8,
        availability: availability,
        daySchedule: daySchedule
      };
    });
    
    res.json(teacherAvailability);
  } catch (err) {
    console.error('Error fetching teacher availability:', err);
    res.status(500).json({ message: 'Failed to fetch teacher availability' });
  }
};

export const completeLeaveAssignment = async (req, res) => {
  const { requestId, assignments, leaveRequest } = req.body;
  
  try {
    const users = await readDataFile();
    
    // 1. Update leave request status
    const leaveRequestsPath = path.join(__dirname, '../model/leave_requests.json');
    const leaveFileContent = await fs.readFile(leaveRequestsPath, 'utf-8');
    let leaveRequests = JSON.parse(leaveFileContent);
    
    const requestIndex = leaveRequests.findIndex(req => req.id == requestId);
    if (requestIndex !== -1) {
      leaveRequests[requestIndex].status = 'Approved';
    }
    
    // 2. Find the teacher who requested leave
    const teacherIndex = users.findIndex(u => u.email === leaveRequest.email && u.role === 'user');
    if (teacherIndex === -1) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    // 3. Get the day of the week for the leave date
    const leaveDate = new Date(leaveRequest.date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[leaveDate.getDay()];
    
    // 4. Process assignments
    for (const [lectureIndex, assignment] of Object.entries(assignments)) {
      const { lecture, assignedTo } = assignment;
      
      // Find the teacher to assign the lecture to
      const assignedTeacherIndex = users.findIndex(u => u.email === assignedTo && u.role === 'user');
      if (assignedTeacherIndex !== -1) {
        // Initialize schedule if doesn't exist
        if (!users[assignedTeacherIndex].schedule) {
          users[assignedTeacherIndex].schedule = [];
        }
        
        // Add the lecture to assigned teacher's schedule
        users[assignedTeacherIndex].schedule.push({
          ...lecture,
          timestamp: new Date().toISOString(),
          isAssigned: true,
          originalTeacher: leaveRequest.email,
          leaveDate: leaveRequest.date
        });
      }
    }
    
    // 5. Replace original teacher's lectures with "Leave" for the entire day
    if (!users[teacherIndex].schedule) {
      users[teacherIndex].schedule = [];
    }
    
    // Remove existing lectures for that day
    users[teacherIndex].schedule = users[teacherIndex].schedule.filter(
      item => !(item.day === dayOfWeek && !item.isLeave)
    );
    
    // Add leave entries for all 8 periods
    for (let period = 1; period <= 8; period++) {
      users[teacherIndex].schedule.push({
        day: dayOfWeek,
        lectureNumber: period,
        subject: 'Leave',
        room: '',
        slot: lectureTimeSlots[period] || '',
        timestamp: new Date().toISOString(),
        isLeave: true,
        leaveDate: leaveRequest.date
      });
    }
    
    // 6. Save all changes
    await writeDataFile(users);
    await fs.writeFile(leaveRequestsPath, JSON.stringify(leaveRequests, null, 2));
    
    res.json({ message: 'Leave assignment completed successfully' });
  } catch (err) {
    console.error('Error completing leave assignment:', err);
    res.status(500).json({ message: 'Failed to complete leave assignment' });
  }
};