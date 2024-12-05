let isUser = false;
let user = null;
let users = [];
let otherPosts = [];
let userPosts = [];
let filteredPosts = [];
let filteredUsers = [];
const baseUrl = "http://localhost:5000/raju";

// Set Current Page
const setCurrentPage = (pageId) => {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => {
    if (page.id === pageId) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  });
};

// Check user session
const CheckUserSession = () => {
  const authButtons = document.querySelectorAll(".auth-buttons");
  const logoutButton = document.querySelector("#logout-button");
  const ul = document
    .getElementById("header-links-container")
    .querySelector("ul");

  if (isUser) {
    authButtons.forEach((button) => {
      button.style.display = "none";
    });
    logoutButton.style.display = "block";
    ul.style.display = "flex";
    SetProfile();
  } else {
    authButtons.forEach((button) => {
      button.style.display = "block";
    });
    logoutButton.style.display = "none";
    ul.style.display = "none";
  }
};

// Active links
const activeLinks = () => {
  const headerLinksContainer = document.getElementById(
    "header-links-container"
  );
  const ul = headerLinksContainer.querySelector("ul");
  const li = ul.querySelectorAll("li");
  li.forEach((item) => {
    item.addEventListener("click", () => {
      setCurrentPage(item.textContent.toLowerCase().trim());
    });
  });
  const phoneNav = document.getElementById("phone-nav");
  const phoneNavUl = phoneNav.querySelector("ul");
  const phoneNavLi = phoneNavUl.querySelectorAll("li");
  phoneNavLi.forEach((item) => {
    item.addEventListener("click", () => {
      setCurrentPage(item.textContent.toLowerCase().trim());
    });
  });

  const authButtons = document.querySelectorAll(".auth-buttons");
  authButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCurrentPage(button.textContent.toLowerCase().trim());
    });
  });
};

const FetchUsers = async () => {
  const usersList = document.querySelector(".users-list");
  const res = await fetch(`${baseUrl}/users`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("fitness-web-token")}`,
    },
  });
  const data = await res.json();
  if (res.ok) {
    users = data.users;
  } else {
    alert(data.message);
  }
};

// Set Profile
const SetProfile = () => {
  const posts = document.querySelector(".profile-stats-posts");
  const followers = document.querySelector(".profile-stats-followers");
  const following = document.querySelector(".profile-stats-following");
  const profileImage = document.querySelectorAll(".profile-image");
  document.querySelector(".profile-name").textContent = user.name;
  followers.textContent = user.followers.length || 0;
  following.textContent = user.following.length || 0;
  posts.textContent = user.posts.length || 0;
  profileImage.forEach((image) => {
    image.src = user.image;
  });
};

// handel users
const searchUsers = (e) => {
  const search = e.target.value.trim();
  const usersList = document.querySelector(".users-list");
  usersList.innerHTML = "";

  if (search.length > 0) {
    filteredUsers = users.filter(
      (item) =>
        item.name?.toLowerCase().includes(search.toLowerCase()) &&
        item._id !== user._id
    );

    if (filteredUsers.length > 0) {
      filteredUsers.forEach((user) => {
        const userName = user.name?.trim() || "Anonymous";
        const userImage =
          user.image?.trim() ||
          `https://ui-avatars.com/api/?background=random&name=${
            userName.split(" ")[0]
          }`;

        const div = document.createElement("div");
        div.classList.add("user-detail");
        div.innerHTML = `
          <div class="profile-image-container">
            <img
              src="${userImage}"
              alt="${userName} Profile"
              class="profile-image"
            />
          </div>
          <div class="user-info">
            <h1>${userName}</h1>
            <p>Bio: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <button class="follow-button" id="follow-button">Follow</button>
        `;
        usersList.appendChild(div);
      });
    } else {
      usersList.innerHTML = `<p>No users found.</p>`;
    }
  }
};

// Signup
const SignUpUser = async (e) => {
  e.preventDefault();
  const name = document.querySelector("#signup-name").value;
  const email = document.querySelector("#signup-email").value;
  const password = document.querySelector("#signup-password").value;

  if (password.length < 8) {
    alert("Password must be at least 8 characters long");
    return;
  }

  const res = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password,
    }),
  });
  const data = await res.json();
  if (res.ok) {
    setCurrentPage("login");
    alert("Registered successfully");
  } else {
    alert(data.message);
  }
};

// Login User
const LoginUser = async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });
  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("fitness-web-token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    user = data.user;
    isUser = true;
    setCurrentPage("home");
    CheckUserSession();
  } else {
    alert(data.message);
  }
};

const OpenPostModal = () => {
  const postModal = document.getElementById("post-modal");
  postModal.style.display = "flex";
  document.body.style.overflow = "hidden";
};

const ClosePostModal = () => {
  const postModal = document.getElementById("post-modal");
  postModal.style.display = "none";
  document.body.style.overflow = "auto";
};

const UploadPost = async (e) => {
  e.preventDefault();
  const postImage = document.getElementById("post-modal-image").files[0];
  const postDescription = document.getElementById(
    "post-modal-description"
  ).value;
  const postTitle = document.getElementById("post-modal-title").value;

  const formData = new FormData();
  formData.append("image", postImage);
  formData.append("desc", postDescription);
  formData.append("title", postTitle);

  console.log(postImage, postDescription, postTitle);
  const res = await fetch(`${baseUrl}/contents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("fitness-web-token")}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (res.ok) {
    alert("Post uploaded successfully");
    ClosePostModal();
  } else {
    alert(data.message);
  }
};

