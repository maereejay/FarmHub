document.addEventListener("DOMContentLoaded", function () {
  const firstName = localStorage.getItem("first_name");
  const lastName = localStorage.getItem("last_name");

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Select the <h1> tag inside the user section
  const userHeading = document.querySelector(".user h1");

  // If user data exists, update the content
  if (firstName && lastName) {
    userHeading.textContent = `${capitalize(firstName)} ${capitalize(
      lastName
    )}`;
  } else {
    userHeading.textContent = "User"; // Default text if no user data found
  }
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      this.closest("tr").remove();
    });
  });

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

  // Function to fetch and display storage crops in the table
  async function fetchStorageCrops() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authorization token is missing! Please log in.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/projects/farmhub/Backend/Storage/getStorage.php",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Pass token for authentication
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        const cropTableBody = document.getElementById("cropTableBody");
        cropTableBody.innerHTML = ""; // Clear existing content

        result.storage.forEach((crop) => {
          const cropRow = document.createElement("tr");

          // Create each cell for crop name, quantity, harvest date, and delete button
          cropRow.innerHTML = `
          <td>${crop.crop_name}</td>
          <td>${crop.quantity}</td>
          <td>${new Date(crop.date_harvested).toLocaleDateString("en-GB")}</td>
          <td class="delete-cell">
            <button class="delete-btn" data-id="${crop.id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;

          // Append the new row to the table body
          cropTableBody.appendChild(cropRow);
        });

        // Attach event listener to delete buttons
        document.querySelectorAll(".delete-btn").forEach((button) => {
          button.addEventListener("click", function () {
            const cropId = button.getAttribute("data-id");
            deleteStorageCrop(cropId); // Call the function to delete the crop
          });
        });
      } else {
        alert(result.message || "No harvested crops found");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch storage crops");
    }
  }

  // Function to delete a crop from storage
  async function deleteStorageCrop(cropId) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authorization token is missing! Please log in.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/projects/farmhub/Backend/Storage/deleteStorageCrop.php", // Backend script to delete crop from storage
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            crop_id: cropId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Crop deleted from storage!");
        fetchStorageCrops(); // Reload the crops after deletion
      } else {
        alert(result.error || "Failed to delete crop from storage");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  // Call the function to fetch storage crops when the page loads
  window.onload = fetchStorageCrops;
});

// Get the search input field and add an event listener to it
document.getElementById("search-input").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase(); // Get the search input value and convert it to lowercase
  const rows = document.querySelectorAll("#cropTableBody tr"); // Get all rows in the storage table body

  rows.forEach((row) => {
    const cropName = row
      .querySelector("td:nth-child(1)")
      .textContent.toLowerCase(); // Get crop name from the first <td> in the row

    // Show or hide rows based on the search input
    if (cropName.includes(searchValue)) {
      row.style.display = "table-row"; // Show matching rows
    } else {
      row.style.display = "none"; // Hide non-matching rows
    }
  });
});
