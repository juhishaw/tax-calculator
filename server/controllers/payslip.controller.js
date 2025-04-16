const { parsePayslipText } = require("../services/payslip-parser.service");
const fs = require("fs");

exports.handlePayslipUpload = async (req, res) => {
  const filePath = req.file?.path;
  const mimetype = req.file?.mimetype;
  const forceOCR = req.body?.forceOCR === "true"; // <-- grab from client payload

  if (!filePath || !mimetype) {
    return res.status(400).json({ message: "No file uploaded or mimetype missing" });
  }

  try {
    const extracted = await parsePayslipText(filePath, mimetype, forceOCR);
    return res.json(extracted);
  } catch (error) {
    console.error("❌ Payslip processing failed:");
    console.error(error.stack || error.message);
    return res.status(500).json({ message: "Failed to process payslip", error: error.message });
  } finally {
    try {
      fs.unlinkSync(filePath); // delete temp file regardless of outcome
    } catch (err) {
      console.warn("⚠️ Temp file deletion failed:", err.message);
    }
  }
};
