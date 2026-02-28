module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { username, password } = req.body;

    // Hardcoded credentials for the admin panel
    // In a real production system, these would be checked against a hashed password in a database
    if (username === 'admin' && password === 'admin123') {
        const token = "admin_session_" + Math.random().toString(36).substr(2);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                username: 'admin',
                role: 'administrator'
            }
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
};
