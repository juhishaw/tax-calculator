const pdfParse = require("pdf-parse");
const fs = require("fs");
const Tesseract = require("tesseract.js");
const path = require("path");
let queue = null;
let tesseractWarmedUp = false;

// Warm Tesseract + setup queue
(async () => {
  const mod = await import("p-queue");
  const PQueue = mod.default;
  queue = new PQueue({ concurrency: 1 });

  // Warmup Tesseract with a dummy call
  await Tesseract.recognize(path.join(__dirname, "../assets/blank.png"), "eng").catch(() => {});
  tesseractWarmedUp = true;
  console.log("🚀 Tesseract pre-warmed (v6), OCR queue ready.");
})();

function extractAmount(text, regex) {
  const match = text.match(regex);
  if (!match) return null;
  const amount = match[1] || match[2]; // support for dual capture groups
  return parseInt(amount.replace(/,/g, "").split(".")[0], 10); // strip decimals safely
}

async function extractTextFromImage(imagePath) {
  if (!tesseractWarmedUp || !queue) {
    throw new Error("Tesseract or queue not ready yet");
  }

  return await queue.add(async () => {
    console.log("🔠 Running OCR on:", imagePath);
    if (!fs.existsSync(imagePath)) {
      throw new Error("Image file does not exist: " + imagePath);
    }
    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: m => console.log(m.status, m.progress)
    });
    return result.data.text;
  });
}

function extractPAN(text) {
  const match = text.match(/PAN\s+No\.?\s*[:\-]?\s*([A-Z]{5}[0-9]{4}[A-Z])/i);
  return match ? match[1] : null;
}

function extractUAN(text) {
  const match = text.match(/\bUAN[:\s]*([0-9]{12})\b/i);
  return match ? match[1] : null;
}

exports.parsePayslipText = async (filePath, mimetype, forceOCR = false) => {
  let rawText = "";

  try {
    if (forceOCR) {
      console.warn("Forced OCR mode");
      rawText = await extractTextFromImage(filePath);
    } else if (mimetype === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);

      if (data.text.trim().length < 50) {
        console.warn("PDF had little to no text. Falling back to OCR.");
        rawText = await extractTextFromImage(filePath);
      } else {
        rawText = data.text;
      }
    } else if (mimetype.startsWith("image/")) {
      rawText = await extractTextFromImage(filePath);
    }
  } catch (e) {
    console.warn("📄 PDF parse failed, switching to OCR:", e.message);
    rawText = await extractTextFromImage(filePath);
  }

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
      extractAmount(rawText, /Projected\s+Basic\s*:?₹?\s*([\d,]+)/i) || // ☑️ always first
      extractAmount(rawText, /Basic\s*₹?\s*([\d,]+)/i) ||
      extractAmount(
        rawText,
        /(?:CTC\s+)?Basic\s+(?:Salary|Pay)?[:\s]*₹?\s*([\d,]+\.\d{2})/i
      ),

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
