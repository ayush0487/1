import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = path.join(__dirname, '../model/data.json');

// Returns the logged-in teacher's info and schedule
export const getCurrentTeacher = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') { // Changed from 'teacher' to 'user'
    return res.status(401).send('Unauthorized');
  }
  
  try {
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const userData = JSON.parse(fileContent);
    
    const teacher = userData.find(user => 
      user.email === req.session.user.email && user.role === 'user'
    );
    
    if (!teacher) {
      return res.status(404).send('Teacher not found');
    }
    
    // Return teacher data with name, role, and schedule
    const teacherInfo = {
      name: teacher.username,
      email: teacher.email,
      role: 'teacher',
      schedule: teacher.schedule || []
    };
    
    res.json(teacherInfo);
  } catch (err) {
    console.error('Error fetching teacher data:', err);
    res.status(500).send('Failed to fetch teacher data');
  }
};

export const serveTeacherPage = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'user') { // Changed from 'teacher' to 'user'
    return res.redirect('/');
  }
  // Serve the teacher.html file
  res.sendFile(path.resolve(__dirname, '../public/teacher.html'));
};



