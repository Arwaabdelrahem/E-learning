const mongoose = require("mongoose");
const config = require("config");

// config.get("DB");
module.exports = function () {
  mongoose
    .connect(
      "mongodb+srv://Arwaabdelrahem:mongo@cluster0.xse5n.mongodb.net/E-learning?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    )
    .then(() => {
      console.log("MongoDB connected");
    });
};
