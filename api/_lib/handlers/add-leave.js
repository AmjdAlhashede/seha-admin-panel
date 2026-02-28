const prisma = require('../prisma.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const {
            patientNameEn,
            patientNameAr,
            idNumber,
            birthDate,
            job,
            employer,
            nationality,
            city,
            startDate,
            endDate,
            daysCount,
            diagnosis,
            doctorName,
            hospitalName,
            notes
        } = req.body;

        const data = {
            serviceCode: "TEMP",
            patientNameEn,
            patientNameAr,
            idNumber,
            birthDate: new Date(birthDate),
            job,
            employer,
            nationality,
            city,
            startDate: new Date(startDate)
        };

        if (endDate) data.endDate = new Date(endDate);
        if (daysCount) data.daysCount = parseInt(daysCount);
        if (diagnosis) data.diagnosis = diagnosis;
        if (doctorName) data.doctorName = doctorName;
        if (hospitalName) data.hospitalName = hospitalName;
        if (notes) data.notes = notes;

        const newLeave = await prisma.sickLeave.create({ data });

        const serviceCode = generateServiceCode(newLeave.id, new Date(startDate));

        const updatedLeave = await prisma.sickLeave.update({
            where: { id: newLeave.id },
            data: { serviceCode }
        });

        return res.status(201).json(updatedLeave);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

function generateServiceCode(id, date) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = Array.from({ length: 3 }, () =>
        letters.charAt(Math.floor(Math.random() * letters.length))
    ).join('');

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const paddedId = String(id).padStart(4, '0');

    return `${randomLetters}${year}${month}${day}${paddedId}`;
}
