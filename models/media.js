const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const mediaSchema = new mongoose.Schema(
  {
    file: {},
  },
  { timestamps: true }
);

mediaSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      file: doc.file,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

mediaSchema.plugin(pagination);
mediaSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Media",
  startAt: 1,
});

const Media = mongoose.model("Media", mediaSchema);
module.exports.Media = Media;
