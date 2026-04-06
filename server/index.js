// Load env from current directory or parent directory
require("dotenv").config();
require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const Chat = require("./models/Chat");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// OpenAI Setup
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    console.warn("⚠️ Warning: OPENAI_API_KEY is not set or is invalid. AI responses will fail.");
  }
  const isOpenRouter = apiKey && apiKey.startsWith("sk-or-");
  openai = new OpenAI({
    apiKey: apiKey || "dummy-key-to-prevent-crash",
    baseURL: isOpenRouter ? "https://openrouter.ai/api/v1" : undefined,
  });
} catch (e) {
  console.error("Failed to initialize OpenAI client:", e.message);
}

// Database Connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/ai_tutor";
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// API Endpoint for Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, grade, board } = req.body;

    if (!message || !grade || !board) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
      // Free Fallback mode with simple keyword matching
      const userText = message.toLowerCase();
      let fallbackReply = "";

      if (userText.includes("fraction") || userText.includes("pizza") || userText.includes("divide")) {
        fallbackReply = "That's a fantastic math question! In mathematics, a fraction represents a part of a whole. Imagine you have a pizza and you divide it into four equal pieces. If you eat one piece, you've eaten 1/4 of the pizza!";
      } else if (userText.includes("algebra") || userText.includes("x ") || userText.includes("variable")) {
        fallbackReply = "Great question! In algebra, we use letters like 'x' or 'y' to represent numbers we don't know yet. It's like a mystery box, and our goal is to figure out what number is hiding inside the box!";
      } else if (userText.includes("geometry") || userText.includes("shape") || userText.includes("area")) {
        fallbackReply = "Geometry is fun! The area is simply the amount of space inside a shape. If you have a rectangle, you just multiply how long it is by how wide it is!";
      } else {
        const genericResponses = [
          "Let's solve this math problem step-by-step! First, look at the numbers and choose an operation. What do you think is the first step?",
          "That is a great math question! How would you write this out as an equation?",
          "Hmm, let me think! That's a fun puzzle. Can we break the numbers down into smaller, easier pieces?"
        ];
        fallbackReply = genericResponses[Math.floor(Math.random() * genericResponses.length)];
      }

      return res.json({ reply: `[Simulated] ${fallbackReply}` });
    }

    const systemPrompt = `You are a friendly Math tutor designed to give precise and context-aware answers for students from grade ${grade} studying the ${board} board curriculum.

Steps you must follow:
1. Understand the intent behind the student's input.
2. Identify key details in the question.
3. Decide the best possible answer matching their grade level.
4. Respond clearly without repeating or rambling.

Behavior rules:
- Never repeat the same sentence unnecessarily
- Never ignore user intent
- If input is vague, ask a follow-up question
- Explain mathematical concepts simply and break problems down step-by-step

Output style:
- Clear
- Direct
- Non-repetitive
- Helpful
- Concise (as it will be spoken by a text-to-speech engine)`;

    const key = process.env.OPENAI_API_KEY || "";
    const completion = await openai.chat.completions.create({
      model: key.startsWith("sk-or-") ? "openai/gpt-4o-mini" : "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 300,
    });

    const reply = completion.choices[0].message.content;

    // Save to database
    const newChat = new Chat({
      grade,
      board,
      userMessage: message,
      aiReply: reply,
    });
    await newChat.save();

    res.json({ reply });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
