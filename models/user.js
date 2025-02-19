// // User.js
// // @description :: model of a database collection user

// import mongoose from "mongoose";
// import mongoosePaginate from "mongoose-paginate-v2";
// import idValidator from "mongoose-id-validator";
// import bcrypt from "bcrypt";

// const { Schema } = mongoose;

// const myCustomLabels = {
//   totalDocs: "itemCount",
//   docs: "data",
//   limit: "perPage",
//   page: "currentPage",
//   nextPage: "next",
//   prevPage: "prev",
//   totalPages: "pageCount",
//   pagingCounter: "slNo",
//   meta: "paginator",
// };

// mongoosePaginate.paginate.options = { customLabels: myCustomLabels };

// const schema = new Schema(
//   {
//     fullName: { type: String },
//     password: { type: String },
//     mobileNo: { type: String },

//     profileImage: { type: String, default: "" },

//     email: { type: String, required: true },
//     isverify: { type: Boolean, default: false },
//     isBan: { type: Boolean, default: false },
//     banReason: { type: String, default: "" },
//     otp: { type: String, default: "" },
//     isActive: { type: Boolean },
//   },
//   {
//     timestamps: {
//       createdAt: "createdAt",
//       updatedAt: "updatedAt",
//     },
//   }
// );

// schema.pre("save", async function (next) {
//   this.isDeleted = false;
//   this.isActive = true;
//   if (this.password && this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 8);
//   }
//   next();
// });

// schema.pre("insertMany", async function (next, docs) {
//   if (docs && docs.length) {
//     for (const element of docs) {
//       element.isDeleted = false;
//       element.isActive = true;
//     }
//   }
//   next();
// });

// schema.methods.isPasswordMatch = async function (password) {
//   return bcrypt.compare(password, this.password);
// };

// schema.method("toJSON", function () {
//   const { _id, __v, ...object } = this.toObject({ virtuals: true });
//   object.id = _id;
//   delete object.password;
//   return object;
// });

// schema.plugin(mongoosePaginate);
// schema.plugin(idValidator);

// const User = mongoose.model("User", schema);
// export default User;
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import idValidator from "mongoose-id-validator";

const { Schema } = mongoose;

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

const schema = new Schema(
  {
    fullName: { type: String },
    name: String,
    password: { type: String }, // Keep plain password (no hash)
    mobileNo: { type: String },
    image: String,
    profileImage: { type: String, default: "" },
    email: { type: String, required: true },
    isverify: { type: Boolean, default: false },
    isBan: { type: Boolean, default: false },
    banReason: { type: String, default: "" },
    otp: { type: String, default: "" },
    isActive: { type: Boolean },
    role: {
      type: String,
      enum: ["Viewer", "Writer", "Client", "Subscriber"],
      default: "Viewer",
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// Remove bcrypt logic as we are no longer hashing passwords
schema.pre("save", async function (next) {
  this.isDeleted = false;
  this.isActive = true;
  next();
});

schema.pre("insertMany", async function (next, docs) {
  if (docs && docs.length) {
    for (const element of docs) {
      element.isDeleted = false;
      element.isActive = true;
    }
  }
  next();
});

// Remove password match method as it's not needed now
schema.method("toJSON", function () {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;
  delete object.password;
  return object;
});

schema.plugin(mongoosePaginate);
schema.plugin(idValidator);

const User = mongoose.model("User", schema);
export default User;
