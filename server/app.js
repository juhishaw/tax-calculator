const express = require("express");
const cors = require("cors");
const compression = require("compression");
const payslipRoutes = require("./routes/payslip.routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:4200", // Angular dev server
      "https://tax-calculator-one-theta.vercel.app" // Deployed app
    ],
    credentials: true,
  })
);

app.use(compression());
app.use(express.json());
app.use("/api", payslipRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

module.exports = app;

