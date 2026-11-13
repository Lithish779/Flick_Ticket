// authController.js

// const User = require("../models/User");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// exports.register = async(req,res)=>{
//     try{
//         const {name,email,password} = req.body;

//         const hash = await bcrypt.hash(password,10);

//         const user = await User.create({
//             name,
//             email,
//             password:hash
//         });

//         res.json(user);
//     }catch(err){
//         res.status(500).json(err);
//     }
// };

// exports.login = async(req,res)=>{
//     try{
//         const {email,password} = req.body;

//         const user = await User.findOne({email});
//         if(!user) return res.status(404).send("User not found");

//         const match = await bcrypt.compare(password,user.password);
//         if(!match) return res.status(400).send("Wrong password");

//         const token = jwt.sign({id:user._id},process.env.JWT_SECRET);

//         res.json({token,user});
//     }catch(err){
//         res.status(500).json(err);
//     }
// };





const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const userId = user._id || user.id || user;
  const userRole = user.role || "user";
  const userEmail = user.email || "";
  const userName = user.name || "";

  return jwt.sign(
    { id: userId, _id: userId, role: userRole, email: userEmail, name: userName },
    process.env.JWT_SECRET || "supersecretjwtkey_flickticket_2026",
    { expiresIn: "7d" }
  );
};

// ✅ REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists (case-insensitive)
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hash,
      role: "user",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Case-insensitive user lookup
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ GOOGLE AUTH (LOGIN / REGISTER)
exports.googleAuth = async (req, res) => {
  try {
    const { name, email, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required for Google login" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-register user with Google profile
      const randomPassword = Math.random().toString(36).slice(-10) + "Aa1!";
      const hash = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        password: hash,
        role: "user",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      token: generateToken(user),
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).json({ message: err.message || "Google auth failed" });
  }
};