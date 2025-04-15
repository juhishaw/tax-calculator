const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, "../uploads/") });

const { handlePayslipUpload } = require("../controllers/payslip.controller");

router.post("/payslip-upload", upload.single("payslip"), handlePayslipUpload);

module.exports = router;
