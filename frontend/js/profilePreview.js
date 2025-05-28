// Get user ID from URL query
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

if (!userId) {
  alert("No user ID provided in URL.");
  throw new Error("Missing user ID");
}

// Capitalize helper

// Load profile info
async function loadUserProfile() {
  try {
    const res = await fetch(
      `http://localhost/projects/farmhub/Backend/ProfileLink/getProfile.php?id=${userId}`
    );
    const result = await res.json();

    if (result.success) {
      const data = result.data;

      // Profile Picture
      const profilePic = document.getElementById("editable-image");
      if (data.profile_picture) {
        profilePic.src = data.profile_picture;
      }

      // About Me
      document.getElementById("about-me-info").textContent =
        data.about_me || "";

      // Personal Info Fields
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
}

// Load recent posts
let currentPostIndex = 0;
let postData = [];

async function loadUserRecentPosts() {
  try {
    const res = await fetch(
      `http://localhost/projects/farmhub/Backend/ProfileLink/getRecent.php?id=${userId}`
    );
    const result = await res.json();

    if (result.success && result.posts) {
      postData = result.posts.map((post) => ({
        title: post.title || "",
        desc: post.caption || "",
        img: post.image || "",
      }));

      showPost(currentPostIndex);
    }
  } catch (err) {
    console.error("Error fetching recent posts:", err);
  }
}

function showPost(index) {
  const postImage = document.querySelector(".post-image img");
  const postTitle = document.querySelector(".post-texts h1");
  const postDesc = document.querySelector(".post-texts p");

  const post = postData[index] || {};
  postTitle.textContent = post.title || "";
  postDesc.textContent = post.desc || "";
  postImage.src = post.img || "";
  postImage.alt = post.img ? "Post Image" : "No Image";
}

document.querySelector(".prev-button").addEventListener("click", () => {
  currentPostIndex = (currentPostIndex - 1 + postData.length) % postData.length;
  showPost(currentPostIndex);
});

document.querySelector(".next-button").addEventListener("click", () => {
  currentPostIndex = (currentPostIndex + 1) % postData.length;
  showPost(currentPostIndex);
});

// Load public gallery
let galleryImages = [];

async function loadGallery() {
  try {
    const res = await fetch(
      `http://localhost/projects/farmhub/Backend/ProfileLink/getGallery.php?id=${userId}`
    );
    const result = await res.json();

    if (result.success) {
      galleryImages = result.images;
      updateGallery();
    }
  } catch (err) {
    console.error("Error loading gallery:", err);
  }
}

function updateGallery() {
  const galleryContainer = document.querySelector(".gallery-container");
  galleryContainer.innerHTML = "";

  galleryImages.forEach((image) => {
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("gallery-item-wrapper");

    const img = document.createElement("img");
    img.src = image.image;
    img.alt = "Gallery Image";
    img.classList.add("gallery-item");

    imgWrapper.appendChild(img);
    galleryContainer.appendChild(imgWrapper);
  });
}

// INIT
document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile();
  await loadUserRecentPosts();
  await loadGallery();
});
