const express = require("express");
const router = express.Router();
const { db } = require("../config/database");
const { checkUser } = require("../middleware/auth");
const uploadImage = require("../config/cloudinary");

router.get(`/contents`, async (req, res) => {
  try {
    const contents = await db.collection("contents").find().toArray();
    if (!contents) {
      return res.status(404).json({
        message: "No contents found",
      });
    }
    res.json({
      message: "Contents fetched successfully",
      contents: contents,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.get(`/contents/:id`, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await db.collection("contents").findOne({
      _id: id,
    });
    if (!content) {
      return res.status(404).json({
        message: "Content not found",
      });
    }
    res.json({
      message: "Content fetched successfully",
      content: content,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.post(`/contents`, checkUser, async (req, res) => {
  try {
    const { title, body } = req.body;
    const file = req.file;
    const userId = req.user.id;

    const user = await db.collection("users").findOne({
      _id: userId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const fileUpload = await uploadImage(file);
    if (fileUpload.error) {
      return res.status(500).json({
        message: "Error in image upload",
      });
    }
    const content = await db.collection("contents").insertOne({
      title: title,
      author: userId,
      image: fileUpload.url,
      body: body,
      userId: userId,
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (!content) {
      return res.status(404).json({
        message: "Error found creating content",
      });
    }
    res.json({
      message: "Content created successfully",
      content: content,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.delete(`/contents/:id`, checkUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const user = await db.collection("users").findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const content = await db.collection("contents").findOne({
      _id: id,
    });
    if (!content) {
      return res.status(404).json({
        message: "Content not found",
      });
    }

    if (content.userId !== userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await db.collection("contents").deleteOne({
      _id: id,
    });

    res.json({
      message: "Content deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.post(`/like`, checkUser, async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.user.id;

    const user = await db.collection("users").findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await db.collection("contents").updateOne(
      {
        _id: contentId,
      },
      {
        $push: {
          likes: userId,
        },
      }
    );

    res.json({
      message: "Content liked successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.delete(`/like`, checkUser, async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.user.id;

    const user = await db.collection("users").findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await db.collection("contents").updateOne(
      {
        _id: contentId,
      },
      {
        $pull: {
          likes: userId,
        },
      }
    );

    res.json({
      message: "Content liked successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports= router;