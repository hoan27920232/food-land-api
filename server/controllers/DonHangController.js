import DonHang from "../models/DonHang.js";
import SanPham from "../models/SanPham.js";
import Discount from "../models/Discount.js";
import { request_momo } from "../../services/momo/index.js";
import crypto from "crypto";
import pug from "pug";
import { sendGmail } from "../../services/nodemailer/index.js";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const index = ({ querymen: { query, select, cursor } }, res, next) => {
  if (query.keywords) {
    // query.keywords = cleanAccents(query.keywords)
    query.keywords =
      query.keywords instanceof RegExp
        ? query.keywords
        : new RegExp(query.keywords, "i");
  }
  DonHang.count(query)
    .then((count) => {
      return DonHang.find(query, select, cursor)
        .sort({ createdAt: -1 })
        .populate({
          path: "items.sanpham",
          fields: "DonGia",
          populate: {
            path: "AnhMoTa",
            fields: "source",
            options: { withDeleted: true },
          },
          options: { withDeleted: true },
        })
        .populate({
          path: "MaKhachHang",
          options: { withDeleted: true },
        })
        .populate({
          path: "MaTaiKhoan",
          options: { withDeleted: true },
        })
        .populate({
          path: "MaDiscount",
          options: { withDeleted: true },
        })
        .then((donhang) => ({
          result: {
            totalCount: count,
            totalPage: Math.ceil(count / cursor.limit),
            pageSize: cursor.limit,
            pageNo: Math.floor(cursor.skip / cursor.limit) + 1,
            data: donhang,
          },
        }));
    })

    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
};
const filter = ({ querymen: { query, select, cursor } }, res, next) => {
  DonHang.count(query)
    .then((count) => {
      return DonHang.find(query)
        .populate({
          path: "items.sanpham",
          fields: "DonGia",
          populate: {
            path: "AnhMoTa",
            fields: "source",
            options: { withDeleted: true },
          },
          // options: { withDeleted: true },
        })
        .populate({
          path: "MaKhachHang",
          options: { withDeleted: true },
        })
        .populate({
          path: "MaTaiKhoan",
          options: { withDeleted: true },
        })
        .then((donhang) => ({
          data: donhang,
        }));
    })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
};
const show = async ({ params }, res) => {
  let q;
  if (Number(params.id)) {
    q = { _id: params.id };
  } else {
    q = { slug: params.id };
  }
  DonHang.findOne(q)
    .populate("items.sanpham")
    .then((p) => p)
    .then((data) => {
      return res.status(200).json({ data });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
};
const exportexcel = ({ querymen: { query, select, cursor } }, res, next) => {
  const now = new Date();

  query.filter = {
    createdAt: {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1)
    }
  }
  DonHang.count(query)
    .then((count) => {
      return DonHang.find(query)
        .populate({
          path: "items.sanpham",
          fields: "DonGia",
          populate: {
            path: "AnhMoTa",
            fields: "source",
            options: { withDeleted: true },
          },
          // options: { withDeleted: true },
        })
        .populate({
          path: "MaKhachHang",
          options: { withDeleted: true },
        })
        .populate({
          path: "MaTaiKhoan",
          options: { withDeleted: true },
        })
        .then((donhang) => ({
          data: donhang,
        }));
    })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res.status(500).json({ message: err.message });
    });
};
const create = async (req, res) => {
  try {
    let tongTien = 0;
    if (req.body.items && req.body.items.length) {
      const products = await SanPham.find({
        _id: { $in: req.body.items.map((i) => i.sanpham._id) },
      });
      const discount = await Discount.findOne({ _id: req.body.MaDiscount });
      if (products && products.length) {
        let notice = "";
        let count = 0;
        for (const [index, item] of req.body.items.entries()) {
          const p = products.find(
            (i) => i._id.toString() === item.sanpham._id.toString()
          );
          if (!p) {
            count = count + 1;
            notice =
              notice +
              `Không tìm thấy sản phẩm có id bằng ${item.sanpham.code}\n`;
          } else if (p.SoLuong < 1) {
            count = count + 1;
            notice = notice + `Sản phẩm có id bằng ${p.code} đã hết hàng\n`;
          } else if (p.SoLuong < item.soluong) {
            count = count + 1;
            notice =
              notice + `Sản phẩm có id bằng ${p.code} không đủ số lượng \n`;
          } else {
            req.body.items[index].sanpham = p;
            console.log(p, "San pham")
            if(p.GiamGia > 0) {
              tongTien += item.soluong * p.DonGia * (1 - p.GiamGia / 100)
            } else {
              tongTien += item.soluong * p.DonGia
            }
          }
        }
        if (count > 0) {
          return res.status(500).json({ message: notice });
        }
      } else {
        return res
          .status(500)
          .json({ message: "Không tìm thấy sản phẩm nào phù hợp" });
      }
      if (discount) {
        tongTien =
        tongTien *
            (100 - discount.discount) /
          100;
      }
    }

    DonHang.create({ ...req.body, TongTien: tongTien })
      .then((donhang) =>
        donhang.populate([
          {
            path: "items.sanpham",
            fields: "AnhMoTa TenSanPham",
            populate: {
              path: "AnhMoTa",
              fields: "source",
              options: { withDeleted: true },
            },
          },
        ])
      )
      .then(async (data) => {
        const newData = data;
        let payUrl = "";
        if (data.KieuThanhToan == "momo") {
          payUrl = await request_momo(data);
        }
        return { data, payUrl };
      })
      .then(async (data) => {
        const adminTitle = "New order from Tay Bac";
        await sendGmail({
          to: data.data.email || "allfallsdown20@gmail.com",
          subject: `New order from Tay Bac.com [${data.data._id}]`,
          message: pug.renderFile(`${__dirname}/template.pug`, {
            title: adminTitle,
            order: data.data,
          }),
        });
        return data;
      })
      .then((data) => {
        return res.status(200).json({ data });
      })
      .catch((err) => {
        return res.status(500).json({ message: err.message });
      });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const momo = async (req, res) => {
  try {
    const partnerCode = req.body.partnerCode;
    const orderId = req.body.orderId;
    const amount = req.body.amount;
    const orderInfo = req.body.orderInfo;
    const requestId = req.body.requestId;
    const extraData = req.body.extraData;
    const accessKey = process.env.ACCESS_KEY;
    const secretkey = process.env.SECRET_KEY;
    const message = req.body.message;
    const orderType = req.body.orderType;
    const resultCode = req.body.resultCode;
    const payType = req.body.payType;
    const transId = req.body.transId;
    const responseTime = req.body.responseTime;
    var signatureReceive = req.body.signature;
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    var signature = crypto
      .createHmac("sha256", secretkey)
      .update(rawSignature)
      .digest("hex");
    if (signatureReceive !== signature) {
      return res.status(500).json({ err: "Signature wrong" });
    }
    if (resultCode != 0) {
      return res.status(400).json({ err: "The trans doesnt finish" });
    } else {
      DonHang.findOneAndUpdate(
        { _id: orderId.split("-")[1] },
        { TinhTrangThanhToan: 1 }
      )
        .then((data) => res.status(200).json(data))
        .catch((err) => res.status(500).json(err));
    }
    return res.status(200).json({ data: req.body });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
const update = async (req, res) => {
  try {
    let tongTien = 0;
    let order = await DonHang.findById(req.params.id);
    if (order) {
      if (req.body.items && req.body.items.length) {
        const products = await SanPham.find({
          id: { $in: req.body.items.map((i) => i.sanpham._id) },
        });
        const discount = await Discount.findOne({ _id: req.body.Discount });
        if (products && products.length) {
          for (const [index, item] of req.body.items.entries()) {
            const p = products.find((i) => {
              return i._id.toString() === item.sanpham._id.toString();
            });
            if (!p) {
              return res.status(500).json({
                message: `Không tìm thấy sản phẩm id = ${item.sanpham}`,
              });
            } else if (
              p.SoLuong < 1 &&
              !order.items
                .map((i) => i.sanpham._id.toString())
                .includes(p._id.toString())
            ) {
              return res
                .status(500)
                .json({ message: `Sản phẩm id = ${p.code} đã hết hàng` });
            } else if (
              p.SoLuong < item.soluong - item.soluongcu &&
              order.items
                .map((i) => i.sanpham._id.toString())
                .includes(p._id.toString())
            ) {
              return res
                .status(500)
                .json({ message: `Sản phẩm id = ${p.code} không đủ số lượng` });
            } else {
              console.log(item.soluong, p.DonGia, "Update")
              req.body.items[index].sanpham = p;
              if(p.GiamGia > 0) {
                tongTien += item.soluong * p.DonGia * (1 - p.GiamGia / 100)
              } else {
                tongTien += item.soluong * p.DonGia

              }
            }
          }
        } else {
          return res
            .status(500)
            .json({ message: "Không tìm thấy sản phẩm nào phù hợp" });
        }
        if (discount) {
          tongTien =
            tongTien *
              (100 - discount.discount) /
            100;
        } 
      }
    }
    req.body.TongTien = tongTien
    order = await Object.assign(order, req.body).save();
    return res.status(200).json(order);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: err.message });
  }
};
const remove = async (req, res) => {
  DonHang.findById({ _id: req.params.id })
    .then((data) => (data ? data.remove() : null))
    .then(() => res.status(201).json({ message: "Delete success" }))
    .catch((err) => res.status(500).json({ message: err.message }));
};
const updateShipment = async (req, res) => {
  try{
    const { partner_id, status_id} = req.body
  if(status_id == 4) {
    let order = await DonHang.findById(partner_id);
    order.TrangThai = 2
    await order.save()
  } else if (status_id == -1 || status_id == 9) {
    let order = await DonHang.findById(partner_id);
    order.TrangThai = -1
    await order.save()
  } 
  else if (status_id == 5) {
    let order = await DonHang.findById(partner_id);
    order.TrangThai = 3
    order.NgayHoanThanh = Date.now()
    await order.save()
  }
  return res.status(200).json("Update order")
  }catch(err) {
    console.log(err)
    return res.status(500).json("Err")
  }
}
export { index, create, update, remove, show, momo, filter, exportexcel, updateShipment };
