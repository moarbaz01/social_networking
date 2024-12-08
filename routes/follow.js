const express = require("express");
const router = express.Router();
const { db } = require("../config/database");
const { checkUser } = require("../middleware/auth");
const { ObjectId } = require("mongodb");

router.post(`/follow`, checkUser, async (req, res) => {
  try {
    const { opponentId } = req.body;
    const userId = req.user.id;
    console.log("userid", userId, req.user);
    console.log("opponentid", opponentId);

    const user = await db.collection("users").findOne({
      _id: ObjectId.createFromHexString(userId),
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const opponent = await db.collection("users").findOne({
      _id: ObjectId.createFromHexString(opponentId),
    });

    if (!opponent) {
      return res.status(404).json({
        message: "Opponent not found",
      });
    }

    const isFollowing = user.following.includes(opponentId);
    if (isFollowing) {
      return res.status(400).json({
        message: "You are already following this user",
      });
    }

    await db.collection("users").updateOne(
      {
        _id: ObjectId.createFromHexString(opponentId),
      },
      {
        $push: {
          followers: userId,
        },
      }
    );

    await db.collection("users").updateOne(
      {
        _id: ObjectId.createFromHexString(userId),
      },
      {
        $push: {
          following: opponentId,
        },
      }
    );

    res.json({
      message: "Followed successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.delete(`/follow/:id`, checkUser, async (req, res) => {
  try {
    const opponentId = req.params.id;
    const userId = req.user.id;

    const user = await db.collection("users").findOne({
      _id: ObjectId.createFromHexString(userId),
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const opponent = await db.collection("users").findOne({
      _id: ObjectId.createFromHexString(opponentId),
    });

    if (!opponent) {
      return res.status(404).json({
        message: "Opponent not found",
      });
    }
    const isFollowing = user.following.includes(opponentId);
    if (!isFollowing) {
      return res.status(400).json({
        message: "You are not following this user",
      });
    }

    // Remove user from followers
    await db.collection("users").updateOne(
      {
        _id: ObjectId.createFromHexString(opponentId),
      },
      {
        $pull: {
          followers: userId,
        },
      }
    );

    // Remove user from following
    await db.collection("users").updateOne(
      {
        _id: ObjectId.createFromHexString(userId),
      },
      {
        $pull: {
          following: opponentId,
        },
      }
    );

    res.json({
      message: "Unfollowed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;
