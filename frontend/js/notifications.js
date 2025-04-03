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

document.addEventListener("DOMContentLoaded", function () {
  // Fetch and display notifications when the page loads
  fetchNotifications();
  markNotificationsAsRead();

  // Function to fetch and display notifications
  async function fetchNotifications() {
    const token = localStorage.getItem("token"); // Get the stored token for authorization
    if (!token) {
      alert("Authorization token is missing! Please log in.");
      return;
    }

    try {
      // Fetch notifications from the backend
      const response = await fetch(
        "http://localhost/projects/farmhub/Backend/Notification/getNotification.php",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      const notificationContainer = document.querySelector(".notifications");

      if (result.success) {
        // Clear existing notifications before appending new ones
        notificationContainer.innerHTML = "";
        if (result.notifications.length === 0) {
          alert("No notifications");
        }
        // Loop through and add each notification
        result.notifications.forEach((notification) => {
          const notificationElement = document.createElement("div");
          notificationElement.innerHTML = `
            <div>
              <div class="headings">
                <div class="title">
                  <i class="fas fa-exclamation-triangle"></i>
                  <h3>Harvest Notification</h3>
                </div>
                <span>${new Date(
                  notification.created_at
                ).toLocaleDateString()}</span>
              </div>
              <div class="notification-info">
                <p>Your crop <span>${
                  notification.crop_name
                }</span> is ready for harvest</p>
                <button class="delete-btn" data-id="${
                  notification.id
                }"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          `;
          notificationContainer.appendChild(notificationElement);

          // Add event listener for the delete button
          const deleteButton = notificationElement.querySelector(".delete-btn");
          deleteButton.addEventListener("click", function () {
            deleteNotification(notification.id);
          });
        });
      } else {
        notificationContainer.innerHTML = "<p>No notifications available</p>";
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  // Function to mark notifications as read
  async function markNotificationsAsRead() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authorization token is missing! Please log in.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/projects/farmhub/Backend/Notification/markRead.php",
        {
          method: "POST", // Use POST method to trigger the read status update
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        console.log("Notifications marked as read successfully.");
      } else {
        console.log("Failed to mark notifications as read.");
      }
    } catch (error) {
      alert("Something went wrong while marking notifications as read.");
    }
  }
  // Function to delete a notification
  async function deleteNotification(notificationId) {
    const token = localStorage.getItem("token"); // Get the stored token for authorization

    if (!confirm("Are you sure you want to delete this notification?")) {
      return; // If the user cancels, do nothing
    }

    try {
      const response = await fetch(
        "http://localhost/projects/farmhub/Backend/Notification/deleteNotification.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notification_id: notificationId }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Notification deleted");
        fetchNotifications(); // Refresh notifications list after deletion
      } else {
        alert("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Something went wrong. Please try again.");
    }
  }
});
