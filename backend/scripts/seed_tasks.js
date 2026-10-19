const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const Task = require("../models/Task");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task_manager";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding sample tasks...");

  const count = await Task.countDocuments();
  console.log(`Current document count: ${count}`);

  if (count < 50) {
    const needed = 55 - count;
    console.log(`Adding ${needed} sample tasks to make cache benchmarking distinct...`);
    const categories = ["Frontend", "Backend", "Security", "DevOps", "Database", "Testing", "Optimization", "Architecture"];
    const priorities = ["low", "medium", "high"];
    const sampleDocs = [];

    for (let i = 1; i <= needed; i++) {
      const cat = categories[i % categories.length];
      const prio = priorities[i % priorities.length];
      sampleDocs.push({
        title: `Portfolio Task #${count + i}: Implement ${cat} Module Feature`,
        description: `Production task #${count + i} covering ${cat} component implementation, rigorous unit test assertions, responsive UI integration, and database query index profiling.`,
        completed: i % 3 === 0,
        priority: prio,
      });
    }

    const inserted = await Task.insertMany(sampleDocs);
    console.log(`Successfully seeded ${inserted.length} sample tasks!`);
  }

  const newCount = await Task.countDocuments();
  console.log(`Total tasks in database now: ${newCount}`);
  await mongoose.disconnect();
}

seed().catch(console.error);
