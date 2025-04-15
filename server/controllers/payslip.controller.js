const { parsePayslipText } = require("../services/payslip-parser.service");
const fs = require("fs");

exports.handlePayslipUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const mimetype = req.file.mimetype;

    const extracted = await parsePayslipText(filePath, mimetype);

    fs.unlinkSync(filePath);
    res.json(extracted);
  } catch (error) {
    console.error("ERROR STACK >>>", error.stack);
    console.error("ERROR MESSAGE >>>", error.message);
    res.status(500).json({ message: "Failed to process payslip", error: error.message });
  }
};