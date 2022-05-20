import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import AutoInrement from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";
import mongooseKeywords from "mongoose-keywords";
import { cleanAccents } from "../../services/format/index.js";

const AutoIncrement = AutoInrement(mongoose);
const Schema = mongoose.Schema;
export const addressSchema = new Schema({
  // postCode: {
  //   type: String,
  //   maxlength: 10,
  // },
  provinceOrCity: {
    name: {
      type: String,
      maxlength: 30,
      required: true,
    },
    id: {
      type: String,
      maxlength: 10,
      required: true,

    },
    pid: {
      type: String,
      maxlength: 10,
    },
    code: {
      type: String,
      maxlength: 10,
      required: true,
    },
  },
  district: {
    name: {
      type: String,
      maxlength: 30,
      required: true,
    },
    id: {
      type: String,
      maxlength: 10,
      required: true,
    },
    pid: {
      type: String,
      maxlength: 10,
    },
    code: {
      type: String,
      maxlength: 10,
      required: true,
    },
  },
  ward: {
    name: {
      type: String,
      maxlength: 30,
      required: true,
    },
    id: {
      type: String,
      maxlength: 10,
      required: true,
    },
    pid: {
      type: String,
      maxlength: 10,
    },
    code: {
      type: String,
      maxlength: 10,
      required: true,
    },
  },
  DiaChiDetail: {
    type: String,
    maxlength: 100,
    required: true,
  },
})
const khachhangSchema = new Schema({
  _id: Number,
  TenKhachHang: {
    type: String,
    required: true,
  },
  DiaChi: addressSchema,
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  SDT: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  NgaySinh: {
    type: Date,
    // required: true,
  },
  TrangThai: {
    type: Boolean,
    required: true
  },
  resetPassLink: {
    type: String,
  }
}, { timestamps: true, _id: false });

khachhangSchema.pre("save",async function (next){
  try{
    const khachHang = this;
  if(khachHang.isModified("password"))
  {
    console.log(khachHang.password)
    khachHang.password = await bcrypt.hash(khachHang.password,10)
  }
  next()
  }catch(err){
    console.log(err)
  }
})
khachhangSchema.plugin(mongooseKeywords, {
  paths: ["_id", "SDT", "TenKhachHang"]
});
khachhangSchema.plugin(AutoIncrement, { id: "customer_id", inc_field: "_id" });
khachhangSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
  withDeleted: true
});
const khachang = mongoose.model("KhachHang", khachhangSchema);
export default khachang;