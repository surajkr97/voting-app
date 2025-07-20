const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  username: { type: String, required: true },
  party: { type: String, required: true },
  age: { type: Number, required: true },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  voteCount: { type: Number, default: 0 },
});

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
