import mongoose from "mongoose";
import AutoInrement from "mongoose-sequence";
import mongoose_delete from "mongoose-delete";
import mongooseKeywords from "mongoose-keywords";
import { cleanAccents } from "../../services/format/index.js";

const AutoIncrement = AutoInrement(mongoose);
const Schema = mongoose.Schema;

const discountSchema = new Schema(
  {
    _id: Number,
    code: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

discountSchema.plugin(mongooseKeywords, {
  paths: ["_id", "code"],
});
discountSchema.plugin(AutoIncrement, { id: "discount_id", inc_field: "_id" });
discountSchema.plugin(mongoose_delete, {
  deletedAt: true,
  overrideMethods: "all",
  withDeleted: true,
});
const discount = mongoose.model("DanhMucBlog", discountSchema);
export default discount;
