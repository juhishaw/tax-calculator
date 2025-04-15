const express = require("express");
const cors = require("cors");
const payslipRoutes = require("./routes/payslip.routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:4200", // <-- your Angular dev server
      "https://tax-optimizer-app.vercel.app/" // <-- Vercel
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", payslipRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

module.exports = app;
