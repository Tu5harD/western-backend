const { Op } = require("sequelize");
const ejs = require("ejs");
const pdf = require("html-pdf");
const fs = require("fs");
const path = require("path");
const { globalError } = require("../../../../../errors/globalError");
const Ledger = require("../../../../../model/ledger/retailerLedger");
const VendorLedger = require("../../../../../model/ledger/vendorLedger");
const Retailer = require("../../../../../model/retailer/retailer");
const Vendor = require("../../../../../model/vendor/vendor");
const Worker = require("../../../../../model/worker/worker");
const WorkerLedger = require("../../../../../model/ledger/workerLedger");
const Executive = require("../../../../../model/executive/executive");
const ExecutiveLedger = require("../../../../../model/ledger/executiveLedger");
const Bill = require("../../../../../model/bill/bill");
const PurchaseBill = require("../../../../../model/bill/purchaseOrderBill");
const OrderList = require("../../../../../model/order/orderList");
const Order = require("../../../../../model/order/order");
const Stock = require("../../../../../model/stock/stock");
const Product = require("../../../../../model/product/product");
var CsvParser = require("json2csv").Parser;
const excelJS = require("exceljs");
const dayjs = require("dayjs");
const { Sequelize, sequelize } = require("../../../../../config/database");

const fetchRetailerLedger = async (req, res, next) => {
  try {
    const { retailer_id } = req.body;
    let options = {
      where: {
        retailer_id: +retailer_id,
      },
      include: [
        {
          model: Retailer,
          attributes: ["retailer_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await Ledger.findAndCountAll(options);

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }
    ledger = ledger.map((m) => {
      let { ...data } = m.toJSON();
      return {
        ...data,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
        balance: -data.balance,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
      };
    });

    const data = {
      ledgerData: ledger,
      retailer_name: ledger[0]?.Retailer?.retailer_name,
    };
    const filePathName = path.resolve(
      __dirname,
      "../../../../../views/ledgerData.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, data);

    let option = {
      format: "A4",
    };

    pdf.create(ejsData, option).toBuffer((err, buffer) => {
      if (err) {
        return next(globalError(500, err.message));
      }

      // Set the content type and send the PDF in the response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=ledgerData.pdf");
      res.end(buffer);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchRetailerLedgerCsv = async (req, res, next) => {
  try {
    const { retailer_id } = req.body;
    let options = {
      where: {
        retailer_id: +retailer_id,
      },
      include: [
        {
          model: Retailer,
          attributes: ["retailer_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await Ledger.findAndCountAll(options);

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }
    ledger = ledger.map((m) => {
      let { ...data } = m.toJSON();
      return {
        retailer_name: data.Retailer?.retailer_name,
        tranction_type: data.type,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
        balance: -data.balance,
        payment_type: data.payment_type,
        description: data.description,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
      };
    });

    const csvFields = [
      "Retailer Name",
      "TRANSACTION TYPE",
      "AMOUNT",
      "BALANCE",
      "PAYMENT TYPE",
      "DESCRIPTION",
      "DATE",
    ];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(ledger);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "inline; filename=ledgerData.csv");
    res.end(csvData);
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchRetailerLedgerExcel = async (req, res, next) => {
  try {
    const { retailer_id } = req.body;
    let options = {
      where: {
        retailer_id: +retailer_id,
      },
      include: [
        {
          model: Retailer,
          attributes: ["retailer_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await Ledger.findAndCountAll(options);

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ledger Data");
    worksheet.columns = [
      { header: "S_No", key: "sno" },
      { header: "Retailer Name", key: "retailer_name" },
      { header: "Transaction Type", key: "transaction_type" },
      { header: "Amount", key: "amount" },
      { header: "Balance", key: "balance" },
      { header: "Payment Type", key: "payment_type" },
      { header: "Description", key: "description" },
      { header: "Date", key: "createdAt" },
    ];

    ledger.forEach((m, index) => {
      let { ...data } = m.toJSON();
      let rows = {
        sno: index + 1,
        retailer_name: data.Retailer?.retailer_name,
        tranction_type: data.type,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
        balance: -data.balance,
        payment_type: data.payment_type,
        description: data.description,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
      };
      worksheet.addRow(rows);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader("Content-Disposition", "inline; filename=ledgerData.xlsx");

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchVendorLedger = async (req, res, next) => {
  try {
    const { vendor_id } = req.body;
    let options = {
      where: {
        vendor_id: vendor_id,
      },
      include: [
        {
          model: Vendor,
          attributes: ["Vendor_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await VendorLedger.findAndCountAll(options);

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }
    ledger = ledger.map((m) => {
      let { ...data } = m.toJSON();
      return {
        ...data,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
        balance: -data.balance,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
      };
    });

    const data = {
      ledgerData: ledger,
      retailer_name: ledger[0]?.Vendor?.Vendor_name,
    };
    const filePathName = path.resolve(
      __dirname,
      "../../../../../views/ledgerData.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, data);

    let option = {
      format: "A4",
    };

    pdf.create(ejsData, option).toBuffer((err, buffer) => {
      if (err) {
        return next(globalError(500, err.message));
      }

      // Set the content type and send the PDF in the response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=ledgerData.pdf");
      res.end(buffer);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchVendorLedgerCsv = async (req, res, next) => {
  try {
    const { vendor_id } = req.body;
    let options = {
      where: {
        vendor_id: Number(vendor_id),
      },
      include: [
        {
          model: Vendor,
          attributes: ["vendor_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await VendorLedger.findAndCountAll(options);

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }
    ledger = ledger.map((m) => {
      let { ...data } = m.toJSON();
      return {
        vendor_name: data.Vendor?.vendor_name,
        tranction_type: data.type,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
        balance: -data.balance,
        payment_type: data.payment_type,
        description: data.description,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
      };
    });

    const csvFields = [
      "VENDOR NAME",
      "TRANSACTION TYPE",
      "AMOUNT",
      "BALANCE",
      "PAYMENT TYPE",
      "DESCRIPTION",
      "DATE",
    ];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(ledger);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "inline; filename=ledgerData.csv");
    res.end(csvData);
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchVendorLedgerExcel = async (req, res, next) => {
  try {
    const { vendor_id } = req.body;
    let options = {
      where: {
        vendor_id: Number(vendor_id),
      },
      include: [
        {
          model: Vendor,
          attributes: ["vendor_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await VendorLedger.findAndCountAll(options);

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ledger Data");
    worksheet.columns = [
      { header: "S_No", key: "sno" },
      { header: "Vendor Name", key: "vendor_name" },
      { header: "Transaction Type", key: "type" },
      { header: "Amount", key: "amount" },
      { header: "Balance", key: "balance" },
      { header: "Payment Type", key: "payment_type" },
      { header: "Description", key: "description" },
      { header: "Date", key: "createdAt" },
    ];

    ledger.forEach((m, index) => {
      let { ...data } = m.toJSON();
      let rows = {
        sno: index + 1,
        vendor_name: data.Vendor?.vendor_name,
        type: data.type,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
        balance: -data.balance,
        payment_type: data.payment_type,
        description: data.description,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
      };
      worksheet.addRow(rows);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader("Content-Disposition", "inline; filename=ledgerData.xlsx");

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchWorkerLedger = async (req, res, next) => {
  try {
    const { worker_id } = req.body;
    let options = {
      where: {
        worker_id: Number(worker_id),
      },
      include: [
        {
          model: Worker,
          attributes: ["worker_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await WorkerLedger.findAndCountAll(options);

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }
    ledger = ledger.map((m) => {
      let { ...data } = m.toJSON();
      return {
        ...data,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
        balance: data.balance,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
      };
    });

    const data = {
      ledgerData: ledger,
      retailer_name: ledger[0]?.Worker?.worker_name,
    };
    const filePathName = path.resolve(
      __dirname,
      "../../../../../views/ledgerData.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, data);

    let option = {
      format: "A4",
    };

    pdf.create(ejsData, option).toBuffer((err, buffer) => {
      if (err) {
        return next(globalError(500, err.message));
      }

      // Set the content type and send the PDF in the response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=ledgerData.pdf");
      res.end(buffer);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchWorkerLedgerCsv = async (req, res, next) => {
  try {
    const { worker_id } = req.body;
    let options = {
      where: {
        worker_id: Number(worker_id),
      },
      include: [
        {
          model: Worker,
          attributes: ["worker_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await WorkerLedger.findAndCountAll(options);

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }
    ledger = ledger.map((m) => {
      let { ...data } = m.toJSON();
      return {
        worker_name: data.Worker?.worker_name,
        tranction_type: data.type,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
        balance: data.balance,
        payment_type: data.payment_type,
        description: data.description,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
      };
    });

    const csvFields = [
      "WORKER NAME",
      "TRANSACTION TYPE",
      "AMOUNT",
      "BALANCE",
      "PAYMENT TYPE",
      "DESCRIPTION",
      "DATE",
    ];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(ledger);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "inline; filename=ledgerData.csv");
    res.end(csvData);
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchWorkerLedgerExcel = async (req, res, next) => {
  try {
    const { worker_id } = req.body;
    let options = {
      where: {
        worker_id: Number(worker_id),
      },
      include: [
        {
          model: Worker,
          attributes: ["worker_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await WorkerLedger.findAndCountAll(options);

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ledger Data");
    worksheet.columns = [
      { header: "S_No", key: "sno" },
      { header: "Worker Name", key: "worker_name" },
      { header: "Transaction Type", key: "type" },
      { header: "Amount", key: "amount" },
      { header: "Balance", key: "balance" },
      { header: "Payment Type", key: "payment_type" },
      { header: "Description", key: "description" },
      { header: "Date", key: "createdAt" },
    ];

    ledger.forEach((m, index) => {
      let { ...data } = m.toJSON();
      let rows = {
        sno: index + 1,
        worker_name: data.Worker?.worker_name,
        type: data.type,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
        balance: data.balance,
        payment_type: data.payment_type,
        description: data.description,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
      };
      worksheet.addRow(rows);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader("Content-Disposition", "inline; filename=ledgerData.xlsx");

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchExecutiveLedger = async (req, res, next) => {
  try {
    const { executive_id } = req.body;
    let options = {
      where: {
        executive_id: Number(executive_id),
      },
      include: [
        {
          model: Executive,
          attributes: ["executive_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await ExecutiveLedger.findAndCountAll(
      options
    );

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }
    ledger = ledger.map((m) => {
      let { ...data } = m.toJSON();
      return {
        ...data,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
        balance: data.balance,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
      };
    });

    const data = {
      ledgerData: ledger,
      retailer_name: ledger[0]?.Executive?.executive_name,
    };
    const filePathName = path.resolve(
      __dirname,
      "../../../../../views/ledgerData.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, data);

    let option = {
      format: "A4",
    };

    pdf.create(ejsData, option).toBuffer((err, buffer) => {
      if (err) {
        return next(globalError(500, err.message));
      }

      // Set the content type and send the PDF in the response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=ledgerData.pdf");
      res.end(buffer);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchExecutiveLedgerCsv = async (req, res, next) => {
  try {
    const { executive_id } = req.body;
    let options = {
      where: {
        executive_id: Number(executive_id),
      },
      include: [
        {
          model: Executive,
          attributes: ["executive_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await ExecutiveLedger.findAndCountAll(
      options
    );

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }
    ledger = ledger.map((m) => {
      let { ...data } = m.toJSON();
      return {
        executive_name: data.Executive?.executive_name,
        tranction_type: data.type,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
        balance: data.balance,
        payment_type: data.payment_type,
        description: data.description,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
      };
    });

    const csvFields = [
      "EXECUTIVE NAME",
      "TRANSACTION TYPE",
      "AMOUNT",
      "BALANCE",
      "PAYMENT TYPE",
      "DESCRIPTION",
      "DATE",
    ];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(ledger);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "inline; filename=ledgerData.csv");
    res.end(csvData);
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchExecutiveLedgerExcel = async (req, res, next) => {
  try {
    const { executive_id } = req.body;
    let options = {
      where: {
        executive_id: Number(executive_id),
      },
      include: [
        {
          model: Executive,
          attributes: ["executive_name"],
        },
      ],
      order: [["created_at", "ASC"]],
    };

    let { count, rows: ledger } = await ExecutiveLedger.findAndCountAll(
      options
    );

    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Ledger not Created",
      });
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ledger Data");
    worksheet.columns = [
      { header: "S_No", key: "sno" },
      { header: "Executive Name", key: "executive_name" },
      { header: "Transaction Type", key: "type" },
      { header: "Amount", key: "amount" },
      { header: "Balance", key: "balance" },
      { header: "Payment Type", key: "payment_type" },
      { header: "Description", key: "description" },
      { header: "Date", key: "createdAt" },
    ];

    ledger.forEach((m, index) => {
      let { ...data } = m.toJSON();
      let rows = {
        sno: index + 1,
        executive_name: data.Executive?.executive_name,
        type: data.type,
        amount:
          data.type === "debit"
            ? "- " + String(data.amount)
            : "+ " + String(data.amount),
        balance: data.balance,
        payment_type: data.payment_type,
        description: data.description,
        createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
      };
      worksheet.addRow(rows);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader("Content-Disposition", "inline; filename=ledgerData.xlsx");

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchGSTR1ReportPDF = async (req, res, next) => {
  try {
    const { startDate = "", endDate = "", query = "" } = req.query;

    const condition = {
      [Op.and]: [
        {
          [Op.or]: [
            {
              retailer_name: {
                [Op.like]: `%${query}%`,
              },
            },
          ],
        },
      ],
    };

    const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    const formattedEndDate = dayjs(endDate).add(1, "day").format("YYYY-MM-DD");

    const { count, rows: bill } = await Bill.findAndCountAll({
      where: {
        bill_status: {
          [Op.or]: ["pending", "paid"],
        },
        createdAt: {
          [Op.between]: [formattedStartDate, formattedEndDate],
        },
      },
      include: [
        {
          model: Retailer,
          attributes: [
            "retailer_name",
            "retailer_mobile",
            "retailer_address",
            "retailer_fssai",
            "retailer_gst_no",
          ],
          where: condition,
        },
      ],
      order: [["bill_id", "DESC"]],
    });
    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Report not Created",
      });
    }

    let data = bill.map((m) => {
      let { billing_amount, gst_type, gst_rate, bill_id, ...otherData } =
        m.toJSON();
      let GStr = 1 + gst_rate / 100;

      let taxableValue = Math.round(billing_amount / GStr);
      let centralTaxAmount = Math.round(taxableValue * (gst_rate / 100));
      return {
        gst_no: otherData?.Retailer?.retailer_gst_no,
        party_name: otherData?.Retailer?.retailer_name,
        transaction_type: "Sale",
        invoice_no: bill_id,
        invoice_date: dayjs(otherData.createdAt).format("YYYY-MM-DD"),
        invoice_value: billing_amount,
        rate: gst_type == "GST" ? String(gst_rate) + " %" : "0 %",
        cess_rate: 0,
        taxable_value: taxableValue,
        reverse_charge: "N",
        integrated_tax_amount: 0,
        central_tax_amount: centralTaxAmount / 2,
        state_tax_amount: centralTaxAmount / 2,
        cess_amount: 0,
        place_of_supply: "MAHARASHTRA",
      };
    });

    const report = {
      gstReport: data,
      report: "GST R1 REPORT",
    };
    const filePathName = path.resolve(
      __dirname,
      "../../../../../views/gstReport.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, report);

    let option = {
      format: "A1",
    };

    pdf.create(ejsData, option).toBuffer((err, buffer) => {
      if (err) {
        return next(globalError(500, err.message));
      }

      res
        .status(200)
        .setHeader("Content-Type", "application/pdf")
        .setHeader("Content-Disposition", "inline; filename=GSTR1REPORT.pdf")
        .end(buffer);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchGSTR1ReportCSV = async (req, res, next) => {
  try {
    const { startDate = "", endDate = "", query = "" } = req.query;

    const condition = {
      [Op.and]: [
        {
          [Op.or]: [
            {
              retailer_name: {
                [Op.like]: `%${query}%`,
              },
            },
          ],
        },
      ],
    };

    const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    const formattedEndDate = dayjs(endDate).add(1, "day").format("YYYY-MM-DD");

    const { count, rows: bill } = await Bill.findAndCountAll({
      where: {
        bill_status: {
          [Op.or]: ["pending", "paid"],
        },
        createdAt: {
          [Op.between]: [formattedStartDate, formattedEndDate],
        },
      },
      include: [
        {
          model: Retailer,
          attributes: [
            "retailer_name",
            "retailer_mobile",
            "retailer_address",
            "retailer_fssai",
            "retailer_gst_no",
          ],
          where: condition,
        },
      ],
      order: [["bill_id", "DESC"]],
    });
    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Report not Created",
      });
    }

    let data = bill.map((m) => {
      let { billing_amount, gst_type, gst_rate, bill_id, ...otherData } =
        m.toJSON();
      let GStr = 1 + gst_rate / 100;

      let taxableValue = Math.round(billing_amount / GStr);
      let centralTaxAmount = Math.round(taxableValue * (gst_rate / 100));
      return {
        gst_no: otherData?.Retailer?.retailer_gst_no,
        party_name: otherData?.Retailer?.retailer_name,
        transaction_type: "Sale",
        invoice_no: bill_id,
        invoice_date: dayjs(otherData.createdAt).format("YYYY-MM-DD"),
        invoice_value: billing_amount,
        rate: gst_type == "GST" ? String(gst_rate) + " %" : "0 %",
        cess_rate: 0,
        taxable_value: taxableValue,
        reverse_charge: "N",
        integrated_tax_amount: 0,
        central_tax_amount: centralTaxAmount / 2,
        state_tax_amount: centralTaxAmount / 2,
        cess_amount: 0,
        place_of_supply: "MAHARASHTRA",
      };
    });

    const csvFields = [
      "GSTIN/UIN",
      "Party Name",
      "Transaction Type",
      "Invoice No.",
      "Invoice Date",
      "Invoice Value",
      "Rate",
      "Cess Rate",
      "Taxable value",
      "Reverse Charge",
      "Integrated Tax Amount",
      "Central Tax Amount",
      "State/UT Tax Amount",
      "Cess Amount",
      "Place of Supply (Name of state)",
    ];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "inline; filename=GSTR1REPORT.csv");
    res.end(csvData);
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchGSTR1ReportExcel = async (req, res, next) => {
  try {
    const { startDate = "", endDate = "", query = "" } = req.query;

    const condition = {
      [Op.and]: [
        {
          [Op.or]: [
            {
              retailer_name: {
                [Op.like]: `%${query}%`,
              },
            },
          ],
        },
      ],
    };

    const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    const formattedEndDate = dayjs(endDate).add(1, "day").format("YYYY-MM-DD");

    const { count, rows: bill } = await Bill.findAndCountAll({
      where: {
        bill_status: {
          [Op.or]: ["pending", "paid"],
        },
        createdAt: {
          [Op.between]: [formattedStartDate, formattedEndDate],
        },
      },
      include: [
        {
          model: Retailer,
          attributes: [
            "retailer_name",
            "retailer_mobile",
            "retailer_address",
            "retailer_fssai",
            "retailer_gst_no",
          ],
          where: condition,
        },
      ],
      order: [["bill_id", "DESC"]],
    });
    if (count === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        data: [],
        message: "Report not Created",
      });
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ledger Data");
    worksheet.columns = [
      { header: "GSTIN/UIN", key: "gst_no" },
      { header: "Party Name", key: "party_name" },
      { header: "Transaction Type", key: "transaction_type" },
      { header: "Invoice No.", key: "invoice_no" },
      { header: "Invoice Date", key: "invoice_date" },
      { header: "Invoice Value", key: "invoice_value" },
      { header: "Rate", key: "rate" },
      { header: "Cess Rate", key: "cess_rate" },
      { header: "Taxable Value", key: "taxable_value" },
      { header: "Reverse Charge", key: "reverse_charge" },
      { header: "Integrated Tax Amount", key: "integrated_tax_amount" },
      { header: "Central Tax Amount", key: "central_tax_amount" },
      { header: "State/UT Tax Amount", key: "state_tax_amount" },
      { header: "Cess Amount", key: "cess_amount" },
      { header: "Place of Supply (Name of state)", key: "place_of_supply" },
    ];

    bill.forEach((m, index) => {
      let { billing_amount, gst_type, gst_rate, bill_id, ...otherData } =
        m.toJSON();
      let GStr = 1 + gst_rate / 100;

      let taxableValue = Math.round(billing_amount / GStr);
      let centralTaxAmount = Math.round(taxableValue * (gst_rate / 100));

      let rows = {
        gst_no: otherData?.Retailer?.retailer_gst_no,
        party_name: otherData?.Retailer?.retailer_name,
        transaction_type: "Sale",
        invoice_no: bill_id,
        invoice_date: dayjs(otherData.createdAt).format("YYYY-MM-DD"),
        invoice_value: billing_amount,
        rate: gst_type == "GST" ? String(gst_rate) + " %" : "0 %",
        cess_rate: 0,
        taxable_value: taxableValue,
        reverse_charge: "N",
        integrated_tax_amount: 0,
        central_tax_amount: centralTaxAmount / 2,
        state_tax_amount: centralTaxAmount / 2,
        cess_amount: 0,
        place_of_supply: "MAHARASHTRA",
      };
      worksheet.addRow(rows);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader("Content-Disposition", "inline; filename=GSTR1REPORT.xlsx");

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchGSTR2ReportPDF = async (req, res, next) => {
  try {
    const { startDate = "", endDate = "" } = req.query;

    // const condition = {
    //   [Op.and]: [],
    // };
    // if (query.startsWith("#")) {
    //   condition[Op.and].push({ retailer_id: Number(query.split("#")[1]) });
    // } else {
    //   condition[Op.and].push({
    //     [Op.or]: [
    //       {
    //         retailer_name: {
    //           [Op.like]: `%${query}%`,
    //         },
    //       },
    //     ],
    //   });
    // }
    // const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    // const formattedEndDate = dayjs(endDate).add(1, "day").format("YYYY-MM-DD");

    // condition.createdAt = {
    //   [Op.between]: [formattedStartDate, formattedEndDate],
    // };

    const bills = await PurchaseBill.findAndCountAll({
      where: {
        purchase_bill_status: "paid",
      },
      include: [
        {
          model: Vendor,
          attributes: ["vendor_name", "vendor_gst_no"],
        },
      ],
      order: [["purchase_bill_id", "DESC"]],
      // limit: +pageSize,
      // offset: (+pageIndex - 1) * +pageSize,
    });
    if (bills.count === 0) {
      return res.status(200).json({ success: false, data: [] });
    }

    let data = bills?.rows.map((m) => {
      let { billing_amount, gst_type, purchase_bill_id, ...otherData } =
        m.toJSON();

      let taxableValue = Math.round(billing_amount / 1.18);
      let centralTaxAmount = Math.round(taxableValue * 0.09);
      return {
        gst_no: otherData?.Vendor?.vendor_gst_no,
        party_name: otherData?.Vendor?.vendor_name,
        transaction_type: "Purchase",
        invoice_no: purchase_bill_id,
        invoice_date: dayjs(otherData.createdAt).format("YYYY-MM-DD"),
        invoice_value: billing_amount,
        rate: gst_type === "GST" ? "18 %" : "0 %",
        cess_rate: 0,
        taxable_value: taxableValue,
        reverse_charge: "N",
        integrated_tax_amount: 0,
        central_tax_amount: centralTaxAmount,
        state_tax_amount: centralTaxAmount,
        cess_amount: 0,
        place_of_supply: "MAHARASHTRA",
      };
    });

    const report = {
      gstReport: data,
      report: "GST R2 REPORT",
    };
    const filePathName = path.resolve(
      __dirname,
      "../../../../../views/gstReport.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, report);

    let option = {
      format: "A1",
    };

    pdf.create(ejsData, option).toBuffer((err, buffer) => {
      if (err) {
        return next(globalError(500, err.message));
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=GSTR2REPORT.pdf");
      res.end(buffer);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchGSTR2ReportCSV = async (req, res, next) => {
  try {
    const { startDate = "", endDate = "" } = req.query;

    // const condition = {
    //   [Op.and]: [],
    // };
    // if (query.startsWith("#")) {
    //   condition[Op.and].push({ retailer_id: Number(query.split("#")[1]) });
    // } else {
    //   condition[Op.and].push({
    //     [Op.or]: [
    //       {
    //         retailer_name: {
    //           [Op.like]: `%${query}%`,
    //         },
    //       },
    //     ],
    //   });
    // }
    // const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    // const formattedEndDate = dayjs(endDate).add(1, "day").format("YYYY-MM-DD");

    // condition.createdAt = {
    //   [Op.between]: [formattedStartDate, formattedEndDate],
    // };

    const bills = await PurchaseBill.findAndCountAll({
      where: {
        purchase_bill_status: "paid",
      },
      include: [
        {
          model: Vendor,
          attributes: ["vendor_name", "vendor_gst_no"],
        },
      ],
      order: [["purchase_bill_id", "DESC"]],
      // limit: +pageSize,
      // offset: (+pageIndex - 1) * +pageSize,
    });
    if (bills.count === 0) {
      return res.status(200).json({ success: false, data: [] });
    }

    let data = bills?.rows.map((m) => {
      let { billing_amount, gst_type, purchase_bill_id, ...otherData } =
        m.toJSON();

      let taxableValue = Math.round(billing_amount / 1.18);
      let centralTaxAmount = Math.round(taxableValue * 0.09);
      return {
        gst_no: otherData?.Vendor?.vendor_gst_no,
        party_name: otherData?.Vendor?.vendor_name,
        transaction_type: "Purchase",
        invoice_no: purchase_bill_id,
        invoice_date: dayjs(otherData.createdAt).format("YYYY-MM-DD"),
        invoice_value: billing_amount,
        rate: gst_type === "GST" ? "18 %" : "0 %",
        cess_rate: 0,
        taxable_value: taxableValue,
        reverse_charge: "N",
        integrated_tax_amount: 0,
        central_tax_amount: centralTaxAmount,
        state_tax_amount: centralTaxAmount,
        cess_amount: 0,
        place_of_supply: "MAHARASHTRA",
      };
    });

    const csvFields = [
      "GSTIN/UIN",
      "Party Name",
      "Transaction Type",
      "Invoice No.",
      "Invoice Date",
      "Invoice Value",
      "Rate",
      "Cess Rate",
      "Taxable value",
      "Reverse Charge",
      "Integrated Tax Amount",
      "Central Tax Amount",
      "State/UT Tax Amount",
      "Cess Amount",
      "Place of Supply (Name of state)",
    ];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "inline; filename=GSTR2REPORT.csv");
    res.end(csvData);
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchGSTR2ReportExcel = async (req, res, next) => {
  try {
    const { startDate = "", endDate = "" } = req.query;

    // const condition = {
    //   [Op.and]: [],
    // };
    // if (query.startsWith("#")) {
    //   condition[Op.and].push({ retailer_id: Number(query.split("#")[1]) });
    // } else {
    //   condition[Op.and].push({
    //     [Op.or]: [
    //       {
    //         retailer_name: {
    //           [Op.like]: `%${query}%`,
    //         },
    //       },
    //     ],
    //   });
    // }
    // const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
    // const formattedEndDate = dayjs(endDate).add(1, "day").format("YYYY-MM-DD");

    // condition.createdAt = {
    //   [Op.between]: [formattedStartDate, formattedEndDate],
    // };

    const bills = await PurchaseBill.findAndCountAll({
      where: {
        purchase_bill_status: "paid",
      },
      include: [
        {
          model: Vendor,
          attributes: ["vendor_name", "vendor_gst_no"],
        },
      ],
      order: [["purchase_bill_id", "DESC"]],
      // limit: +pageSize,
      // offset: (+pageIndex - 1) * +pageSize,
    });
    if (bills.count === 0) {
      return res.status(200).json({ success: false, data: [] });
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ledger Data");
    worksheet.columns = [
      { header: "GSTIN/UIN", key: "gst_no" },
      { header: "Party Name", key: "party_name" },
      { header: "Transaction Type", key: "transaction_type" },
      { header: "Invoice No.", key: "invoice_no" },
      { header: "Invoice Date", key: "invoice_date" },
      { header: "Invoice Value", key: "invoice_value" },
      { header: "Rate", key: "rate" },
      { header: "Cess Rate", key: "cess_rate" },
      { header: "Taxable Value", key: "taxable_value" },
      { header: "Reverse Charge", key: "reverse_charge" },
      { header: "Integrated Tax Amount", key: "integrated_tax_amount" },
      { header: "Central Tax Amount", key: "central_tax_amount" },
      { header: "State/UT Tax Amount", key: "state_tax_amount" },
      { header: "Cess Amount", key: "cess_amount" },
      { header: "Place of Supply (Name of state)", key: "place_of_supply" },
    ];

    bills?.forEach((m) => {
      let { billing_amount, gst_type, purchase_bill_id, ...otherData } =
        m.toJSON();

      let taxableValue = Math.round(billing_amount / 1.18);
      let centralTaxAmount = Math.round(taxableValue * 0.09);
      let rows = {
        gst_no: otherData?.Vendor?.vendor_gst_no,
        party_name: otherData?.Vendor?.vendor_name,
        transaction_type: "Purchase",
        invoice_no: purchase_bill_id,
        invoice_date: dayjs(otherData.createdAt).format("YYYY-MM-DD"),
        invoice_value: billing_amount,
        rate: gst_type === "GST" ? "18 %" : "0 %",
        cess_rate: 0,
        taxable_value: taxableValue,
        reverse_charge: "N",
        integrated_tax_amount: 0,
        central_tax_amount: centralTaxAmount,
        state_tax_amount: centralTaxAmount,
        cess_amount: 0,
        place_of_supply: "MAHARASHTRA",
      };
      worksheet.addRow(rows);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader("Content-Disposition", "inline; filename=GSTR2REPORT.xlsx");

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchBillWiseProfitLossPDF = async (req, res, next) => {
  try {
    const { startDate = "", endDate = "", query = "" } = req.query;

    const nextDayEndDate = new Date(
      new Date(endDate).getTime() + 24 * 60 * 60 * 1000
    );

    const condition = {
      [Op.and]: [{ retailer_deleted: false }, { retailer_status: true }],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          retailer_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    let bills = await Bill.findAll({
      where: {
        bill_status: {
          [Op.in]: ["pending", "paid"],
        },
        createdAt: {
          [Op.between]: [startDate, nextDayEndDate],
        },
      },
      attributes: [
        "bill_id",
        "order_id",
        "billing_amount",
        "pending_amount",
        "bill_status",
        "createdAt",
      ],
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
          where: condition,
        },
        {
          model: Order,
          attributes: ["order_id"],
          include: [
            {
              model: OrderList,
              attributes: ["product_id", "quantity"],
              include: [
                {
                  model: Stock,
                  attributes: ["stock_sale_price", "stock_purchase_price"],
                },
              ],
            },
          ],
        },
      ],
      order: [["bill_id", "DESC"]],
    });
    if (!bills) {
      return res.json({ success: true, data: bills.length });
    }

    let billss = bills.map((m) => {
      let bill_amount = m.billing_amount;
      let pending_amount = m.pending_amount;
      let purchase_price = m.Order.OrderLists.reduce(
        (acc, curr) =>
          acc + Math.round(curr.Stock.stock_purchase_price * curr.quantity),
        0
      );
      let total = Math.round(bill_amount - pending_amount);
      let profit_loss = Math.round(total - purchase_price);
      let retailer_name = m.Retailer.retailer_name;
      return {
        bill_id: m.bill_id,
        profit_loss: profit_loss,
        status: profit_loss >= 0 ? "profit" : "loss",
        retailer_name: retailer_name,
        total_amount: bill_amount,
        pending_amount: m.pending_amount,
        date: dayjs(m.createdAt).format("YYYY-MM-DD"),
      };
    });

    const report = {
      profitLossReport: billss,
      report: "Bill Wise Profit Loss",
    };
    const filePathName = path.resolve(
      __dirname,
      "../../../../../views/billWiseProfitLoss.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, report);

    let option = {
      format: "A1",
    };

    pdf.create(ejsData, option).toBuffer((err, buffer) => {
      if (err) {
        return next(globalError(500, err.message));
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline; filename=billWiseProfitLoss.pdf"
      );
      res.end(buffer);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchBillWiseProfitLossCsv = async (req, res, next) => {
  try {
    const { startDate = "", endDate = "", query = "" } = req.query;

    const nextDayEndDate = new Date(
      new Date(endDate).getTime() + 24 * 60 * 60 * 1000
    );

    const condition = {
      [Op.and]: [{ retailer_deleted: false }, { retailer_status: true }],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          retailer_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    let bills = await Bill.findAll({
      where: {
        bill_status: {
          [Op.in]: ["pending", "paid"],
        },
        createdAt: {
          [Op.between]: [startDate, nextDayEndDate],
        },
      },
      attributes: [
        "bill_id",
        "order_id",
        "billing_amount",
        "pending_amount",
        "bill_status",
        "createdAt",
      ],
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
          where: condition,
        },
        {
          model: Order,
          attributes: ["order_id"],
          include: [
            {
              model: OrderList,
              attributes: ["product_id", "quantity"],
              include: [
                {
                  model: Stock,
                  attributes: ["stock_sale_price", "stock_purchase_price"],
                },
              ],
            },
          ],
        },
      ],
      order: [["bill_id", "DESC"]],
    });
    if (!bills) {
      return res.json({ success: true, data: bills.length });
    }

    let billss = bills.map((m) => {
      let bill_amount = m.billing_amount;
      let pending_amount = m.pending_amount;
      let purchase_price = m.Order.OrderLists.reduce(
        (acc, curr) =>
          acc + Math.round(curr.Stock.stock_purchase_price * curr.quantity),
        0
      );
      let total = Math.round(bill_amount - pending_amount);
      let profit_loss = Math.round(total - purchase_price);
      let retailer_name = m.Retailer.retailer_name;
      return {
        bill_id: m.bill_id,
        retailer_name: retailer_name,
        total_amount: bill_amount,
        pending_amount: m.pending_amount,
        status: profit_loss >= 0 ? "profit" : "loss",
        profit_loss: profit_loss,
        date: dayjs(m.createdAt).format("YYYY-MM-DD"),
      };
    });

    const csvFields = [
      "Bill Id",
      "Party Name",
      "Total Amount",
      "Pending Amount",
      "Status",
      "Profit/Loss",
      "Date",
    ];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(billss);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=BillWiseProfitLoss.csv"
    );
    res.end(csvData);
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchBillWiseProfitLossExcel = async (req, res, next) => {
  try {
    const { startDate = "", endDate = "", query = "" } = req.query;

    const nextDayEndDate = new Date(
      new Date(endDate).getTime() + 24 * 60 * 60 * 1000
    );

    const condition = {
      [Op.and]: [{ retailer_deleted: false }, { retailer_status: true }],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          retailer_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    let bills = await Bill.findAll({
      where: {
        bill_status: {
          [Op.in]: ["pending", "paid"],
        },
        createdAt: {
          [Op.between]: [startDate, nextDayEndDate],
        },
      },
      attributes: [
        "bill_id",
        "order_id",
        "billing_amount",
        "pending_amount",
        "bill_status",
        "createdAt",
      ],
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
          where: condition,
        },
        {
          model: Order,
          attributes: ["order_id"],
          include: [
            {
              model: OrderList,
              attributes: ["product_id", "quantity"],
              include: [
                {
                  model: Stock,
                  attributes: ["stock_sale_price", "stock_purchase_price"],
                },
              ],
            },
          ],
        },
      ],
      order: [["bill_id", "DESC"]],
    });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Profit Loss Data");
    worksheet.columns = [
      { header: "Bill Id", key: "bill_id" },
      { header: "Party Name", key: "retailer_name" },
      { header: "Total Amount", key: "total_amount" },
      { header: "Pending Amount", key: "pending_amount" },
      { header: "Status", key: "status" },
      { header: "Profit/Loss", key: "profit_loss" },
      { header: "Date", key: "date" },
    ];

    bills.forEach((m) => {
      let bill_amount = m.billing_amount;
      let pending_amount = m.pending_amount;
      let purchase_price = m.Order.OrderLists.reduce(
        (acc, curr) =>
          acc + Math.round(curr.Stock.stock_purchase_price * curr.quantity),
        0
      );
      let total = Math.round(bill_amount - pending_amount);
      let profit_loss = Math.round(total - purchase_price);
      let retailer_name = m.Retailer.retailer_name;
      let rows = {
        bill_id: m.bill_id,
        profit_loss: profit_loss,
        status: profit_loss >= 0 ? "profit" : "loss",
        retailer_name: retailer_name,
        total_amount: bill_amount,
        pending_amount: m.pending_amount,
        date: dayjs(m.createdAt).format("YYYY-MM-DD"),
      };
      worksheet.addRow(rows);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "inline; filename=BillWiseProfitLoss.xlsx"
    );

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchProductWiseProfitLossPDF = async (req, res, next) => {
  try {
    const { query = "" } = req.query;
    const condition = {
      [Op.and]: [{ product_deleted: false }],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          product_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    const result = await OrderList.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "total_quantity"],
        "stock_id",
      ],
      include: [
        {
          model: Order,
          attributes: [
            "order_id",
            "order_status",
            "order_confirm_date",
            "retailer_id",
          ], // Include specific Order columns
          where: {
            order_status: ["confirmed", "pending"],
            order_deleted: false,
          },
          include: [
            {
              model: Retailer,
              attributes: ["retailer_id", "type"],
              // where: {
              //   type: "retailer",
              // },
            },
          ],
        },
        {
          model: Stock,
          attributes: [
            "stock_id",
            "product_id",
            "stock_wholesaler_price",
            "stock_retailer_price",
            "stock_purchase_price",
          ],
          include: [
            {
              model: Product,
              attributes: ["product_name", "product_id"],
              where: condition,
            },
          ],
        },
      ],
      group: ["OrderList.stock_id", "Order.Retailer.type"],
    });

    let profitLossRetailer = result
      .filter((m) => m.Order?.Retailer?.type === "retailer")
      .map((m) => {
        const stock = m.Stock || {};
        const product = stock.Product || {};
        const stockRetailerPrice = Number(stock.stock_retailer_price);
        const totalSaleQuantity = Number(m.dataValues.total_quantity);

        const totalRetailerProfit = Math.round(
          stockRetailerPrice - stock.stock_purchase_price
        );

        const totalProfitLoss = Math.round(
          totalRetailerProfit * totalSaleQuantity
        );

        return {
          product_id: product.product_id,
          total_quantity: totalSaleQuantity,
          stock_retailer_price: stockRetailerPrice,
          product: product.product_name,
          retailer_profit_loss: totalProfitLoss,
          wholesaler_profit_loss: 0,
        };
      });

    let profitLossWholesaler = result
      .filter((m) => m.Order?.Retailer?.type === "wholesaler")
      .map((m) => {
        const stock = m.Stock || {};
        const product = stock.Product || {};
        const stockWholesalerPrice = Number(stock.stock_wholesaler_price);
        const totalSaleQuantity = Number(m.dataValues.total_quantity);
        const totalWholesalerProfit = Math.round(
          stockWholesalerPrice - stock.stock_purchase_price
        );
        const totalProfitLoss = Math.round(
          totalWholesalerProfit * totalSaleQuantity
        );

        return {
          product_id: product.product_id,
          total_quantity: totalSaleQuantity,
          stock_wholesaler_price: stockWholesalerPrice,
          product: product.product_name,
          wholesaler_profit_loss: totalProfitLoss,
          retailer_profit_loss: 0,
        };
      });

    const aggregatedProfitLoss = {};

    [...profitLossRetailer, ...profitLossWholesaler].forEach((item) => {
      const key = item.product_id;

      if (!aggregatedProfitLoss[key]) {
        aggregatedProfitLoss[key] = {
          product_id: item.product_id,
          total_quantity: 0,
          retailer_profit_loss: 0,
          wholesaler_profit_loss: 0,
          product: item.product,
        };
      }

      aggregatedProfitLoss[key].total_quantity += item.total_quantity;
      aggregatedProfitLoss[key].retailer_profit_loss +=
        item.retailer_profit_loss;
      aggregatedProfitLoss[key].wholesaler_profit_loss +=
        item.wholesaler_profit_loss;
    });

    const finalResult = Object.values(aggregatedProfitLoss);
    const report = {
      profitLossReport: finalResult,
      report: "Product Wise Profit Loss",
    };
    const filePathName = path.resolve(
      __dirname,
      "../../../../../views/productWiseProfitLoss.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, report);

    let option = {
      format: "A1",
    };

    pdf.create(ejsData, option).toBuffer((err, buffer) => {
      if (err) {
        return next(globalError(500, err.message));
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline; filename=ProductWiseProfitLoss.pdf"
      );
      res.end(buffer);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchProductWiseProfitLossCSV = async (req, res, next) => {
  try {
    const { query = "" } = req.query;

    const condition = {
      [Op.and]: [{ product_deleted: false }],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          product_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    const result = await OrderList.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "total_quantity"],
        "stock_id",
      ],
      include: [
        {
          model: Order,
          attributes: [
            "order_id",
            "order_status",
            "order_confirm_date",
            "retailer_id",
          ], // Include specific Order columns
          where: {
            order_status: ["confirmed", "pending"],
            order_deleted: false,
          },
          include: [
            {
              model: Retailer,
              attributes: ["retailer_id", "type"],
              // where: {
              //   type: "retailer",
              // },
            },
          ],
        },
        {
          model: Stock,
          attributes: [
            "stock_id",
            "product_id",
            "stock_wholesaler_price",
            "stock_retailer_price",
            "stock_purchase_price",
          ],
          include: [
            {
              model: Product,
              attributes: ["product_name", "product_id"],
              where: condition,
            },
          ],
        },
      ],
      group: ["OrderList.stock_id", "Order.Retailer.type"],
    });

    let profitLossRetailer = result
      .filter((m) => m.Order?.Retailer?.type === "retailer")
      .map((m) => {
        const stock = m.Stock || {};
        const product = stock.Product || {};
        const stockRetailerPrice = Number(stock.stock_retailer_price);
        const totalSaleQuantity = Number(m.dataValues.total_quantity);

        const totalRetailerProfit = Math.round(
          stockRetailerPrice - stock.stock_purchase_price
        );

        const totalProfitLoss = Math.round(
          totalRetailerProfit * totalSaleQuantity
        );

        return {
          product_id: product.product_id,
          total_quantity: totalSaleQuantity,
          stock_retailer_price: stockRetailerPrice,
          product: product.product_name,
          retailer_profit_loss: totalProfitLoss,
          wholesaler_profit_loss: 0,
        };
      });

    let profitLossWholesaler = result
      .filter((m) => m.Order?.Retailer?.type === "wholesaler")
      .map((m) => {
        const stock = m.Stock || {};
        const product = stock.Product || {};
        const stockWholesalerPrice = Number(stock.stock_wholesaler_price);
        const totalSaleQuantity = Number(m.dataValues.total_quantity);
        const totalWholesalerProfit = Math.round(
          stockWholesalerPrice - stock.stock_purchase_price
        );
        const totalProfitLoss = Math.round(
          totalWholesalerProfit * totalSaleQuantity
        );

        return {
          product_id: product.product_id,
          total_quantity: totalSaleQuantity,
          stock_wholesaler_price: stockWholesalerPrice,
          product: product.product_name,
          wholesaler_profit_loss: totalProfitLoss,
          retailer_profit_loss: 0,
        };
      });

    const aggregatedProfitLoss = {};

    [...profitLossRetailer, ...profitLossWholesaler].forEach((item) => {
      const key = item.product_id;

      if (!aggregatedProfitLoss[key]) {
        aggregatedProfitLoss[key] = {
          product_id: item.product_id,
          total_quantity: 0,
          retailer_profit_loss: 0,
          wholesaler_profit_loss: 0,
          product: item.product,
        };
      }

      aggregatedProfitLoss[key].total_quantity += item.total_quantity;
      aggregatedProfitLoss[key].retailer_profit_loss +=
        item.retailer_profit_loss;
      aggregatedProfitLoss[key].wholesaler_profit_loss +=
        item.wholesaler_profit_loss;
    });

    const finalResult = Object.values(aggregatedProfitLoss);

    const csvFields = [
      "Product Id",
      "Total Quantity",
      "Retailer Profit Loss",
      "WholeSaler Profit Loss",
      "Product Name",
    ];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(finalResult);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=ProductWiseProfitLoss.csv"
    );
    res.end(csvData);
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchProductWiseProfitLossExcel = async (req, res, next) => {
  try {
    const { query = "" } = req.query;

    const condition = {
      [Op.and]: [{ product_deleted: false }],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          product_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    const result = await OrderList.findAll({
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "total_quantity"],
        "stock_id",
      ],
      include: [
        {
          model: Order,
          attributes: [
            "order_id",
            "order_status",
            "order_confirm_date",
            "retailer_id",
          ], // Include specific Order columns
          where: {
            order_status: ["confirmed", "pending"],
            order_deleted: false,
          },
          include: [
            {
              model: Retailer,
              attributes: ["retailer_id", "type"],
              // where: {
              //   type: "retailer",
              // },
            },
          ],
        },
        {
          model: Stock,
          attributes: [
            "stock_id",
            "product_id",
            "stock_wholesaler_price",
            "stock_retailer_price",
            "stock_purchase_price",
          ],
          include: [
            {
              model: Product,
              attributes: ["product_name", "product_id"],
              where: condition,
            },
          ],
        },
      ],
      group: ["OrderList.stock_id", "Order.Retailer.type"],
    });

    let profitLossRetailer = result
      .filter((m) => m.Order?.Retailer?.type === "retailer")
      .map((m) => {
        const stock = m.Stock || {};
        const product = stock.Product || {};
        const stockRetailerPrice = Number(stock.stock_retailer_price);
        const totalSaleQuantity = Number(m.dataValues.total_quantity);

        const totalRetailerProfit = Math.round(
          stockRetailerPrice - stock.stock_purchase_price
        );

        const totalProfitLoss = Math.round(
          totalRetailerProfit * totalSaleQuantity
        );

        return {
          product_id: product.product_id,
          total_quantity: totalSaleQuantity,
          stock_retailer_price: stockRetailerPrice,
          product: product.product_name,
          retailer_profit_loss: totalProfitLoss,
          wholesaler_profit_loss: 0,
        };
      });

    let profitLossWholesaler = result
      .filter((m) => m.Order?.Retailer?.type === "wholesaler")
      .map((m) => {
        const stock = m.Stock || {};
        const product = stock.Product || {};
        const stockWholesalerPrice = Number(stock.stock_wholesaler_price);
        const totalSaleQuantity = Number(m.dataValues.total_quantity);
        const totalWholesalerProfit = Math.round(
          stockWholesalerPrice - stock.stock_purchase_price
        );
        const totalProfitLoss = Math.round(
          totalWholesalerProfit * totalSaleQuantity
        );

        return {
          product_id: product.product_id,
          total_quantity: totalSaleQuantity,
          stock_wholesaler_price: stockWholesalerPrice,
          product: product.product_name,
          wholesaler_profit_loss: totalProfitLoss,
          retailer_profit_loss: 0,
        };
      });

    const aggregatedProfitLoss = {};

    [...profitLossRetailer, ...profitLossWholesaler].forEach((item) => {
      const key = item.product_id;

      if (!aggregatedProfitLoss[key]) {
        aggregatedProfitLoss[key] = {
          product_id: item.product_id,
          total_quantity: 0,
          retailer_profit_loss: 0,
          wholesaler_profit_loss: 0,
          product: item.product,
        };
      }

      aggregatedProfitLoss[key].total_quantity += item.total_quantity;
      aggregatedProfitLoss[key].retailer_profit_loss +=
        item.retailer_profit_loss;
      aggregatedProfitLoss[key].wholesaler_profit_loss +=
        item.wholesaler_profit_loss;
    });

    const finalResult = Object.values(aggregatedProfitLoss);

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Profit Loss Data");
    worksheet.columns = [
      { header: "Product Id", key: "product_id" },
      { header: "Product Name", key: "product" },
      { header: "Total Quantity Sell", key: "total_quantity" },
      { header: "Retailer Profit/Loss", key: "retailer_profit_loss" },
      { header: "WholeSaler Profit/Loss", key: "wholesaler_profit_loss" },
    ];

    finalResult?.forEach((m) => {
      let rows = {
        product_id: m.product_id,
        product: m.product,
        total_quantity: m.total_quantity,
        retailer_profit_loss: m.retailer_profit_loss,
        wholesaler_profit_loss: m.wholesaler_profit_loss,
      };
      worksheet.addRow(rows);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "inline; filename=ProductWiseProfitLoss.xlsx"
    );

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchPartyPendingBalancePDF = async (req, res, next) => {
  try {
    const { query = "" } = req.query;
    const condition = {
      [Op.and]: [],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          retailer_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    let bills = await Bill.findAll({
      where: {
        bill_status: "pending",
      },
      attributes: [
        "retailer_id",
        [
          sequelize.fn("SUM", sequelize.col("pending_amount")),
          "totalPendingAmount",
        ],
      ],
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
          where: condition,
        },
      ],
      group: ["retailer_id"],
    });

    const data = bills?.map((f) => {
      return {
        retailer_id: f.retailer_id,
        retailer_name: f.Retailer.retailer_name,
        pending_amount: f.getDataValue("totalPendingAmount"),
      };
    });

    const report = {
      data: data,
      report: "Party Overall Pending Balance",
    };
    const filePathName = path.resolve(
      __dirname,
      "../../../../../views/partyPendingBalance.ejs"
    );
    const htmlString = fs.readFileSync(filePathName).toString();
    const ejsData = ejs.render(htmlString, report);

    let option = {
      format: "A4",
    };

    pdf.create(ejsData, option).toBuffer((err, buffer) => {
      if (err) {
        return next(globalError(500, err.message));
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "inline; filename=PartyPendingBalance.pdf"
      );
      res.end(buffer);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchPartyPendingBalanceCSV = async (req, res, next) => {
  try {
    const { query = "" } = req.query;
    const condition = {
      [Op.and]: [],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          retailer_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    let bills = await Bill.findAll({
      where: {
        bill_status: "pending",
      },
      attributes: [
        "retailer_id",
        [
          sequelize.fn("SUM", sequelize.col("pending_amount")),
          "totalPendingAmount",
        ],
      ],
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
          where: condition,
        },
      ],
      group: ["retailer_id"],
    });

    const data = bills?.map((f) => {
      return {
        retailer_id: f.retailer_id,
        retailer_name: f.Retailer.retailer_name,
        pending_amount: f.getDataValue("totalPendingAmount"),
      };
    });

    const csvFields = ["ID", "Party Name", "Pending Amount"];

    const csvParser = new CsvParser({ csvFields });
    const csvData = csvParser.parse(data);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=PartyPendingBalance.csv"
    );
    res.end(csvData);
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

const fetchPartyPendingBalanceExcel = async (req, res, next) => {
  try {
    const { query = "" } = req.query;
    const condition = {
      [Op.and]: [],
    };

    condition[Op.and].push({
      [Op.or]: [
        {
          retailer_name: {
            [Op.like]: `%${query}%`,
          },
        },
      ],
    });

    let bills = await Bill.findAll({
      where: {
        bill_status: "pending",
      },
      attributes: [
        "retailer_id",
        [
          sequelize.fn("SUM", sequelize.col("pending_amount")),
          "totalPendingAmount",
        ],
      ],
      include: [
        {
          model: Retailer,
          attributes: ["retailer_id", "retailer_name"],
          where: condition,
        },
      ],
      group: ["retailer_id"],
    });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Party Pending Balance");
    worksheet.columns = [
      { header: "ID", key: "retailer_id" },
      { header: "Party Name", key: "retailer_name" },
      { header: "Pending Balance", key: "pending_amount" },
    ];

    bills?.forEach((f) => {
      let rows = {
        retailer_id: f.retailer_id,
        retailer_name: f.Retailer.retailer_name,
        pending_amount: f.getDataValue("totalPendingAmount"),
      };
      worksheet.addRow(rows);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "inline; filename=PartyPendingBalance.xlsx"
    );

    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    return next(globalError(500, error.message));
  }
};

module.exports = {
  fetchRetailerLedger,
  fetchRetailerLedgerCsv,
  fetchRetailerLedgerExcel,
  fetchVendorLedger,
  fetchVendorLedgerCsv,
  fetchVendorLedgerExcel,
  fetchWorkerLedger,
  fetchWorkerLedgerCsv,
  fetchWorkerLedgerExcel,
  fetchExecutiveLedger,
  fetchExecutiveLedgerCsv,
  fetchExecutiveLedgerExcel,
  fetchGSTR1ReportPDF,
  fetchGSTR1ReportCSV,
  fetchGSTR1ReportExcel,
  fetchGSTR2ReportPDF,
  fetchGSTR2ReportCSV,
  fetchGSTR2ReportExcel,
  fetchBillWiseProfitLossPDF,
  fetchBillWiseProfitLossCsv,
  fetchBillWiseProfitLossExcel,
  fetchProductWiseProfitLossPDF,
  fetchProductWiseProfitLossCSV,
  fetchProductWiseProfitLossExcel,
  fetchPartyPendingBalancePDF,
  fetchPartyPendingBalanceCSV,
  fetchPartyPendingBalanceExcel,
};
