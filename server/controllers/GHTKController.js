import axiosClient from "../../services/axios/ghtkAxios.js";
import axios from "axios";
import donhangs from "../models/DonHang.js";
const calculateShip = async (req, res) => {
  try {
    const pick_province = "Hà Nội";
    const pick_district = "Đan Phượng";
    const deliver = "none";
    const cal = await axiosClient.get(
      `${process.env.API_GHTK}/services/shipment/fee`,
      {
        headers: {
          Token: process.env.TOKEN_GHTK,
        },
        params: {
          pick_province,
          pick_district,
          province: req.query.province,
          district: req.query.district,
          weight: req.query.weight * 1000,
          deliver_option: deliver,
        },
      }
    );
    return res.status(200).json({ ship: cal });
  } catch (err) {
    console.log(err);
  }
};
const postOrderGHTK = async (req, res) => {
  let ghtkToken = process.env.TOKEN_GHTK;
  // let getListPick = await axiosClient.get(
  //   "/services/shipment/list_pick_add",
  //   {
  //     headers: {
  //       Token: ghtkToken,
  //     },
  //   }
  // );

  // getListPick = getListPick.data[0];
  const pick_name = 'Đỗ Bá Hoàn';
  const pick_address = 'Số nhà 01,  Ngách 9/4 cụm 10, Đan Phượng, Hà Nội';
  const pick_province = "Hà Nội";
  const pick_district = "Đan Phượng";
  const pick_tel = '0354732260';
  // console.log(getListPick);
  if (ghtkToken) {
    const orderFullInfo = req.body;
    orderFullInfo.order = {
      ...orderFullInfo.order,
      pick_name,
      pick_address,
      pick_province,
      pick_district,
      pick_tel
    };
    console.log(orderFullInfo);
    try {
      const result = await axiosClient.post('/services/shipment/order/?ver=1.5', 
        orderFullInfo
      )
      if (result.success === true) {
        console.log("succes---------------------");
        const orderUpdated = await donhangs.updateOne({ id: orderFullInfo.order.id }, { TrangThai: 1 })
        res.json({
          success: true,
          message: result.message,
        });
      } else {
        res.json({
          success: false,
          message: result.message,
        });
      }
    } catch (err) {
      console.log(err);
      res.json({
        success: false,
        message: `Không thêm được đơn vào hệ thống GHTK: ${err}`,
      });
    }
  } else {
    res.json({
      success: false,
      message: `Không lấy được token GHTK`,
    });
  }
};
const deleteGHTK = async (req,res) => {
  const result = await axiosClient.post(`/services/shipment/cancel/partner_id:${req.params.id}`)

  if (result.success === true){
    res.json({
      success: true,
      message: result.message,
    });
  } else {
    res.json({
      success: false,
      message: result.message,
    });
  }
}
export { calculateShip, postOrderGHTK, deleteGHTK };
