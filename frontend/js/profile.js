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

window.addEventListener("DOMContentLoaded", async () => {
  loadUserRecentPosts();

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(
      "http://localhost/projects/farmhub/Backend/Profile/getProfile.php",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();

    if (result.success) {
      const data = result.data;

      // Profile image
      const editableImage = document.getElementById("editable-image");
      if (data.profile_picture) {
        editableImage.src = data.profile_picture;
      }

      // About Me
      document.getElementById("about-me-info").textContent =
        data.about_me || "";

      // Fields
      const fields = {
        name: document.getElementById("name"),
        location: document.getElementById("location"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        instagram: document.getElementById("instagram"),
        facebook: document.getElementById("facebook"),
      };

      fields.name.textContent = data.name || "";
      fields.location.textContent = data.location || "";
      fields.email.textContent = data.email || "";
      fields.phone.textContent = data.phone_number || "";
      fields.instagram.textContent = data.instagram || "";
      fields.facebook.textContent = data.facebook || "";
    } else {
      console.warn("Could not load profile:", result.message);
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
  }
});

const editableImage = document.getElementById("editable-image");
const imageInput = document.getElementById("image-input");

// Click to open file selector
editableImage.parentElement.addEventListener("click", (e) => {
  e.preventDefault(); // ✅ Correct usage
  imageInput.click();
});

// Handle file selection
imageInput.addEventListener("change", async (event) => {
  event.preventDefault(); // ✅ This is the one that prevents reload

  const file = event.target.files[0];
  if (!file) return;

  // Preview image
  const reader = new FileReader();

  reader.onload = () => {
    editableImage.src = reader.result;
  };
  reader.readAsDataURL(file);

  // Upload to backend
  const formData = new FormData();
  formData.append("profile_picture", file);

  try {
    const res = await fetch(
      "http://localhost/projects/farmhub/Backend/Profile/uploadProfilePicture.php",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    const result = await res.json();
    if (!result.success) {
      alert("Failed to upload profile picture");
    }
  } catch (err) {
    console.error("Upload error:", err);
    alert("Something went wrong while uploading the profile picture.");
  }
});
//display the profilepic

//ABOUT ME FIELD
const editButton = document.getElementById("e1");
const editFormContainer = document.getElementById("edit-form-container");
const editForm = document.getElementById("edit-form");
const cancelButton = document.getElementById("cancel-button");

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

  // Populate the form with current values
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

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(editForm);
  const data = {};

  // Build a plain object from the form
  for (let [key, value] of formData.entries()) {
    if (value.trim() !== "") {
      data[key] = value.trim();
    }
  }
  editFormContainer.classList.add("hidden");

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      "http://localhost/projects/farmhub/Backend/Profile/updateProfile.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    const result = await res.json();

    if (result.success) {
      // Update fields on page
      for (let key in data) {
        if (fields[key]) {
          fields[key].textContent = data[key];
        }
      }

      editFormContainer.classList.add("hidden");
    } else {
      alert(result.message || "Failed to update profile info.");
    }
  } catch (err) {
    console.error("Update error:", err);
    alert("Something went wrong while updating profile info.");
  }
});

// ABOUT ME FIELD
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

  // Populate form with current About Me text
  aboutMeInput.value = aboutMeText.textContent.trim();
});

aeCancelButton.addEventListener("click", () => {
  aeEditFormContainer.classList.add("hidden");
});

aeEditForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedText = aboutMeInput.value.trim();

  if (updatedText !== "") {
    aboutMeText.textContent = updatedText;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "http://localhost/projects/farmhub/Backend/Profile/updateProfile.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            about_me: updatedText,
          }),
        }
      );

      const result = await res.json();
      if (!result.success) {
        alert("Failed to update About Me: " + result.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while updating About Me.");
    }
  }

  aeEditFormContainer.classList.add("hidden");
});

//display the details

let currentPostIndex = 0;

const prevButton = document.querySelector(".prev-button");
const nextButton = document.querySelector(".next-button");
const editBtn = document.getElementById("e3");
const editFC = document.getElementById("edit-form-container-posts");
const postTabs = document.querySelectorAll(".post-tab");
const postFields = document.querySelectorAll(".post-fields");
const saveButton = document.querySelector(".save-button");
const cancelBtn = document.querySelector(".cancel-button");

let postData = [
  { title: "", desc: "No post yet", img: "" },
  { title: "", desc: "No post yet", img: "" },
  { title: "", desc: "No post yet", img: "" },
];

async function loadUserRecentPosts() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost/projects/farmhub/Backend/Profile/getRecent.php",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (result.success && result.posts) {
      // Reset and fill the postData array
      postData = [
        { title: "", desc: "No post yet", img: "" },
        { title: "", desc: "No post yet", img: "" },
        { title: "", desc: "No post yet", img: "" },
      ];

      result.posts.forEach((post) => {
        const index = parseInt(post.data_index);
        if (index >= 0 && index <= 2) {
          postData[index] = {
            title: post.title || "",
            desc: post.caption || "No post yet",
            img: post.image,
          };
        }
      });

      showPost(currentPostIndex); // Refresh view
    } else {
      console.warn("No recent posts returned from server.");
    }
  } catch (err) {
    console.error("Failed to load posts:", err);
  }
}

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

showPost(currentPostIndex);

prevButton.addEventListener("click", () => {
  currentPostIndex = (currentPostIndex - 1 + postData.length) % postData.length;
  showPost(currentPostIndex);
});

