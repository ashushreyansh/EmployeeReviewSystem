document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const overlay = document.getElementById("overlay");
  const navbar = document.querySelector(".navbar ul.menuList");

  function closeForms() {
    overlay.style.display = "none";
    loginForm.style.display = "none";
    signupForm.style.display = "none";
  }

  function showLoginForm() {
    overlay.style.display = "block";
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  }

  function showSignupForm() {
    overlay.style.display = "block";
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }

  function toggleForms() {
    overlay.style.display = "block";

    if (loginForm.style.display === "none") {
      // Show login form, hide signup form
      loginForm.style.display = "block";
      signupForm.style.display = "none";
    } else {
      // Show signup form, hide login form
      loginForm.style.display = "none";
      signupForm.style.display = "block";
    }
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission behavior
    handleLogin(event); // Call your handleLogin function
  });
  function handleLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // Make an AJAX request to the server to handle the login
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.message === "Login successful") {
          localStorage.setItem("isLoggedIn", "true");
          closeForms();
        }
        updateNavbar();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function updateNavbar() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    const loginButton = document.createElement("button");
    loginButton.textContent = "Login";
    loginButton.onclick = handleLogin;

    const logoutButton = document.createElement("button");
    logoutButton.textContent = "Logout";
    logoutButton.onclick = handleLogout;

    // Clear existing navbar buttons
    navbar.innerHTML = "";

    if (isLoggedIn) {
      // If logged in, show logout button
      navbar.appendChild(logoutButton);
    } else {
      // If not logged in, show login button
      navbar.appendChild(loginButton);
    }
  }

  document.addEventListener("DOMContentLoaded", updateNavbar);

  function handleLogout() {
    // Add logic to handle logout
    fetch("/logout", {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.success) {
          console.log("Logout successful", data);

          // After logout, update the navbar to show the login button
          const isLoggedIn = false;

          // Update localStorage to reflect the new authentication state
          localStorage.setItem("isLoggedIn", "false");

          // Update the navbar
          updateNavbar(isLoggedIn);
        } else {
          console.log("Logout failed:", data.error || "Unknown error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  window.handleLoginClick = function () {
    showLoginForm();
  };

  window.handleSignupClick = function () {
    showSignupForm();
  };

  window.handleOptionsClick = function () {
    // Add logic to handle Options click
    console.log("Options logic here");
  };

  // window.handleLogin = handleLogin;
  // window.handleSignup = handleSignup;
  window.toggleForms = toggleForms;
  window.closeForms = closeForms;
  window.handleLogout = handleLogout;
});
