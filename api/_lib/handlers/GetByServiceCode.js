const prisma = require('../prisma.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        let serviceCode;

        if (req.method === 'GET') {
            serviceCode = req.query.serviceCode || req.query.ServiceCode || req.query.code;
        } else {
            serviceCode = req.body.serviceCode || req.body.ServiceCode || req.body.code;
        }

        if (!serviceCode) {
            return res.status(400).json({
                success: false,
                message: 'Missing service code',
                error: 'يجب إدخال رمز الخدمة'
            });
        }

        const leave = await prisma.sickLeave.findFirst({
            where: {
                serviceCode: serviceCode
            }
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave not found',
                error: 'رمز الخدمة غير صحيح'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
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
            }
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
