const Transaction = require('../models/Transaction');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// @desc    Export transactions as CSV
// @route   GET /api/export/csv
// @access  Private
const exportCSV = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authorized.' });
        }

        const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });

        if (!transactions.length) {
            return res.status(404).json({ message: 'No transactions found to export.' });
        }

        const formattedTransactions = transactions.map(t => ({
            Title: t.title,
            Amount: `₹${t.amount.toFixed(2)}`,
            Category: t.category,
            Type: t.type.toUpperCase(),
            Date: new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            Notes: t.notes || ''
        }));
        
        const fields = ['Title', 'Amount', 'Category', 'Type', 'Date', 'Notes'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(formattedTransactions);

        res.header('Content-Type', 'text/csv');
        res.attachment('PFT_Transactions_Report.csv');
        return res.send(csv);
    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).json({ message: 'Server error during CSV generation.' });
    }
};

// @desc    Export transactions as Excel
// @route   GET /api/export/excel
// @access  Private
const exportExcel = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Transactions');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Amount (₹)', key: 'amount', width: 15 },
            { header: 'Notes', key: 'notes', width: 40 }
        ];

        // Style the header row
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '6366F1' }
        };

        transactions.forEach(t => {
            worksheet.addRow({
                date: new Date(t.date).toLocaleDateString('en-IN'),
                title: t.title,
                category: t.category,
                type: t.type.toUpperCase(),
                amount: t.amount,
                notes: t.notes || ''
            });
        });

        // Auto-filter and freeze header
        worksheet.autoFilter = 'A1:F1';
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + `PFT_Report_${new Date().getTime()}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Excel Export Error:', error);
        res.status(500).json({ message: 'Server error during Excel generation.' });
    }
};

// @desc    Export transactions as PDF
// @route   GET /api/export/pdf
// @access  Private
const exportPDF = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = 'PFT_Financial_Report.pdf';
        
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.rect(0, 0, 600, 150).fill('#6366f1');
        doc.fontSize(28).fillColor('#ffffff').text('FINANCIAL STATEMENT', 50, 50, { characterSpacing: 1 });
        doc.fontSize(10).fillColor('#ffffff').text('Personal Finance Tracker | Secure & Private', 50, 85);
        
        // Summary Info on Header
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const savings = income - expense;

        doc.fontSize(10).text(`Generated for: ${req.user.name}`, 400, 50, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 400, 65, { align: 'right' });

        doc.moveDown(4);

        // Summary Boxes
        const startY = 170;
        doc.rect(50, startY, 150, 70).fill('#f1f5f9');
        doc.fillColor('#64748b').fontSize(8).text('TOTAL INCOME', 65, startY + 15);
        doc.fillColor('#10b981').fontSize(14).text(`₹${income.toLocaleString()}`, 65, startY + 35);

        doc.rect(225, startY, 150, 70).fill('#f1f5f9');
        doc.fillColor('#64748b').fontSize(8).text('TOTAL EXPENSE', 240, startY + 15);
        doc.fillColor('#ef4444').fontSize(14).text(`₹${expense.toLocaleString()}`, 240, startY + 35);

        doc.rect(400, startY, 150, 70).fill('#f1f5f9');
        doc.fillColor('#64748b').fontSize(8).text('NET BALANCE', 415, startY + 15);
        doc.fillColor('#6366f1').fontSize(14).text(`₹${savings.toLocaleString()}`, 415, startY + 35);

        // Table
        doc.moveDown(6);
        doc.fontSize(14).fillColor('#1e293b').text('Transaction History', 50, 270);
        
        const tableTop = 300;
        doc.fontSize(9).fillColor('#94a3b8');
        doc.text('DATE', 50, tableTop);
        doc.text('DESCRIPTION', 120, tableTop);
        doc.text('CATEGORY', 280, tableTop);
        doc.text('TYPE', 380, tableTop);
        doc.text('AMOUNT', 480, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#e2e8f0');

        let y = tableTop + 25;
        transactions.forEach((t, i) => {
            if (i % 2 === 0) {
                doc.rect(50, y - 5, 500, 25).fill('#f8fafc');
            }
            
            const date = new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            doc.fillColor('#1e293b').fontSize(8);
            doc.text(date, 50, y);
            doc.text(t.title.substring(0, 30), 120, y);
            doc.text(t.category, 280, y);
            doc.text(t.type.toUpperCase(), 380, y);
            
            const isInc = t.type === 'income';
            doc.fillColor(isInc ? '#10b981' : '#ef4444')
               .text(`${isInc ? '+' : '-'} ₹${t.amount.toLocaleString()}`, 480, y, { align: 'right' });

            y += 25;

            if (y > 750) {
                doc.addPage();
                y = 50;
            }
        });

        // Footer
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < (range.start + range.count); i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor('#94a3b8').text(
                `Personal Finance Tracker | Page ${i + 1} of ${range.count}`,
                50, 800, { align: 'center' }
            );
        }

        doc.end();
    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    exportCSV,
    exportExcel,
    exportPDF
};
