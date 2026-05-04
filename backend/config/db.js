const mongoose = require("mongoose");

class Database {
  static instance = null;

  constructor() {
    this.connection = null;
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect() {
    if (this.connection) return;
    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error.message);
      process.exit(1);
    }
  }
}

module.exports = Database;
