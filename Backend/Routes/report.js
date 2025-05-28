const express = require('express');
const router = express.Router();
const fs = require('fs');
const { Parser } = require('json2csv');
const Customer = require('../models/Customer'); // use Mongoose model

// Endpoint to generate the customer report
router.get('/generateReport', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    };

    const customers = await Customer.find(query);

    const csvFields = ['customer_email', 'customer_name', 'template_name', 'status', 'uploadedby', 'date'];
    const parser = new Parser({ fields: csvFields });
    const csv = parser.parse(customers);

    const filePath = './customer_report.csv';
    fs.writeFileSync(filePath, csv);

    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      fs.unlinkSync(filePath); // Clean up after sending
    });

  } catch (error) {
    console.error('Error generating customer report:', error);
    res.status(500).json({ error: 'Failed to generate customer report' });
  }
});

module.exports = router;
