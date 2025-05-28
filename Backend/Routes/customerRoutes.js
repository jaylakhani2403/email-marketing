// const express = require('express');
// const multer = require('multer');
// const XLSX = require('xlsx');
// const router = express.Router();
// const Customer = require('../models/Customer');
// const userServices = require('../Services/userServices');

// // Multer setup for in-memory storage
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Route: POST /upload
// router.post('/upload', upload.single('file'), async (req, res) => {
//   const email = userServices.getLoggedInUserEmail(); // Corrected function call
//   const file = req.file;

//   if (!file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   try {
//     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

//     const [headers, ...rows] = data;
//     const customers = rows.map(row => ({
//       customer_email: row[0],
//       customer_name: row[1],
//       template_name: row[2],
//       status: row[3],
//       email
//     }));

//     await Customer.insertMany(customers);
//     res.json({ message: 'Data imported successfully', insertedCount: customers.length });
//   } catch (error) {
//     console.error('Error importing data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;


const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();
const Customer = require('../models/Customer');
const userServices = require('../Services/userServices');

// Multer setup for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route: POST /upload (Bulk Upload Customers)
router.post('/upload', upload.single('file'), async (req, res) => {
  const uploadedby = userServices.getLoggedInUserEmail();
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const [headers, ...rows] = data;
    const customers = rows.map(row => ({
      customer_email: row[0],
      customer_name: row[1],
      template_name: row[2],
      status: row[3],
      uploadedby
    }));

    await Customer.insertMany(customers);
    res.json({ message: 'Data imported successfully', insertedCount: customers.length });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: GET /customers (Fetch all customers for the logged-in user)
router.get('/customers', async (req, res) => {
  try {
    const uploadedby = userServices.getLoggedInUserEmail();
    const customers = await Customer.find({ uploadedby }).sort({ date: -1 });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: PUT /customer/:id (Edit a customer)
router.put('/editcustomerDetails/:id', async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Customer not found' });

    res.json({ message: 'Customer updated successfully', updated });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: DELETE /customer/:id (Delete and return updated list)
router.delete('/deleteCustomer/:id', async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Customer not found' });

    const uploadedby = userServices.getLoggedInUserEmail();
    const updatedCustomers = await Customer.find({ uploadedby }).sort({ date: -1 });

    res.json({
      message: 'Customer deleted successfully',
      deleted,
      customers: updatedCustomers
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.delete('/deleteAllCustomers', async (req, res) => {
  try {
    await Customer.deleteMany({}); // or a filtered condition
    res.status(200).json({ message: 'All customers deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all customers' });
  }
});


module.exports = router;
