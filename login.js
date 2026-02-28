document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submit-btn');
    const errorBox = document.getElementById('error-box');
    const errorText = document.getElementById('error-text');

    // Reset UI
    errorBox.style.display = 'none';
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>جاري الدخول...</span>';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/admin-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Respect "Remember Me" setting from server/db
            const storage = data.user.rememberMe ? localStorage : sessionStorage;

            // Save token and user info
            storage.setItem('admin_token', data.token);
            storage.setItem('admin_user', JSON.stringify(data.user));

            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            // Show error
            errorText.textContent = data.message || 'خطأ في اسم المستخدم أو كلمة المرور';
            errorBox.style.display = 'flex';
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        errorText.textContent = 'حدث خطأ في الاتصال بالخادم';
        errorBox.style.display = 'flex';
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
    }
});

// Check if already logged in
if (localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')) {
    window.location.href = 'index.html';
}
