const newtaskBtn = document.getElementById("new-taskBtn");
const newtaskForm = document.getElementById("task-form");
const cancelForm = document.getElementById("cancel");
const taskContent = document.querySelector(".task-content");
const filterAll = document.getElementById("filter-all");
const filterOngoing = document.getElementById("filter-ongoing");
const filterCompleted = document.getElementById("filter-completed");
const filterOverdue = document.getElementById("filter-overdue");
const noTasksMessage = taskContent.querySelector("h1");
const firstName = localStorage.getItem("first_name");
const lastName = localStorage.getItem("last_name");
document.addEventListener("DOMContentLoaded", function () {
  fetchTasks();
});
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

function updateNoTasksMessage() {
  const tasks = document.querySelectorAll(".task");
  if (tasks.length > 0) {
    noTasksMessage.style.display = "none";
  } else {
    noTasksMessage.style.display = "block";
  }
}

cancelForm.addEventListener("click", (e) => {
  newtaskForm.classList.add("hidden");
  e.preventDefault();
  newtaskForm.reset();
});
newtaskBtn.addEventListener("click", (e) => {
  newtaskForm.classList.remove("hidden");
});

document
  .getElementById("task-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get user input
    const title = document.getElementById("title").value;
    const dueDateInput = document.getElementById("due_date").value;
    const description = document.getElementById("description").value;

    const dueDate = new Date(dueDateInput);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to compare dates properly

    let status;

    if (dueDate < today) {
      status = "Overdue";
    } else if (dueDate > today) {
      status = "Ongoing";
    }

    // Get token from local storage
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please log in.");
      window.location.href = "login.html";
      return;
    }

    // Validate input
    if (!title || !dueDateInput || !description || !status) {
      alert("All fields are required!");
      return;
    }

    try {
      let response = await fetch(
        "http://localhost/projects/farmhub/Backend/Tasks/createTask.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title,
            due_date: dueDateInput,
            description: description,
            status: status,
          }),
        }
      );

      let result = await response.json();

      if (result.success) {
        alert("Task created successfully!");
        window.location.reload(); // Refresh tasks
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  });
async function updateTaskStatus(taskId, newStatus) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Authorization token is missing.");
    alert("You must be logged in to update tasks.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost/projects/farmhub/Backend/Tasks/updateTaskStatus.php",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to update task status.");
    }

    console.log("Task status updated successfully:", data.message);
    alert("Task status updated successfully!");
  } catch (error) {
    console.error("Error updating task status:", error.message);
    alert(`Error: ${error.message}`);
  }
}

function markTaskCompleted(taskId, button) {
  updateTaskStatus(taskId, "Completed");

  // ✅ Update UI immediately
  const taskDiv = document.querySelector(`[data-id='${taskId}']`);
  if (taskDiv) {
    const statusSpan = taskDiv.querySelector(".status");
    statusSpan.textContent = "completed";
    statusSpan.className = "status completed";
    taskDiv.setAttribute("data-status", "completed");

    // ✅ Disable the button after completion
    button.disabled = true;
    button.textContent = "Completed";
  }
}

function fetchTasks() {
  const token = localStorage.getItem("token"); // Retrieve JWT from local storage

  fetch("http://localhost/projects/farmHub/Backend/Tasks/viewTask.php", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        displayTasks(data.tasks);
      } else {
        console.error("Error fetching tasks:", data.error);
      }
    })
    .catch((error) => console.error("Fetch error:", error));
}
async function deleteTask(taskId) {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Authorization token is missing.");
    alert("You must be logged in to delete tasks.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost/projects/farmhub/Backend/Tasks/deleteTask.php",
      {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: taskId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to delete task.");
    }

    console.log("Task deleted successfully:", data.message);
    alert("Task deleted successfully!");

    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.remove();
    }
  } catch (error) {
    console.error("Error deleting task:", error.message);
    alert(`Error: ${error.message}`);
  }
}

