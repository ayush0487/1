let role=null;
       const adminBtn = document.querySelector(".admin");
       const userBtn = document.querySelector(".user");
       const submitBtn = document.getElementById("btn");
       adminBtn.addEventListener("click", () => {
       role = "admin";
        adminBtn.style.backgroundColor = "green";
       userBtn.style.backgroundColor = "";
      });
      userBtn.addEventListener("click", () => {
        role = "user";
        userBtn.style.backgroundColor = "green";
        adminBtn.style.backgroundColor = "";
      });
      submitBtn.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
          alert("Please fill in all fields");
          return;
        }

        const loginData = { email, password, role };

        try {
          const rawResponse = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
          });

          const content = await rawResponse.text();
          console.log(content);
          
          if(rawResponse.ok) {
            alert(`logged in successfully!`);
            if(loginData.role=='user')
            window.location.href = "/teacher.html"; 
          else{
            window.location.href = '/form.html'
          }
          } else {
            alert(content);
          }
        } catch (error) {
          console.error('Error during login:', error);
          alert('Login failed. Please try again.');
        }
      });