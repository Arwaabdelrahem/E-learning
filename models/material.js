const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

const materialSchema = mongoose.Schema({
  link: {
    type: String,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  type: {
    type: String,
    enum: ["videoLink", "Image"],
  },
  description: {
    type: String,
  },
});

materialSchema.plugin(pagination);
const Material = mongoose.model("Material", materialSchema);

module.exports.Material = Material;
