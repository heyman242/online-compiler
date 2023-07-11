const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');


const { generateFile } = require("./generateFile");
const { addJobToQueue } = require("./jobQueue");
const Job = require("./models/job");

const mongoURI = "mongodb://localhost:27017"

const connectToMongo = async () => {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(mongoURI); 
      console.log('Mongo connected');
    } catch (error) {
      console.log(error);
      process.exit();
    }
  };
  
  
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.post("/run", async (req, res) => {
    const { language = "cpp", code } = req.body;
  
    console.log(language, "Length:", code.length);
  
    if (code === undefined) {
      return res.status(400).json({ success: false, error: "Empty code body!" });
    }
    // need to generate a c++ file with content from the request
    const filepath = await generateFile(language, code);
    // write into DB
    const job = await new Job({ language, filepath }).save();
    const jobId = job["_id"];
    addJobToQueue(jobId);
    res.status(201).json({ jobId });
  });
  
  app.get("/status", async (req, res) => {
    const jobId = req.query.id;
  
    if (jobId === undefined) {
      return res
        .status(400)
        .json({ success: false, error: "missing id query param" });
    }
  
    const job = await Job.findById(jobId);
  
    if (job === undefined) {
      return res.status(400).json({ success: false, error: "couldn't find job" });
    }
  
    return res.status(200).json({ success: true, job });
  });


connectToMongo()
  .then(() => {
    app.listen(5000, () => {
      console.log(`Listening on port 5000!`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });