
---

## 🧾 `server/README.md` — Node.js Backend

```markdown
# ⚙️ Tax Optimizer - Node.js Backend

Backend service to handle payslip uploads (PDF or image), parse them via OCR/regex, and return structured salary data to the frontend.

### 🚀 Live API  
[https://tax-optimizer.onrender.com/api/payslip-upload](https://tax-optimizer.onrender.com/api/payslip-upload)

---

## 🧰 Tech Stack

- **Node.js**
- **Express.js**
- **Multer** (for file uploads)
- **pdf-parse**
- **tesseract.js** (OCR for image-based payslips)
- **Regex-powered text extraction**
- **Hosted on Render (Free Tier)**

---

## 📦 Setup Instructions

1. **Install dependencies**

```bash
cd server
npm install
