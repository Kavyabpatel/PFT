const express = require('express');
const router = express.Router();
const { exportCSV, exportPDF, exportExcel } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/csv', exportCSV);
router.get('/excel', exportExcel);
router.get('/pdf', exportPDF);

module.exports = router;
