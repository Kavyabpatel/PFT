const Transaction = require('../models/Transaction');
const Asset = require('../models/Asset');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const EmergencyFund = require('../models/EmergencyFund');
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
            Amount: (Number(t.amount) || 0).toFixed(2),
            Category: t.category,
            Type: (t.type || '').toUpperCase(),
            Date: new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            Notes: t.notes || ''
        }));
        
        const fields = ['Date', 'Title', 'Category', 'Type', 'Amount', 'Notes'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(formattedTransactions);

        res.header('Content-Type', 'text/csv');
        res.attachment(`PFT_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
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
        workbook.creator = 'Personal Finance Tracker';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Financial Summary');

        // Column definitions
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 16 },
            { header: 'Transaction Title', key: 'title', width: 32 },
            { header: 'Category', key: 'category', width: 22 },
            { header: 'Type', key: 'type', width: 14 },
            { header: 'Amount (Rs.)', key: 'amount', width: 18 },
            { header: 'Notes / Description', key: 'notes', width: 40 }
        ];

        // Header Styling
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '0F172A' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 28;

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            const isInc = t.type && t.type.toLowerCase() === 'income';
            const amt = Number(t.amount) || 0;
            if (isInc) totalIncome += amt; else totalExpense += amt;

            const row = worksheet.addRow({
                date: new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                title: t.title,
                category: t.category,
                type: (t.type || '').toUpperCase(),
                amount: amt,
                notes: t.notes || ''
            });

            row.getCell('amount').numFmt = 'Rs. #,##0.00';
            row.getCell('type').font = { color: { argb: isInc ? '059669' : 'DC2626' }, bold: true };
        });

        worksheet.addRow([]);
        
        const summaryHeader = worksheet.addRow(['', 'FINANCIAL SUMMARY OVERVIEW']);
        summaryHeader.font = { bold: true, size: 12, color: { argb: '0F172A' } };

        const incRow = worksheet.addRow(['', 'Total Income', '', '', totalIncome]);
        incRow.getCell(5).numFmt = 'Rs. #,##0.00';
        incRow.getCell(5).font = { bold: true, color: { argb: '059669' } };

        const expRow = worksheet.addRow(['', 'Total Expense', '', '', totalExpense]);
        expRow.getCell(5).numFmt = 'Rs. #,##0.00';
        expRow.getCell(5).font = { bold: true, color: { argb: 'DC2626' } };

        const balRow = worksheet.addRow(['', 'Net Balance', '', '', totalIncome - totalExpense]);
        balRow.getCell(5).numFmt = 'Rs. #,##0.00';
        balRow.getCell(5).font = { bold: true, color: { argb: '0F172A' } };

        worksheet.autoFilter = 'A1:F1';
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + `PFT_Financial_Report_${new Date().toISOString().slice(0, 10)}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Excel Export Error:', error);
        res.status(500).json({ message: 'Server error during Excel generation.' });
    }
};

