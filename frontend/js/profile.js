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

function changeImage() {
  const imageInput = document.getElementById("image-input");
  imageInput.click();

  imageInput.onchange = (event) => {
    const file = event.target.files[0];
    const editableImage = document.getElementById("editable-image");

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        editableImage.src = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      editableImage.src = "../assets/profile/default-profile.png";
    }
  };
}

//ABOUT ME FIELD
const editButton = document.getElementById("e1");
const editFormContainer = document.getElementById("edit-form-container");
const editForm = document.getElementById("edit-form");
const cancelButton = document.getElementById("cancel-button");

// Initial fields
const fields = {
  name: document.getElementById("name"),
  location: document.getElementById("location"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  instagram: document.getElementById("instagram"),
  facebook: document.getElementById("facebook"),
};
editButton.addEventListener("click", () => {
  editFormContainer.classList.remove("hidden");

  // Populate form with current values
  editForm.elements["name"].value = fields.name.textContent;
  editForm.elements["location"].value = fields.location.textContent;
  editForm.elements["email"].value = fields.email.textContent;
  editForm.elements["phone"].value = fields.phone.textContent;
  editForm.elements["instagram"].value = fields.instagram.textContent;
  editForm.elements["facebook"].value = fields.facebook.textContent;
});
cancelButton.addEventListener("click", () => {
  editFormContainer.classList.add("hidden");
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Update fields if modified
  const formData = new FormData(editForm);
  for (let [key, value] of formData.entries()) {
    if (value.trim() !== "") {
      fields[key].textContent = value.trim();
    }
  }

  editFormContainer.classList.add("hidden");
});

//PROFILE FIELDS
const aeEditButton = document.getElementById("e2");
const aeEditFormContainer = document.getElementById(
  "editform-container-aboutme"
);
const aeEditForm = document.getElementById("form-aboutme");
const aeCancelButton = document.getElementById("aboutme-cancel-button");
const aboutMeText = document.getElementById("about-me-info");
const aboutMeInput = document.getElementById("edit-about-me");

aeEditButton.addEventListener("click", () => {
  aeEditFormContainer.classList.remove("hidden");

  // Populate form with current values
  aboutMeInput.value = aboutMeText.textContent.trim();
});
aeCancelButton.addEventListener("click", () => {
  aeEditFormContainer.classList.add("hidden");
});

aeEditForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Update fields if modified
  const updatedText = aboutMeInput.value.trim();

  if (updatedText !== "") {
    aboutMeText.textContent = updatedText; // Update displayed text
  }

  aeEditFormContainer.classList.add("hidden");
});

let currentPostIndex = 0;

const posts = document.querySelectorAll(".posts");
const prevButton = document.querySelector(".prev-button");
const nextButton = document.querySelector(".next-button");
const editBtn = document.getElementById("e3");
const editFC = document.getElementById("edit-form-container-posts");
const editF = document.getElementById("edit-posts-form");
const postTabs = document.querySelectorAll(".post-tab");
const postFields = document.querySelectorAll(".post-fields");
const saveButton = document.querySelector(".save-button");
const cancelBtn = document.querySelector(".cancel-button");

// Post data (empty by default)
let postData = [
  { title: "", desc: "No post yet", img: "" },
  { title: "", desc: "No post yet", img: "" },
  { title: "", desc: "No post yet", img: "" },
];

// Function to update the visible post
function showPost(index) {
  const postImage = document.querySelector(".post-image img");
  const postTitle = document.querySelector(".post-texts h1");
  const postDesc = document.querySelector(".post-texts p");

  postTitle.textContent = postData[index].title || "";
  postDesc.textContent = postData[index].desc;

  if (postData[index].img) {
    postImage.src = postData[index].img;
    postImage.alt = "Post Image";
  } else {
    postImage.src = "";
    postImage.alt = "No image selected";
  }
}

// Initialize first post
showPost(currentPostIndex);

