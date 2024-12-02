const express = require("express");
const router = express.Router();
const { db } = require("../config/database");
const { checkUser } = require("../middleware/auth");

router.post(`/follow`, checkUser, async (req, res) => {
  try {
    const { opponentId } = req.body;
    const userId = req.user.id;

    const user = await db.collection("users").findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const opponent = await db.collection("users").findOne({
      _id: opponentId,
    });

    if (!opponent) {
      return res.status(404).json({
        message: "Opponent not found",
      });
    }

    await db.collection("users").updateOne(
      {
        _id: opponentId,
      },
      {
        $push: {
          followers: { _id: userId, name: user.name },
        },
      }
    );

    await db.collection("users").updateOne(
      {
        _id: userId,
      },
      {
        $push: {
          following: { _id: opponentId, name: opponent.name },
        },
      }
    );

    res.json({
      message: "Followed successfully",
    });
  } catch (error) {
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
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const opponent = await db.collection("users").findOne({
      _id: opponentId,
    });

    if (!opponent) {
      return res.status(404).json({
        message: "Opponent not found",
      });
    }

    // Remove user from followers
    await db.collection("users").updateOne(
      {
        _id: opponentId,
      },
      {
        $pull: {
          followers: { _id: userId },
        },
      }
    );

    // Remove user from following
    await db.collection("users").updateOne(
      {
        _id: userId,
      },
      {
        $pull: {
          following: { _id: opponentId },
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

module.exports= router;

