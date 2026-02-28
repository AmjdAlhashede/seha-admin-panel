/**
 * مكتبة توليد تقارير PDF احترافية للإجازات المرضية
 * تصميم مستوحى من تقارير وزارة الصحة السعودية
 */

/**
 * توليد تقرير PDF احترافي لإجازة مرضية واحدة
 */
async function generateSickLeavePDF(leave) {
    if (typeof window.jspdf === 'undefined') {
        alert('مكتبة PDF غير محملة');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ========== Header Section ==========
    // Logo area (top right)
    doc.setFillColor(14, 165, 233); // Primary blue
    doc.rect(pageWidth - 50, 10, 40, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SEHA', pageWidth - 30, 28, { align: 'center' });

    // Ministry header (top left)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Kingdom of Saudi Arabia', 15, 15);
    doc.text('Ministry of Health', 15, 22);
    doc.setFontSize(8);
    doc.text('Seha Digital Platform', 15, 29);

    // ========== Title Section ==========
    doc.setFillColor(240, 249, 255); // Light blue background
    doc.rect(0, 45, pageWidth, 25, 'F');

    doc.setTextColor(14, 165, 233);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Sick Leave Report', pageWidth / 2, 55, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Medical Leave Certificate', pageWidth / 2, 63, { align: 'center' });

    // ========== Leave ID Badge ==========
    let y = 80;
    doc.setFillColor(79, 70, 229); // Purple
    doc.roundedRect(15, y, 60, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Leave ID: #${leave.id}`, 45, y + 8, { align: 'center' });

    // ========== Patient Information Section ==========
    y = 100;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 15, y);

    // Draw section box
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, y + 3, pageWidth - 30, 60, 2, 2);

    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Two column layout
    const col1X = 25;
    const col2X = pageWidth / 2 + 10;
    const labelColor = [100, 116, 139];
    const valueColor = [15, 23, 42];

    // Column 1
    doc.setTextColor(...labelColor);
    doc.text('Full Name:', col1X, y);
    doc.setTextColor(...valueColor);
    doc.setFont('helvetica', 'bold');
    doc.text(leave.patientName, col1X + 25, y);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...labelColor);
    doc.text('ID Number:', col1X, y);
    doc.setTextColor(...valueColor);
    doc.text(leave.idNumber || 'N/A', col1X + 25, y);

    y += 10;
    doc.setTextColor(...labelColor);
    doc.text('Job Title:', col1X, y);
    doc.setTextColor(...valueColor);
    doc.text(leave.job || 'N/A', col1X + 25, y);

    y += 10;
    doc.setTextColor(...labelColor);
    doc.text('Nationality:', col1X, y);
    doc.setTextColor(...valueColor);
    doc.text(leave.nationality || 'N/A', col1X + 25, y);

    // Column 2
    y = 112;
    doc.setTextColor(...labelColor);
    doc.text('Employer:', col2X, y);
    doc.setTextColor(...valueColor);
    doc.text(leave.employer || 'N/A', col2X + 25, y);

    // ========== Leave Details Section ==========
    y = 175;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Leave Details', 15, y);

    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y + 3, pageWidth - 30, 35, 2, 2);

    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(...labelColor);
    doc.text('Start Date:', col1X, y);
    doc.setTextColor(...valueColor);
    const startDate = new Date(leave.startDate).toLocaleDateString('en-GB');
    doc.text(startDate, col1X + 25, y);

    doc.setTextColor(...labelColor);
    doc.text('Request Date:', col2X, y);
    doc.setTextColor(...valueColor);
    const createdDate = leave.createdAt ? new Date(leave.createdAt).toLocaleDateString('en-GB') : startDate;
    doc.text(createdDate, col2X + 30, y);

    y += 12;
    doc.setTextColor(...labelColor);
    doc.text('Status:', col1X, y);

    // Status badge
    let statusText = '';
    let statusBg = [0, 0, 0];

    if (leave.status === 'approved') {
        statusText = 'APPROVED';
        statusBg = [16, 185, 129];
    } else if (leave.status === 'rejected') {
        statusText = 'REJECTED';
        statusBg = [239, 68, 68];
    } else {
        statusText = 'PENDING';
        statusBg = [234, 88, 12];
    }

    doc.setFillColor(...statusBg);
    doc.roundedRect(col1X + 23, y - 5, 30, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(statusText, col1X + 38, y + 1, { align: 'center' });

    // ========== QR Code Placeholder ==========
    y = 225;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.rect(15, y, 30, 30);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('QR Code', 30, y + 17, { align: 'center' });

    doc.setFontSize(7);
    doc.text('Scan to verify', 30, y + 35, { align: 'center' });

    // ========== Footer ==========
    y = pageHeight - 25;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, y, pageWidth - 15, y);

    y += 8;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Seha Digital Platform - Ministry of Health', pageWidth / 2, y, { align: 'center' });

    y += 5;
    doc.setFontSize(7);
    doc.text('www.seha.sa | support@seha.sa | 920000000', pageWidth / 2, y, { align: 'center' });

    y += 5;
    const reportDate = new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Report Generated: ${reportDate}`, pageWidth / 2, y, { align: 'center' });

    // ========== Watermark ==========
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(50);
    doc.setFont('helvetica', 'bold');
    doc.text('SEHA', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45
    });

    // Save
    const fileName = `sick-leave-${leave.id}-${leave.patientName.replace(/\s+/g, '-')}.pdf`;
    doc.save(fileName);
}

/**
 * توليد تقرير شامل لجميع الإجازات
 */
async function generateAllLeavesPDF(leaves) {
    if (typeof window.jspdf === 'undefined') {
        alert('مكتبة PDF غير محملة');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Sick Leaves Summary Report', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Records: ${leaves.length}`, pageWidth / 2, 25, { align: 'center' });

    // Statistics
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;

    let y = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistics Overview', 15, y);

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Stats boxes
    const boxWidth = 55;
    const boxHeight = 20;
    const gap = 10;

    // Pending box
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(15, y, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(234, 88, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(pending.toString(), 15 + boxWidth / 2, y + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Pending', 15 + boxWidth / 2, y + 16, { align: 'center' });

    // Approved box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(15 + boxWidth + gap, y, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(approved.toString(), 15 + boxWidth + gap + boxWidth / 2, y + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Approved', 15 + boxWidth + gap + boxWidth / 2, y + 16, { align: 'center' });

    // Rejected box
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(15 + (boxWidth + gap) * 2, y, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(rejected.toString(), 15 + (boxWidth + gap) * 2 + boxWidth / 2, y + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Rejected', 15 + (boxWidth + gap) * 2 + boxWidth / 2, y + 16, { align: 'center' });

    // Table
    y += 35;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Requests', 15, y);

    y += 8;

    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, pageWidth - 30, 10, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('ID', 20, y + 7);
    doc.text('Patient Name', 40, y + 7);
    doc.text('Job', 105, y + 7);
    doc.text('Date', 145, y + 7);
    doc.text('Status', 175, y + 7);

    y += 10;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);

    leaves.slice(0, 15).forEach((leave, index) => {
        if (y > pageHeight - 30) {
            doc.addPage();
            y = 20;
        }

        // Alternate row colors
        if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
        }

        doc.text(`#${leave.id}`, 20, y);
        doc.text(leave.patientName.substring(0, 25), 40, y);
        doc.text((leave.job || 'N/A').substring(0, 15), 105, y);
        doc.text(new Date(leave.startDate).toLocaleDateString('en-GB'), 145, y);

        // Status
        let statusColor = [0, 0, 0];
        if (leave.status === 'approved') statusColor = [16, 185, 129];
        else if (leave.status === 'rejected') statusColor = [239, 68, 68];
        else statusColor = [234, 88, 12];

        doc.setTextColor(...statusColor);
        doc.text(leave.status.toUpperCase(), 175, y);
        doc.setTextColor(0, 0, 0);

        y += 8;
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const reportDate = new Date().toLocaleString('en-GB');
    doc.text(`Generated: ${reportDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`sick-leaves-summary-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * توليد تقرير إحصائي
 */
async function generateStatisticsPDF(leaves) {
    if (typeof window.jspdf === 'undefined') {
        alert('مكتبة PDF غير محملة');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistical Analysis Report', pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Sick Leave Management System', pageWidth / 2, 28, { align: 'center' });

    // Calculate statistics
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;

    // Job distribution
    const jobCounts = {};
    leaves.forEach(l => {
        const job = l.job || 'Unknown';
        jobCounts[job] = (jobCounts[job] || 0) + 1;
    });
    const topJobs = Object.entries(jobCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    let y = 55;

    // Overview section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Overview', 15, y);

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const stats = [
        { label: 'Total Requests', value: total, color: [79, 70, 229] },
        { label: 'Pending', value: `${pending} (${((pending / total) * 100).toFixed(1)}%)`, color: [234, 88, 12] },
        { label: 'Approved', value: `${approved} (${((approved / total) * 100).toFixed(1)}%)`, color: [16, 185, 129] },
        { label: 'Rejected', value: `${rejected} (${((rejected / total) * 100).toFixed(1)}%)`, color: [239, 68, 68] }
    ];

    stats.forEach(stat => {
        doc.setTextColor(100, 116, 139);
        doc.text(stat.label + ':', 25, y);
        doc.setTextColor(...stat.color);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value.toString(), 70, y);
        doc.setFont('helvetica', 'normal');
        y += 8;
    });

    // Top Jobs
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Job Titles', 15, y);

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    topJobs.forEach(([job, count], index) => {
        doc.setTextColor(100, 116, 139);
        doc.text(`${index + 1}.`, 25, y);
        doc.setTextColor(0, 0, 0);
        doc.text(job, 35, y);
        doc.setTextColor(79, 70, 229);
        doc.setFont('helvetica', 'bold');
        doc.text(`${count} requests`, 120, y);
        doc.setFont('helvetica', 'normal');
        y += 8;
    });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const reportDate = new Date().toLocaleString('en-GB');
    doc.text(`Report Date: ${reportDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`statistics-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

// Export functions
if (typeof window !== 'undefined') {
    window.generateSickLeavePDF = generateSickLeavePDF;
    window.generateAllLeavesPDF = generateAllLeavesPDF;
    window.generateStatisticsPDF = generateStatisticsPDF;
}
