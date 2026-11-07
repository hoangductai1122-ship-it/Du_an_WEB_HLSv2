// ============================================================================
// CẤU HÌNH KẾT NỐI CƠ SỞ DỮ LIỆU SUPABASE - PHÒNG TRUYỀN THỐNG HLS
// ============================================================================
// Hướng dẫn:
// 1. Khi chưa điền SUPABASE_URL và SUPABASE_ANON_KEY, hệ thống tự động chạy ở
//    "Chế độ Local (Thử nghiệm)" lưu trên trình duyệt kèm dữ liệu mẫu để bạn
//    trải nghiệm ngay mọi tính năng (Đăng nhập Admin, Upload ảnh, Thêm/Sửa/Xóa).
// 2. Khi muốn đưa lên mạng cho mọi người cùng xem:
//    - Tạo project miễn phí tại https://supabase.com
//    - Mở trang admin.html -> nhấn nút "Hướng dẫn kết nối Supabase" để lấy mã SQL
//    - Dán Project URL và anon public key vào 2 dòng bên dưới.
// ============================================================================

window.HLS_CONFIG = {
    SUPABASE_URL: "",      // Ví dụ: "https://xyzcompany.supabase.co"
    SUPABASE_ANON_KEY: "", // Ví dụ: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    STORAGE_BUCKET: "member-photos",

    // Tài khoản mặc định khi chạy chế độ Local (chưa gắn Supabase)
    DEMO_ADMIN_EMAIL: "admin@hls.hust.edu.vn",
    DEMO_ADMIN_PASSWORD: "hls2026",

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
    ]
};

