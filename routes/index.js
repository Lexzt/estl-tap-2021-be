const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "ESTL Take Home Assesment 2021" });
});

module.exports = router;