// @desc    Export Pixel-Perfect Financial Statement PDF Matching User Screenshot
// @route   GET /api/export/pdf
// @access  Private
const exportPDF = async (req, res) => {
    try {
        const userId = req.user._id;
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });

        const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
        const filename = `PFT_Financial_Statement_${new Date().toISOString().slice(0, 10)}.pdf`;
        
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Color Palette
        const slate900 = '#0f172a';
        const slate800 = '#1e293b';
        const slate500 = '#64748b';
        const slate400 = '#94a3b8';
        const slate200 = '#e2e8f0';

        // Calculations
        const totalIncome = transactions
            .filter(t => t.type && t.type.toLowerCase() === 'income')
            .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        const totalExpense = transactions
            .filter(t => t.type && t.type.toLowerCase() === 'expense')
            .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        const netBalance = totalIncome - totalExpense;

        const userName = req.user.name || 'Kavya Patel';
        const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

        // Format currency helper
        const formatCurrency = (amount) => `Rs. ${(Number(amount) || 0).toLocaleString('en-IN')}`;

        // --- 1. Letterhead ---
        doc.fillColor(slate500)
           .fontSize(9)
           .font('Helvetica-Bold')
           .text('PFT', 40, 42, { characterSpacing: 2 });

        doc.fillColor(slate900)
           .fontSize(28)
           .font('Times-Roman')
           .text('Financial Statement', 40, 56);

        doc.fillColor(slate500)
           .fontSize(10)
           .font('Helvetica')
           .text(`For the period ending ${dateStr}`, 40, 92);

        doc.fillColor(slate500)
           .fontSize(9.5)
           .font('Helvetica')
           .text('Prepared for', 350, 45, { align: 'right' });

        doc.fillColor(slate800)
           .fontSize(11)
           .font('Helvetica')
           .text(userName, 350, 60, { align: 'right' });

        doc.fillColor(slate500)
           .fontSize(10)
           .font('Helvetica')
           .text(dateStr, 350, 78, { align: 'right' });

        // Solid Letterhead Bottom Line
        doc.moveTo(40, 115).lineTo(555, 115).lineWidth(1.5).stroke(slate800);

        // --- 2. Summary Table ---
        let currentY = 145;

        // TOTAL INCOME
        doc.fillColor(slate500).fontSize(10).font('Helvetica').text('TOTAL INCOME', 40, currentY, { characterSpacing: 0.5 });
        doc.fillColor(slate900).fontSize(14).font('Helvetica').text(formatCurrency(totalIncome), 350, currentY - 2, { align: 'right', width: 205 });
        doc.moveTo(40, currentY + 20).lineTo(555, currentY + 20).lineWidth(0.5).stroke(slate200);

        // TOTAL EXPENSE
        currentY += 32;
        doc.fillColor(slate500).fontSize(10).font('Helvetica').text('TOTAL EXPENSE', 40, currentY, { characterSpacing: 0.5 });
        doc.fillColor(slate900).fontSize(14).font('Helvetica').text(`(${formatCurrency(totalExpense)})`, 350, currentY - 2, { align: 'right', width: 205 });
        
        // Mid-line under Total Expense (starts from x=300 to 555)
        currentY += 22;
        doc.moveTo(300, currentY).lineTo(555, currentY).lineWidth(1.5).stroke(slate800);

        // NET BALANCE
        currentY += 12;
        doc.fillColor(slate900).fontSize(11).font('Helvetica-Bold').text('NET BALANCE', 40, currentY, { characterSpacing: 0.5 });
        doc.fillColor(slate900)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text(formatCurrency(netBalance), 350, currentY - 4, { align: 'right', width: 205 });

        // --- 3. Transaction History Table ---
        currentY += 55;
        doc.fillColor(slate900)
           .fontSize(11)
           .font('Helvetica')
           .text('TRANSACTION HISTORY', 40, currentY, { characterSpacing: 0.5 });

        currentY += 20;
        // Table Header Line
        doc.moveTo(40, currentY).lineTo(555, currentY).lineWidth(1.5).stroke(slate800);

        currentY += 8;
        doc.fillColor(slate500).fontSize(10).font('Helvetica-Bold');
        doc.text('Date', 40, currentY);
        doc.text('Description', 140, currentY);
        doc.text('Category', 260, currentY);
        doc.text('Type', 360, currentY);
        doc.text('Amount', 450, currentY, { width: 105, align: 'right' });

        currentY += 16;
        doc.moveTo(40, currentY).lineTo(555, currentY).lineWidth(1.5).stroke(slate800);

        let rowY = currentY + 10;
        const rowHeight = 28;

        transactions.forEach((t) => {
            if (rowY + rowHeight > 760) {
                doc.addPage();
                rowY = 40;

                doc.fillColor(slate900).fontSize(11).font('Helvetica').text('TRANSACTION HISTORY (CONTINUED)', 40, rowY, { characterSpacing: 0.5 });
                rowY += 18;
                doc.moveTo(40, rowY).lineTo(555, rowY).lineWidth(1.5).stroke(slate800);
                rowY += 8;
                doc.fillColor(slate500).fontSize(10).font('Helvetica-Bold');
                doc.text('Date', 40, rowY);
                doc.text('Description', 140, rowY);
                doc.text('Category', 260, rowY);
                doc.text('Type', 360, rowY);
                doc.text('Amount', 450, rowY, { width: 105, align: 'right' });
                rowY += 16;
                doc.moveTo(40, rowY).lineTo(555, rowY).lineWidth(1.5).stroke(slate800);
                rowY += 10;
            }

            const formattedDate = new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const isInc = t.type && t.type.toLowerCase() === 'income';
            const amt = Number(t.amount) || 0;

            doc.fillColor(slate800).fontSize(9.5).font('Helvetica');
            doc.text(formattedDate, 40, rowY + 4);
            doc.text((t.title || 'Untitled').substring(0, 24), 140, rowY + 4);
            doc.text(t.category || 'General', 260, rowY + 4);
            doc.text(isInc ? 'Income' : 'Expense', 360, rowY + 4);

            const displayAmount = isInc ? formatCurrency(amt) : `(${formatCurrency(amt)})`;
            doc.fillColor(slate900)
               .font('Helvetica')
               .text(displayAmount, 450, rowY + 4, { width: 105, align: 'right' });

            rowY += rowHeight;
            doc.moveTo(40, rowY - 6).lineTo(555, rowY - 6).lineWidth(0.5).stroke(slate200);
        });

        // --- 4. Page Footer ---
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);
            doc.moveTo(40, 800).lineTo(555, 800).lineWidth(0.5).stroke(slate200);
            doc.fontSize(8)
               .fillColor(slate400)
               .font('Helvetica')
               .text('Generated by PFT — Personal Finance Tracker', 40, 808);
            doc.text('Confidential', 350, 808, { align: 'right', width: 205 });
        }

        doc.end();
    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({ message: 'Server error during PDF report generation.' });
    }
};

module.exports = {
    exportCSV,
    exportExcel,
    exportPDF
};
