document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const showFormBtn = document.getElementById("showFormBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const cropForm = document.getElementById("cropForm");
  const cropList = document.getElementById("crops");
  const statusFilter = document.getElementById("statusFilter");
  const sortOrder = document.getElementById("sortOrder");

  let crops = [];

  showFormBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  cropForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const cropName = document.getElementById("cropName").value;
    const cropType = document.getElementById("cropType").value;
    const harvestDate = new Date(document.getElementById("harvestDate").value);
    const daysLeft = Math.ceil(
      (harvestDate - new Date()) / (1000 * 60 * 60 * 24)
    );

    crops.push({ name: cropName, type: cropType, date: harvestDate, daysLeft });
    modal.classList.add("hidden");
    updateCropList();
  });

  // Update the crop list based on filtering and sorting
  function updateCropList() {
    let filteredCrops = [...crops];

    // Handle filtering
    const filterValue = statusFilter.value;
    if (filterValue === "ready") {
      filteredCrops = filteredCrops.filter((crop) => crop.daysLeft <= 0);
    } else if (filterValue === "almost") {
      filteredCrops = filteredCrops.filter(
        (crop) => crop.daysLeft <= 5 && crop.daysLeft > 0
      );
    } else if (filterValue === "growing") {
      filteredCrops = filteredCrops.filter((crop) => crop.daysLeft > 5);
    }

    // Handle sorting
    const sortValue = sortOrder.value;
    if (sortValue === "earliest") {
      filteredCrops.sort((a, b) => a.date - b.date);
    } else if (sortValue === "latest") {
      filteredCrops.sort((a, b) => b.date - a.date);
    }

    cropList.innerHTML = "";
    filteredCrops.forEach((crop, index) => {
      const li = document.createElement("li");
      li.classList.add("crop-item");
      li.innerHTML = `
                <strong>${crop.name} (${crop.type})</strong><br>
                📅 Harvest Date: ${crop.date.toDateString()}<br>
                ⏳ Days Left: ${crop.daysLeft} days
                <button class="delete-btn" onclick="deleteCrop(${index})">❌</button>
            `;
      cropList.appendChild(li);
    });
  }

  // Delete crop functionality
  window.deleteCrop = function (index) {
    crops.splice(index, 1);
    updateCropList();
  };

  // Initialize crop list
  updateCropList();

  // Update crop list on filter or sort change
  statusFilter.addEventListener("change", updateCropList);
  sortOrder.addEventListener("change", updateCropList);
});
