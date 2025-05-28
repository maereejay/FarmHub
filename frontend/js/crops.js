const sortBtn = document.getElementById("sortBtn");
const sortMenu = document.getElementById("sortMenu");
const cropForm = document.getElementById("crop-form");
const addCrop = document.getElementById("add-crop");
const cancelCrop = document.getElementById("cancel");
const cropContent = document.querySelector(".crop-content");
const noCropsMessage = cropContent.querySelector("h1");
const sortOptions = document.querySelectorAll(".sort-opt");
const filterButtons = document.querySelectorAll(".filter button");
const searchInput = document.getElementById("search-input");
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
function updateNoCropsMessage() {
  const crops = document.querySelectorAll(".crop-item");
  if (crops.length > 0) {
    noCropsMessage.style.display = "none";
  } else {
    noCropsMessage.style.display = "block";
  }
}

sortBtn.addEventListener("click", (e) => {
  sortMenu.classList.toggle("hidden");
});

addCrop.addEventListener("click", (e) => {
  cropForm.classList.remove("hidden");
});

cancelCrop.addEventListener("click", (e) => {
  cropForm.classList.add("hidden");
  e.preventDefault();
  cropForm.reset();
});

function calculateDaysLeft(harvestDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time to remove hours, minutes, seconds

  const harvest = new Date(harvestDate);
  harvest.setHours(0, 0, 0, 0); // Normalize harvest date

  const timeDiff = harvest - today;
  let daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysLeft < 0 ? 0 : daysLeft; // Ensure no negative values
}

