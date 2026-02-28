const prisma = require('../prisma.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const leaves = await prisma.sickLeave.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(leaves);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}