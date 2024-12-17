/**
 * AdminAuth.js
 * @description :: model of a database collection user
 */
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import idValidator from "mongoose-id-validator";
import bcrypt from "bcrypt";

const myCustomLabels = {
  totalDocs: "itemCount",
  docs: "data",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "paginator",
};

mongoosePaginate.paginate.options = { customLabels: myCustomLabels };

const { Schema } = mongoose;

const schema = new Schema(
  {
    fullname: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "Invalid email address",
      },
    },
    password: { 
      type: String, 
      select: false, 
      required: true 
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

schema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  delete object.password;
  return object;
});

schema.plugin(mongoosePaginate);
schema.plugin(idValidator);

const Admin = mongoose.model("Admin", schema);

export default Admin;
