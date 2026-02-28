const prisma = require('../prisma.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        let serviceCode, nationalId;

        if (req.method === 'GET') {
            serviceCode = req.query.serviceCode || req.query.ServiceCode;
            nationalId = req.query.nationalId || req.query.NationalId || req.query.idNumber;
        } else {
            serviceCode = req.body.serviceCode || req.body.ServiceCode;
            nationalId = req.body.nationalId || req.body.NationalId || req.body.idNumber;
        }

        if (!serviceCode || !nationalId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters',
                error: 'يجب إدخال رمز الخدمة ورقم الهوية'
            });
        }

        const leave = await prisma.sickLeave.findFirst({
            where: {
                serviceCode: serviceCode,
                idNumber: nationalId
            }
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave not found',
                error: 'رقم الهوية خاطئ أو رمز الخدمة غير صحيح'
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
