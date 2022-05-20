import mongoose from "mongoose";
import mongooseSlug from "mongoose-slug-generator";
import mongooseKeywords from "mongoose-keywords";
import AutoInrement from "mongoose-sequence";
import dayjs from "dayjs";
import { cleanAccents } from "../../services/format/index.js";
const AutoIncrement = AutoInrement(mongoose);
const Schema = mongoose.Schema;
const sanphamSchema = new Schema(
  {
    codeCounter: Number,
    code: {
      type: String,
      maxlength: 20,
      unique: true,
    },
    TenSanPham: {
      type: String,
      required: true,
    },
    DonGia: {
      type: Number,
      required: true,
    },
    KhoiLuong: {
      type: Number,
      required: true,
    },
    MoTa: {
      type: String,
    },
    SoLuong: {
      type: Number,
      min: 0,
      required: true,
    },
    SoLuongDaBan: {
      type: Number,
      min: 0,
      required: true,
    },
    // slug: {
    //   type: String,
    //   slug: "TenSanPham",
    //   unique: true,
    // },
    Comments: [
      {
        name: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 0,
          max: 5,
        },
      },
    ],
    AnhMoTa: [
      {
        type: Number,
        ref: "HinhAnh",
        required: true
      },
    ],
    DanhMucSP: {
      type: Number,
      ref: "DanhMucSanPham",
      required: true,
    },
    averageRating: {
      type: Number,
      default: 5,
    },
    GiamGia: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    NgayHetHan: {
      type: Date,
      required:true,
    },
    slug: { type: String, slug: "TenSanPham" }
  },
  { timestamps: true }
);
// sanphamSchema.methods = {
//   view(full) {
//     const view = {
//       _id: this._id,
//       TenSanPham: this.TenSanPham,
//       slug: this.slug,
//       DonGia: this.DonGia,
//       AnhMoTa: this.AnhMoTa,
//       SoLuong: this.SoLuong,
//       SoLuongDaBan: this.SoLuongDaBan,
//       DanhMucSP: this.DanhMucSP,
//       MoTa: this.MoTa,
//       NgayKhoiTao: this.createdAt,
//     };
//     return full
//       ? {
//           ...view,
//           MoTa: this.MoTa,
//         }
//       : view;
//   },
// };
mongoose.plugin(mongooseSlug);
sanphamSchema.path("codeCounter").set(function (counter) {
  this.code = `PRODUCT-${new Date().getFullYear()}${counter
    .toString()
    .padStart(6, "0")}`;
  return counter;
});
// sanphamSchema.path("Comments").set(function (Comments) {
//   console.log("Hello comments", Comments.map((p) => p.rating).reduce((a, b) => a + b, 0), Comments)
//   this.avarageRating = Comments.map((p) => p.rating).reduce((a, b) => a + b, 0);
//   return Comments;
// });
sanphamSchema.plugin(AutoIncrement, { inc_field: "codeCounter" });

sanphamSchema.plugin(mongooseKeywords, {
  paths: ["code", "TenSanPham"],
});
// sanphamSchema.plugin(mongoSlug, {
//   tmpl: "<%=TenSanPham%>-<%=dayjs(new Date()).format('YYYY-MM-DD-HH-mm-ss')%>",
//   locals: { dayjs },
// });
// sanphamSchema.plugin(AutoIncrement, { id: "product_id", inc_field: "_id" });
// sanphamSchema.plugin(mongoose_delete, {
//   deletedAt: true,
//   overrideMethods: "all",
//   withDeleted: true
// });

const sanpham = mongoose.model("SanPham", sanphamSchema);
export default sanpham;
