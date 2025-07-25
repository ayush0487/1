import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataFilePath = path.join(__dirname, '../model/data.json');

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
    console.log(req.body)
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

    // Create lecture object
    const lectureObj = {
      day: day,
      lectureNumber: lectureNumber,
      subject: subject,
      room: room || '',
      slot: timeSlot || '',
      timestamp: new Date().toISOString()
    };

    // Check if lecture already exists for this day and period
    const existingLectureIndex = users[userIndex].schedule.findIndex(
      item => item.day === day && item.lectureNumber === (period + 1)
    );

    if (existingLectureIndex !== -1) {
      // Update existing lecture
      users[userIndex].schedule[existingLectureIndex] = lectureObj;
    } else {
      // Add new lecture
      users[userIndex].schedule.push(lectureObj);
    }

    await writeDataFile(users);
    res.json({ message: 'Lecture added/updated successfully', lecture: lectureObj });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to add schedule item' });
  }
};



export const saveFullSchedule = async (req, res) => {
  const { email, schedule } = req.body;

  try {
    const users = await readDataFile();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'teacher');
    
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