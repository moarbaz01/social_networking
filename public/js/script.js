let user = null;
let currentSection = "login-page";

function setCurrentSection(sectionId) {
  const sections = document.querySelectorAll(".page");
  sections.forEach((section) => {
    section.style.display = "none";
  });

  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.style.display = "flex";
  }
}

const SignUpUser = async (e) => {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector("#signup-email").value;
  const name = form.querySelector("#signup-name").value;
  const password = form.querySelector("#signup-password").value;

  const res = await fetch("http://localhost:5000/raju/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      name,
      password,
    }),
  });

  if (res.ok) {
    alert("Successfully Registered");
    setCurrentSection("home");
  } else {
    alert("Error found");
  }
};

const setProfile = () => {
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  userName.textContent = user.name;
  userEmail.textContent = user.email;
};
const LoginUser = async (e) => {
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector("#login-email").value;
  const password = form.querySelector("#login-password").value;

  const res = await fetch("http://localhost:5000/raju/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    const token = data.token;
    user = data.user;
    setProfile();
    hideHeaderButtons();
    localStorage.setItem("fitness-app-token", token);
    setCurrentSection("home");
  } else {
    alert("Error found");
  }
};
const hideHeaderButtons = () => {
  const headerButtons = document.querySelectorAll(".header-btn");
  headerButtons.forEach((button) => {
    button.style.display = "none";
  });
  const logoutButton = document.getElementById("logout-btn");
  const searchButton = document.getElementById("search-btn");
  logoutButton.style.display = "block";
  searchButton.style.display = "block";
};

const showHeaderButtons = () => {
  const headerButtons = document.querySelectorAll(".header-btn");
  headerButtons.forEach((button) => {
    button.style.display = "block";
  });
  const logoutButton = document.getElementById("logout-btn");
  const searchButton = document.getElementById("search-btn");
  logoutButton.style.display = "none";
  searchButton.style.display = "none";
};

const LogoutUser = () => {
  localStorage.removeItem("fitness-app-token");
  setProfile();
  user = null;
  setCurrentSection("login-page");
  showHeaderButtons();
};

const fetchUser = async () => {
  const token = localStorage.getItem("fitness-app-token");
  if (!token) {
    setCurrentSection("login-page");
    return;
  }
  const res = await fetch("http://localhost:5000/raju/login", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    const data = await res.json();
    user = data.user;
    setProfile();
    setCurrentSection("home");
    hideHeaderButtons();
  }
};

window.onload = () => {
  fetchUser();
};
