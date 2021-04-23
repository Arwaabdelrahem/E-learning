const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(cors());
app.use(helmet());
require("./startup/routes")(app);
require("./startup/production")(app);

const server = http.createServer(app);
module.exports = {
  up: (cb) => {
    // let server = app.listen(process.env.PORT);
    server.listen(process.env.PORT || 3000);
    server.on("listening", cb);
    server.on("error", function (err) {
      console.error(err.message.red);
    });

    require("./socketServer").up(server);
  },
};
