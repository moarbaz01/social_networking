const express = require("express");
const router = express.Router();
const { db } = require("../config/database");
const jwt = require("jsonwebtoken");
const { checkUser } = require("../middleware/auth");

router.post(`/users`, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email);
    const userExists = await db.collection("users").findOne({
      email: email,
    });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const user = await db.collection("users").insertOne({
      name: name,
      email: email,
      image: `https://ui-avatars.com/api/?background=random&name=${
        name.split(" ")[0]
      }`,
      password: password,
      posts: [],
      followers: [],
      following: [],
    });

    res.json({
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.get(`/users`, checkUser, async function (req, res) {
  try {
    const users = await db.collection("users").find().toArray();
    if (!users) {
      return res.status(404).json({
        message: "No users found",
      });
    }
    res.json({
      message: "Users fetched successfully",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// Login user
router.post(`/login`, async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({
      email: email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User is not found, please signup first",
      });
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: "Password is incorrect",
      });
    }

    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
        id: user._id,
      },
      "secret",
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "User logged in successfully",
      token,
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.get(`/login`, checkUser, async function (req, res) {
  try {
    const email = req.user.email;
    const user = await db.collection("users").findOne({
      email: email,
    });
    console.log(user);

    if (!user) {
      return res.status(404).json({
        message: "User is not found, please signup first",
      });
    }

    res.json({
      message: "User fetched successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.delete(`/login`, checkUser, async function (req, res) {
  try {
    res.json({
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;
