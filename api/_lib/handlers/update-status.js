const prisma = require('./_lib/prisma.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { id, status } = req.body;

        const updatedLeave = await prisma.sickLeave.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        return res.status(200).json(updatedLeave);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}