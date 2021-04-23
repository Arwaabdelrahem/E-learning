require("dotenv").config();

const database = require("./startup/DB");
const server = require("./server");

(() => {
  database.connect(function () {
    console.info("Mongodb is connected");
    server.up(function () {
      console.info("Server is listening at", this.address().port);
      console.info("Enjoy!");
    });
  });
})();
