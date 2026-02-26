/* ===============================
   AUTH HANDLER — CLEAN & WORKING
================================*/

function loginUser() {
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  const userError = document.getElementById("userError");
  const emailError = document.getElementById("emailError");
  const passError = document.getElementById("passError");

  userError.innerText = "";
  emailError.innerText = "";
  passError.innerText = "";

  if (!username.value.trim()) {
    userError.innerText = "Username required";
    return;
  }

  if (!email.value.trim()) {
    emailError.innerText = "Email required";
    return;
  }

  if (!password.value.trim()) {
    passError.innerText = "Password required";
    return;
  }

  fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        passError.innerText = data.error;
        return;
      }

      // ✅ Save for frontend UI only
      localStorage.setItem("sfo_user", JSON.stringify(data.user));
      
      // Show success animation
      const card = document.querySelector(".login-card");
      card.classList.add("success");
      
      // Redirect
      setTimeout(() => {
        location.href = data.redirect;
      }, 800);
    })
    .catch(err => {
      console.error("Login error:", err);
      passError.innerText = "Login failed. Please try again.";
    });
}

/* ===============================
   TOGGLE PASSWORD VISIBILITY
================================ */
function togglePassword() {
  const input = document.getElementById("password");
  const icon = document.querySelector(".toggle-password");
  
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}
