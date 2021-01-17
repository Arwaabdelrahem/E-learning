const express = require("express");
const app = express();

require("./startup/DB")();
require("./startup/routes")(app);
require("./startup/production")(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
