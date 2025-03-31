const firstName = localStorage.getItem("first_name");
const lastName = localStorage.getItem("last_name");

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Select the <h1> tag inside the user section
const userHeading = document.querySelector(".user h1");

// If user data exists, update the content
if (firstName && lastName) {
  userHeading.textContent = `${capitalize(firstName)} ${capitalize(lastName)}`;
} else {
  userHeading.textContent = "User"; // Default text if no user data found
}

function logout() {
  // Remove token and user data from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("first_name");
  localStorage.removeItem("last_name");
  localStorage.removeItem("state");

  alert("Logged out successfully!");
  // Redirect to login page
  window.location.href = "login.html";
}

const logoutButton = document.querySelector(".signout button");

if (logoutButton) {
  logoutButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default link behavior
    logout();
  });
}
