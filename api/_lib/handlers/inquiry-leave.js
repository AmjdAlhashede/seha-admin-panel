const prisma = require('../prisma.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Support both new and legacy query parameters
        const serviceCode = req.query.serviceCode || req.query.NormalizedServiceCode || req.query.ServiceCode;
        const idNumber = req.query.idNumber || req.query.PatientId || req.query.IDNumber || req.query.NationalOrIqamaID;

        if (!serviceCode || !idNumber) {
            return res.status(400).json({
                message: 'Missing required parameters',
                error: 'يجب إدخال رمز الخدمة ورقم الهوية'
            });
        }

        const leave = await prisma.sickLeave.findFirst({
            where: {
                serviceCode: serviceCode,
                idNumber: idNumber
            }
        });

        if (!leave) {
            return res.status(404).json({
                message: 'Leave not found',
                error: 'رقم الهوية خاطئ أو رمز الخدمة غير صحيح',
                data: []
            });
        }

        // Map internal structure to legacy structure expected by the portal
        const legacyData = {
            PatientName: leave.patientNameAr,
            "Patient Name": leave.patientNameAr, // Some pages use spaces
            SickLeaveDate: leave.createdAt.toISOString().split("T")[0],
            From: leave.startDate.toISOString().split("T")[0],
            To: leave.endDate ? leave.endDate.toISOString().split("T")[0] : "",
            Duration: leave.daysCount || 0,
            "Doctor NAME": leave.doctorName || "",
            JobTitle: leave.job || "",
            Relationship: null, // Default
            FullName: leave.patientNameAr, // For Mlenquiry
            Status: leave.status === 'approved' ? 1 : 0, // Simplified
            NormalizedServiceCode: leave.serviceCode,
            ExamDate: leave.startDate.toISOString().split("T")[0],
            FinalResult: leave.status === 'approved' ? 1 : 0,
            ApplicantFullName: leave.patientNameAr, // For Amanat
            ApplicantIDNumber: leave.idNumber,
            ApplicantDOB: leave.birthDate.toISOString().split("T")[0],
            ApplicantPhone: "05XXXXXXXX",
            TestDate: leave.startDate.toISOString().split("T")[0],
            Justifications: leave.notes || ""
        };

        return res.status(200).json({
            success: true,
            data: [legacyData]
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}
