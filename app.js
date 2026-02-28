// --- SAMPLE REALISTIC DATA (Fallback if API fails) ---
const MOCK_DATA = [];

const MOCK_STAFF = [
    { name: "د. سامي الجابر", role: "استشاري قلب", hospital: "مستشفى الملك فهد" },
    { name: "د. منى الأحمد", role: "طبيبة أطفال", hospital: "مجمع العيادات" },
    { name: "أ. علي حسن", role: "موظف استقبال", hospital: "مركز الروضة" },
];

let globalLeaves = [];

// --- CONFIGURATION ---
const API_BASE_URL = window.location.origin; // Same origin by default, but can be changed if API is elsewhere

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initApp();
});

function checkAuth() {
    if (!localStorage.getItem('admin_token')) {
        window.location.href = 'login.html';
    }
}

window.logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = 'login.html';
};

window.seedDatabase = async () => {
    const btn = document.getElementById('seed-btn');
    if (!btn) return;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> جاري الشحن...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/seed-data`, { method: 'POST' });
        const data = await response.json();

        if (data.success) {
            showToast(`✅ ${data.message}`);
            await loadLeaves();
            updateStats();
        } else {
            showToast('❌ ' + (data.message || 'حدث خطأ'));
        }
    } catch (error) {
        console.error('Seed error:', error);
        showToast('❌ حدث خطأ في الاتصال بالخادم');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
};

async function initApp() {
    await loadLeaves();
    renderStaff();

    // Setup Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = globalLeaves.filter(l => {
                const nameAr = l.patientNameAr || l.patientName || '';
                const nameEn = l.patientNameEn || l.patientName || '';
                return nameAr.toLowerCase().includes(val) ||
                    nameEn.toLowerCase().includes(val) ||
                    l.id.toString().includes(val);
            });
            renderTable(filtered, 'leaves-table-body', true);
        });
    }
}

// --- DATA HANDLING ---
async function loadLeaves() {
    // Show loading state
    showLoadingState();

    let leaves = [];
    let isUsingFallback = false;

    try {
        const res = await fetch('/api/get-leaves');
        if (!res.ok) throw new Error('API Failed');
        leaves = await res.json();

        // If API returns empty array, show message
        if (leaves.length === 0) {
            console.log('قاعدة البيانات فارغة - أضف بيانات من البورتال');
        }
    } catch (err) {
        console.warn('API Error:', err);
        leaves = [];
    }

    globalLeaves = leaves;

    // Hide loading and show data
    hideLoadingState();

    updateStats();
    renderTable(globalLeaves.slice(0, 5), 'dash-table-body', false);
    renderTable(globalLeaves, 'leaves-table-body', true);
}

// Show loading state
function showLoadingState() {
    const dashTable = document.getElementById('dash-table-body');
    const leavesTable = document.getElementById('leaves-table-body');

    const loadingHTML = `
        <tr>
            <td colspan="10" style="text-align:center; padding:40px;">
                <div style="display:inline-flex; align-items:center; gap:12px; color:var(--primary);">
                    <i class="fas fa-circle-notch fa-spin" style="font-size:1.5rem;"></i>
                    <span style="font-size:1.1rem; font-weight:600;">جاري تحميل البيانات...</span>
                </div>
            </td>
        </tr>
    `;

    if (dashTable) dashTable.innerHTML = loadingHTML.replace('colspan="10"', 'colspan="4"');
    if (leavesTable) leavesTable.innerHTML = loadingHTML;
}

// Hide loading state
function hideLoadingState() {
    // Loading will be replaced by actual data in renderTable
}

// --- RENDERING ---
function renderTable(data, elementId, isFull) {
    const tbody = document.getElementById(elementId);
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${isFull ? 10 : 4}" style="text-align:center; padding:40px;">
            <div style="color:#94a3b8;">
                <i class="fas fa-inbox" style="font-size:3rem; margin-bottom:15px; opacity:0.5;"></i>
                <p style="font-size:1.1rem; font-weight:600; margin-bottom:8px;">لا توجد بيانات</p>
                <p style="font-size:0.9rem;">أضف طلب إجازة من البورتال لتظهر هنا</p>
            </div>
        </td></tr>`;
        return;
    }

    data.forEach(item => {
        const date = new Date(item.startDate).toLocaleDateString('ar-SA');

        // Support old data format (patientName) and new format (patientNameAr, patientNameEn)
        const nameAr = item.patientNameAr || item.patientName || '-';
        const nameEn = item.patientNameEn || item.patientName || '-';

        let statusBadge = '';
        if (item.status === 'pending') statusBadge = '<span class="status-badge pending"><i class="fas fa-clock"></i> قيد المراجعة</span>';
        if (item.status === 'approved') statusBadge = '<span class="status-badge approved"><i class="fas fa-check"></i> مقبولة</span>';
        if (item.status === 'rejected') statusBadge = '<span class="status-badge rejected"><i class="fas fa-times"></i> مرفوضة</span>';

        let actions = '';
        if (item.status === 'pending') {
            actions = `
                <button onclick="changeStatus('${item.id}', 'approved')" style="border:none; background:#dcfce7; color:#166534; padding:5px 10px; border-radius:6px; cursor:pointer; margin-left:5px;" title="موافقة"><i class="fas fa-check"></i></button>
                <button onclick="changeStatus('${item.id}', 'rejected')" style="border:none; background:#fee2e2; color:#991b1b; padding:5px 10px; border-radius:6px; cursor:pointer; margin-left:5px;" title="رفض"><i class="fas fa-times"></i></button>
                <button onclick="viewDetails('${item.id}')" style="border:none; background:#e0e7ff; color:#4338ca; padding:5px 10px; border-radius:6px; cursor:pointer; margin-left:5px;" title="التفاصيل"><i class="fas fa-eye"></i></button>
                <button onclick="printLeave('${item.id}')" style="border:none; background:#f1f5f9; color:#475569; padding:5px 10px; border-radius:6px; cursor:pointer; margin-left:5px;" title="طباعة"><i class="fas fa-print"></i></button>
                <button onclick="deleteLeave('${item.id}')" style="border:none; background:#fef2f2; color:#dc2626; padding:5px 10px; border-radius:6px; cursor:pointer;" title="حذف"><i class="fas fa-trash"></i></button>
            `;
        } else {
            actions = `
                <button onclick="viewDetails('${item.id}')" style="border:none; background:#e0e7ff; color:#4338ca; padding:5px 10px; border-radius:6px; cursor:pointer; margin-left:5px;" title="التفاصيل"><i class="fas fa-eye"></i></button>
                <button onclick="printLeave('${item.id}')" style="border:none; background:#f1f5f9; color:#475569; padding:5px 10px; border-radius:6px; cursor:pointer; margin-left:5px;" title="طباعة"><i class="fas fa-print"></i></button>
                <button onclick="deleteLeave('${item.id}')" style="border:none; background:#fef2f2; color:#dc2626; padding:5px 10px; border-radius:6px; cursor:pointer;" title="حذف"><i class="fas fa-trash"></i></button>
            `;
        }

        const tr = document.createElement('tr');
        if (isFull) {
            tr.innerHTML = `
                <td style="font-family:monospace; color:var(--primary); font-weight:700;">${item.serviceCode}</td>
                <td style="font-weight:600;">${nameAr}</td>
                <td style="font-weight:600;">${nameEn}</td>
                <td style="font-family:monospace;">${item.idNumber || '-'}</td>
                <td>${item.job || '-'}</td>
                <td>${item.employer || '-'}</td>
                <td>${item.city || '-'}</td>
                <td>${date}</td>
                <td>${statusBadge}</td>
                <td style="white-space:nowrap;">${actions}</td>
            `;
        } else {
            tr.innerHTML = `
                <td style="font-family:monospace;">${item.serviceCode}</td>
                <td style="font-weight:600;">${nameAr}</td>
                <td>${date}</td>
                <td>${statusBadge}</td>
            `;
        }
        tbody.appendChild(tr);
    });
}

