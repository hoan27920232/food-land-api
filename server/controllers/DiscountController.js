import { cleanAccents } from '../../services/format/index.js'
import Discount from '../models/Discount.js'
'use strict'
const index = ({ querymen: { query, select, cursor } }, res, next) => {
  if (query.keywords) {
    query.keywords = (query.keywords instanceof RegExp) ? query.keywords : new RegExp((query.keywords), 'i')
  }
    Discount.count(query)
    .then((count) => {
      return Discount.find(query, select, cursor).sort({ createdAt: -1 }).then((discount) => ({
        result: {
          totalCount: count,
          totalPage: Math.ceil(count / cursor.limit),
          pageSize: cursor.limit,
          pageNo: Math.floor(cursor.skip / cursor.limit) + 1,
          data: discount,
        },
      }))
    })  
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return  res.status(500).json({ message: err.message})
    });
}
const show = ({ params }, res, next) => {
    let q;
    if (Number(params.id)) {
      q = { _id: params.id };
    }
    if(q)
    Discount.findOne(q)
      .then((p) => (p))
      .then((data) => {
        return res.status(200).json({data});
      })
      .catch((err) =>  res.status(500).json({ message: err.message}));
  else return res.status(500).json({ message: 'Id is not a number '})
}
const create = (req, res) => {
  Discount.create(req.body)
    .then(() => {
      return res.status(200).json({ msg: 'Add discount success'});
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).json({ message: err.message})
    });
}

const update = ( req, res) => {
  
  Discount.findOneAndUpdate({  _id: req.params.id }, req.body)
    .then(() => res.status(201).json({ message: "Update success" }))
    .catch((err) =>  res.status(500).json({ message: err.message}));
}

const remove = (req, res) => {
  Discount.deleteById({  _id: req.params.id })
    .then(() => res.status(201).json({ message: "Delete success" }))
    .catch((err) =>  res.status(500).json({ message: err.message}));
}


const getByCode = async(req, res) => {
  Discount.findOne({ code : req.params.id })
      .then((data) => {
        return res.status(200).json({data});
      })
      .catch((err) =>  res.status(500).json({ message: err.message}));
}
export { index, create, update, remove, show, getByCode }