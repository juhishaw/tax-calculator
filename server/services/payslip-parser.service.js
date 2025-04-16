const pdfParse = require("pdf-parse");
const fs = require("fs");
const Tesseract = require("tesseract.js");

function extractAmount(text, regex) {
  const match = text.match(regex);
  if (!match) return null;
  const amount = match[1] || match[2]; // support for dual capture groups
  return parseInt(amount.replace(/,/g, "").split(".")[0], 10); // strip decimals safely
}

async function extractTextFromImage(imagePath) {
  const result = await Tesseract.recognize(imagePath, "eng", {
    logger: (m) => console.log(m.status, m.progress),
  });
  return result.data.text;
}

function extractPAN(text) {
  const match = text.match(/PAN\s+No\.?\s*[:\-]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i);
  return match ? match[1] : null;
}

function extractUAN(text) {
  const match = text.match(/\bUAN[:\s]*([0-9]{12})\b/i);
  return match ? match[1] : null;
}

exports.parsePayslipText = async (filePath, mimetype) => {
  let rawText = "";

  try {
    if (mimetype === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      rawText = data.text;
    } else if (mimetype.startsWith("image/")) {
      rawText = await extractTextFromImage(filePath);
    }
  } catch (e) {
    console.warn("📄 PDF parse failed, switching to OCR:", e.message);
    rawText = await extractTextFromImage(filePath);
  }

  // Monthly / yearly data handling
  const pfMonthly = extractAmount(
    rawText,
    /EPF\s+Contribution\s*₹?\s*([\d,]+)/i
  );
  const pfAnnual =
    extractAmount(rawText, /Projected\s+PF\s*:?₹?\s*([\d,]+)/i) ||
    (pfMonthly ? Math.round(pfMonthly * 12) : null);

  const medicalMonthly =
    extractAmount(rawText, /CTC\s+Medical\s*₹?\s*([\d,]+)/i) ||
    extractAmount(rawText, /Medical\s+Allow.*₹?\s*([\d,]+)/i);

  const monthlyGross = extractAmount(
    rawText,
    /Gross\s+Earnings\s*₹?\s*([\d,]+)/i
  );

  const annualSalary =
    extractAmount(rawText, /Annual\s+Salary\s+Earning[:\s]*([\d,]+)/i) ||
    extractAmount(rawText, /Annual\s+Salary\s*:?₹?\s*([\d,]+)/i) ||
    (monthlyGross ? Math.round(monthlyGross * 12) : null);

  return {
    totalCTC:
      extractAmount(rawText, /Annual\s+Salary\s+Earning[:\s]*₹?\s*([\d,]+)/i) ||
      extractAmount(rawText, /Annual\s+Salary\s*:?₹?\s*([\d,]+)/i),

    basicCTC:
      extractAmount(rawText, /Projected\s+Basic\s*:?₹?\s*([\d,]+)/i) ||
      extractAmount(
        rawText,
        /(?:CTC\s+)?Basic\s+(?:Salary|Pay)?[:\s]*₹?\s*([\d,]+\.\d{2})/i
      ) ||
      extractAmount(rawText, /Basic\s*₹?\s*([\d,]+)/i),

    hra:
      extractAmount(rawText, /HRA[:\s]*₹?\s*([\d,]+\.\d{2})/i) ||
      extractAmount(rawText, /House\s+Rent\s+Allowance\s*:?₹?\s*([\d,]+)/i) ||
      extractAmount(rawText, /Projected\s+HRA\s*:?₹?\s*([\d,]+)/i),

    pf: pfAnnual,

    transportAllowance:
      extractAmount(
        rawText,
        /Transport\s+(Allowance|CTC)[:\s]*₹?\s*([\d,]+\.\d{2})/i
      ) ||
      extractAmount(rawText, /Projected\s+Transport\s*:?₹?\s*([\d,]+)/i) ||
      extractAmount(rawText, /Transport\s+₹?\s*([\d,]+)/i),

    foodCard:
      extractAmount(rawText, /Food\s+(Card|Coupon).*?₹?\s*([\d,]+)/i) ||
      extractAmount(rawText, /Meal\s+(Voucher|Card).*?₹?\s*([\d,]+)/i),

    medicalAllowance: medicalMonthly ? Math.round(medicalMonthly * 12) : null,

    annualSalary,
    monthlyGross,

    pan: extractPAN(rawText),
    uan: extractUAN(rawText),
  };
};
