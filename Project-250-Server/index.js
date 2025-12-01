const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const multer = require("multer");
require("dotenv").config();
const jwt = require('jsonwebtoken');
const generateToken = require('./generateToken');


const {
  router: complainRouter,
  setComplainCollections,
} = require("./complain");
const { router: laundryRouter, setLaundryCollections } = require("./laundry");
const { router: rommsRouter, setRoomsCollection } = require("./rooms");
const { router: menuRouter, setMenuCollection } = require("./menu");
const CartRoutes = require("./routes/CartRoutes");
const OrderRoutes = require("./routes/OrderRoutes");
const NotFound = require("./middlewares/NotFound");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 🔹 MongoDB Setup
const uri = `mongodb+srv://${process.env.USERID}:${process.env.PASSWORD}@cluster0.rdbtijm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let usersCollection;
let complainCollection;
let seatApplicationCollection;
let roomsCollection;
let laundryCollection;
let menuCollection;

async function connectDB() {
  try {
    await client.connect();
    console.log("✅Connected to MongoDB");

    const db = client.db(process.env.MONGO_DB || "HallMannagement");
    usersCollection = db.collection("users");
    complainCollection = db.collection("complains");
    seatApplicationCollection = db.collection("seatApplications");
    roomsCollection = db.collection("rooms");
    laundryCollection = db.collection("laundry");
    menuCollection = db.collection("menu");

    // Attach collection setters
    setComplainCollections({ complainCollection });
    setLaundryCollections({ laundryCollection });
    setRoomsCollection({ roomsCollection });
    setMenuCollection({ menuCollection });

    // Register routes

    console.log("✅ Collections set successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

app.use("/api/order",OrderRoutes);
app.use("/api/cart",CartRoutes);
app.use("/api/laundry", laundryRouter);
app.use("/api/rooms", rommsRouter);
app.use("/api/menu", menuRouter);
app.use("/api", complainRouter);


app.use(NotFound);

// 🔹 Multer Configuration for Seat Application
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/login', async (req,res)=>{
  try{
    const {email, password} = req.body;
    const user = await usersCollection.findOne({email});
    if(user && user.password === password){
      const token = generateToken({id:user._id,role:user.role});
      res.status(200).json({token:token});
    }
    else{
      res.status(400).json({Message: "Invalid Credentials"});
    }
  }
  catch(err){
    res.status(500).json({message: err.message});
  }
})

// 🔹 Seat Application Routes
app.post("/seat-application", upload.single("proofFile"), async (req, res) => {
  try {
    const applicationData = req.body;
    const proofFile = req.file;

    if (
      !applicationData.roomType ||
      !applicationData.floor ||
      !applicationData.block ||
      !applicationData.department ||
      !applicationData.cgpa ||
      !applicationData.semester
    ) {
      return res
        .status(400)
        .json({ message: "Missing required application data." });
    }

    const newApplication = {
      ...applicationData,
      proofFile: proofFile
        ? {
            filename: proofFile.originalname,
            mimetype: proofFile.mimetype,
            size: proofFile.size,
            uploadStatus: "received",
          }
        : null,
      status: "submitted",
      createdAt: new Date(),
      timeline: [
        {
          status: "submitted",
          note: "Application submitted",
          date: new Date(),
        },
      ],
    };

    const result = await seatApplicationCollection.insertOne(newApplication);
    res.status(201).json({
      message: "Application submitted successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error submitting seat application:", error);
    res
      .status(500)
      .json({ message: "Failed to submit application", error: error.message });
  }
});

// 🔹 Fetch all seat applications
app.get("/seat-applications", async (req, res) => {
  try {
    const applications = await seatApplicationCollection.find().toArray();
    res.status(200).json(applications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch applications", error: error.message });
  }
});

app.post("/register-student", async (req, res,next) =>{
  let token;
    if(req.headers.authorization
        && req.headers.authorization.startsWith('Bearer')
    ){
        try{
            token = req.headers.authorization.split(' ')[1];
            const payload = jwt.verify(token, process.env.JWT_KEY);
            const role = payload.role;
            
            // req.user = await User.findById(payload.id).select('-password');
            if(role === "admin")next();
            else res.status(400).json({Message:"Not Admin"});
        }
        catch(err){
          res.status(400).json({Message: "Invalid token"});
        }
      }
      else{
        res.status(400).json({Message: "No token"});
      }


});

// 🔹 Student Registration
app.post("/register-student", async (req, res) => {
  try {
    const { name, studentId, email, phone, password, role, room, avatar } =
      req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const assignedRole = role || "student";

    const newUser = {
      uid: userRecord.uid,
      studentId: studentId || `ST-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      phone: phone || "N/A",
      role: assignedRole,
      room: room || "Not assigned",
      avatar:
        avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      createdAt: new Date(),
    };

    // ✅ Step 2: Try inserting into MongoDB
    try {
      const result = await usersCollection.insertOne(newUser);
      console.log("User inserted in MongoDB with id:", result.insertedId);
    } catch (mongoErr) {
      // 🚨 Step 3: Rollback Firebase user if MongoDB insert fails
      console.error("MongoDB insertion failed:", mongoErr);
      return res
        .status(500)
        .json({ message: "Failed to save user data. User rolled back." });
    }

    res.status(201).json({
      message: "Student registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error registering student:", error);

    res
      .status(500)
      .json({ message: "Failed to register student", error: error.message });
  }
});

// 🔹 Get & Delete Users
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (user?.uid)
      await admin
        .auth()
        .deleteUser(user.uid)
        .catch(() => {});
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(result.deletedCount ? 200 : 404).json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// 🔹 Root Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

connectDB()
.then(()=>{
    console.log("connected to DB");
    app.listen(port,()=>{
        console.log(`listening to port ${port}`);
    })
})
.catch((err)=>{
    console.log("error occurred.");
    console.log(err);
});
