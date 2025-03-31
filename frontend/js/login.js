const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("signinBtn");
const switchBtn = document.getElementById("show");

const signin = document.getElementById("signin");
const signup = document.getElementById("signup");

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("from") === "join") {
  signin.classList.add("hide");
  signup.classList.remove("hide");
  switchBtn.innerHTML = "LOG IN";
}

switchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (signin.classList.contains("hide")) {
    signin.classList.remove("hide");
    signup.classList.add("hide");
    switchBtn.innerHTML = "SIGN UP";
  } else {
    signin.classList.add("hide");
    signup.classList.remove("hide");
    switchBtn.innerHTML = "LOG IN";
  }
});

const states = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "Federal Capital Territory (FCT)",
];

function handleStateAutoFill(event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent the form submission and page reload

    const inputField = document.getElementById("stateInput");
    const inputValue = inputField.value.toLowerCase();

    // Find the matching state from the list (case-insensitive)
    const matchedState = states.find((state) =>
      state.toLowerCase().startsWith(inputValue)
    );

    // If a match is found, set it as the input value
    if (matchedState) {
      inputField.value = matchedState;
    }

    // Remove focus from the input field to hide the datalist options
    inputField.blur();
  }
}

// Add event listener for the "Enter" keypress
document
  .getElementById("stateInput")
  .addEventListener("keypress", handleStateAutoFill);

// Optional: hide the datalist after typing finishes (on input)
document.getElementById("stateInput").addEventListener("input", function () {
  const inputField = document.getElementById("stateInput");
});

document
  .getElementById("signupForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form from reloading the page

    // Get input values
    let firstName = document
      .querySelector("input[name='firstName']")
      .value.trim();
    let lastName = document
      .querySelector("input[name='lastName']")
      .value.trim();
    let email = document
      .querySelector("input[name='signup-email']")
      .value.trim();
    let state = document.querySelector("input[name='state']").value.trim();
    let password = document
      .querySelector("input[name='signup-password']")
      .value.trim();

    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Email:", email);
    console.log("State:", state);
    console.log("Password:", password);

    // Validation
    if (!firstName || !lastName || !email || !state || !password) {
      alert("All fields are required!");
      return;
    }

    try {
      let response = await fetch(
        "http://localhost/projects/farmhub/backend/signup.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email,
            state: state,
            password: password,
          }),
        }
      );

      let result = await response.json();

      if (result.success) {
        alert("Signup successful! You can now log in.");
        window.location.href = "login.html"; // Redirect to login page
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  });

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent page reload

    // Get user input
    let email = document.querySelector("input[name='email']").value.trim();
    let password = document
      .querySelector("input[name='password']")
      .value.trim();

    // Validate input
    if (!email || !password) {
      alert("Email and password are required!");
      return;
    }

    try {
      let response = await fetch(
        "http://localhost/projects/farmhub/backend/login.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      let result = await response.json();

      if (result.success) {
        alert("Login successful!");

        // Store user details in localStorage
        localStorage.setItem("token", result.token);
        localStorage.setItem("first_name", result.first_name); // Store first name
        localStorage.setItem("last_name", result.last_name); // Store last name
        localStorage.setItem("state", result.state); // Store last name

        // Redirect to dashboard or home page
        window.location.href = "dashboard.html";
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  });
