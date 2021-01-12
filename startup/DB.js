const mongoose = require("mongoose");
const config = require("config");

config.get("DB");
module.exports = function () {
  mongoose
    .connect(config.get("DB"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log("MongoDB connected");
    });
};
