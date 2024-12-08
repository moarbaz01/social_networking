let isUser = false;
let user = null;
let users = [];
let otherPosts = [];
let userPosts = [];
let filteredPosts = [];
let filteredUsers = [];
let editingPostId = null;
const baseUrl = "http://localhost:5000/M00976117";

const headerLogo = document.getElementById("header-logo");

headerLogo.addEventListener("click", () => {
  if (isUser) {
    setCurrentPage("home");
  }
});

const setCurrentPage = (pageId) => {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });
};

const handleResize = () => {
  const phoneNav = document.querySelector("#phone-nav");
  if (window.innerWidth < 768) {
    phoneNav.style.display = isUser ? "flex" : "none";
  } else {
    phoneNav.style.display = "none";
  }
};

const CheckUserSession = () => {
  const authButtons = document.querySelectorAll(".auth-buttons");
  const logoutButton = document.querySelector("#logout-button");
  const createPostButton = document.querySelector(".create-post-button");

  const ul = document
    .getElementById("header-links-container")
    .querySelector("ul");

  authButtons.forEach((button) => {
    button.style.display = isUser ? "none" : "block";
  });
  logoutButton.style.display = isUser ? "block" : "none";
  ul.style.display = isUser ? "flex" : "none";
  createPostButton.style.display = isUser ? "block" : "none";

  if (isUser) SetProfile();
};

const activeLinks = () => {
  const setPageOnClick = (element) => {
    element.addEventListener("click", () => {
      setCurrentPage(element.textContent.toLowerCase().trim());
    });
  };

  document
    .querySelectorAll(
      "#header-links-container ul li, #phone-nav ul li, .auth-buttons"
    )
    .forEach(setPageOnClick);
};

const FetchUsers = async () => {
  const token = localStorage.getItem("fitness-web-token");
  if (!token) return;
  try {
    const res = await fetch(`${baseUrl}/users`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      users = data.users;
    }
  } catch (error) {
    alert(error.message);
  }
};

const SetProfile = () => {
  const profile = document.querySelector("#profile");
  const { name, followers, following, posts, image, bio } = user;
  profile.querySelector(".profile-name").textContent = name;
  profile.querySelector(".profile-stats-followers").textContent =
    followers.length;
  profile.querySelector(".profile-stats-following").textContent =
    following.length;
  profile.querySelector(".profile-stats-posts").textContent = posts.length;
  profile.querySelector(".profile-image").src = image;
  profile.querySelector(".profile-bio").textContent = bio || "No Bio";
  document.querySelector("#profile-edit-modal-name").value = name;
  document.querySelector("#profile-edit-modal-bio").value = bio;
};

const FollowUser = async (opponentId) => {
  try {
    const res = await fetch(`${baseUrl}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("fitness-web-token")}`,
      },
      body: JSON.stringify({ opponentId }),
    });
    const data = await res.json();
    if (res.ok) {
      users = users.map((item) =>
        item._id === opponentId
          ? { ...item, followers: [...item.followers, user._id] }
          : item
      );
      user.following.push(opponentId);
      SetProfile();
      SetProfileById(opponentId);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    alert(error.message);
  }
};

const UnfollowUser = async (opponentId) => {
  try {
    const res = await fetch(`${baseUrl}/follow/${opponentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("fitness-web-token")}`,
      },
    });
    const data = await res.json();
    if (res.ok) {
      users = users.map((item) =>
        item._id === opponentId
          ? {
              ...item,
              followers: item.followers.filter((id) => id !== user._id),
            }
          : item
      );
      user.following = user.following.filter((id) => id !== opponentId);
      SetProfile();
      SetProfileById(opponentId);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    alert(error.message);
  }
};

const SetProfileById = (id) => {
  const profile = document.querySelector("#profile-view");
  const currentUser = users.find((user) => user._id === id);
  const { name, followers, following, posts, image } = currentUser;

  profile.querySelector(".profile-name").textContent = name;
  profile.querySelector(".profile-stats-followers").textContent =
    followers.length;
  profile.querySelector(".profile-stats-following").textContent =
    following.length;
  profile.querySelector(".profile-stats-posts").textContent = posts.length;
  profile
    .querySelectorAll(".profile-image")
    .forEach((img) => (img.src = image));

  const followButton = profile.querySelector(".follow-button");
  const isFollowed = user.following.includes(currentUser._id);
  followButton.textContent = isFollowed ? "Unfollow" : "Follow";

  const newFollowButton = followButton.cloneNode(true);
  followButton.parentNode.replaceChild(newFollowButton, followButton);
  newFollowButton.addEventListener("click", () =>
    isFollowed ? UnfollowUser(currentUser._id) : FollowUser(currentUser._id)
  );
};

