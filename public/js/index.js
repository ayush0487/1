let role=null;
  const adminBtn = document.querySelector(".admin");
  const userBtn = document.querySelector(".user");
  const submitBtn = document.getElementById("btn");

  adminBtn.addEventListener("click",()=>{
    adminBtn.style.backgroundColor = "green";
    userBtn.style.backgroundColor = "";
    role="admin";
  })
  userBtn.addEventListener("click",()=>{
    userBtn.style.backgroundColor = "green";
    adminBtn.style.backgroundColor = "";
    role="user";
  })
  submitBtn.addEventListener("click", async(e) => {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
   if (!username || !email || !password) {
    alert("Please fill in all fields");
    return;
  }
   const userData = { username, email, password, role };
 
  try {
    const rawResponse = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const content = await rawResponse.text();
    console.log(content);
    if(rawResponse.ok)
    {
        alert(`signed up successfully!`);
         window.location.href = "/login.html";
    } else {
        alert(content);
    }
  } catch (error) {
    console.error('Error during registration:', error);
    alert('Registration failed. Please try again.');
  }
});