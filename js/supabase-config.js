// ============================================================================
// CẤU HÌNH KẾT NỐI CƠ SỞ DỮ LIỆU SUPABASE - TRUNG TÂM QUẢN TRỊ WEBSITE HLS
// ============================================================================
// Hướng dẫn vận hành & bảo mật:
// 1. Khi chưa điền SUPABASE_URL và SUPABASE_ANON_KEY, hệ thống chạy ở
//    "Chế độ Local (Kiểm thử)" trên trình duyệt: mật khẩu quản trị được kiểm tra
//    bằng mã băm SHA-256 (không lưu mật khẩu gốc), phiên đăng nhập lưu trong
//    sessionStorage và tự động khóa khi đóng tab hoặc sau 30 phút không thao tác.
// 2. Khi đưa website lên Hosting chính thức:
//    - Tạo project miễn phí tại https://supabase.com
//    - Vào Authentication -> Users tạo tài khoản Admin chính thức
//    - Mở admin.html -> nhấn "Cấu hình Supabase" để chạy mã SQL phân quyền RLS
//    - Dán Project URL và anon public key vào 2 dòng bên dưới.
// ============================================================================

window.HLS_CONFIG = {
    SUPABASE_URL: "",      // Ví dụ: "https://xyzcompany.supabase.co"
    SUPABASE_ANON_KEY: "", // Ví dụ: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    STORAGE_BUCKET: "member-photos",
    EVENT_STORAGE_BUCKET: "event-photos",

    // Hệ thống phân cấp 4 tầng cố định từ trên xuống dưới của HLS
    TIERS: [
        {
            level: 1,
            key: "advisor",
            name: "Ban Cố vấn",
            badge: "Cố vấn",
            description: "Các thầy cô, anh chị cựu thành viên định hướng chuyên môn & phát triển cho CLB"
        },
        {
            level: 2,
            key: "executive",
            name: "Ban Chủ nhiệm",
            badge: "Ban Chủ nhiệm",
            description: "Đội ngũ điều hành cao nhất dẫn dắt định hướng và hoạt động chung của CLB"
        },
        {
            level: 3,
            key: "department_lead",
            name: "Trưởng / Phó các ban",
            badge: "Trưởng / Phó ban",
            description: "Đội ngũ cán bộ chủ chốt quản lý trực tiếp các ban chức năng"
        },
        {
            level: 4,
            key: "member",
            name: "Thành viên",
            badge: "Thành viên",
            description: "Những mảnh ghép nhiệt huyết tạo nên sức mạnh của đại gia đình HLS"
        }
    ],

    // Danh sách các ban gợi ý trong HLS
    DEPARTMENTS: [
        "Ban Cố vấn",
        "Ban Chủ nhiệm",
        "Ban Chuyên môn",
        "Ban Truyền thông",
        "Ban Đối ngoại",
        "Ban Sự kiện",
        "Ban Nhân sự - Tổ chức"
    ],

    // Danh sách phân nhóm chuyên đề cho Sự kiện & Hoạt động
    EVENT_SUBTYPES: [
        "Cuộc thi Học thuật",
        "Thực tế Doanh nghiệp (Company Tour)",
        "Tuyển thành viên Thường niên",
        "Hội thảo & Talkshow",
        "Workshop Chuyên môn",
        "Nghiên cứu Khoa học",
        "Văn hóa & Gắn kết Nội bộ"
    ]
};

