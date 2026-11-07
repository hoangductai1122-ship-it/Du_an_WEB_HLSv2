// ============================================================================
// DỊCH VỤ QUẢN LÝ DỮ LIỆU PHÒNG TRUYỀN THỐNG & CONFESSION - HLS HUST
// Hỗ trợ song song:
// - Supabase Cloud (PostgreSQL + Storage + Auth) khi đã điền khóa cấu hình
// - Local Storage (kèm dữ liệu mẫu HLS các Gen) để chạy thử ngay không cần server
// ============================================================================

(function () {
    const LOCAL_STORAGE_KEY = "hls_hall_of_fame_members_v1";
    const LEGACY_AUTH_KEYS = ["hls_hall_of_fame_admin_session_v1", "hls_admin_session_v1"];
    const SESSION_AUTH_KEY = "hls_admin_auth_session_v2";
    const LOCAL_CRED_KEY = "hls_admin_cred_v2";
    const LOGIN_LOCKOUT_KEY = "hls_admin_lockout_v2";
    const SESSION_TTL_MS = 30 * 60 * 1000; // Tự động khóa sau 30 phút không thao tác
    const MAX_FAILED_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MS = 60 * 1000; // Tạm khóa 60 giây khi nhập sai quá 5 lần

    // Thông tin xác thực mặc định cho chế độ Local (chỉ lưu mã băm SHA-256 có muối, không lưu mật khẩu gốc)
    const DEFAULT_LOCAL_EMAIL = "admin@hls.hust.edu.vn";
    const DEFAULT_LOCAL_HASH = "16a8131fa776143ee68a38c26bba312a4c7cb0d49eed501661fae8d4b984e134";

    // Xóa triệt để các phiên đăng nhập cũ từng lưu vĩnh viễn trên localStorage ở phiên bản trước
    try {
        LEGACY_AUTH_KEYS.forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    } catch (_) {
        // ignore
    }

    // Dữ liệu mẫu khởi tạo cho các Gen của HLS - ĐHBK Hà Nội
    const SEED_MEMBERS = [
        // ================= GEN 4 (ĐƯƠNG NHIỆM) =================
        {
            id: "hls-g4-cv-01",
            name: "TS. Nguyễn Minh Hoàng",
            gen: 4,
            term: "2025 - 2026",
            tier: 1,
            sort_order: 1,
            role: "Cố vấn Học thuật CLB",
            department: "Ban Cố vấn",
            cohort: "Giảng viên ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop",
            quote: "Tư duy hệ thống của người Bách Khoa là nền tảng tuyệt vời để làm chủ chuỗi cung ứng toàn cầu.",
            confession_title: "Lời nhắn gửi tới các thế hệ sinh viên HLS",
            confession: "Đồng hành cùng HLS qua từng mùa cuộc thi học thuật và dự án nghiên cứu, điều làm thầy tự hào nhất không chỉ là những chiếc cúp giải thưởng mà các em mang về, mà là tinh thần dấn thân, nghiêm túc và hỗ trợ lẫn nhau giữa các thế hệ.\n\nNgành Logistics và Quản lý chuỗi cung ứng đang chuyển mình mạnh mẽ cùng dữ liệu và tự động hóa. Thầy mong rằng Phòng Truyền Thống này sẽ luôn nhắc nhớ mỗi thành viên HLS về ngọn lửa nhiệt huyết ban đầu: dám nghĩ lớn, làm thật và luôn giữ sự gắn kết như một gia đình dưới mái trường Bách Khoa Hà Nội."
        },
        {
            id: "hls-g4-cv-02",
            name: "Lê Trần Bảo Ngọc",
            gen: 4,
            term: "2025 - 2026",
            tier: 1,
            sort_order: 2,
            role: "Cố vấn Đối ngoại & Cựu Chủ nhiệm",
            department: "Ban Cố vấn",
            cohort: "Cựu SV K65 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
            quote: "Đi thật xa để trở về truyền lửa cho đàn em HLS.",
            confession_title: "Gửi những người em đang viết tiếp giấc mơ HLS",
            confession: "Mỗi lần quay lại Bách Khoa, nhìn thấy sắc đỏ - đen của HLS rực rỡ trong các sự kiện lớn nhỏ, chị lại thấy hình ảnh của chính mình những năm tháng sinh viên đầy hoài bão.\n\nDù công việc hiện tại ở tập đoàn đa quốc gia có bận rộn đến đâu, HLS vẫn luôn là nơi chị muốn dành thời gian quay về chia sẻ kinh nghiệm thực chiến. Chúc Gen đương nhiệm luôn bản lĩnh, đoàn kết và bứt phá mạnh mẽ hơn nữa nhé!"
        },
        {
            id: "hls-g4-bcn-01",
            name: "Hoàng Đức Tài",
            gen: 4,
            term: "2025 - 2026",
            tier: 2,
            sort_order: 1,
            role: "Chủ nhiệm CLB",
            department: "Ban Chủ nhiệm",
            cohort: "K67 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
            quote: "Muốn đi nhanh hãy đi một mình, muốn đi xa hãy đi cùng đồng đội HLS.",
            confession_title: "Thanh xuân rực rỡ nhất mang tên HLS",
            confession: "Nhớ những đêm cả team thức tới 2-3 giờ sáng ở quán cà phê quen thuộc quanh khu Bách - Kinh - Xây để hoàn thiện đề án tổ chức sự kiện và chuẩn bị bài thi Vietnam Young Logistics Talents. Có những lúc áp lực tưởng chừng quá sức, nhưng chỉ cần nhìn sang đồng đội vẫn đang miệt mài bên cạnh, mọi mệt mỏi lại tan biến.\n\nCảm ơn tất cả các anh chị Cố vấn, các bạn trong Ban Chủ nhiệm, Trưởng/Phó các ban và từng thành viên của HLS đã tin tưởng và sát cánh bên nhau. Dù sau này mỗi người một hành trình sự nghiệp riêng, mong rằng khi mở lại trang Phòng Truyền Thống này, chúng ta vẫn mỉm cười tự hào vì đã từng cháy hết mình vì màu áo HLS!"
        },
        {
            id: "hls-g4-bcn-02",
            name: "Phạm Khánh Linh",
            gen: 4,
            term: "2025 - 2026",
            tier: 2,
            sort_order: 2,
            role: "Phó Chủ nhiệm Nội vụ",
            department: "Ban Chủ nhiệm",
            cohort: "K67 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
            quote: "HLS không chỉ là một câu lạc bộ học thuật, mà là nhà.",
            confession_title: "Cảm ơn vì đã là một phần thanh xuân của nhau",
            confession: "Từ một cô sinh viên năm nhất còn rụt rè ngày đi phỏng vấn tuyển thành viên, HLS đã rèn giũa cho mình sự tự tin, kỹ năng quản lý con người và những người bạn tri kỷ tuyệt vời nhất dưới mái trường Bách Khoa.\n\nNhắn gửi tới các em khóa sau: Đừng sợ sai, cứ mạnh dạn nhận việc, mạnh dạn đề xuất ý tưởng mới. Các anh chị và HLS sẽ luôn ở phía sau nâng đỡ để các em tỏa sáng!"
        },
        {
            id: "hls-g4-bcn-03",
            name: "Đỗ Quang Huy",
            gen: 4,
            term: "2025 - 2026",
            tier: 2,
            sort_order: 3,
            role: "Phó Chủ nhiệm Đối ngoại",
            department: "Ban Chủ nhiệm",
            cohort: "K67 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
            quote: "Kết nối giá trị thật – Kiến tạo cơ hội lớn.",
            confession_title: "Những chuyến đi và những cái bắt tay đáng nhớ",
            confession: "Làm đối ngoại cho HLS giúp mình có cơ hội gặp gỡ hàng chục doanh nghiệp cảng biển, hãng tàu, 3PL lớn nhỏ và mang về những chuyến Company Tour thực tế cho anh em trong CLB.\n\nMỗi email mời tài trợ thành công, mỗi hội thảo chật kín hội trường C2 đều là thành quả của cả một tập thể bền bỉ. Chúc HLS ngày càng mở rộng mạng lưới đối tác và vươn tầm toàn quốc!"
        },
        {
            id: "hls-g4-lead-01",
            name: "Vũ Tuấn Kiệt",
            gen: 4,
            term: "2025 - 2026",
            tier: 3,
            sort_order: 1,
            role: "Trưởng ban Chuyên môn",
            department: "Ban Chuyên môn",
            cohort: "K68 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
            quote: "Biến mô hình toán tối ưu thành lời giải thực tiễn cho doanh nghiệp.",
            confession_title: "Nơi những bài toán tối ưu không còn khô khan",
            confession: "Ở Ban Chuyên môn HLS, tụi mình đã cùng nhau giải hàng chục case study từ tối ưu tồn kho, thiết kế mạng lưới kho bãi cho tới mô phỏng chuỗi cung ứng.\n\nCảm ơn các thành viên Ban Chuyên môn đã luôn giữ tinh thần ham học hỏi, sẵn sàng tranh luận nảy lửa để tìm ra phương án tốt nhất. Hẹn gặp mọi người ở những đỉnh cao mới!"
        },
        {
            id: "hls-g4-lead-02",
            name: "Trần Hà My",
            gen: 4,
            term: "2025 - 2026",
            tier: 3,
            sort_order: 2,
            role: "Trưởng ban Truyền thông",
            department: "Ban Truyền thông",
            cohort: "K68 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
            quote: "Kể câu chuyện Logistics bằng lăng kính sáng tạo đầy cảm hứng.",
            confession_title: "Gửi team Truyền thông “chạy deadline xuyên màn đêm”",
            confession: "Ai bảo dân kỹ thuật Bách Khoa khô khan thì chắc chắn chưa gặp Ban Truyền thông HLS rồi! Từ những bộ nhận diện sự kiện sắc nét, những thước phim recap đầy cảm xúc cho đến những bài viết học thuật nghìn lượt tiếp cận.\n\nYêu thương gửi tới toàn bộ các chiến binh thiết kế, content, media của chị. Cảm ơn các em vì luôn giữ ngọn lửa sáng tạo bùng cháy!"
        },
        {
            id: "hls-g4-lead-03",
            name: "Ngô Gia Bách",
            gen: 4,
            term: "2025 - 2026",
            tier: 3,
            sort_order: 3,
            role: "Phó ban Sự kiện",
            department: "Ban Sự kiện",
            cohort: "K68 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
            quote: "Đằng sau ánh đèn sân khấu là mồ hôi và nụ cười của anh em hậu cần.",
            confession_title: "Hậu trường rực lửa của những sự kiện trăm người",
            confession: "Cầm bộ đàm chạy dọc hội trường từ 6 giờ sáng, kiểm tra từng chiếc mic, từng tấm standee đến khi khán giả vỗ tay vang dội cuối chương trình — đó là cảm giác hạnh phúc không gì đánh đổi được.\n\nChúc đại gia đình HLS luôn giữ vững phong độ tổ chức chuyên nghiệp và máu lửa trong mọi sự kiện sắp tới!"
        },
        {
            id: "hls-g4-mem-01",
            name: "Nguyễn Phương Anh",
            gen: 4,
            term: "2025 - 2026",
            tier: 4,
            sort_order: 1,
            role: "Thành viên Ban Truyền thông",
            department: "Ban Truyền thông",
            cohort: "K69 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
            quote: "Mỗi ngày ở HLS là một ngày học thêm điều mới mẻ.",
            confession_title: "Lời tỏ tình gửi tới ngôi nhà thứ hai tại Bách Khoa",
            confession: "Ngày nhận email báo đỗ vào HLS, em đã nhảy cẫng lên vì sung sướng. Các anh chị không chỉ chỉ bảo tận tình từng nét thiết kế, cách viết bài mà còn lo cho tụi em từng cốc trà sữa những hôm chạy sự kiện muộn.\n\nEm hứa sẽ cố gắng hết sức để tiếp nối truyền thống tự hào của CLB mình!"
        },
        {
            id: "hls-g4-mem-02",
            name: "Đặng Minh Quân",
            gen: 4,
            term: "2025 - 2026",
            tier: 4,
            sort_order: 2,
            role: "Thành viên Ban Chuyên môn",
            department: "Ban Chuyên môn",
            cohort: "K69 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
            quote: "Đam mê tối ưu hóa vận tải & dữ liệu chuỗi cung ứng.",
            confession_title: "Từ con số 0 đến giải thưởng nghiên cứu đầu tay",
            confession: "Nhờ những buổi training nội bộ hàng tuần của Ban Chuyên môn mà một sinh viên năm nhất như mình đã hiểu rõ bức tranh toàn cảnh ngành Supply Chain và tự tin tham gia nhóm Nghiên cứu khoa học.\n\nChúc HLS ngày càng lớn mạnh và gặt hái thêm nhiều Quán quân!"
        },
        {
            id: "hls-g4-mem-03",
            name: "Bùi Thanh Thảo",
            gen: 4,
            term: "2025 - 2026",
            tier: 4,
            sort_order: 3,
            role: "Thành viên Ban Đối ngoại",
            department: "Ban Đối ngoại",
            cohort: "K69 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
            quote: "Tự tin giao tiếp, bản lĩnh kết nối.",
            confession_title: "Gửi ngàn lời yêu thương tới đại gia đình HLS",
            confession: "Khoảnh khắc cả CLB cùng khoác vai nhau hát vang trong đêm Gala tổng kết nhiệm kỳ là ký ức đẹp nhất năm nhất đại học của mình. Chúc tất cả mọi người luôn chân cứng đá mềm và thành công rực rỡ!"
        },

        // ================= GEN 3 =================
        {
            id: "hls-g3-bcn-01",
            name: "Lê Trần Bảo Ngọc",
            gen: 3,
            term: "2024 - 2025",
            tier: 2,
            sort_order: 1,
            role: "Chủ nhiệm CLB Gen 3",
            department: "Ban Chủ nhiệm",
            cohort: "K65 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
            quote: "Một nhiệm kỳ rực lửa mở rộng quy mô học thuật và kết nối doanh nghiệp.",
            confession_title: "Nhìn lại hành trình Gen 3 đầy tự hào",
            confession: "Gen 3 là giai đoạn chúng mình đặt mục tiêu đưa các sự kiện học thuật của HLS vượt ra khỏi khuôn khổ nội bộ để kết nối sâu rộng với cộng đồng sinh viên yêu thích Chuỗi cung ứng trên toàn miền Bắc.\n\nCảm ơn tất cả những người đồng đội Gen 3 đã không quản ngại vất vả để biến mọi kế hoạch trên trang giấy thành hiện thực rực rỡ!"
        },
        {
            id: "hls-g3-lead-01",
            name: "Trịnh Quốc Khánh",
            gen: 3,
            term: "2024 - 2025",
            tier: 3,
            sort_order: 1,
            role: "Trưởng ban Đối ngoại",
            department: "Ban Đối ngoại",
            cohort: "K66 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop",
            quote: "Mỗi thử thách là một nấc thang trưởng thành.",
            confession_title: "Kỷ niệm những ngày đi thực tế cảng Hải Phòng cùng HLS",
            confession: "Chuyến đi tham quan cảng biển và kho ngoại quan đầu tiên mà Gen 3 tổ chức vẫn luôn in đậm trong tâm trí mình. Nhìn ánh mắt háo hức của gần 60 thành viên khi tận mắt chứng kiến cần cẩu giàn bốc xếp container thực tế, mọi công sức chuẩn bị đều xứng đáng!"
        },

        // ================= GEN 2 =================
        {
            id: "hls-g2-bcn-01",
            name: "Nguyễn Đức Mạnh",
            gen: 2,
            term: "2023 - 2024",
            tier: 2,
            sort_order: 1,
            role: "Chủ nhiệm CLB Gen 2",
            department: "Ban Chủ nhiệm",
            cohort: "K64 · ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop",
            quote: "Xây nền móng vững, vươn tầm cao xa.",
            confession_title: "Viết tiếp ngọn lửa từ những ngày đầu thành lập",
            confession: "Nhận trọng trách từ Gen 1 sáng lập, nhiệm vụ lớn nhất của anh em Gen 2 là chuẩn hóa quy trình hoạt động các ban chuyên môn và xây dựng văn hóa gắn kết đặc trưng của HLS.\n\nThật xúc động khi thấy CLB ngày hôm nay lớn mạnh gấp nhiều lần. Chúc các thế hệ đàn em luôn giữ trọn đam mê!"
        },

        // ================= GEN 1 (SÁNG LẬP) =================
        {
            id: "hls-g1-bcn-01",
            name: "Trần Tuấn Minh",
            gen: 1,
            term: "Gen Sáng lập",
            tier: 2,
            sort_order: 1,
            role: "Chủ nhiệm Sáng lập CLB",
            department: "Ban Chủ nhiệm",
            cohort: "Cựu SV ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=600&auto=format&fit=crop",
            quote: "Mọi hành trình vạn dặm đều bắt đầu từ khát vọng kết nối những người chung đam mê.",
            confession_title: "Ngày đầu tiên đặt viên gạch mang tên HLS tại Bách Khoa",
            confession: "Những ngày đầu tiên ngồi lại với nhau tại thư viện Tạ Quang Bửu, nhóm sáng lập chỉ có vỏn vẹn hơn chục sinh viên chung niềm đam mê mãnh liệt với Logistics & Supply Chain Management và trăn trở làm sao để sinh viên Bách Khoa có một sân chơi chuyên sâu, thực chiến.\n\nKhông ngờ từ hạt mầm nhỏ ấy, hôm nay HLS đã trở thành mái nhà chung của hàng trăm sinh viên ưu tú qua nhiều thế hệ. Cảm ơn tất cả các Gen kế cận đã giữ gìn và phát triển di sản này vượt xa cả kỳ vọng ban đầu của tụi anh!"
        },
        {
            id: "hls-g1-bcn-02",
            name: "Lê Minh Châu",
            gen: 1,
            term: "Gen Sáng lập",
            tier: 2,
            sort_order: 2,
            role: "Đồng sáng lập & Phó Chủ nhiệm",
            department: "Ban Chủ nhiệm",
            cohort: "Cựu SV ĐHBK Hà Nội",
            avatar_url: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?q=80&w=600&auto=format&fit=crop",
            quote: "Chia sẻ tri thức – Gắn kết thế hệ.",
            confession_title: "Gửi HLS – Niềm tự hào tuổi hai mươi",
            confession: "Mỗi khi đi phỏng vấn hay làm việc trong ngành Chuỗi cung ứng, gặp được các bạn trẻ giới thiệu 'Em cũng trưởng thành từ CLB HLS Bách Khoa', tim mình lại trào dâng niềm xúc động khó tả.\n\nChúc con thuyền HLS luôn căng buồm vươn ra biển lớn!"
        }
    ];

    let supabaseClient = null;

    function getConfig() {
        return window.HLS_CONFIG || {};
    }

    function isSupabaseConfigured() {
        const cfg = getConfig();
        return Boolean(
            cfg.SUPABASE_URL &&
            cfg.SUPABASE_ANON_KEY &&
            cfg.SUPABASE_URL.startsWith("http") &&
            window.supabase
        );
    }

    function getSupabase() {
        if (!isSupabaseConfigured()) return null;
        if (!supabaseClient) {
            const cfg = getConfig();
            const clientKey = `${cfg.SUPABASE_URL}::${cfg.SUPABASE_ANON_KEY}`;
            if (window.__hlsSupabaseClient && window.__hlsSupabaseClientKey === clientKey) {
                supabaseClient = window.__hlsSupabaseClient;
            } else {
                let authStorage;
                try {
                    authStorage = window.sessionStorage;
                } catch (_) {
                    authStorage = undefined;
                }
                supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
                    auth: {
                        storage: authStorage,
                        persistSession: true,
                        autoRefreshToken: true
                    }
                });
                window.__hlsSupabaseClient = supabaseClient;
                window.__hlsSupabaseClientKey = clientKey;
            }
        }
        return supabaseClient;
    }

    // Sắp xếp chuẩn kim tự tháp: Cấp 1 -> Cấp 2 -> Cấp 3 -> Cấp 4, sau đó theo sort_order tăng dần
    function sortMembersHierarchy(members) {
        return [...members].sort((a, b) => {
            if (Number(b.gen) !== Number(a.gen)) {
                return Number(b.gen) - Number(a.gen);
            }
            const tierA = Number(a.tier) || 4;
            const tierB = Number(b.tier) || 4;
            if (tierA !== tierB) {
                return tierA - tierB;
            }
            const orderA = Number(a.sort_order) || 999;
            const orderB = Number(b.sort_order) || 999;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return (a.name || "").localeCompare(b.name || "", "vi");
        });
    }

    // Đọc/ghi LocalStorage an toàn
    function readLocalMembers() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_MEMBERS));
                return [...SEED_MEMBERS];
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_MEMBERS));
                return [...SEED_MEMBERS];
            }
            return parsed;
        } catch (err) {
            console.warn("Không thể truy cập localStorage, dùng dữ liệu mẫu trong bộ nhớ:", err);
            return [...SEED_MEMBERS];
        }
    }

    function writeLocalMembers(members) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
    }

    // Nén và thu nhỏ kích thước ảnh ngay trên trình duyệt để tải trang mượt mà
    function compressImageFile(file, maxWidth = 800, quality = 0.82) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Không thể đọc file ảnh."));
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error("Định dạng ảnh không hợp lệ."));
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            const dataUrl = canvas.toDataURL("image/jpeg", quality);
                            resolve({ blob, dataUrl });
                        },
                        "image/jpeg",
                        quality
                    );
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Upload ảnh lên Supabase Storage (hoặc trả về DataURL đã nén nếu chạy Local)
    async function uploadAvatar(file) {
        const compressed = await compressImageFile(file);
        const sb = getSupabase();
        if (!sb) {
            return compressed.dataUrl;
        }

        const cfg = getConfig();
        const bucket = cfg.STORAGE_BUCKET || "member-photos";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `members/${Date.now()}_${safeName.replace(/\.[^.]+$/, "")}.jpg`;

        const { error: uploadError } = await sb.storage
            .from(bucket)
            .upload(filePath, compressed.blob, {
                contentType: "image/jpeg",
                upsert: false
            });

        if (uploadError) {
            throw new Error("Lỗi tải ảnh lên Supabase Storage: " + uploadError.message);
        }

        const { data } = sb.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    }

    // Lấy toàn bộ thành viên
    async function getMembers() {
        const sb = getSupabase();
        if (sb) {
            const { data, error } = await sb
                .from("members")
                .select("*")
                .order("gen", { ascending: false })
                .order("tier", { ascending: true })
                .order("sort_order", { ascending: true });

            if (error) {
                throw new Error("Không thể tải danh sách thành viên từ Supabase: " + error.message);
            }
            return sortMembersHierarchy(data || []);
        }

        return sortMembersHierarchy(readLocalMembers());
    }

    // Lấy chi tiết 1 thành viên theo ID
    async function getMemberById(id) {
        if (!id) return null;
        const sb = getSupabase();
        if (sb) {
            const { data, error } = await sb
                .from("members")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (error) {
                throw new Error("Không thể tải thông tin thành viên: " + error.message);
            }
            return data;
        }

        const members = readLocalMembers();
        return members.find((m) => String(m.id) === String(id)) || null;
    }

    // Thêm mới hoặc cập nhật thành viên
    async function saveMember(memberPayload, imageFile) {
        let avatarUrl = (memberPayload.avatar_url || "").trim();
        if (imageFile) {
            avatarUrl = await uploadAvatar(imageFile);
        }
        if (!avatarUrl) {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                memberPayload.name || "HLS"
            )}&background=111111&color=ffffff&size=512&bold=true`;
        }

        const normalized = {
            name: (memberPayload.name || "").trim(),
            gen: Number(memberPayload.gen) || 1,
            term: (memberPayload.term || "").trim(),
            tier: Number(memberPayload.tier) || 4,
            sort_order: Number(memberPayload.sort_order) || 10,
            role: (memberPayload.role || "").trim(),
            department: (memberPayload.department || "").trim(),
            cohort: (memberPayload.cohort || "").trim(),
            avatar_url: avatarUrl,
            quote: (memberPayload.quote || "").trim(),
            confession_title: (memberPayload.confession_title || "").trim(),
            confession: (memberPayload.confession || "").trim()
        };

        const sb = getSupabase();
        if (sb) {
            if (memberPayload.id) {
                const { data, error } = await sb
                    .from("members")
                    .update(normalized)
                    .eq("id", memberPayload.id)
                    .select()
                    .single();
                if (error) throw new Error("Lỗi cập nhật thành viên: " + error.message);
                return data;
            } else {
                const recordWithId = {
                    id: "hls-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
                    ...normalized
                };
                const { data, error } = await sb
                    .from("members")
                    .insert([recordWithId])
                    .select()
                    .single();
                if (error) throw new Error("Lỗi thêm thành viên: " + error.message);
                return data;
            }
        }

        // Chế độ Local
        const members = readLocalMembers();
        if (memberPayload.id) {
            const idx = members.findIndex((m) => String(m.id) === String(memberPayload.id));
            const updated = { id: memberPayload.id, ...normalized };
            if (idx >= 0) {
                members[idx] = updated;
            } else {
                members.push(updated);
            }
            writeLocalMembers(members);
            return updated;
        } else {
            const created = {
                id: "hls-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
                ...normalized
            };
            members.push(created);
            writeLocalMembers(members);
            return created;
        }
    }

    // Xóa thành viên
    async function deleteMember(id) {
        const sb = getSupabase();
        if (sb) {
            const { error } = await sb.from("members").delete().eq("id", id);
            if (error) throw new Error("Lỗi xóa thành viên: " + error.message);
            return true;
        }

        const members = readLocalMembers().filter((m) => String(m.id) !== String(id));
        writeLocalMembers(members);
        return true;
    }

    // Khôi phục dữ liệu mẫu ban đầu (chỉ cho chế độ Local)
    function resetDemoData() {
        if (isSupabaseConfigured()) return;
        writeLocalMembers(SEED_MEMBERS);
    }

    // Nhập danh sách từ file JSON (hỗ trợ cả Local lẫn đẩy hàng loạt lên Supabase)
    async function importMembersJson(items) {
        if (!Array.isArray(items)) throw new Error("Dữ liệu JSON không hợp lệ.");
        const sb = getSupabase();
        if (sb) {
            const cleaned = items.map((item) => ({
                id: item.id || "hls-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
                name: item.name || "",
                gen: Number(item.gen) || 1,
                term: item.term || "",
                tier: Number(item.tier) || 4,
                sort_order: Number(item.sort_order) || 10,
                role: item.role || "",
                department: item.department || "",
                cohort: item.cohort || "",
                avatar_url: item.avatar_url || "",
                quote: item.quote || "",
                confession_title: item.confession_title || "",
                confession: item.confession || ""
            }));
            const { error } = await sb.from("members").upsert(cleaned, { onConflict: "id" });
            if (error) throw new Error("Lỗi nhập dữ liệu lên Supabase: " + error.message);
            return cleaned.length;
        }

        writeLocalMembers(items);
        return items.length;
    }

    // ================= XÁC THỰC & BẢO MẬT QUẢN TRỊ VIÊN =================
    // Băm SHA-256 thuần JS dự phòng khi mở trực tiếp qua giao thức file:// (nơi crypto.subtle bị ẩn)
    function sha256PureHex(str) {
        const utf8 = typeof TextEncoder !== "undefined"
            ? Array.from(new TextEncoder().encode(str))
            : Array.from(unescape(encodeURIComponent(str))).map((ch) => ch.charCodeAt(0));

        const K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];

        let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
        let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

        const bitLen = utf8.length * 8;
        utf8.push(0x80);
        while ((utf8.length % 64) !== 56) utf8.push(0);

        const hi = Math.floor(bitLen / 0x100000000);
        const lo = bitLen >>> 0;
        utf8.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255);
        utf8.push((lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);

        const rrot = (x, n) => (x >>> n) | (x << (32 - n));
        const w = new Array(64);

        for (let i = 0; i < utf8.length; i += 64) {
            for (let j = 0; j < 16; j++) {
                const idx = i + j * 4;
                w[j] = ((utf8[idx] << 24) | (utf8[idx + 1] << 16) | (utf8[idx + 2] << 8) | utf8[idx + 3]) >>> 0;
            }
            for (let j = 16; j < 64; j++) {
                const s0 = rrot(w[j - 15], 7) ^ rrot(w[j - 15], 18) ^ (w[j - 15] >>> 3);
                const s1 = rrot(w[j - 2], 17) ^ rrot(w[j - 2], 19) ^ (w[j - 2] >>> 10);
                w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
            }

            let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
            for (let j = 0; j < 64; j++) {
                const S1 = rrot(e, 6) ^ rrot(e, 11) ^ rrot(e, 25);
                const ch = (e & f) ^ ((~e) & g);
                const temp1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
                const S0 = rrot(a, 2) ^ rrot(a, 13) ^ rrot(a, 22);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const temp2 = (S0 + maj) >>> 0;

                h = g; g = f; f = e;
                e = (d + temp1) >>> 0;
                d = c; c = b; b = a;
                a = (temp1 + temp2) >>> 0;
            }

            h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
            h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
        }

        return [h0, h1, h2, h3, h4, h5, h6, h7]
            .map((v) => v.toString(16).padStart(8, "0"))
            .join("");
    }

    async function computeAuthDigest(email, password) {
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const payload = `hls-auth-v2:${normalizedEmail}:${String(password || "")}`;
        if (window.crypto && window.crypto.subtle && typeof TextEncoder !== "undefined") {
            try {
                const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
                return Array.from(new Uint8Array(buf))
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
            } catch (_) {
                return sha256PureHex(payload);
            }
        }
        return sha256PureHex(payload);
    }

    function getLocalStoredCredential() {
        try {
            const raw = localStorage.getItem(LOCAL_CRED_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.email && parsed.hash) {
                    return {
                        email: String(parsed.email).trim().toLowerCase(),
                        hash: String(parsed.hash),
                        isCustom: true
                    };
                }
            }
        } catch (_) {
            // ignore
        }
        return {
            email: DEFAULT_LOCAL_EMAIL,
            hash: DEFAULT_LOCAL_HASH,
            isCustom: false
        };
    }

    function readLockoutState() {
        try {
            const raw = localStorage.getItem(LOGIN_LOCKOUT_KEY);
            return raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: 0 };
        } catch (_) {
            return { attempts: 0, lockedUntil: 0 };
        }
    }

    function checkLockoutBeforeLogin() {
        const state = readLockoutState();
        const now = Date.now();
        if (state.lockedUntil && state.lockedUntil > now) {
            const remainSec = Math.ceil((state.lockedUntil - now) / 1000);
            throw new Error(`Tài khoản đang tạm khóa bảo mật do nhập sai nhiều lần. Vui lòng thử lại sau ${remainSec} giây.`);
        }
    }

    function recordFailedAttempt() {
        const state = readLockoutState();
        const nextAttempts = (Number(state.attempts) || 0) + 1;
        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
            const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
            try {
                localStorage.setItem(LOGIN_LOCKOUT_KEY, JSON.stringify({ attempts: 0, lockedUntil }));
            } catch (_) {}
            throw new Error("Bạn đã nhập sai 5 lần liên tiếp. Hệ thống tạm khóa đăng nhập trong 60 giây để bảo vệ tài khoản.");
        }
        try {
            localStorage.setItem(LOGIN_LOCKOUT_KEY, JSON.stringify({ attempts: nextAttempts, lockedUntil: 0 }));
        } catch (_) {}
        return MAX_FAILED_ATTEMPTS - nextAttempts;
    }

    function clearLockoutState() {
        try {
            localStorage.removeItem(LOGIN_LOCKOUT_KEY);
        } catch (_) {}
    }

    function readSessionMeta() {
        try {
            const raw = sessionStorage.getItem(SESSION_AUTH_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    function writeSessionMeta(mode, email) {
        const now = Date.now();
        const meta = {
            mode,
            email: String(email || "").trim().toLowerCase(),
            loggedInAt: now,
            lastActiveAt: now
        };
        try {
            sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(meta));
        } catch (_) {}
        return meta;
    }

    let lastTouchTime = 0;
    function touchAdminSession() {
        const now = Date.now();
        if (now - lastTouchTime < 15000) return;
        lastTouchTime = now;
        const meta = readSessionMeta();
        if (!meta) return;
        if (now - Number(meta.lastActiveAt || 0) > SESSION_TTL_MS) return;
        meta.lastActiveAt = now;
        try {
            sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify(meta));
        } catch (_) {}
    }

    async function getAdminSession() {
        const meta = readSessionMeta();
        if (!meta || !meta.lastActiveAt || (Date.now() - Number(meta.lastActiveAt) > SESSION_TTL_MS)) {
            await logoutAdmin();
            return null;
        }

        const sb = getSupabase();
        if (sb) {
            const { data } = await sb.auth.getSession();
            if (data && data.session && data.session.user) {
                return {
                    mode: "supabase",
                    email: data.session.user.email,
                    expiresAt: Number(meta.lastActiveAt) + SESSION_TTL_MS
                };
            }
            await logoutAdmin();
            return null;
        }

        if (meta.mode === "local" && meta.email) {
            return {
                mode: "local",
                email: meta.email,
                expiresAt: Number(meta.lastActiveAt) + SESSION_TTL_MS
            };
        }
        return null;
    }

    async function loginAdmin(email, password) {
        checkLockoutBeforeLogin();
        const normalizedEmail = String(email || "").trim().toLowerCase();
        const rawPass = String(password || "");

        const sb = getSupabase();
        if (sb) {
            const { data, error } = await sb.auth.signInWithPassword({
                email: normalizedEmail,
                password: rawPass
            });
            if (error) {
                const remain = recordFailedAttempt();
                throw new Error(`Đăng nhập thất bại: Sai email hoặc mật khẩu (còn ${remain} lần thử).`);
            }
            clearLockoutState();
            return writeSessionMeta("supabase", data.user.email);
        }

        const activeCred = getLocalStoredCredential();
        const inputHash = await computeAuthDigest(normalizedEmail, rawPass);

        if (normalizedEmail === activeCred.email && inputHash === activeCred.hash) {
            clearLockoutState();
            return writeSessionMeta("local", activeCred.email);
        }

        const remain = recordFailedAttempt();
        throw new Error(`Sai email hoặc mật khẩu quản trị viên (còn ${remain} lần thử trước khi tạm khóa).`);
    }

    async function changeAdminPassword({ currentPassword, newPassword, newEmail } = {}) {
        const curPass = String(currentPassword || "");
        const nextPass = String(newPassword || "");

        if (!curPass) {
            throw new Error("Vui lòng nhập mật khẩu hiện tại để xác minh quyền quản trị.");
        }
        if (nextPass.length < 6) {
            throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        const sb = getSupabase();
        if (sb) {
            const { data: sessionData } = await sb.auth.getSession();
            const activeUser = sessionData && sessionData.session && sessionData.session.user;
            if (!activeUser || !activeUser.email) {
                throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            }

            const { error: verifyErr } = await sb.auth.signInWithPassword({
                email: activeUser.email,
                password: curPass
            });
            if (verifyErr) {
                throw new Error("Mật khẩu hiện tại không chính xác.");
            }

            const { error: updateErr } = await sb.auth.updateUser({ password: nextPass });
            if (updateErr) {
                throw new Error("Không thể cập nhật mật khẩu trên Supabase: " + updateErr.message);
            }
            return writeSessionMeta("supabase", activeUser.email);
        }

        const activeCred = getLocalStoredCredential();
        const verifyHash = await computeAuthDigest(activeCred.email, curPass);
        if (verifyHash !== activeCred.hash) {
            throw new Error("Mật khẩu hiện tại không chính xác.");
        }

        const targetEmail = (newEmail ? String(newEmail).trim().toLowerCase() : activeCred.email) || activeCred.email;
        const nextHash = await computeAuthDigest(targetEmail, nextPass);
        try {
            localStorage.setItem(
                LOCAL_CRED_KEY,
                JSON.stringify({
                    email: targetEmail,
                    hash: nextHash,
                    updatedAt: new Date().toISOString()
                })
            );
        } catch (_) {
            throw new Error("Không thể lưu thông tin bảo mật vào trình duyệt.");
        }

        return writeSessionMeta("local", targetEmail);
    }

    async function logoutAdmin() {
        try {
            sessionStorage.removeItem(SESSION_AUTH_KEY);
            LEGACY_AUTH_KEYS.forEach((k) => {
                localStorage.removeItem(k);
                sessionStorage.removeItem(k);
            });
        } catch (_) {}

        const sb = getSupabase();
        if (sb) {
            try {
                await sb.auth.signOut();
            } catch (_) {}
        }
    }

    function getTierMeta(level) {
        const tiers = (getConfig().TIERS || []);
        return tiers.find((t) => Number(t.level) === Number(level)) || {
            level: 4,
            name: "Thành viên",
            badge: "Thành viên",
            description: ""
        };
    }

    window.HLSService = {
        isSupabaseConfigured,
        getMembers,
        getMemberById,
        saveMember,
        deleteMember,
        resetDemoData,
        importMembersJson,
        getAdminSession,
        loginAdmin,
        logoutAdmin,
        touchAdminSession,
        changeAdminPassword,
        getTierMeta,
        sortMembersHierarchy
    };
})();

