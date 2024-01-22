import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 25,
    },
    email: {
      type: String,
      trim: true,
      requried: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);

userSchema.methods.isPasswordMatch = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    next();
  };
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt)
})


export default mongoose.model("user", userSchema);
