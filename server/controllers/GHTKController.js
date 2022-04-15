import axiosClient from "../../services/axios/index.js";
const calculateShip = async (req, res) => {
  try {
    // const getListPick = await axiosClient.get(`https://services.ghtklab.com/services/shipment/list_pick_add`, {
    //     headers: {
    //         Token: process.env.TOKEN_GHTK
    //     }
    // })
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
  let ghtkToken = process.env.TOKEN_GHTK


  if (ghtkToken) {
    const orderFullInfo = req.body
    try {
      const result = await axios({
        method: 'post',
        // Đường dẫn môi trường thật
        url: `${process.env.API_GHTK}/services/shipment/order/?ver=1.5`,
        // Đường dẫn cho môi trường thử nghiệm
        // url: 'https://services.ghtklab.com/services/shipment/order/?ver=1.5',
        headers: {
          Token: ghtkToken,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify(orderFullInfo),
        crossdomain: true,
        timeout: 10000,
      })
      if (result.data.success === true) {
        // Update order fulfillmentStatus to shipped
        const orderUpdated = await Order.updateOne({ code: orderFullInfo.order.id }, { fulfillmentStatus: 'shipped' })
        res.json({
          success: true,
          message: result.data.message,
        })
      } else {
        res.json({
          success: false,
          message: result.data.message,
        })
      }
    } catch (err) {
      res.json({
        success: false,
        message: `Không thêm được đơn vào hệ thống GHTK: ${err}`,
      })
    }
  } else {
    res.json({
      success: false,
      message: `Không lấy được token GHTK`,
    })
  }
}
export { calculateShip, postOrderGHTK };