const searchUsers = (e) => {
  const search = e.target.value.trim().toLowerCase();
  const usersList = document.querySelector(".users-list");
  usersList.innerHTML = "";

  if (search.length > 0) {
    filteredUsers = users.filter(
      (item) =>
        item.name?.toLowerCase().includes(search) && item._id !== user._id
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
            <img src="${userImage}" alt="${userName} Profile" class="profile-image" />
          </div>
          <div class="user-info">
            <h1>${userName}</h1>
            <p class="truncate">${user.bio || "No Bio"}</p>
          </div>
        `;
        div.addEventListener("click", () => {
          SetProfileById(user._id);
          SetPostsById(user._id);
          setCurrentPage("profile-view");
        });
        usersList.appendChild(div);
      });
    } else {
      usersList.innerHTML = `<p>No users found.</p>`;
    }
  }
};

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
    await FetchUsers();
    await FetchPosts();
    CheckUserSession();
    SetProfile();
    setCurrentPage("home");
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

const OpenProfileEditModal = () => {
  const postModal = document.getElementById("profile-edit-modal");
  postModal.style.display = "flex";
  document.body.style.overflow = "hidden";
};

const CloseProfileEditModal = () => {
  const postModal = document.getElementById("profile-edit-modal");
  postModal.style.display = "none";
  document.body.style.overflow = "auto";
};
const OpenEditPostModal = (post) => {
  document.getElementById("post-edit-modal-title").value = post.title;
  document.getElementById("post-edit-modal-description").value = post.desc;
  editingPostId = post._id;
  const postModal = document.getElementById("post-edit-modal");
  postModal.style.display = "flex";
  document.body.style.overflow = "hidden";
};

const CloseEditPostModal = () => {
  editingPostId = null;
  const postModal = document.getElementById("post-edit-modal");
  postModal.style.display = "none";
  document.body.style.overflow = "auto";
};

const UpdateProfile = async (e) => {
  e.preventDefault();
  const name = document.getElementById("profile-edit-modal-name").value;
  const bio = document.getElementById("profile-edit-modal-bio").value;
  const password = document.getElementById("profile-edit-modal-password").value;
  const submitButton = e.target.querySelector("button[type='submit']");
  const closeModalButton = document.querySelector(
    "#close-profile-edit-form-button"
  );
  const originalButtonText = submitButton.textContent;
  if (password) {
    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }
  }

  if (name === user.name && bio === user.bio && password === "") {
    alert("No changes made");
    return;
  }
  try {
    submitButton.textContent = "Updating...";
    closeModalButton.disabled = true;
    const res = await fetch(`${baseUrl}/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("fitness-web-token")}`,
      },
      body: JSON.stringify({
        name,
        bio,
        password,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Profile Update successfully");
      await FetchUser("profile");
      SetProfile();
      CloseProfileEditModal();
    } else {
      alert(data.message);
    }
  } catch (error) {
  } finally {
    submitButton.textContent = originalButtonText;
    closeModalButton.disabled = false;
  }
};

const UploadPost = async (e) => {
  e.preventDefault();
  const postImage = document.getElementById("post-modal-image").files[0];
  const postDescription = document.getElementById(
    "post-modal-description"
  ).value;
  const postTitle = document.getElementById("post-modal-title").value;
  const submitButton = e.target.querySelector("button[type='submit']");
  console.log(submitButton);
  const closeModalButton = document.querySelector("#close-post-modal-button");
  const originalButtonText = submitButton.textContent;
  const formData = new FormData();
  formData.append("image", postImage);
  formData.append("desc", postDescription);
  formData.append("title", postTitle);

  e.target.value = "Loading...";
  try {
    submitButton.textContent = "Uploading...";
    closeModalButton.disabled = true;
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
      await FetchPosts();
      SetPosts();
      ClosePostModal();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert(error.message);
  } finally {
    submitButton.textContent = originalButtonText;
    e.target.value = "Upload Post";
    closeModalButton.disabled = false;
  }
};

const FetchUser = async (path) => {
  const token = localStorage.getItem("fitness-web-token");
  if (!token) {
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
    await FetchUsers();
    await FetchPosts();
    SetProfile();
    CheckUserSession();
    setCurrentPage(path || "home");
  } else {
    localStorage.removeItem("fitness-web-token");
    setCurrentPage("login");
  }
  CheckUserSession();
};

const FetchPosts = async () => {
  const token = localStorage.getItem("fitness-web-token");
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
    console.log("Posts", posts);
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
  otherPosts = [];
  users = [];
  userPosts = [];
  activeLinks();
  CheckUserSession();
  setCurrentPage("login");
};

const LikeAndDislike = (isLiked, postId) => {
  if (isLiked) {
    DislikePost(postId);
  } else {
    LikePost(postId);
  }
};

const SetPosts = () => {
  const ProfilePosts = document
    .getElementById("profile")
    .querySelector(".profile-posts");
  const OtherPosts = document.querySelector(".other-posts");

  ProfilePosts.innerHTML = "";
  OtherPosts.innerHTML = "";

  if (userPosts.length > 0) {
    userPosts.forEach((post) => {
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `
        <div class="post-user-details">
            <div class="profile-image-container" style="cursor:pointer">
              <img src="${
                user.image
              }" alt="Post Author" class="profile-image" />
            </div>
            <h1>${user.name}</h1>
            <div class="delete-post" style="cursor:pointer;color : red">
              <span class="material-icons">delete</span>
            </div>
            <div class="edit-post" style="cursor:pointer;color : green">
              <span class="material-icons">edit</span>
            </div>
          </div>
          <div class="post-details">
            <div class="post-image-container">
              <img class="post-image" src="${post.image}" alt="Post Image" />
            </div>
            <h1 class="post-title">${post.title}</h1>
            <p class="post-desc">${post.desc}</p>
            <div class="like-container">
              <span class="material-icons like">favorite</span>
              <span>${post.likes.length || 0} Like</span>
            </div>
          </div>
      `;
      ProfilePosts.appendChild(div);

      const profileImageContainer = div.querySelector(
        ".profile-image-container"
      );
      profileImageContainer.addEventListener("click", () => {
        SetProfileById(user._id);
        SetPostsById(user._id);
        setCurrentPage("profile-view");
      });
      const deletePost = div.querySelector(".delete-post");
      deletePost.addEventListener("click", () => {
        DeletePost(post._id);
      });

      const editPost = div.querySelector(".edit-post");
      editPost.addEventListener("click", () => {
        OpenEditPostModal(post);
      });

      const likeButton = div.querySelector(".like");
      const isLiked = post.likes.includes(user._id);
      if (isLiked) {
        likeButton.classList.add("liked");
      }

      likeButton.addEventListener("click", () => {
        LikeAndDislike(isLiked, post._id);
        likeButton.classList.toggle("liked");
      });
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
            <div class="profile-image-container" style="cursor:pointer">
              <img src="${
                post.author.image
              }" alt="Post Author" class="profile-image" />
            </div>
            <h1>${post.author.name}</h1>
          </div>
          <div class="post-details">
            <div class="post-image-container">
              <img class="post-image" src="${post.image}" alt="Post Image" />
            </div>
            <h1 class="post-title">${post.title}</h1>
            <p class="post-desc">${post.desc}</p>
            <div class="like-container">
              <span class="material-icons like">favorite</span>
              <span>${post.likes.length || 0} Like</span>
            </div>
          </div>
      `;
      OtherPosts.appendChild(div);
      const profileImageContainer = div.querySelector(
        ".profile-image-container"
      );
      profileImageContainer.addEventListener("click", () => {
        SetProfileById(post.author._id);
        SetPostsById(post.author._id);
        setCurrentPage("profile-view");
      });

      const likeButton = div.querySelector(".like");
      const isLiked = post.likes.includes(user._id);
      if (isLiked) {
        likeButton.classList.add("liked");
      }

      likeButton.addEventListener("click", () => {
        LikeAndDislike(isLiked, post._id);
        likeButton.classList.toggle("liked");
      });
    });

    displayPosts(otherPosts);
  } else {
    OtherPosts.innerHTML = `<p>No posts found.</p>`;
  }
};