// Handle form submission for adding a crop
cropForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Get form values from the input fields
  const cropName = document.getElementById("crop_name").value;
  const harvestDateInput = document.getElementById("harvest_date").value;
  const quantity = document.getElementById("quantity").value;
  const plotName = document.getElementById("plot").value || "Unknown Plot";

  // Prepare the data to send to the backend
  const data = {
    crop_name: cropName,
    harvest_date: harvestDateInput,
    quantity: quantity,
    plot: plotName,
  };

  // Get the authorization token (assuming it's stored in localStorage)
  const token = localStorage.getItem("token"); // Make sure to set token when the user logs in

  if (!token) {
    alert("Authorization token is missing! Please log in.");
    return;
  }

  try {
    // Send the data to the backend
    let response = await fetch(
      "http://localhost/projects/farmhub/Backend/Crops/addCrop.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add Authorization header with the token
        },
        body: JSON.stringify(data), // Send data to the backend
      }
    );

    // Process the response from the backend
    let result = await response.json();

    if (result.success) {
      const daysLeft = calculateDaysLeft(harvestDateInput);

      alert("Crop added successfully!");
      const cropDiv = document.createElement("div");
      cropDiv.classList.add("crop-item");
      cropDiv.innerHTML = `
        <h4>${cropName}</h4>
        <h6>📅 Harvest Date: <span>${new Date(
          harvestDateInput
        ).toLocaleDateString("en-GB")}</span></h6>
        <h6>⏳ Days Left: <span>${daysLeft} days</span></h6>
        <h6>📦 Quantity: <span>${quantity}</span></h6>
        <h6>📍 Plot: <span>${plotName}</span></h6>
        <div class="crop-opts">
          <button class="harv-crop-btn">
            <i class="fas fa-shopping-basket"></i>
          </button>
          <button class="del-crop-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      // Append the new crop to the crop content container
      cropContent.appendChild(cropDiv);
      updateNoCropsMessage();

      // Delete button functionality
      cropDiv
        .querySelector(".del-crop-btn")
        .addEventListener("click", function () {
          cropDiv.remove();
          updateNoCropsMessage();
        });

      // Reset the form and hide it
      cropForm.reset();
      cropForm.classList.add("hidden");
    } else {
      alert(result.error || "Failed to add crop.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
  }
});

// Function to find the correct "Days Left" inside a crop div
function getDaysLeft(cropDiv) {
  const h6Elements = cropDiv.querySelectorAll("h6");

  for (let h6 of h6Elements) {
    if (h6.textContent.includes("Days Left")) {
      const daysText = h6.querySelector("span").textContent.trim();
      return parseInt(daysText); // Convert "8 days" to 8
    }
  }
  return Infinity; // If no valid "Days Left" is found, push it to the end
}
// Function to sort crops by "Days Left"
function sortCrops(order) {
  const crops = Array.from(cropContent.children);

  crops.sort((a, b) => {
    const daysA = getDaysLeft(a);
    const daysB = getDaysLeft(b);

    return order === "asc" ? daysA - daysB : daysB - daysA;
  });

  // Re-append sorted crops
  crops.forEach((crop) => cropContent.appendChild(crop));
}

// Attach event listeners to sorting buttons
sortOptions.forEach((option) => {
  option.addEventListener("click", function () {
    const sortOrder = this.getAttribute("data-sort");
    sortCrops(sortOrder);
    sortMenu.classList.add("hidden"); // Hide menu after sorting
  });
});

// Function to filter crops based on the selected category
function filterCrops(filterType) {
  const crops = document.querySelectorAll(".crop-content > div");

  crops.forEach((crop) => {
    const daysLeft = getDaysLeft(crop);

    if (filterType === "all") {
      crop.style.display = "block"; // Show all crops
    } else if (filterType === "harvest-ready" && daysLeft === 0) {
      crop.style.display = "block"; // Show crops that are ready for harvest (0 days left)
    } else if (filterType === "growing" && daysLeft > 0) {
      crop.style.display = "block"; // Show growing crops (days left > 0)
    } else {
      crop.style.display = "none"; // Hide crops that don't match the filter
    }
  });

  // Update active button styling
  filterButtons.forEach((btn) => btn.classList.remove("active-btn"));
}

// Attach event listeners to filter buttons
filterButtons[0].addEventListener("click", () => {
  filterCrops("all");
  filterButtons[0].classList.add("active-btn");
}); // "All" button
filterButtons[1].addEventListener("click", () => {
  filterCrops("growing");
  filterButtons[1].classList.add("active-btn");
}); // Growing crops button
filterButtons[2].addEventListener("click", () => {
  filterCrops("harvest-ready");
  filterButtons[2].classList.add("active-btn");
}); // Harvest-ready crops button

searchInput.addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  const crops = document.querySelectorAll(".crop-content > div");

  crops.forEach((crop) => {
    const cropName = crop.querySelector("h4").textContent.toLowerCase(); // Get crop name from <h4>

    if (cropName.includes(searchValue)) {
      crop.style.display = "block"; // Show matching crops
    } else {
      crop.style.display = "none"; // Hide non-matching crops
    }
  });
});

// Fetch and display crops on page load
window.addEventListener("DOMContentLoaded", fetchCrops);

// ===================== Utility Functions ===================== //

function showAlert(message) {
  alert(message); // Replace with a toast/snackbar in production
}

function createCropDiv(crop) {
  const cropDiv = document.createElement("div");
  cropDiv.classList.add("crop-item");
  cropDiv.dataset.cropId = crop.id;

  const daysLeft = calculateDaysLeft(crop.harvest_date);
  cropDiv.innerHTML = `
    <h4>${crop.crop_name}</h4>
    <h6>📅 Harvest Date: <span>${new Date(crop.harvest_date).toLocaleDateString(
      "en-GB"
    )}</span></h6>
    <h6>⏳ Days Left: <span>${daysLeft} days</span></h6>
    <h6>📦 Quantity: <span>${crop.quantity}</span></h6>
    <h6>📍 Plot: <span>${crop.plot}</span></h6>
    <div class="crop-opts">
      <button class="harv-crop-btn"><i class="fas fa-shopping-basket"></i></button>
      <button class="del-crop-btn"><i class="fas fa-trash"></i></button>
    </div>
  `;

  // Bind event listeners
  cropDiv.querySelector(".del-crop-btn").addEventListener("click", () => {
    handleDeleteCrop(crop.id, cropDiv);
  });

  cropDiv.querySelector(".harv-crop-btn").addEventListener("click", () => {
    handleHarvestCrop(crop.id, crop.quantity, cropDiv);
  });

  return cropDiv;
}

// ===================== Crop Operations ===================== //

async function fetchCrops() {
  const token = localStorage.getItem("token");
  if (!token)
    return showAlert("Authorization token is missing! Please log in.");

  try {
    const res = await fetch(
      "http://localhost/projects/farmhub/Backend/Crops/getCrop.php",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (data.success && data.crops.length > 0) {
      cropContent.innerHTML = ""; // Clear existing
      data.crops.forEach((crop) => {
        const cropDiv = createCropDiv(crop);
        cropContent.appendChild(cropDiv);
      });
    } else {
      updateNoCropsMessage();
      showAlert(data.message || "No crops found.");
    }
  } catch (err) {
    console.error(err);
    showAlert("Failed to fetch crops");
  }
}

async function handleDeleteCrop(cropId, cropDiv) {
  const token = localStorage.getItem("token");
  if (!token)
    return showAlert("Authorization token is missing! Please log in.");

  try {
    const res = await fetch(
      "http://localhost/projects/farmhub/Backend/Crops/deleteCrop.php",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ crop_id: cropId }),
      }
    );

    const result = await res.json();

    if (result.success) {
      cropDiv.remove(); // Remove from UI
      updateNoCropsMessage();
      showAlert("Crop deleted successfully!");
    } else {
      showAlert(result.error || "Failed to delete crop");
    }
  } catch (err) {
    console.error(err);
    showAlert("Something went wrong. Please try again.");
  }
}

async function handleHarvestCrop(cropId, quantity, cropDiv) {
  const token = localStorage.getItem("token");
  if (!token)
    return showAlert("Authorization token is missing! Please log in.");

  const harvestDate = new Date().toISOString().split("T")[0];

  try {
    const res = await fetch(
      "http://localhost/projects/farmhub/Backend/Crops/harvestCrop.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop_id: cropId,
          quantity,
          harvest_date: harvestDate,
        }),
      }
    );

    const result = await res.json();

    if (result.success) {
      cropDiv.remove(); // UI only, DB already handled it
      updateNoCropsMessage();
      showAlert("Crop harvested successfully!");
    } else {
      showAlert(result.error || "Failed to harvest crop");
    }
  } catch (err) {
    console.error(err);
    showAlert("Something went wrong. Please try again.");
  }
}
