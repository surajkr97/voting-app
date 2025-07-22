const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

//POST Route, Create a new user
router.post("/signup", async (req, res) => {
  try {

    // Only one admin is allowed, check if an admin already exists
    if (req.body.role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(400).json({ error: "An admin already exists." });
      }
    }

    //Assuming the request body contains the User data
    const data = req.body;

    //Create a new User document using the Mongoose model
    const newUser = new User(data);

    //Save the new user to the database
    const response = await newUser.save();
    console.log("data saved");

    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token is: ", token);

    res.status(200).json({ response: response, token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route, get token
router.post("/login", async (req, res) => {
  try {
    //Extract aadharCardNumber and password from request body
    const { aadharCardNumber, password } = req.body;

    //Find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    //If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    //generate Token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    //return token as response
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

//Fetch Current User by Auth Token, Profile
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Profile Password Update
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    //Extract the id from the token
    const userId = req.user.id;

    //Extract current and new passwords from request body
    const { currentPassword, newPassword } = req.body;

    //Find the user by userId
    const user = await User.findById(userId);

    //If password does not match, return error
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    //Update the user's password
    user.password = newPassword;
    await user.save();

    console.log("password updated");
    res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;
