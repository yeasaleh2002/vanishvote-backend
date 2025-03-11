require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize, Op, Poll, Comment } = require("./models/index");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/api/poll", async (req, res) => {
  try {
    const { question, options, expiresIn, isPrivate } = req.body;
    let expiresAt;
    if (typeof expiresIn === "string") {
      expiresAt = new Date(expiresIn);
    } else if (typeof expiresIn === "number") {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    } else {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 
    }

    if (isNaN(expiresAt.getTime())) {
      return res.status(400).json({ error: "Invalid expiration date" });
    }

    const formattedExpiresAt = expiresAt
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const poll = await Poll.create({
      question,
      options,
      expiresIn: formattedExpiresAt,
      votes: [],
      isPrivate: isPrivate || false,
    });

    res.status(201).json({
      message: "Poll created successfully",
      poll,
      pollLink: `${req.protocol}://${req.get("host")}/poll/${poll.id}`,
    });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ error: "Failed to create poll" });
  }
});

app.post("/api/poll/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIndex } = req.body;

    const poll = await Poll.findByPk(id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    if (poll.expired || new Date() > new Date(poll.expiresIn)) {
      return res.status(400).json({ error: "Poll has expired" });
    }

    const updatedVotes = [...poll.votes, optionIndex];
    await poll.update({ votes: updatedVotes });

    res.status(200).json({ message: "Vote recorded" });
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ error: "Failed to record vote" });
  }
});

app.get("/api/poll/:id/results", async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findByPk(id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    const results = poll.votes.reduce((acc, vote) => {
      acc[vote] = (acc[vote] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({ results });
  } catch (error) {
    console.error("Error getting poll results:", error);
    res.status(500).json({ error: "Failed to get results" });
  }
});

app.get("/api/poll/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findByPk(id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    res.status(200).json(poll);
  } catch (error) {
    console.error("Error getting poll details:", error);
    res.status(500).json({ error: "Failed to get poll details" });
  }
});

app.post("/api/poll/:id/comment", async (req, res) => {
  try {
    const { id } = req.params;
    let { text } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Comment text cannot be empty" });
    }

    text = text.trim();

    const poll = await Poll.findByPk(id);
    if (!poll) return res.status(404).json({ error: "Poll not found" });

    const newComment = await Comment.create({ pollId: id, text });

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.get("/api/poll/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.findAll({ where: { pollId: id } });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ error: "Failed to get comments" });
  }
});

setInterval(async () => {
  try {
    await Poll.update(
      { expired: true },
      { where: { expiresIn: { [Op.lte]: new Date() } } }
    );
  } catch (error) {
    console.error("Error expiring polls:", error);
  }
}, 60000);

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
