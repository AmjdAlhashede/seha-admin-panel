const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { currentUsername, newUsername, newPassword, rememberMe } = req.body;

    try {
        const admin = await prisma.adminAccount.findFirst({
            where: { username: currentUsername }
        });

        if (!admin) return res.status(404).json({ success: false, message: 'المسؤول غير موجود' });

        const updated = await prisma.adminAccount.update({
            where: { id: admin.id },
            data: {
                username: newUsername || admin.username,
                password: newPassword || admin.password,
                rememberMeDefault: rememberMe !== undefined ? rememberMe : admin.rememberMeDefault
            }
        });

        return res.status(200).json({ success: true, message: 'تم تحديث الإعدادات بنجاح', user: updated });
    } catch (error) {
        console.error('Update Settings Error:', error);
        return res.status(500).json({ success: false, message: 'فشل تحديث الإعدادات' });
    } finally {
        await prisma.$disconnect();
    }
};