const SetPostsById = (id) => {
  const ProfilePosts = document
    .getElementById("profile-view")
    .querySelector(".profile-posts");
  ProfilePosts.innerHTML = "";

  const currentUserPosts = otherPosts.filter((post) => post.author._id === id);
  if (currentUserPosts.length > 0) {
    currentUserPosts.forEach((post) => {
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `
        <div class="post-user-details">
            <div class="profile-image-container" style="cursor:pointer">
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
              <span class="material-icons like"> favorite </span>
              <span>${post.likes.length || 0} Like</span>
            </div>
          </div>
      `;
      ProfilePosts.appendChild(div);
      const likeButton = div.querySelector(".like");
      const isLiked = post.likes.includes(user._id);
      if (isLiked) {
        likeButton.classList.add("liked");
      }
      likeButton.addEventListener("click", () => {
        LikeAndDislike(isLiked, post._id);
        likeButton.classList.toggle("liked");
      });
      const profileImageContainer = div.querySelector(
        ".profile-image-container"
      );
      profileImageContainer.addEventListener("click", () => {
        SetProfileById(post.author._id);
        SetPostsById(post.author._id);
        setCurrentPage("profile-view");
      });
    });
  } else {
    ProfilePosts.innerHTML = `<p>No posts found.</p>`;
  }
};

