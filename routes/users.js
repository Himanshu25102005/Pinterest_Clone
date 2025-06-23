const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Naya_Pin_DB");
const plm = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  profileImage: String,
  contact: Number,
  board: {
    type: Array,
    default: [],
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

userSchema.plugin(plm);
module.exports = mongoose.model("user", userSchema);
