const express = require("express");
const { getAllAndroidProducts } = require("../../components/product/fetch");
const router = express.Router();

router.get("/", getAllAndroidProducts);

module.exports = router;
