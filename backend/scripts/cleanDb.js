const mongoose = require("mongoose");

async function clean() {
  await mongoose.connect("mongodb://127.0.0.1:27017/task_manager");
  const users = mongoose.connection.collection("users");
  
  // Remove googleId from any document where it is null
  const unsetOp = {};
  unsetOp["$unset"] = { googleId: "" };
  await users.updateMany({ googleId: null }, unsetOp);
  
  // Remove test users
  const delRes = await users.deleteMany({ email: { $in: ["p7student@charusat.edu.in", "auth.tester@example.com"] } });
  console.log("Cleanup done. Deleted test users:", delRes.deletedCount);
  await mongoose.disconnect();
}

clean().catch(console.error);