nextButton.addEventListener("click", () => {
  currentPostIndex = (currentPostIndex + 1) % postData.length;
  showPost(currentPostIndex);
});

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

function updateAllPosts() {
  const updatePromises = [];

  postData.forEach((post, index) => {
    const title = document.getElementById(`title-${index}`).value;
    const desc = document.getElementById(`desc-${index}`).value;
    const imageInput = document.getElementById(`image-${index}`);

    const formData = new FormData();
    formData.append("data_index", index);
    formData.append("title", title);
    formData.append("caption", desc);
    console.log(imageInput.files[0]);

    if (imageInput.files.length > 0) {
      formData.append("image", imageInput.files[0]);
    }

    const promise = fetch(
      "http://localhost/projects/farmhub/Backend/Profile/updateRecent.php",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    )
      .then(async (res) => {
        const text = await res.text();
        console.log("RAW RESPONSE TEXT:", text); // 👈 Debugging output

        try {
          const json = JSON.parse(text);
          if (!json.success) throw new Error(json.message);
          return json;
        } catch (e) {
          console.error("Invalid JSON:", text);
          throw new Error("Failed to parse server response");
        }
      })

      .then(() => {
        postData[index].title = title;
        postData[index].desc = desc;

        if (imageInput.files.length > 0) {
          const reader = new FileReader();
          reader.onload = function (e) {
            postData[index].img = e.target.result;
            if (index === currentPostIndex) showPost(currentPostIndex);
          };
          reader.readAsDataURL(imageInput.files[0]);
        }
      })
      .catch((err) => {
        console.error(`Error updating post ${index}:`, err.message);
        alert(`Error updating post ${index}: ${err.message}`);
      });

    updatePromises.push(promise);
  });

  Promise.all(updatePromises).then(() => {
    editFC.classList.add("hidden");
    showPost(currentPostIndex);
  });
}

saveButton.addEventListener("click", (e) => {
  e.preventDefault();
  updateAllPosts();
});

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

let galleryImages = [];

// Show form
galleryButton.addEventListener("click", () => {
  galleryFormContainer.classList.remove("hidden");
});

// Submit form to upload image
galleryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = galleryImageInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(
      "http://localhost/projects/farmhub/Backend/Profile/uploadGallery.php",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    const result = await response.json();
    console.log("Gallery Upload Response:", result);

    if (result.success) {
      galleryImages.push({
        image: result.image, // use the image name
      });
      updateGallery();
    } else {
      alert("Failed to upload image: " + result.message);
    }
  } catch (err) {
    console.error("Upload Error:", err);
    alert("Something went wrong while uploading.");
  }

  galleryFormContainer.classList.add("hidden");
  galleryForm.reset();
});

// Cancel button
cancelGalleryButton.addEventListener("click", () => {
  galleryFormContainer.classList.add("hidden");
  galleryForm.reset();
});

// Fetch existing gallery images when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(
      "http://localhost/projects/farmhub/Backend/Profile/getGallery.php",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const result = await response.json();
    if (result.success) {
      galleryImages = result.images.map((img) => ({
        image: img.image, // Use the image name
      }));
      updateGallery();
    } else {
      console.log("Failed to load gallery images");
    }
  } catch (err) {
    console.error("Error fetching gallery images:", err);
  }
});

// Delete image from gallery
async function deleteImage(imageName, index) {
  try {
    const formData = new FormData();
    formData.append("image_name", imageName); // Send the image name to the backend for deletion

    const response = await fetch(
      "http://localhost/projects/farmhub/Backend/Profile/deleteGallery.php",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    const result = await response.json();
    if (result.success) {
      galleryImages.splice(index, 1); // Remove the image from the array
      updateGallery(); // Refresh the gallery
    } else {
      alert("Failed to delete image: " + result.message);
    }
  } catch (err) {
    console.error("Error deleting image:", err);
    alert("Something went wrong while deleting.");
  }
}

// Update gallery display
function updateGallery() {
  galleryContainer.innerHTML = ""; // Clear existing images

  galleryImages.forEach((image, index) => {
    const imageWrapper = document.createElement("div");
    imageWrapper.classList.add("gallery-item-wrapper");

    const imgElement = document.createElement("img");
    imgElement.src = image.image; // Use the image path
    imgElement.alt = "Gallery Image";
    imgElement.classList.add("gallery-item");

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = `<i class="fa fa-trash"></i>`;
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      deleteImage(image.image, index); // Pass the image name and index to the delete function
    });

    imageWrapper.appendChild(imgElement);
    imageWrapper.appendChild(deleteButton);
    galleryContainer.appendChild(imageWrapper);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(
      "http://localhost/projects/farmhub/Backend/getUserId.php",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const result = await response.json();

    if (result.success && result.user_id) {
      const userId = result.user_id;
      const profileUrl = `http://127.0.0.1:5500/frontend/html/profilePreview.html?id=${userId}`;

      // Set preview link
      document.getElementById("preview").href = profileUrl;

      // Copy to clipboard on button click
      document
        .getElementById("share-button")
        .addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(profileUrl);
            alert("Link copied to clipboard!");
          } catch (err) {
            console.error("Clipboard copy failed:", err);
            alert("Failed to copy link.");
          }
        });
    } else {
      console.error("Could not retrieve user ID.");
    }
  } catch (err) {
    console.error("Error getting user ID:", err);
  }
});
