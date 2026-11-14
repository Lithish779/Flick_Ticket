// snackController.js

const Snack = require("../models/Snack");
const mongoose = require("mongoose");

const FALLBACK_SNACKS = [
  {
    _id: "snack_001",
    name: "Classic Salted Popcorn",
    category: "Popcorn",
    price: 210,
    image:
      "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=400&q=80",
    theatre: "IMAX",
  },
  {
    _id: "snack_002",
    name: "Gourmet Cheese Caramel Duo",
    category: "Popcorn",
    price: 280,
    image:
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=400&q=80",
    theatre: "IMAX",
  },
  {
    _id: "snack_003",
    name: "Mexican Salsa Nachos",
    category: "Nachos",
    price: 240,
    image:
      "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80",
    theatre: "IMAX",
  },
  {
    _id: "snack_004",
    name: "Chilled Cold Coffee",
    category: "Beverages",
    price: 160,
    image:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=400&q=80",
    theatre: "IMAX",
  },
  {
    _id: "snack_005",
    name: "Sparkling Fizzy Cola",
    category: "Beverages",
    price: 130,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80",
    theatre: "IMAX",
  },
];

// ➤ Add snack (Admin)
exports.addSnack = async (req, res) => {
  try {
    const snack = await Snack.create({
      ...req.body,
      name: req.body.name.trim(),
      theatre: req.body.theatre.trim(),
    });
    res.json(snack);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➤ Get snacks by theatre
exports.getSnacksByTheatre = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(FALLBACK_SNACKS);
    }
    const theatre = req.params.theatre ? req.params.theatre.trim() : "";
    const snacks = await Snack.find({
      theatre: { $regex: `^${theatre}$`, $options: "i" },
    }).maxTimeMS(2500);
    if (!snacks || snacks.length === 0) {
      return res.json(FALLBACK_SNACKS);
    }
    res.json(snacks);
  } catch (err) {
    res.json(FALLBACK_SNACKS);
  }
};

// Get ALL snacks (Admin)
exports.getAllSnacks = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(FALLBACK_SNACKS);
    }
    const snacks = await Snack.find().maxTimeMS(2500);
    if (!snacks || snacks.length === 0) {
      return res.json(FALLBACK_SNACKS);
    }
    res.json(snacks);
  } catch (err) {
    res.json(FALLBACK_SNACKS);
  }
};

exports.getAllSnacks = async(req,res)=>{
  try{
    const snacks = await Snack.find();
    res.json(snacks);
  }catch(err){
    res.status(500).json(err);
  }
};



// Update snack
exports.updateSnack = async (req,res)=>{
  try{
    const snack = await Snack.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true}
    );
    res.json(snack);
  }catch(err){
    res.status(500).json(err);
  }
};

// Delete snack
exports.deleteSnack = async (req,res)=>{
  try{
    await Snack.findByIdAndDelete(req.params.id);
    res.json({message:"Snack deleted"});
  }catch(err){
    res.status(500).json(err);
  }
};
