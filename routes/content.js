const express = require("express");
const router = express.Router();
const { db } = require("../config/database");
const { checkUser } = require("../middleware/auth");
const uploadImage = require("../config/cloudinary");
const { ObjectId } = require("mongodb");

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

router.put(`/contents`, checkUser, async (req, res) => {
  try {
    const { title, desc, contentId } = req.body;
    const id = req.user.id;
    console.log(contentId, title);

    const user = await db.collection("users").findOne({
      _id: ObjectId.createFromHexString(id),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const content = await db.collection("contents").updateOne(
      { _id: ObjectId.createFromHexString(contentId) },
      {
        $set: { title: title, desc: desc },
      }
    );
    if (!content) {
      return res.status(404).json({
        message: "Error found creating content",
      });
    }

    res.json({
      message: "Content created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});
router.post(`/contents`, checkUser, async (req, res) => {
  try {
    const { title, desc } = req.body;
    const file = req.files?.image;
    if (req.files) {
      console.log("Req files: ", req.files?.image);
    }
    const id = req.user.id;

    const user = await db.collection("users").findOne({
      _id: ObjectId.createFromHexString(id),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { password, ...userWithoutPassword } = user;

    const fileUpload = await uploadImage(file);
    if (fileUpload.error) {
      return res.status(500).json({
        message: "Error in image upload",
      });
    }
    const content = await db.collection("contents").insertOne({
      title: title,
      image: fileUpload.url,
      desc: desc,
      author: userWithoutPassword,
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (!content) {
      return res.status(404).json({
        message: "Error found creating content",
      });
    }

    await db.collection("users").updateOne(
      {
        _id: ObjectId.createFromHexString(id),
      },
      {
        $push: {
          posts: content,
        },
      }
    );
    res.json({
      message: "Content created successfully",
      content: content,
    });
  } catch (error) {
    console.log(error);
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
      _id: ObjectId.createFromHexString(userId),
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const content = await db.collection("contents").findOne({
      _id: ObjectId.createFromHexString(id),
    });
    if (!content) {
      return res.status(404).json({
        message: "Content not found",
      });
    }

    if (content.author._id != userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    await db.collection("contents").deleteOne({
      _id: ObjectId.createFromHexString(id),
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
    console.log(contentId);
    const user = await db.collection("users").findOne({
      _id: ObjectId.createFromHexString(userId),
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const content = await db.collection("contents").findOne({
      _id: ObjectId.createFromHexString(contentId),
    });

    const isLiked = content.likes.includes(userId);
    if (isLiked) {
      return res.status(400).json({
        message: "Content already liked",
      });
    }
    await db.collection("contents").updateOne(
      {
        _id: ObjectId.createFromHexString(contentId),
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

router.delete(`/like/:id`, checkUser, async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.user.id;
    console.log(contentId);
    const user = await db.collection("users").findOne({
      _id: ObjectId.createFromHexString(userId),
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const content = await db.collection("contents").findOne({
      _id: ObjectId.createFromHexString(contentId),
    });

    const isLiked = content.likes.includes(userId);
    if (!isLiked) {
      return res.status(400).json({
        message: "Content not liked",
      });
    }

    await db.collection("contents").updateOne(
      {
        _id: ObjectId.createFromHexString(contentId),
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

module.exports = router;
