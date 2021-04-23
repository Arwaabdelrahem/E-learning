const mongoose = require("mongoose");

module.exports = {
  connect: (cb) => {
    return mongoose
      .connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      })
      .then(() => {
        cb();
      })
      .catch((err) => {
        console.error(err.message.red);
        process.exit(1);
      });
  },
};
