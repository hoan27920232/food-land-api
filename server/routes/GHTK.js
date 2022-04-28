import passport from "../../services/passport/index.js";
import express from "express";
import axiosClient from "../../services/axios/index.js";
import {calculateShip, postOrderGHTK, deleteGHTK} from '../controllers/GHTKController.js'
const router = express.Router();

router.get("/vnlocations/:parent", async function (req, res, next) {
  const parentId = req.params.parent || 0;
  const result = await axiosClient.get(
    `https://khachhang.giaohangtietkiem.vn/khach-hang/services/list-dia-chi?parentId=${parentId}`
  );
  return res.json(result);
});
router.get('/calculateShip',calculateShip);
//   router.get('/listPickAdd', getPickAddresses)
//   router.get('/shipFee', getShipFee)
  router.post('/postOrder', postOrderGHTK)
  router.post('/deleteOrder/:id', deleteGHTK)
export default router;