function renderStaff() {
    const container = document.querySelector('.staff-grid');
    if (!container) return;

    // Keep the "Add" card if exists
    // But easier to regenerate
    container.innerHTML = `
        <div class="add-staff-card" onclick="openModal()">
            <div style="width:60px; height:60px; background:#e2e8f0; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:15px; color:#64748b;">
                <i class="fas fa-plus fa-lg"></i>
            </div>
            <h3 style="color:#475569;">إضافة موظف جديد</h3>
        </div>
    `;

    MOCK_STAFF.forEach(member => {
        const div = document.createElement('div');
        div.className = 'staff-card';
        div.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${member.name}&background=random" class="staff-avatar">
            <h3 style="font-size:1.1rem; margin-bottom:5px;">${member.name}</h3>
            <p style="color:var(--primary); font-weight:600; font-size:0.9rem;">${member.role}</p>
            <p style="color:#94a3b8; font-size:0.85rem;">${member.hospital}</p>
        `;
        container.appendChild(div);
    });
}

function updateStats() {
    const pending = globalLeaves.filter(i => i.status === 'pending').length;
    const approved = globalLeaves.filter(i => i.status === 'approved').length;
    const rejected = globalLeaves.filter(i => i.status === 'rejected').length;

    const pEl = document.querySelector('.val-pending');
    const aEl = document.querySelector('.val-approved');
    const rEl = document.querySelector('.val-rejected');

    if (pEl) pEl.textContent = pending;
    if (aEl) aEl.textContent = approved;
    if (rEl) rEl.textContent = rejected;
}

// --- ACTIONS ---
async function changeStatus(id, newStatus) {
    if (!confirm('هل أنت متأكد من تغيير الحالة؟')) return;

    // Show loading toast
    showToast('⏳ جاري تحديث الحالة...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/update-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: newStatus })
        });

        if (!response.ok) throw new Error('Server Error');

        // Update locally after server confirms
        const idx = globalLeaves.findIndex(l => l.id == id);
        if (idx > -1) {
            globalLeaves[idx].status = newStatus;
            updateStats();
            renderTable(globalLeaves.slice(0, 5), 'dash-table-body', false);
            renderTable(globalLeaves, 'leaves-table-body', true);
        }

        showToast('✅ تم تحديث الحالة بنجاح');
    } catch (error) {
        console.error('Update Status Error:', error);
        showToast('❌ فشل تحديث الحالة - تحقق من الاتصال');
    }
}

// --- NAVIGATION & UI HELPERS ---
window.navTo = function (sectionId, el) {
    // 1. Update Sidebar Active State
    if (el) {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
    } else {
        // Fallback for non-sidebar clicks (e.g. from dashboard button)
        // Manual mapping if needed, simplified here
    }

    // 2. Show Section
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    // 3. Close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    // 4. Update Title
    const map = { 'dashboard': 'نظرة عامة', 'leaves': 'طلبات الإجازة', 'staff': 'الطاقم الطبي', 'settings': 'الإعدادات' };
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = map[sectionId] || 'لوحة التحكم';
}

// Modal & Toast Global Functions
window.openModal = () => {
    const m = document.getElementById('staffModal');
    if (m) m.classList.add('active');
}
window.closeModal = () => {
    const m = document.getElementById('staffModal');
    if (m) m.classList.remove('active');
}
window.addStaff = () => {
    closeModal();
    showToast('تم إضافة الموظف بنجاح');
    // Add dummy staff visually
    MOCK_STAFF.push({ name: "موظف جديد", role: "طاقم طبي", hospital: "الإدارة" });
    renderStaff();
}

window.showToast = (msg) => {
    const t = document.getElementById('toast');
    const txt = document.getElementById('toastMsg');
    if (t && txt) {
        txt.textContent = msg;
        t.classList.add('active');
        setTimeout(() => t.classList.remove('active'), 3000);
    }
}

// Refresh data from server
window.refreshData = async () => {
    const btn = event.target.closest('button');
    const icon = btn.querySelector('i');

    // Add spinning animation
    icon.classList.add('fa-spin');
    btn.disabled = true;

    try {
        await loadLeaves();
        showToast('✅ تم تحديث البيانات بنجاح');
    } catch (error) {
        showToast('❌ فشل تحديث البيانات');
    } finally {
        icon.classList.remove('fa-spin');
        btn.disabled = false;
    }
}

// View Details Function
window.viewDetails = (leaveId) => {
    const leave = globalLeaves.find(l => l.id == leaveId);
    if (!leave) return;

    // Support old and new data format
    const nameAr = leave.patientNameAr || leave.patientName || '-';
    const nameEn = leave.patientNameEn || leave.patientName || '-';

    const birthDate = leave.birthDate ? new Date(leave.birthDate).toLocaleDateString('ar-SA') : '-';
    const startDate = new Date(leave.startDate).toLocaleDateString('ar-SA');
    const createdDate = leave.createdAt ? new Date(leave.createdAt).toLocaleDateString('ar-SA') : startDate;

    let statusText = '';
    let statusColor = '';
    let statusIcon = '';
    if (leave.status === 'pending') {
        statusText = 'قيد المراجعة';
        statusColor = '#ea580c';
        statusIcon = 'fa-clock';
    } else if (leave.status === 'approved') {
        statusText = 'مقبولة';
        statusColor = '#16a34a';
        statusIcon = 'fa-check-circle';
    } else {
        statusText = 'مرفوضة';
        statusColor = '#dc2626';
        statusIcon = 'fa-times-circle';
    }

    // Action buttons for pending status
    let actionButtons = '';
    if (leave.status === 'pending') {
        actionButtons = `
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button onclick="approveFromModal('${leave.id}')" 
                    style="flex:1; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; border:none; padding:14px; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; font-size:1rem; transition:0.2s;">
                    <i class="fas fa-check-circle"></i> موافقة
                </button>
                <button onclick="rejectFromModal('${leave.id}')" 
                    style="flex:1; background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color:white; border:none; padding:14px; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; font-size:1rem; transition:0.2s;">
                    <i class="fas fa-times-circle"></i> رفض
                </button>
            </div>
        `;
    }

    const detailsHTML = `
        <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:25px; border-radius:12px 12px 0 0; margin:-30px -30px 20px -30px; text-align:center;">
            <div style="width:80px; height:80px; background:white; border-radius:50%; margin:0 auto 15px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                <i class="fas fa-user-injured" style="font-size:2.5rem; color:#667eea;"></i>
            </div>
            <h3 style="color:white; margin:0; font-size:1.3rem;">${nameAr}</h3>
            <p style="color:rgba(255,255,255,0.8); margin:5px 0 0 0; font-size:0.95rem;">${nameEn}</p>
            <p style="color:rgba(255,255,255,0.9); margin:5px 0 0 0; font-size:0.9rem;">رمز الخدمة: ${leave.serviceCode}</p>
        </div>

        <div style="background:#f8fafc; padding:20px; border-radius:12px; margin-bottom:15px;">
            <h4 style="color:var(--primary); margin-bottom:15px; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-user-circle"></i> المعلومات الشخصية
            </h4>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">رقم الهوية:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${leave.idNumber || '-'}</p>
                </div>
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">تاريخ الميلاد:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${birthDate}</p>
                </div>
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">الجنسية:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${leave.nationality || '-'}</p>
                </div>
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">المدينة:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${leave.city || '-'}</p>
                </div>
            </div>
        </div>

        <div style="background:#f8fafc; padding:20px; border-radius:12px; margin-bottom:15px;">
            <h4 style="color:var(--primary); margin-bottom:15px; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-briefcase"></i> معلومات العمل
            </h4>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">الوظيفة:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${leave.job || '-'}</p>
                </div>
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">جهة العمل:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${leave.employer || '-'}</p>
                </div>
            </div>
        </div>

        <div style="background:#f8fafc; padding:20px; border-radius:12px; margin-bottom:${leave.status === 'pending' ? '0' : '15px'};">
            <h4 style="color:var(--primary); margin-bottom:15px; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-calendar-check"></i> تفاصيل الإجازة
            </h4>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">تاريخ البدء:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${startDate}</p>
                </div>
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">تاريخ النهاية:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${leave.endDate ? new Date(leave.endDate).toLocaleDateString('ar-SA') : '-'}</p>
                </div>
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">مدة الإجازة:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${leave.daysCount ? leave.daysCount + ' أيام' : '-'}</p>
                </div>
                <div>
                    <strong style="color:#64748b; font-size:0.85rem;">اسم الطبيب:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${leave.doctorName || '-'}</p>
                </div>
                <div style="grid-column: 1 / -1;">
                    <strong style="color:#64748b; font-size:0.85rem;">التشخيص:</strong>
                    <p style="margin:5px 0 0 0; color:#0f172a; font-weight:600;">${leave.diagnosis || '-'}</p>
                </div>
                <div style="grid-column: 1 / -1;">
                    <strong style="color:#64748b; font-size:0.85rem;">ملاحظات:</strong>
                    <p style="margin:5px 0 0 0; color:#64748b; font-size:0.9rem;">${leave.notes || 'لا يوجد ملاحظات'}</p>
                </div>
                <div style="grid-column:1/-1;">
                    <strong style="color:#64748b; font-size:0.85rem;">الحالة:</strong>
                    <div style="margin-top:8px; display:inline-flex; align-items:center; gap:8px; padding:8px 16px; background:${statusColor}15; border-radius:20px; border:2px solid ${statusColor};">
                        <i class="fas ${statusIcon}" style="color:${statusColor};"></i>
                        <span style="color:${statusColor}; font-weight:700;">${statusText}</span>
                    </div>
                </div>
            </div>
            <button onclick="printLeave('${leave.id}')" 
                style="width:100%; margin-top:15px; background:white; color:#475569; border:2px solid #e2e8f0; padding:12px; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:0.2s;">
                <i class="fas fa-print"></i> تحميل تقرير PDF
            </button>
        </div>

        ${actionButtons}
    `;

    document.getElementById('detailsContent').innerHTML = detailsHTML;
    document.getElementById('detailsModal').classList.add('active');
}

// Approve from modal
window.approveFromModal = async (leaveId) => {
    closeDetailsModal();
    await changeStatus(leaveId, 'approved');
}

// Reject from modal
window.rejectFromModal = async (leaveId) => {
    closeDetailsModal();
    await changeStatus(leaveId, 'rejected');
}

window.closeDetailsModal = () => {
    document.getElementById('detailsModal').classList.remove('active');
}

// Print/PDF Handler
window.printLeave = (id) => {
    const leave = globalLeaves.find(l => l.id == id);
    if (!leave) return;

    const pdfData = {
        ...leave,
        patientName: leave.patientNameAr || leave.patientName || 'N/A'
    };

    if (window.generateSickLeavePDF) {
        window.generateSickLeavePDF(pdfData);
    } else {
        alert('حدث خطأ في محرك توليد التقارير');
    }
}

// --- FILTER BY STATUS ---
let currentFilter = 'all';

window.filterByStatus = (status) => {
    currentFilter = status;

    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const f = btn.dataset.filter;
        if (f === status) {
            if (f === 'all') {
                btn.style.background = 'var(--primary)';
                btn.style.color = 'white';
            } else if (f === 'pending') {
                btn.style.background = '#ea580c';
                btn.style.color = 'white';
            } else if (f === 'approved') {
                btn.style.background = '#16a34a';
                btn.style.color = 'white';
            } else if (f === 'rejected') {
                btn.style.background = '#dc2626';
                btn.style.color = 'white';
            }
        } else {
            btn.style.background = 'transparent';
            if (f === 'all') btn.style.color = 'var(--primary)';
            else if (f === 'pending') btn.style.color = '#ea580c';
            else if (f === 'approved') btn.style.color = '#16a34a';
            else if (f === 'rejected') btn.style.color = '#dc2626';
        }
    });

    const filtered = status === 'all' ? globalLeaves : globalLeaves.filter(l => l.status === status);
    renderTable(filtered, 'leaves-table-body', true);
}

// --- DELETE LEAVE ---
window.deleteLeave = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع!')) return;

    showToast('⏳ جاري الحذف...');

    try {
        const response = await fetch(`/api/delete-leave?id=${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Server Error');

        // Remove locally
        globalLeaves = globalLeaves.filter(l => l.id != id);
        updateStats();
        renderTable(globalLeaves.slice(0, 5), 'dash-table-body', false);

        // Re-apply current filter
        const filtered = currentFilter === 'all' ? globalLeaves : globalLeaves.filter(l => l.status === currentFilter);
        renderTable(filtered, 'leaves-table-body', true);

        showToast('✅ تم حذف الطلب بنجاح');
    } catch (error) {
        console.error('Delete Error:', error);
        showToast('❌ فشل حذف الطلب');
    }
}

// --- ADD LEAVE DIRECT MODAL ---
window.openAddLeaveModal = () => {
    const m = document.getElementById('addLeaveModal');
    if (m) m.classList.add('active');
}

window.closeAddLeaveModal = () => {
    const m = document.getElementById('addLeaveModal');
    if (m) m.classList.remove('active');
    document.getElementById('direct-leave-form')?.reset();
}

window.submitDirectLeave = async (e) => {
    e.preventDefault();

    const formData = {
        patientNameAr: document.getElementById('dl-nameAr').value,
        patientNameEn: document.getElementById('dl-nameEn').value,
        idNumber: document.getElementById('dl-idNumber').value,
        birthDate: document.getElementById('dl-birthDate').value,
        job: document.getElementById('dl-job').value,
        employer: document.getElementById('dl-employer').value,
        nationality: document.getElementById('dl-nationality').value,
        city: document.getElementById('dl-city').value,
        startDate: document.getElementById('dl-startDate').value,
        endDate: document.getElementById('dl-endDate').value,
        daysCount: document.getElementById('dl-daysCount').value,
        servicePrefix: document.getElementById('dl-servicePrefix').value,
        doctorName: document.getElementById('dl-doctorName').value,
        hospitalName: document.getElementById('dl-hospitalName').value,
        diagnosis: document.getElementById('dl-diagnosis').value,
        notes: document.getElementById('dl-notes').value
    };

    showToast('⏳ جاري إضافة الإجازة...');

    try {
        const response = await fetch('/api/add-leave-direct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Server Error');

        const result = await response.json();
        closeAddLeaveModal();

        // Add to local data and refresh
        globalLeaves.unshift(result);
        updateStats();
        renderTable(globalLeaves.slice(0, 5), 'dash-table-body', false);

        const filtered = currentFilter === 'all' ? globalLeaves : globalLeaves.filter(l => l.status === currentFilter);
        renderTable(filtered, 'leaves-table-body', true);

        showToast(`✅ تم إضافة الإجازة بنجاح - رمز: ${result.serviceCode}`);
    } catch (error) {
        console.error('Add Leave Error:', error);
        showToast('❌ فشل إضافة الإجازة');
    }
}
