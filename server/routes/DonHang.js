import {
    index,
    show,
    create,
    update,
    remove,
    momo,
    filter,
    exportexcel,
    updateShipment
  } from "../controllers/DonHangController.js";
  import passport from "../../services/passport/index.js";
  import express from "express";
  import { middleware as query } from "../querymen.js";
  const router = express.Router();
  
  router.get('/',query(),index)
  router.get('/filter',query(),filter)
  router.get('/exportexcel',query(),exportexcel)

  router.get('/:id',show)
  router.post('/',passport.authenticate('jwt', { session: false }), create)
  router.put('/:id',passport.authenticate('jwt', { session: false }),update)
  router.delete('/:id',passport.authenticate('jwt', { session: false }),remove)
  router.post('/momo', momo)
  router.post('/updateShipment', updateShipment);
  export default router;
  