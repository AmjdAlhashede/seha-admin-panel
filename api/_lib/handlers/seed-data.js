const prisma = require('../prisma.js');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Generate realistic Arabic sick leave data
        const sampleData = [
            {
                patientNameAr: "أحمد محمد العتيبي",
                patientNameEn: "Ahmed Mohammed Al-Otaibi",
                idNumber: "1098765432",
                birthDate: new Date("1990-05-15"),
                job: "مهندس برمجيات",
                employer: "شركة الاتصالات السعودية",
                nationality: "سعودي",
                city: "الرياض",
                startDate: new Date("2026-02-20"),
                status: "pending"
            },
            {
                patientNameAr: "فاطمة عبدالله الشمري",
                patientNameEn: "Fatima Abdullah Al-Shammari",
                idNumber: "1087654321",
                birthDate: new Date("1985-09-22"),
                job: "معلمة",
                employer: "وزارة التعليم",
                nationality: "سعودية",
                city: "جدة",
                startDate: new Date("2026-02-18"),
                status: "approved"
            },
            {
                patientNameAr: "خالد سعد القحطاني",
                patientNameEn: "Khalid Saad Al-Qahtani",
                idNumber: "1076543210",
                birthDate: new Date("1992-01-10"),
                job: "محاسب",
                employer: "البنك الأهلي السعودي",
                nationality: "سعودي",
                city: "الدمام",
                startDate: new Date("2026-02-15"),
                status: "approved"
            },
            {
                patientNameAr: "نورة سلطان الدوسري",
                patientNameEn: "Noura Sultan Al-Dosari",
                idNumber: "1065432109",
                birthDate: new Date("1988-12-03"),
                job: "طبيبة أسنان",
                employer: "مجمع عيادات السلام",
                nationality: "سعودية",
                city: "مكة المكرمة",
                startDate: new Date("2026-02-22"),
                status: "pending"
            },
            {
                patientNameAr: "عبدالعزيز يوسف الغامدي",
                patientNameEn: "Abdulaziz Yousef Al-Ghamdi",
                idNumber: "1054321098",
                birthDate: new Date("2003-07-18"),
                job: "طالب",
                employer: "جامعة الملك سعود",
                nationality: "سعودي",
                city: "الرياض",
                startDate: new Date("2026-02-10"),
                status: "rejected"
            },
            {
                patientNameAr: "سارة إبراهيم الزهراني",
                patientNameEn: "Sara Ibrahim Al-Zahrani",
                idNumber: "1043210987",
                birthDate: new Date("1993-04-25"),
                job: "صيدلانية",
                employer: "صيدليات الدواء",
                nationality: "سعودية",
                city: "الطائف",
                startDate: new Date("2026-02-24"),
                status: "pending"
            },
            {
                patientNameAr: "محمد علي الحربي",
                patientNameEn: "Mohammed Ali Al-Harbi",
                idNumber: "2087654321",
                birthDate: new Date("1987-11-08"),
                job: "سائق",
                employer: "شركة النقل الجماعي",
                nationality: "مصري",
                city: "الرياض",
                startDate: new Date("2026-02-19"),
                status: "approved"
            },
            {
                patientNameAr: "ريم ناصر المطيري",
                patientNameEn: "Reem Nasser Al-Mutairi",
                idNumber: "1032109876",
                birthDate: new Date("2005-02-14"),
                job: "طالبة",
                employer: "جامعة نورة",
                nationality: "سعودية",
                city: "الرياض",
                startDate: new Date("2026-02-23"),
                status: "pending"
            },
            {
                patientNameAr: "تركي فيصل العنزي",
                patientNameEn: "Turki Faisal Al-Anazi",
                idNumber: "1021098765",
                birthDate: new Date("1991-08-30"),
                job: "مدير مشاريع",
                employer: "أرامكو السعودية",
                nationality: "سعودي",
                city: "الظهران",
                startDate: new Date("2026-02-12"),
                status: "approved"
            },
            {
                patientNameAr: "ياسر أحمد الزهراني",
                patientNameEn: "Yasser Ahmed Al-Zahrani",
                idNumber: "1010987654",
                birthDate: new Date("2008-06-20"),
                job: "طالب",
                employer: "مدرسة الثانوية الأولى",
                nationality: "سعودي",
                city: "جدة",
                startDate: new Date("2026-02-25"),
                status: "pending"
            }
        ];

        // Generate service codes
        const generateServiceCode = (id, date) => {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const randomLetters = Array.from({ length: 3 }, () =>
                letters.charAt(Math.floor(Math.random() * letters.length))
            ).join('');
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const paddedId = String(id).padStart(4, '0');
            return `${randomLetters}${year}${month}${day}${paddedId}`;
        };

        let insertedCount = 0;

        for (const item of sampleData) {
            const newLeave = await prisma.sickLeave.create({
                data: {
                    serviceCode: "TEMP",
                    ...item
                }
            });

            let serviceCode;
            if (insertedCount === 0) {
                serviceCode = "SL-123456789";
            } else {
                serviceCode = generateServiceCode(newLeave.id, item.startDate);
            }

            await prisma.sickLeave.update({
                where: { id: newLeave.id },
                data: { serviceCode }
            });

            insertedCount++;
        }

        return res.status(200).json({
            success: true,
            message: `تم إضافة ${insertedCount} سجل بنجاح`,
            count: insertedCount
        });

    } catch (error) {
        console.error('Seed Error:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إضافة البيانات',
            error: error.message
        });
    }
};
