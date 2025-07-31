document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const userName = document.querySelector('#User-name');
  const userRole = document.querySelector('#User-role');
  const selectTeacher = document.querySelector('#select-tag');
  const addBtn = document.querySelector('#add-btn');
  const dashboard = document.querySelector('#dashboard');
  const calendar = document.querySelector('#calendar');
  const approveLeave = document.querySelector('#approve-leave');
  const timetableSection = document.querySelector('.timetable-section');
  const leaveSection = document.querySelector('.leave-section');

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

            if (lines.length > 1) {
              lines.forEach(line => {
                if (line.includes('Room:')) {
                  room = line.replace('<small>Room:', '').replace('</small>', '').trim();
                }
              });
            }

            if (subject) {
              // Use fixed time slot based on period number
              const slot = lectureTimeSlots[period];
              
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
        window.location.href = '/form.html';
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
        const { day, lectureNumber, subject, room } = lecture;
        const dayId = day.toLowerCase() + lectureNumber;
        const cell = document.getElementById(dayId);
        if (cell) {
          let content = subject;
          if (room) content += `<br><small>Room: ${room}</small>`;
          // Add fixed time slot based on lecture number
          const timeSlot = lectureTimeSlots[lectureNumber];
          if (timeSlot) content += `<br><small>${timeSlot}</small>`;
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

    // Navigation handlers
    dashboard.addEventListener('click', () => {
      timetableSection.style.display = 'block';
      leaveSection.style.display = 'none';
    });

    calendar.addEventListener('click', () => {
      timetableSection.style.display = 'block';
      leaveSection.style.display = 'none';
    });

    approveLeave.addEventListener('click', () => {
      timetableSection.style.display = 'none';
      leaveSection.style.display = 'block';
      loadLeaveRequests();
    });

    setInterval(updateClock, 1000);
    updateClock();
  }

  // Load leave requests from server
  async function loadLeaveRequests() {
    try {
      const response = await fetch('/admin/leave-requests');
      if (response.ok) {
        const leaveRequests = await response.json();
        displayLeaveRequests(leaveRequests);
      } else {
        console.error('Failed to load leave requests');
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
    }
  }

  // Display leave requests in the UI
  function displayLeaveRequests(requests) {
    const container = document.getElementById('leave-requests-container');
    
    if (requests.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #666;">No leave requests found.</p>';
      return;
    }

    container.innerHTML = requests.map(request => `
      <div class="leave-request ${request.status.toLowerCase()}">
        <h4>${request.teacherName} (${request.email})</h4>
        <p><strong>Date:</strong> ${new Date(request.date).toLocaleDateString()}</p>
        <p><strong>Reason:</strong> ${request.reason}</p>
        <p><strong>Submitted:</strong> ${new Date(request.timestamp).toLocaleDateString()}</p>
        <span class="status ${request.status.toLowerCase()}">${request.status}</span>
        
        ${request.status === 'Pending' ? `
          <div class="leave-actions">
            <button class="approve-btn" onclick="handleLeaveRequest(${request.id}, 'Approved')">
              Approve
            </button>
            <button class="reject-btn" onclick="handleLeaveRequest(${request.id}, 'Rejected')">
              Reject
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // Handle leave request approval/rejection
  window.handleLeaveRequest = async function(requestId, status) {
    try {
      const response = await fetch('/admin/handle-leave-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status })
      });

      if (response.ok) {
        alert(`Leave request ${status.toLowerCase()} successfully!`);
        loadLeaveRequests(); // Reload the requests
      } else {
        const error = await response.text();
        alert(`Failed to ${status.toLowerCase()} leave request: ${error}`);
      }
    } catch (error) {
      console.error('Error handling leave request:', error);
      alert('Error occurred while processing leave request.');
    }
  };

  // Start initialization
  initializePage();
});
