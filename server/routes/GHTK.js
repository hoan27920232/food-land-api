import passport from "../../services/passport/index.js";
import express from "express";
import axiosClinet from "../../services/axios/index.js";
const router = express.Router();

router.get("/vnlocations/:parent", async function (req, res, next) {
  const parentId = req.params.parent || 0;
  const result = await axiosClinet.get(
    `https://khachhang.giaohangtietkiem.vn/khach-hang/services/list-dia-chi?parentId=${parentId}`
  );
  return res.json(result);
});
//   router.get('/listPickAdd', getPickAddresses)
//   router.get('/shipFee', getShipFee)
//   router.post('/postOrder', postOrderGHTK)
export default router;