const LikePost = async (postId) => {
  const token = localStorage.getItem("fitness-web-token");
  if (!token) {
    alert("You need to be logged in to like a post.");
    return;
  }

  const res = await fetch(`${baseUrl}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      contentId: postId,
    }),
  });

  const data = await res.json();
  if (res.ok) {
    const profilePost = userPosts.find((post) => post._id === postId);
    if (profilePost) {
      profilePost.likes.push(user._id);
    }

    const otherPost = otherPosts.find((post) => post._id === postId);
    if (otherPost) {
      otherPost.likes.push(user._id);
    }

    SetPosts();
    SetProfile();
    SetPostsById(otherPost.author._id);
  } else {
    alert(data.message);
  }
};

const DislikePost = async (postId) => {
  const token = localStorage.getItem("fitness-web-token");
  if (!token) {
    alert("You need to be logged in to like a post.");
    return;
  }

  const res = await fetch(`${baseUrl}/like/${postId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (res.ok) {
    const profilePost = userPosts.find((post) => post._id === postId);
    if (profilePost) {
      profilePost.likes = profilePost.likes.filter((id) => id !== user._id);
    }

    const otherPost = otherPosts.find((post) => post._id === postId);
    if (otherPost) {
      otherPost.likes = otherPost.likes.filter((id) => id !== user._id);
    }

    SetPosts();
    SetProfile();
    SetPostsById(otherPost.author._id);
  } else {
    alert(data.message);
  }
};

const UpdatePost = async (e) => {
  e.preventDefault();
  const postTitle = document.getElementById("post-edit-modal-title").value;
  const postDescription = document.getElementById(
    "post-edit-modal-description"
  ).value;
  const token = localStorage.getItem("fitness-web-token");
  if (!token) {
    alert("You need to be logged in to update a post.");
    return;
  }

  if (postTitle === "" && postDescription === "") {
    return;
  }
  if (!editingPostId) {
    alert("No post to update");
    return;
  }
  const res = await fetch(`${baseUrl}/contents`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: postTitle,
      desc: postDescription,
      contentId: editingPostId,
    }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("Post updated successfully");
    FetchPosts();
    CloseEditPostModal();
  } else {
    alert(data.message);
  }
};

const displayPosts = (posts) => {
  const postList = document.getElementById("post-list");
  postList.innerHTML = "";
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
         
        </div>
      `;
      postList.appendChild(div);
      const profileImageContainer = div.querySelector(
        ".profile-image-container"
      );
      profileImageContainer.addEventListener("click", () => {
        SetProfileById(post.author._id);
        SetPostsById(post.author._id);
        setCurrentPage("profile-view");
      });
    });
  } else {
    postList.innerHTML = `<p>No posts found.</p>`;
  }
};

const DeletePost = async (contentId) => {
  const token = localStorage.getItem("fitness-web-token");
  if (!token) {
    alert("You need to be logged in to delete a post.");
    return;
  }

  const res = await fetch(`${baseUrl}/contents/${contentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (res.ok) {
    alert("Post deleted successfully");
    userPosts = userPosts.filter((post) => post._id !== contentId);
    SetPosts();
  } else {
    alert(data.message);
  }
};

const searchPosts = (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  if (searchTerm === "") {
    displayPosts(otherPosts);
  } else {
    const filteredPosts = otherPosts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm)
    );
    displayPosts(filteredPosts);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  FetchUser();
  CheckUserSession();
  activeLinks();
});
