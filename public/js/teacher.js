document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const userName = document.querySelector('#User-name');
  const userRole = document.querySelector('#User-role');
  const selectTeacher = document.querySelector('#select-tag');
  const addBtn = document.querySelector('#add-btn');

  // Global variables
  let users = [];
  let currentUser = { name: 'Admin', role: 'admin' };
  let selectedTeacher = null;
  let selectedTeacherData = null;

  // Fetch teachers from server
  async function fetchTeachers() {
    try {
      const response = await fetch('/data');
      users = await response.json();
      info();
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  }

  // Populate UI with user and teacher info
  function info() {
    userName.textContent = currentUser.name;
    userRole.textContent = `(${currentUser.role})`;

    selectTeacher.innerHTML = '<option value="">Select Teacher</option>';
    users.forEach(user => {
      if (user.role === 'user') {
        const option = document.createElement('option');
        option.value = user.email;
        option.textContent = `${user.username} - ${user.email}`;
        selectTeacher.appendChild(option);
      }
    });
  }

  // Handle teacher selection
  selectTeacher.addEventListener('change', async (e) => {
    const selectedEmail = e.target.value;
    if (selectedEmail) {
      selectedTeacherData = users.find(u => u.email === selectedEmail);
      localStorage.setItem('selectedTeacher', JSON.stringify(selectedTeacherData.email));
      await fetchTeacherSchedule(selectedEmail);
    } else {
      selectedTeacherData = null;
      selectedTeacher = null;
      clearTimetable();
    }
  });

  // Clear timetable
  function clearTimetable() {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    days.forEach(day => {
      for (let period = 1; period <= 8; period++) {
        const cell = document.getElementById(day + period);
        if (cell) {
          cell.innerHTML = '';
          cell.contentEditable = true;
          cell.style.cursor = 'text';
          cell.style.minHeight = '40px';
        }
      }
    });
  }

  // Fetch teacher's schedule from server
  async function fetchTeacherSchedule(email) {
    try {
      const response = await fetch('/admin/teacher-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        selectedTeacher = data;
        renderTimetable();
      } else {
        console.error('Failed to fetch teacher schedule:', response.status);
        selectedTeacher = null;
      }
    } catch (error) {
      console.error('Error fetching teacher schedule:', error);
      selectedTeacher = null;
    }
  }

  // Real-time clock display
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    document.getElementById('clock').textContent =
      `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
  }

  // Add button click handler
  addBtn.addEventListener('click', async (event) => {
    event.preventDefault();

    const selectedEmail = selectTeacher.value;
    if (!selectedEmail) {
      alert("Please select a teacher first!");
      return;
    }

    const confirmed = confirm("Do you want to save the current timetable for this teacher?");
    if (!confirmed) return;

    const scheduleArray = [];
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    days.forEach(day => {
      for (let period = 1; period <= 8; period++) {
        const cell = document.getElementById(day + period);
        if (cell && cell.innerHTML.trim()) {
          try {
            const content = cell.innerHTML;
            const lines = content.split('<br>');
            const subject = lines[0] || '';
            let room = '';
            let slot = '';

            if (lines.length > 1) {
              lines.forEach(line => {
                if (line.includes('Room:')) {
                  room = line.replace('<small>Room:', '').replace('</small>', '').trim();
                } else if (line.includes('<small>') && !line.includes('Room:')) {
                  slot = line.replace('<small>', '').replace('</small>', '').trim();
                }
              });
            }

            if (subject) {
              scheduleArray.push({
                day: day.charAt(0).toUpperCase() + day.slice(1),
                lectureNumber: period,
                subject,
                room,
                slot
              });
            }
          } catch (parseError) {
            console.error('Error parsing cell content:', parseError);
          }
        }
      }
    });

    try {
      const response = await fetch('/admin/save-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedEmail,
          schedule: scheduleArray
        })
      });

      if (response.ok) {
        alert("Schedule saved successfully!");
        window.location='/admin';
      } else {
        const errorData = await response.json();
        alert(`Failed to save schedule: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Error occurred while saving schedule.");
    }
  });

  // Render the teacher's timetable
  function renderTimetable() {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    days.forEach(day => {
      for (let period = 1; period <= 8; period++) {
        const cell = document.getElementById(day + period);
        if (cell) {
          cell.innerHTML = '';
          cell.contentEditable = true;
          cell.style.cursor = 'text';
          cell.style.minHeight = '40px';
        }
      }
    });

    if (selectedTeacher && selectedTeacher.schedule && Array.isArray(selectedTeacher.schedule)) {
      selectedTeacher.schedule.forEach(lecture => {
        const { day, lectureNumber, subject, room, slot } = lecture;
        const dayId = day.toLowerCase() + lectureNumber;
        const cell = document.getElementById(dayId);
        if (cell) {
          let content = subject;
          if (room) content += `<br><small>Room: ${room}</small>`;
          if (slot) content += `<br><small>${slot}</small>`;
          cell.innerHTML = content;
        }
      });
    }
  }

  // Initialize everything
  async function initializePage() {
    await fetchTeachers();

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    days.forEach(day => {
      for (let period = 1; period <= 8; period++) {
        const cell = document.getElementById(day + period);
        if (cell) {
          cell.contentEditable = true;
          cell.style.cursor = 'text';
          cell.style.minHeight = '40px';
          cell.setAttribute('placeholder', 'Click to add subject');
        }
      }
    });

    setInterval(updateClock, 1000);
    updateClock();
  }

  // Start initialization
  initializePage();
});
