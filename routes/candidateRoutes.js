const express = require("express");
const router = express.Router();
const Candidate = require("../models/candidate");
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");
const { find } = require("lodash");

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    if(user.role === 'admin') {
      return true;
    }
  } catch (error) {
    return false;
  }
};


//POST Route, Create a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
     if (! await checkAdminRole(req.user.id)) {
      return res
        .status(403)
        .json({ error: "Access denied. Only admins can update candidates." });
    }

    //Assuming the request body contains the candidate data
    const data = req.body;

    //Create a new candidate document using the Mongoose model
    const newCandidate = new Candidate(data);

    //Save the new candidate to the database
    const response = await newCandidate.save();
    console.log("data saved");
    res.status(200).json({ response: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//Candidate ID
router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    //Check if the user is an admin
    if (!checkAdminRole(req.user.id)) {
      return res
        .status(403)
        .json({ error: "Access denied. Only admins can update candidates." });
    }

    
    const candidateID = req.params.candidateID; //Extract candidate ID from the request parameters
    const updatedCandidateData = req.body; //Extract the updated data from the request body

    //Find the candidate by ID and update it
    const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
      new: true,
      runValidators: true, // Run mongoose validators
    });

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.log("Candidate updated successfully");
    res.status(200).json({ response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//Delete a candidate
router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    //Check if the user is an admin
    if (!checkAdminRole(req.user.id)) {
      return res
        .status(403)
        .json({ error: "Access denied. Only admins can delete candidates." });
    }

    const candidateID = req.params.candidateID; //Extract candidate ID from the request parameters

    //Find the candidate by ID and delete it
    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.log("Candidate deleted successfully");
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// let's start voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res)=>{
  const candidateID = req.params.candidateID;
  const userId = req.user.id;

  try{

    //Find the candidate with the specified candidateId
    const candidate = await Candidate.findById(candidateID);
    if(!candidate){
      return res.status(404).json({message: "Candidate not found"});
    }

    // Find the user by userId
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message: "User not found"});
    }

    if(user.isVoted){
      res.status(400).json({message: "You have already voted"});
    }

    if(user.role == "admin"){
      res.status(403).json({message: "Admin is not allowed"});
    }

     //Update the candidate document to record the vote
     candidate.votes.push({userId});
     candidate.voteCount++;
     await candidate.save();

     // Update the user document
     user.isVoted = true;
     await user.save();

     res.status(200).json({message: "Vote recorded successfully"});

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

 // Vote Count
 router.get('/vote/count', async (req, res)=>{
  try{
    //Find all candidates and sort them by voteCount in descending order
    const candidate = await Candidate.find().sort({voteCount: 'desc'});

    //Map the candidates to only return their name and voteCount
    const voteRecord = candidate.map((data)=>{
      return{
        party: data.party,
        count: data.voteCount
      }
    });
    return res.status(200).json({voteRecord});

  } catch(err){
    console.log(err);
    res.status(500).json({error: "Internal Server Error"});
  }
 });

module.exports = router;
