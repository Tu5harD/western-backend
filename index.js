const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const helmet = require("helmet");
const http = require("http");

const { SocketConnection } = require("./socket/connection");
// const server = http.createServer(app);
// SocketConnection(server);

const { dbConnection } = require("./config/databaseConnection");
app.set("view engine", "ejs");
app.use("/static/api/v1/", express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
  })
);
app.use(helmet());

const version = process.env.VERSION;
const versionOne = process.env.VERSION_ONE;

app.get(`/api/${version + versionOne}/test`, (req, res) => {
  if (dbConnection()) return res.status(200).send("Running...");
  return res.status(500).send("Not running...");
});

// Common apis
app.use(
  `/api/${version + versionOne}/web/common/auth`,
  require("./common/routes/auth")
);

// app.use(
//   `/api/${version + versionOne}/common/auth`,
//   require("./common/routes/auth")
// );

// // Web side apis
app.use(
  `/api/${version + versionOne}/web/admin`,
  require("./api/v1/web/routes/admin")
);
app.use(
  `/api/${version + versionOne}/web/retailer`,
  require("./api/v1/web/routes/retailer/retailer")
);
app.use(
  `/api/${version + versionOne}/web/retailer/recovery`,
  require("./api/v1/web/routes/recovery/recovery")
);
app.use(
  `/api/${version + versionOne}/web/executive`,
  require("./api/v1/web/routes/executive/executive")
);
app.use(
  `/api/${version + versionOne}/web/vendor`,
  require("./api/v1/web/routes/vendor/vendor")
);
app.use(
  `/api/${version + versionOne}/web/worker`,
  require("./api/v1/web/routes/worker/worker")
);
app.use(
  `/api/${version + versionOne}/web/worker/attendance`,
  require("./api/v1/web/routes/worker/workerAttendance")
);

app.use(
  `/api/${version + versionOne}/web/category`,
  require("./api/v1/web/routes/category/category")
);

app.use(
  `/api/${version + versionOne}/web/product`,
  require("./api/v1/web/routes/product/product")
);

app.use(
  `/api/${version + versionOne}/web/stock`,
  require("./api/v1/web/routes/stock/stock")
);

app.use(
  `/api/${version + versionOne}/web/order`,
  require("./api/v1/web/routes/order/order")
);

app.use(
  `/api/${version + versionOne}/web/dashboard`,
  require("./api/v1/web/routes/dashboard/dashboard")
);
app.use(
  `/api/${version + versionOne}/web/ledger/retailer`,
  require("./api/v1/web/routes/ledger/retailerLedger")
);
app.use(
  `/api/${version + versionOne}/web/ledger/vendor`,
  require("./api/v1/web/routes/ledger/vendorLedger")
);
app.use(
  `/api/${version + versionOne}/web/ledger/executive`,
  require("./api/v1/web/routes/ledger/executiveLedger")
);
app.use(
  `/api/${version + versionOne}/web/ledger/worker`,
  require("./api/v1/web/routes/ledger/workerLedger")
);
app.use(
  `/api/${version + versionOne}/web/bill`,
  require("./api/v1/web/routes/bill/bill")
);

app.use(
  `/api/${version + versionOne}/web/returnOrder`,
  require("./api/v1/web/routes/returnOrder/returnOrder")
);
app.use(
  `/api/${version + versionOne}/web`,
  require("./api/v1/web/routes/pdf/pdf")
);
app.use(
  `/api/${version + versionOne}/web/vendor`,
  require("./api/v1/web/routes/pdf/vendorDocument")
);

app.use(
  `/api/${version + versionOne}/web/worker`,
  require("./api/v1/web/routes/pdf/workerDocument")
);
app.use(
  `/api/${version + versionOne}/web/executive`,
  require("./api/v1/web/routes/pdf/executiveDocument")
);
app.use(
  `/api/${version + versionOne}/web/gst`,
  require("./api/v1/web/routes/pdf/gstr1Report")
);

app.use(
  `/api/${version + versionOne}/web/bill`,
  require("./api/v1/web/routes/pdf/profitLoss")
);
app.use(
  `/api/${version + versionOne}/web/product`,
  require("./api/v1/web/routes/pdf/productReport")
);
app.use(
  `/api/${version + versionOne}/web/party`,
  require("./api/v1/web/routes/pdf/party")
);
app.use(
  `/api/${version + versionOne}/web/routes`,
  require("./api/v1/web/routes/routePath/route")
);
app.use(
  `/api/${version + versionOne}/web/purchase/order`,
  require("./api/v1/web/routes/purchaseOrder/purchaseOrder")
);
app.use(
  `/api/${version + versionOne}/web/delivery/challan`,
  require("./api/v1/web/routes/challan/challan")
);
app.use(
  `/api/${version + versionOne}/web/transaction`,
  require("./api/v1/web/routes/transaction/transaction")
);

app.use(
  `/api/${version + versionOne}/web/payment`,
  require("./api/v1/web/routes/paymentHistory/paymentHistory")
);
app.use(
  `/api/${version + versionOne}/web/graph/data`,
  require("./api/v1/web/routes/graphData/graph")
);

app.use(
  `/api/${version + versionOne}/web/village`,
  require("./api/v1/web/routes/village/village")
);

app.use(
  `/api/${version + versionOne}/web/bill/selected`,
  require("./api/v1/web/routes/billSelection/billSelection")
);

app.use(
  `/api/${version + versionOne}/web/offer`,
  require("./api/v1/web/routes/offer/offer")
);

//android Side Api's
app.use(
  `/api/${version + versionOne}/android/auth`,
  require("./api/v1/android/routes/auth/auth")
);
app.use(
  `/api/${version + versionOne}/android/product`,
  require("./api/v1/android/routes/product/product")
);
app.use(
  `/api/${version + versionOne}/android/order`,
  require("./api/v1/android/routes/order/order")
);
app.use(
  `/api/${version + versionOne}/android/ledger/retailer`,
  require("./api/v1/android/routes/ledger/ledger")
);

app.use(
  `/api/${version + versionOne}/android/retailer/bill`,
  require("./api/v1/android/routes/bill/bill")
);

app.use(
  `/api/${version + versionOne}/android/executive`,
  require("./api/v1/android/routes/retailer/retailer")
);

// error handle
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({
    success: false,
    status: status,
    message: message,
  });
});

// Port setup
const port = process.env.PORT || 8000;
const server = app.listen(port, async () => {
  console.log("running on ", process.env.BASE_URL + port);
  const dbConnect = await dbConnection();
  if (dbConnect) console.log("Database connected");
  else console.log("Database not connected");
});

SocketConnection(server);