function displayTasks(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time to compare dates properly

  tasks.forEach((task) => {
    const dueDate = new Date(task.due_date); // Convert string to Date object
    let dueDateText;
    let status;

    if (task.status != "completed") {
      if (dueDate < today) {
        // Task is overdue
        dueDateText = dueDate.toLocaleDateString("en-GB"); // Format as dd/mm/yyyy
        status = "Overdue";
      } else if (dueDate > today) {
        // Task is ongoing (future date)
        const timeDiff = dueDate - today;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        dueDateText = `${daysRemaining}d`; // Show days remaining
        status = "Ongoing";
      }
    } else {
      dueDateText = dueDate.toLocaleDateString("en-GB");
      status = "completed";
    }
    console.log(status);
    console.log(task.status);

    // Update task status in the database if needed
    if (task.status !== status.toLowerCase()) {
      updateTaskStatus(task.id, status.toLowerCase()); // Call API to update DB
    }
    console.log(task.status);
    // Create task div
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");
    taskDiv.setAttribute("data-id", task.id);
    taskDiv.setAttribute("data-status", task.status);
    taskDiv.setAttribute("data-task-id", task.id);

    taskDiv.innerHTML = `
      <span class="status ${task.status}">${task.status}</span>
      <h4>${task.title}</h4>
      <h6>Due: <span>${dueDateText}</span></h6>
      <p>${task.description}</p>
      <div class="buttons">
        <button class="complete-btn" onclick="">Complete</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    taskContent.appendChild(taskDiv);

    const completeBtn = taskDiv.querySelector(".complete-btn");
    completeBtn.addEventListener("click", function () {
      markTaskCompleted(task.id, completeBtn);
    });
  });
  updateNoTasksMessage();
}

// newtaskForm.addEventListener("submit", function (event) {
//   event.preventDefault();

//   // Get form values
//   const title = document.getElementById("title").value;
//   const dueDateInput = document.getElementById("due_date").value;
//   const description = document.getElementById("description").value;

//   const dueDate = new Date(dueDateInput);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0); // Normalize time to compare dates properly

//   let dueDateText;
//   let status;

//   if (dueDate < today) {
//     // Past due date
//     dueDateText = dueDate.toLocaleDateString("en-GB"); // Format as dd/mm/yyyy
//     status = "Overdue";
//   } else {
//     // Future due date
//     const timeDiff = dueDate - today;
//     const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
//     dueDateText = `${daysRemaining}d`;
//     status = "Ongoing";
//   }

//   // Create task div
//   const taskDiv = document.createElement("div");
//   taskDiv.classList.add("task");
//   taskDiv.setAttribute("data-status", status.toLowerCase());
//   taskDiv.innerHTML = `
//       <span class="status ${status.toLowerCase()}">${status}</span>
//       <h4>${title}</h4>
//       <h6>Due: <span>${dueDateText}</span></h6>
//       <p>${description}</p>
//       <div class="buttons">
//         <button class="complete-btn">Complete</button>
//         <button class="delete-btn">Delete</button>
//       </div>
//     `;

//   // Append task to content div
//   taskContent.appendChild(taskDiv);
//   updateNoTasksMessage();
//   // Add event listener for delete button
//   taskDiv.querySelector(".delete-btn").addEventListener("click", function () {
//     taskDiv.remove();
//     updateNoTasksMessage();
//   });

//   // Add event listener for complete button
//   taskDiv.querySelector(".complete-btn").addEventListener("click", function () {
//     const statusSpan = taskDiv.querySelector(".status");
//     statusSpan.textContent = "Completed";
//     statusSpan.className = "status complete";
//     taskDiv.setAttribute("data-status", "completed");
//   });
//   // Reset form
//   newtaskForm.reset();
//   newtaskForm.classList.add("hidden");
// });

// Filter functions
function filterTasks(status) {
  const tasks = document.querySelectorAll(".task");
  tasks.forEach((task) => {
    if (status === "all" || task.getAttribute("data-status") === status) {
      task.style.display = "block";
    } else {
      task.style.display = "none";
    }
  });
}

filterAll.addEventListener("click", () => {
  filterTasks("all");
  filterAll.classList.add("active-btn");
  filterCompleted.classList.remove("active-btn");
  filterOngoing.classList.remove("active-btn");
  filterOverdue.classList.remove("active-btn");
});
filterOngoing.addEventListener("click", () => {
  filterTasks("ongoing");
  filterAll.classList.remove("active-btn");
  filterCompleted.classList.remove("active-btn");
  filterOngoing.classList.add("active-btn");
  filterOverdue.classList.remove("active-btn");
});
filterCompleted.addEventListener("click", () => {
  filterTasks("completed");
  filterAll.classList.remove("active-btn");
  filterCompleted.classList.add("active-btn");
  filterOngoing.classList.remove("active-btn");
  filterOverdue.classList.remove("active-btn");
});
filterOverdue.addEventListener("click", () => {
  filterTasks("overdue");
  filterAll.classList.remove("active-btn");
  filterCompleted.classList.remove("active-btn");
  filterOngoing.classList.remove("active-btn");
  filterOverdue.classList.add("active-btn");
});

document.getElementById("search-input").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const tasks = document.querySelectorAll(".task");

  tasks.forEach((task) => {
    const taskTitle = task.querySelector("h4").textContent.toLowerCase();
    if (taskTitle.includes(searchValue)) {
      task.style.display = "block";
    } else {
      task.style.display = "none";
    }
  });
});