// Fetch User
const FetchUser = async () => {
  const token = localStorage.getItem("fitness-web-token"); // Fetch dynamically
  if (!token) {
    alert("No token found. Please log in.");
    setCurrentPage("login");
    return;
  }

  const res = await fetch(`${baseUrl}/login`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (res.ok) {
    user = data.user;
    isUser = true;
    setCurrentPage("home");
    FetchPosts();
  } else {
    localStorage.removeItem("fitness-web-token");
    setCurrentPage("login");
  }
  CheckUserSession();
};
// Fetch User
const FetchPosts = async () => {
  const token = localStorage.getItem("fitness-web-token"); // Fetch dynamically
  if (!token) {
    alert("No token found. Please log in.");
    setCurrentPage("login");
    return;
  }

  const res = await fetch(`${baseUrl}/contents`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (res.ok) {
    const posts = data.contents;
    if (posts.length > 0) {
      userPosts = posts.filter((post) => post.author._id === user._id) || null;
      otherPosts = posts.filter((post) => post.author._id !== user._id) || null;
      SetPosts();
    }
  } else {
    alert(data.message);
  }
};

const LogoutUser = () => {
  localStorage.removeItem("fitness-web-token");
  isUser = false;
  user = null;
  otherPosts = null;
  users = null;
  userPosts = null;
  setCurrentPage("login");
  CheckUserSession();
};

const SetPosts = () => {
  const ProfilePosts = document.querySelector(".profile-posts");
  const OtherPosts = document.querySelector(".other-posts");
  ProfilePosts.innerHTML = "";
  if (userPosts.length > 0) {
    userPosts.forEach((post) => {
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `
        <div class="post-user-details">
            <div class="profile-image-container">
              <img
                src="${user.image}"
                alt="Post Author"
                class="profile-image"
              />
            </div>
            <h1>${user.name}</h1>
          </div>
          <div class="post-details">
            <div class="post-image-container">
              <img
                class="post-image"
                src="${post.image}"
                alt="Post Image"
              />
            </div>
            <h1 class="post-title">${post.title}</h1>
            <p class="post-desc">
             ${post.desc}
            </p>
            <div class="like-container">
              <span class="material-symbols-outlined"> favorite </span>
              <span>${post.likes.length || 0} Like</span>
            </div>
          </div>
      `;
      ProfilePosts.appendChild(div);
    });
  } else {
    ProfilePosts.innerHTML = `<p>No posts found.</p>`;
  }

  if (otherPosts.length > 0) {
    otherPosts.forEach((post) => {
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `
        <div class="post-user-details">
            <div class="profile-image-container">
              <img
                src="${post.author.image}"
                alt="Post Author"
                class="profile-image"
              />
            </div>
            <h1>${post.author.name}</h1>
          </div>
          <div class="post-details">
            <div class="post-image-container">
              <img
                class="post-image"
                src="${post.image}"
                alt="Post Image"
              />
            </div>
            <h1 class="post-title">${post.title}</h1>
            <p class="post-desc">
             ${post.desc}
            </p>
            <div class="like-container">
              <span class="material-symbols-outlined"> favorite </span>
              <span>${post.likes.length || 0} Like</span>
            </div>
          </div>
      `;
      OtherPosts.appendChild(div);
    });
  } else {
    OtherPosts.innerHTML = `<p>No posts found.</p>`;
  }
};

const displayPosts = (posts) => {
  const postList = document.getElementById("postList");
  postList.innerHTML = ""; // Clear the existing posts
  if (posts.length > 0) {
    posts.forEach((post) => {
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `
        <div class="post-user-details">
          <div class="profile-image-container">
            <img
              src="${post.author.image || "https://via.placeholder.com/40"}"
              alt="${post.author.name || "User"} Profile"
              class="profile-image"
            />
          </div>
          <h1>${post.author.name || "User Name"}</h1>
        </div>
        <div class="post-details">
          <div class="post-image-container">
            <img
              class="post-image"
              src="${post.image || "https://via.placeholder.com/300"}"
              alt="Post Image"
            />
          </div>
          <h1 class="post-title">${post.title || "Post Title"}</h1>
          <p class="post-desc">${post.desc || "No description available."}</p>
          <div class="like-container">
            <span class="material-symbols-outlined">favorite</span>
            <span>${post.likes.length || 0} Likes</span>
          </div>
        </div>
      `;
      postList.appendChild(div);
    });
  } else {
    postList.innerHTML = `<p>No posts found.</p>`;
  }
};

const searchPosts = () => {
  const searchTerm = postSearchInput.value.toLowerCase().trim();
  if (searchTerm === "") {
    displayPosts(otherPosts);
  } else {
    const filteredPosts = otherPosts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm)
    );
    displayPosts(filteredPosts);
  }
};

window.onload = () => {
  FetchUser();
  CheckUserSession();
  activeLinks();
  FetchUsers();
};
