const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const materialSchema = mongoose.Schema({
  link: {
    type: String,
  },
  course: {
    type: Number,
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
materialSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Material",
  startAt: 1,
});

const Material = mongoose.model("Material", materialSchema);

module.exports.Material = Material;
