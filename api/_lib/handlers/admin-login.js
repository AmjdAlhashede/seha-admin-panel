const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { username, password } = req.body;

    try {
        // Find the admin account
        let admin = await prisma.adminAccount.findFirst({
            where: { username: username }
        });

        // If no admin exists at all, create a default one (First-run setup)
        if (!admin && username === 'admin' && password === 'admin123') {
            admin = await prisma.adminAccount.create({
                data: {
                    username: 'admin',
                    password: 'admin123', // In production, use hashing!
                    rememberMeDefault: true
                }
            });
        }

        if (admin && admin.password === password) {
            const token = "admin_session_" + Math.random().toString(36).substr(2);

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                token: token,
                user: {
                    username: admin.username,
                    role: 'administrator',
                    rememberMe: admin.rememberMeDefault
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }
    } catch (error) {
        console.error('Login DB Error:', error);
        return res.status(500).json({ success: false, message: 'حدث خطأ في قاعدة البيانات' });
    } finally {
        await prisma.$disconnect();
    }
};
