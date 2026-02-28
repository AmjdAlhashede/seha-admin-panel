const prisma = require('../prisma.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const id = parseInt(req.query.id || req.body?.id);

        if (!id) {
            return res.status(400).json({ message: 'Missing leave ID' });
        }

        await prisma.sickLeave.delete({
            where: { id }
        });

        return res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
