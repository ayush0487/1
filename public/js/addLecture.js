// Global variables
let teachers = [];

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

// Page load hone par teachers fetch karna
async function fetchTeachers() {
  try {
    const response = await fetch('/data');
    teachers = await response.json();
    populateTeacherDropdown();
  } catch (error) {
    console.error('Error fetching teachers:', error);
  }
}

// Teacher dropdown populate karna
function populateTeacherDropdown() {
  const teacherSelect = document.getElementById('teacher-select');
  
  // Clear existing options
  teacherSelect.innerHTML = '<option value="">Choose Teacher</option>';
  
  // Add teachers to dropdown
  teachers.forEach(teacher => {
    if (teacher.role === 'user') { // role = user means teacher
      const option = document.createElement('option');
      option.value = teacher.email;
      option.textContent = `${teacher.username} - ${teacher.email}`;
      teacherSelect.appendChild(option);
    }
  });
}

// Form submit handler
document.getElementById('lecture-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const teacherEmail = document.getElementById('teacher-select').value;
  const day = document.getElementById('day-select').value;
  const period = parseInt(document.getElementById('period-select').value);
  const subject = document.getElementById('subject-input').value.trim();
  const room = document.getElementById('room-input').value.trim();
  
  // Validation
  if (!teacherEmail || !day || isNaN(period) || !subject) {
    alert('Please fill all required fields!');
    return;
  }
  
  // Get fixed time slot for the period
  const timeSlot = lectureTimeSlots[period + 1]; // period is 0-based, our slots are 1-based
  
  // Create lecture object
  const lectureData = {
    day: day,
    lectureNumber: period + 1, // Period 1-8 instead of 0-7
    subject: subject,
    room: room || '',
    slot: timeSlot || ''
  };
  
  try {
    // Send to server
    const response = await fetch('/admin/form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: teacherEmail,
        day: day,
        lectureNumber: period + 1,
        subject: subject,
        room: room,
        slot: timeSlot
      })
    });
    
    if (response.ok) {
      alert('Lecture added successfully!');
      // Reset form
      document.getElementById('lecture-form').reset();
      // Optionally redirect back to main page
      // window.location.href = '/admin';
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error saving lecture:', error);
    alert('Failed to save lecture. Please try again.');
  }
});

// Page load par teachers fetch karna
fetchTeachers();
