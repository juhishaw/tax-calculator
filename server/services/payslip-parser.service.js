const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const Tesseract = require("tesseract.js");

function extractAmount(text, regex) {
  const match = text.match(regex);
  if (!match) return null;
  const amount = match[1] || match[2]; // to support dual capture groups
  return parseInt(amount.replace(/,/g, "").split(".")[0], 10);
}

async function extractTextFromImage(imagePath) {
  const result = await Tesseract.recognize(imagePath, "eng", {
    logger: (m) => console.log(m.status, m.progress),
  });
  return result.data.text;
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

  // Monthly values
  const pfMonthly = extractAmount(
    rawText,
    /PF\s+Employee\s+Contribution.*?₹?\s*([\d,]+\.\d{2})/i
  );
  const medicalMonthly = extractAmount(
    rawText,
    /Medical\s+(Allow|Allowance).*?₹?\s*([\d,]+\.\d{2})/i
  );

  // Annual values
  const pfAnnual = extractAmount(rawText, /Projected\s+PF.*?₹?\s*([\d,]+)/i);
  const annualSalary =
    extractAmount(rawText, /Annual\s+Salary\s+Earning[:\s]*([\d,]+)/i) ||
    extractAmount(rawText, /Annual\s+Salary\s*:?₹?\s*([\d,]+)/i);

  const monthlyGross = annualSalary ? Math.round(annualSalary / 12) : null;

  // console.log("====== OCR EXTRACTED TEXT START ======");
  // console.log(rawText);
  // console.log("====== OCR EXTRACTED TEXT END ======");

  return {
    totalCTC:
      extractAmount(rawText, /Total\s+CTC[:\s]*₹?\s*([\d,]+\.\d{2})/i) ||
      extractAmount(rawText, /Total[\s\S]{0,20}?(\d{3,}[,.\d]*)/i),

    basicCTC:
      extractAmount(
        rawText,
        /(?:CTC\s+)?Basic\s+(?:Salary|Pay)?[:\s]*₹?\s*([\d,]+\.\d{2})/i
      ) || extractAmount(rawText, /Projected\s+Basic\s*:?₹?\s*([\d,]+)/i),

    hra:
      extractAmount(rawText, /HRA[:\s]*₹?\s*([\d,]+\.\d{2})/i) ||
      extractAmount(rawText, /House\s+Rent\s+Allowance\s*:?₹?\s*([\d,]+)/i) ||
      extractAmount(rawText, /Projected\s+HRA\s*:?₹?\s*([\d,]+)/i),

    pf: pfAnnual || (pfMonthly ? Math.round(pfMonthly * 12) : null),

    transportAllowance:
      extractAmount(
        rawText,
        /Transport\s+(Allowance|CTC)[:\s]*₹?\s*([\d,]+\.\d{2})/i
      ) || extractAmount(rawText, /Projected\s+Transport\s*:?₹?\s*([\d,]+)/i),

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

function extractPAN(text) {
  const match = text.match(/PAN\s+No\.?\s*[:\-]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i);
  return match ? match[1] : null;
}

function extractUAN(text) {
  const match = text.match(/\bUAN[:\s]*([0-9]{12})\b/i);
  return match ? match[1] : null;
}
