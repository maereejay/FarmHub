// Retrieve first name and last name from local storage
const firstName = localStorage.getItem("first_name");
const lastName = localStorage.getItem("last_name");
const userState = localStorage.getItem("state");

// Function to capitalize first letter
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

// Function to format the current date
function formatDate(date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  // Determine ordinal suffix
  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return `${dayName} ${day}${ordinal(day)} ${monthName} ${year}`;
}

// Set the current date
document.getElementById("current-date").innerText = formatDate(new Date());

// WeatherAPI
const apiKey = "538b76a81c2849e698b164017250501"; // Your WeatherAPI key
const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=`;
const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=&days=7&aqi=no&alerts=no`;

// Fetch current weather based on location
async function fetchCurrentWeather(location) {
  try {
    console.log("Fetching current weather data...");

    const response = await fetch(`${currentWeatherUrl}${location}`);
    const data = await response.json();

    if (!data || !data.current) {
      console.error("Failed to retrieve weather data");
      return;
    }

    const weather = data.current.condition.text.toLowerCase();
    const weatherIcon = data.current.condition.icon;

    // Use the colored icon for today's weather
    document.getElementById(
      "weather-icon"
    ).innerHTML = `<img src="https:${weatherIcon}" alt="weather-icon" style="width: 100%; height: 100%;">`;
    document.getElementById(
      "current-temp"
    ).innerText = ` ${data.current.temp_c}°C`;
    document.getElementById(
      "current-description"
    ).innerText = `${data.current.condition.text}`;

    const weatherImageUrl = weatherImages[weather] || "images/cloudy.jpg";
    document.getElementById(
      "weather-image"
    ).innerHTML = `<img src="${weatherImageUrl}" alt="weather-image">`;
  } catch (error) {
    console.error("Error fetching current weather data:", error);
  }
}

// Handle manual state input
function manualStateInput() {
  const state =
    userState ||
    prompt("Location access denied. Please enter your state (e.g., 'Lagos'):");

  if (state) {
    const location = `${state}, Nigeria`;
    fetchCurrentWeather(location);
    fetchForecast(location);
  } else {
    alert("State input is required to display weather data.");
  }
}

// Get user's location and fetch weather
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetchCurrentWeather(`${lat},${lon}`);
        fetchForecast(`${lat},${lon}`);
      },
      (error) => {
        console.warn("Geolocation denied or failed:", error);
        manualStateInput();
      }
    );
  } else {
    console.warn("Geolocation is not supported by this browser.");
    manualStateInput();
  }
}
// Fetch 3-day forecast based on location
async function fetchForecast(location) {
  try {
    console.log("Fetching 3-day forecast data...");

    const response = await fetch(
      `${forecastUrl.replace("&q=", "&q=" + location)}`
    );
    const data = await response.json();

    if (!data || !data.forecast) {
      console.error("Failed to retrieve forecast data");
      return;
    }

    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = ""; // Clear previous data
    console.log(data.forecast.forecastday);

    // Skip today and get the next 3 days' forecast
    const nextThreeDays = data.forecast.forecastday.slice(0, 3);

    nextThreeDays.forEach((forecast, index) => {
      // Array of 3-letter day abbreviations
      const daysAbbreviation = [
        "SUN",
        "MON",
        "TUE",
        "WED",
        "THUR",
        "FRI",
        "SAT",
      ];

      // Extract the 3-letter day abbreviation
      const forecastDate = daysAbbreviation[new Date(forecast.date).getDay()];
      const maxTemp = forecast.day.maxtemp_c.toFixed(1);
      const minTemp = forecast.day.mintemp_c.toFixed(1);
      const condition = forecast.day.condition.text;
      const icon = forecast.day.condition.icon;

      // Create a div for each forecast with border and h1 for the day
      const forecastDiv = document.createElement("div");
      forecastDiv.classList.add("forecast-day", `day-${index + 1}`);
      forecastDiv.innerHTML = `
        <h1>${forecastDate}</h1>
        <img src="https:${icon}" alt="forecast-icon">
        <p>Max: ${maxTemp}°C</p>
        <p>Min: ${minTemp}°C</p>
        <p>${condition}</p>
      `;
      forecastContainer.appendChild(forecastDiv);
    });
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

// Call the function to get the user's location and fetch weather
getUserLocation();

//DUE DATE COLOR
// Select all the task containers
const taskContainers = document.querySelectorAll(".due-date");

// Loop through each due-date container
taskContainers.forEach((dueDateElement) => {
  // Find the status span within the current due-date container
  const statusElement = dueDateElement.querySelector("#status");

  // Check the status text and set the background color accordingly
  if (statusElement.textContent.trim() === "Due") {
    dueDateElement.style.backgroundColor = "rgb(193, 19, 16)"; // Set background color to red
  } else if (statusElement.textContent.trim() === "Left") {
    dueDateElement.style.backgroundColor = " rgb(71, 142, 86)"; // Set background color to green
  }
});

//TASKS PIE CHART
// Data for the tasks
const tasksDue = 5; // Replace this with the number of tasks due
const tasksNotDue = 8; // Replace this with the number of tasks not due

// Get the canvas element
const ctx = document.getElementById("prodPieChart").getContext("2d");

// Create the pie chart
const prodPieChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Tasks Due", "Tasks Not Due"], // Labels for each section
    datasets: [
      {
        label: "Productivity Level",
        data: [tasksDue, tasksNotDue], // Task counts
        backgroundColor: [" rgb(236, 52, 52)", " rgb(71, 142, 86)"], // Red for "Tasks Due", Green for "Tasks Not Due"
        hoverBackgroundColor: ["#ff4500", "#228b22"], // Slightly darker colors on hover
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ": " + tooltipItem.raw + " tasks"; // Customizing the tooltip text
          },
        },
      },
    },
  },
});

// Data for crops and the percentage of people planting them
const cropData = {
  labels: ["Corn", "Rice", "Wheat", "Soybeans", "Barley"], // Crop names
  datasets: [
    {
      label: "Percentage of People Planting (%)",
      data: [80, 65, 55, 70, 60], // Percentages of people planting these crops
      backgroundColor: "#ff9505", // Bar color
      borderColor: "black", // Border color of the bars
      borderWidth: 1,
      borderRadius: 10, // Rounded corners of the bars
      barThickness: 15, // Set bars to be thin
    },
  ],
};

// Configuration for the bar chart
const config = {
  type: "bar",
  data: cropData,
  options: {
    responsive: true,
    scales: {
      x: {
        title: {
          text: "Crops",
          display: true,
          font: {
            size: 12, // Smaller font size for the x-axis labels
          },
        },
        grid: {
          display: true,
          color: "#ddd", // Grid line color for the x-axis
        },
      },
      y: {
        title: {
          display: true,
          text: "Percentage (%)",
          font: {
            size: 12, // Smaller font size for the y-axis labels
          },
        },
        grid: {
          display: true,
          color: "#ddd", // Grid line color for the y-axis
        },
        beginAtZero: true,
        max: 100, // Set max percentage to 100
      },
    },
    plugins: {
      legend: {
        position: "top", // Position the legend at the top
        labels: {
          font: {
            size: 14, // Smaller font size for the legend
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.dataset.label + ": " + tooltipItem.raw + "%";
          },
        },
      },
    },
  },
};

// Create the bar chart
const ctx1 = document.getElementById("cropBarChart").getContext("2d");
const cropBarChart = new Chart(ctx1, config);
