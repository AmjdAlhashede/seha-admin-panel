const prisma = require('../prisma.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        let serviceCode, nationalId, idNumber;

        if (req.method === 'GET') {
            serviceCode = req.query.serviceCode || req.query.ServiceCode;
            nationalId = req.query.nationalId || req.query.NationalId;
            idNumber = req.query.idNumber || req.query.IdNumber;
        } else {
            serviceCode = req.body.serviceCode || req.body.ServiceCode;
            nationalId = req.body.nationalId || req.body.NationalId;
            idNumber = req.body.idNumber || req.body.IdNumber;
        }

        const searchId = nationalId || idNumber;

        if (!serviceCode && !searchId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters',
                error: 'يجب إدخال رمز الخدمة أو رقم الهوية'
            });
        }

        const where = {};
        if (serviceCode) where.serviceCode = serviceCode;
        if (searchId) where.idNumber = searchId;

        const leaves = await prisma.sickLeave.findMany({
            where: where,
            orderBy: { createdAt: 'desc' }
        });

        if (leaves.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No leaves found',
                error: 'لم يتم العثور على إجازات مطابقة'
            });
        }

        return res.status(200).json({
            success: true,
            data: leaves.map(leave => ({
                id: leave.id,
                serviceCode: leave.serviceCode,
                patientNameEn: leave.patientNameEn,
                patientNameAr: leave.patientNameAr,
                nationalId: leave.idNumber,
                idNumber: leave.idNumber,
                birthDate: leave.birthDate,
                job: leave.job,
                employer: leave.employer,
                nationality: leave.nationality,
                city: leave.city,
                startDate: leave.startDate,
                status: leave.status,
                statusText: leave.status === 'pending' ? 'قيد المراجعة' :
                    leave.status === 'approved' ? 'موافق عليها' : 'مرفوضة',
                createdAt: leave.createdAt
            })),
            count: leaves.length
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
}