// Event Listeners for Slideshow Navigation
prevButton.addEventListener("click", () => {
  currentPostIndex = (currentPostIndex - 1 + postData.length) % postData.length;
  showPost(currentPostIndex);
});

nextButton.addEventListener("click", () => {
  currentPostIndex = (currentPostIndex + 1) % postData.length;
  showPost(currentPostIndex);
});

// Show Edit Form and Populate Fields
editBtn.addEventListener("click", () => {
  editFC.classList.remove("hidden");

  postData.forEach((post, index) => {
    document.getElementById(`title-${index}`).value = post.title;
    document.getElementById(`desc-${index}`).value = post.desc;
  });

  postFields.forEach((field) => field.classList.add("hidden"));

  postTabs.forEach((tab) => tab.classList.remove("active"));
  postTabs[0].classList.add("active");
  postFields[0].classList.remove("hidden");
});

// Tab Switching in the Form
postTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const index = tab.getAttribute("data-index");

    postTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    postFields.forEach((field) => field.classList.add("hidden"));
    document
      .querySelector(`.post-fields[data-index="${index}"]`)
      .classList.remove("hidden");
  });
});

// Function to update all posts on Save
function updateAllPosts() {
  postData.forEach((post, index) => {
    post.title = document.getElementById(`title-${index}`).value;
    post.desc = document.getElementById(`desc-${index}`).value;

    const imageInput = document.getElementById(`image-${index}`);
    if (imageInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = function (event) {
        postData[index].img = event.target.result;
        if (currentPostIndex === index) {
          showPost(currentPostIndex);
        }
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      postData[index].img = "";
    }
  });

  showPost(currentPostIndex); // Refresh slideshow
  editFC.classList.add("hidden"); // Close the form
}

// Save Button - Updates all posts and closes the form
saveButton.addEventListener("click", (e) => {
  e.preventDefault();
  updateAllPosts();
});

// Cancel Button - Closes the form without saving
cancelBtn.addEventListener("click", () => {
  editFC.classList.add("hidden");
});

const galleryButton = document.getElementById("e4");
const galleryFormContainer = document.getElementById("gallery-form-container");
const galleryForm = document.getElementById("gallery-form");
const galleryImageInput = document.getElementById("gallery-image");
const galleryContainer = document.querySelector(".gallery-container");
const saveGalleryButton = document.querySelector(".save-gallery");
const cancelGalleryButton = document.querySelector(".cancel-gallery");

let galleryImages = []; // Array to store images

// Show the form when "Add to Gallery" button is clicked
galleryButton.addEventListener("click", () => {
  galleryFormContainer.classList.remove("hidden");
});

// Handle form submission
galleryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (galleryImageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (event) {
      galleryImages.push(event.target.result); // Store image data
      updateGallery();
    };
    reader.readAsDataURL(galleryImageInput.files[0]);
  }

  galleryFormContainer.classList.add("hidden"); // Hide form after saving
  galleryImageInput.value = ""; // Reset input field
});

// Cancel button hides the form
cancelGalleryButton.addEventListener("click", () => {
  galleryFormContainer.classList.add("hidden");
  galleryForm.reset(); // Reset all form fields
});

// Function to update the gallery display
function updateGallery() {
  galleryContainer.innerHTML = ""; // Clear existing images

  galleryImages.forEach((imageSrc, index) => {
    const imageWrapper = document.createElement("div");
    imageWrapper.classList.add("gallery-item-wrapper");

    const imgElement = document.createElement("img");
    imgElement.src = imageSrc;
    imgElement.alt = "Gallery Image";
    imgElement.classList.add("gallery-item");

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = `<i class="fa fa-trash"></i>`;
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      galleryImages.splice(index, 1); // Remove image from array
      updateGallery(); // Refresh the gallery
    });

    imageWrapper.appendChild(imgElement);
    imageWrapper.appendChild(deleteButton);
    galleryContainer.appendChild(imageWrapper);
  });
}
