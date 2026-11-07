// ============================================================================
// DỊCH VỤ QUẢN LÝ NỘI DUNG TRANG CHỦ, TIN TỨC, ĐỐI TÁC & LIÊN HỆ - HLS HUST
// Quản lý: Banner (Hero), Về chúng tôi, Câu chuyện thành lập, Tầm nhìn & Sứ mệnh,
//          Cơ cấu tổ chức, Thành tích, Tin tức, Đối tác/Nhà tài trợ & Liên hệ.
// Hỗ trợ song song:
// - Supabase Cloud (bảng `site_content`, 1 dòng id = 'main', cột `data` dạng jsonb)
// - Local Storage (lưu cục bộ trên trình duyệt) khi chưa cấu hình Supabase
// ============================================================================

(function () {
    const LOCAL_CONTENT_KEY = "hls_site_content_v1";
    const CONTENT_ROW_ID = "main";

    const DEFAULT_CONTENT = {
        hero: {
            logo_url: "",
            brand_main: "HLS",
            brand_sub: "Logistics",
            nav_cta_label: "Tham gia CLB",
            eyebrow: "Đại học Bách Khoa Hà Nội · HUST",
            title_line1: "Kết nối. Học hỏi.",
            title_highlight: "Phát triển bền vững.",
            description: "Câu lạc bộ Logistics và Quản lý chuỗi cung ứng của Đại học Bách Khoa Hà Nội — không gian học thuật chuyên sâu kết nối sinh viên, giảng viên và mạng lưới doanh nghiệp Chuỗi cung ứng.",
            primary_cta_label: "Xem hoạt động nổi bật",
            secondary_cta_label: "Phòng truyền thống",
            affiliated_unit: "ĐHBK Hà Nội",
            image_url: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop",
            image_caption: "Tư duy hệ thống kỹ thuật & quản trị vận hành chuỗi cung ứng thực tiễn · ĐHBK Hà Nội"
        },

        about: {
            title: "CLB Logistics & Quản lý chuỗi cung ứng",
            title_highlight: "ĐHBK Hà Nội",
            description: "HLS là Câu lạc bộ học thuật về Logistics và Quản lý chuỗi cung ứng tại Đại học Bách Khoa Hà Nội (HUST). Chúng tôi xây dựng cầu nối thực tiễn giữa tư duy kỹ thuật – quản trị của sinh viên Bách Khoa với cộng đồng doanh nghiệp Logistics tại Việt Nam.",
            quote: "Chia sẻ tri thức – Kết nối thế hệ – Học hỏi không ngừng",
            image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=900&auto=format&fit=crop"
        },

        story: {
            title: "Từ một nhóm sinh viên chung đam mê đến cộng đồng học thuật Logistics tại Bách Khoa",
            content: "HLS được thành lập năm 2022 bởi nhóm sinh viên Bách Khoa có chung niềm đam mê với lĩnh vực Logistics và Quản lý chuỗi cung ứng. Xuất phát từ những buổi thảo luận nhỏ tại thư viện Tạ Quang Bửu, nhóm sáng lập mong muốn tạo ra một sân chơi chuyên sâu, nơi sinh viên khối kỹ thuật và kinh tế có thể cùng giải các bài toán chuỗi cung ứng thực tế.\n\nDưới sự bảo trợ chuyên môn của nhà trường và sự đồng hành của đội ngũ giảng viên chuyên ngành, HLS từng bước chuẩn hóa mô hình hoạt động, mở rộng mạng lưới doanh nghiệp đối tác và trở thành điểm đến của sinh viên yêu thích Supply Chain tại ĐHBK Hà Nội.",
            founded_year: "2022",
            patron_name: "Trường Kinh tế – Đại học Bách Khoa Hà Nội",
            patron_description: "Đơn vị bảo trợ chuyên môn, định hướng học thuật và hỗ trợ CLB trong tổ chức các hoạt động, cuộc thi dành cho sinh viên.",
            image_url: "",
            milestones: [
                { year: "2022", title: "Thành lập Câu lạc bộ", description: "Nhóm sáng lập (Gen 1) ra mắt HLS với những buổi sinh hoạt học thuật đầu tiên." },
                { year: "2023", title: "Chuẩn hóa cơ cấu 5 ban", description: "Gen 2 xây dựng quy trình hoạt động cho các ban chuyên môn và văn hóa gắn kết của CLB." },
                { year: "2024", title: "Mở rộng mạng lưới doanh nghiệp", description: "Tổ chức Company Tour thường niên và đồng hành tổ chức cuộc thi học thuật quy mô lớn." },
                { year: "2026", title: "Phát triển hệ sinh thái học thuật", description: "Duy trì chuỗi sự kiện Core hằng năm, nghiên cứu khoa học và workshop chuyên môn." }
            ]
        },

        vision: {
            heading: "Định hướng phát triển của HLS",
            vision: "Trở thành cộng đồng học thuật Logistics và Quản lý chuỗi cung ứng uy tín hàng đầu dành cho sinh viên khối kỹ thuật tại Việt Nam — nơi ươm mầm thế hệ kỹ sư, nhà quản trị chuỗi cung ứng có tư duy hệ thống và năng lực thực chiến.",
            mission: "Kết nối sinh viên với mạng lưới doanh nghiệp Logistics; nâng cao kiến thức chuyên môn và kỹ năng thực tiễn thông qua cuộc thi, hội thảo, thực tế doanh nghiệp; xây dựng môi trường gắn kết, nơi các thế hệ thành viên cùng chia sẻ và phát triển.",
            values: [
                { title: "Học thuật chuyên sâu", description: "Lấy tri thức và tư duy định lượng làm nền tảng cho mọi hoạt động." },
                { title: "Kết nối thực tiễn", description: "Đưa doanh nghiệp đến gần sinh viên và đưa sinh viên đến với thực tế vận hành." },
                { title: "Chủ động & Trách nhiệm", description: "Mỗi thành viên dám nhận việc, dám đề xuất và đi đến cùng với cam kết." },
                { title: "Gắn kết thế hệ", description: "Các Gen kế thừa, hỗ trợ nhau và cùng viết tiếp câu chuyện HLS." }
            ]
        },

        organization: {
            heading: "Ban Chủ nhiệm & các ban chức năng",
            intro: "HLS vận hành theo mô hình Ban Chủ nhiệm điều phối chung và 5 ban chức năng chuyên trách. Ban Chủ nhiệm được hiển thị tự động từ dữ liệu Gen đương nhiệm trong Phòng truyền thống.",
            show_executive_from_hall: true,
            departments: [
                { name: "Ban Chuyên môn / Học thuật", description: "Xây dựng nội dung đào tạo nội bộ, ra đề và chấm thi các cuộc thi học thuật, dẫn dắt nhóm nghiên cứu khoa học.", lead: "Vũ Tuấn Kiệt" },
                { name: "Ban Sự kiện", description: "Lên kế hoạch, điều phối hậu cần và vận hành toàn bộ sự kiện, hội thảo, Company Tour của CLB.", lead: "Ngô Gia Bách" },
                { name: "Ban Truyền thông", description: "Quản lý Fanpage, thiết kế ấn phẩm, sản xuất nội dung và hình ảnh, xây dựng nhận diện thương hiệu HLS.", lead: "Trần Hà My" },
                { name: "Ban Đối ngoại", description: "Tìm kiếm và duy trì quan hệ với doanh nghiệp, nhà tài trợ, đối tác học thuật và các CLB bạn.", lead: "" },
                { name: "Ban Nhân sự", description: "Tuyển thành viên, đào tạo hội nhập, đánh giá hoạt động và xây dựng văn hóa gắn kết nội bộ.", lead: "" }
            ]
        },

        achievements: {
            heading: "Những dấu ấn của HLS",
            intro: "Những con số và dấu mốc ghi nhận nỗ lực của các thế hệ thành viên HLS.",
            stats: [
                { value: "120+", label: "Thành viên qua 4 thế hệ" },
                { value: "15+", label: "Sự kiện & hoạt động mỗi năm" },
                { value: "30+", label: "Doanh nghiệp, đối tác đồng hành" },
                { value: "2.000+", label: "Lượt sinh viên tham gia mỗi năm" }
            ],
            awards: [
                { year: "2026", title: "Quán quân HUST Logistics Case Competition", description: "Đội thi của thành viên Ban Chuyên môn HLS giành giải Nhất toàn cuộc thi." },
                { year: "2026", title: "Giải thưởng Sinh viên Nghiên cứu Khoa học", description: "Đề tài tối ưu ghép tải vận tải & niêm phong điện tử T-Seal được hội đồng đánh giá cao." },
                { year: "2025", title: "CLB học thuật tiêu biểu", description: "Ghi nhận đóng góp trong phong trào học thuật của sinh viên ĐHBK Hà Nội." }
            ]
        },

        news: {
            title: "Bản Tin HLS & Điểm Tin Chuỗi Cung Ứng",
            intro: "Cập nhật tin tức hoạt động Câu lạc bộ, thông báo tuyển thành viên và góc nhìn chuyên sâu về Logistics & Supply Chain.",
            items: [
                {
                    id: "news-vylt-2026",
                    title: "Khởi động Vòng Cấp Trường Vietnam Young Logistics Talents 2026 tại ĐHBK Hà Nội",
                    category: "Tin hoạt động CLB",
                    published_at: "18/09/2026",
                    author: "Ban Truyền thông HLS",
                    is_featured: true,
                    cover_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop",
                    summary: "Sân chơi học thuật lớn nhất năm dành cho sinh viên đam mê Logistics chính thức mở đơn đăng ký đội thi với chuỗi cố vấn chuyên môn từ giảng viên và chuyên gia doanh nghiệp.",
                    content: "Tháng 9 hằng năm đánh dấu sự trở lại của Vietnam Young Logistics Talents (VYLT) tại Đại học Bách Khoa Hà Nội do CLB HLS trực tiếp phối hợp tổ chức Vòng Cấp Trường.\n\nNăm 2026, đề thi tập trung vào bài toán chuyển đổi xanh trong vận tải đa phương thức và tối ưu hóa mạng lưới kho phân phối đô thị bằng mô hình định lượng.\n\nCác đội thi vượt qua vòng sơ loại sẽ bước vào chuỗi Mentoring 1-1 cùng giảng viên Trường Kinh tế – ĐHBK Hà Nội và các quản lý vận hành cấp cao từ doanh nghiệp đối tác trước khi tranh tài tại Đêm Chung kết Hội trường C2.",
                    external_url: ""
                },
                {
                    id: "news-green-supply-chain",
                    title: "HLS Insights: Xu hướng Kho thông minh & Tự động hóa AS/RS tại miền Bắc Việt Nam",
                    category: "Điểm tin Logistics",
                    published_at: "04/10/2026",
                    author: "Ban Chuyên môn HLS",
                    is_featured: true,
                    cover_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop",
                    summary: "Tổng hợp báo cáo chuyên đề từ nhóm nghiên cứu Ban Chuyên môn HLS sau chuyến thực tế tại các trung tâm phân phối hiện đại khu vực Bắc Ninh – Hải Phòng.",
                    content: "Sự bùng nổ của thương mại điện tử và dịch vụ fulfillment tốc độ cao đang thúc đẩy làn sóng đầu tư mạnh mẽ vào hệ thống lưu trữ và truy xuất tự động (AS/RS) cùng đội robot tự hành AGV/AMR tại các hành lang công nghiệp Bắc Ninh, Hưng Yên và Hải Phòng.\n\nDưới góc nhìn của sinh viên khối kỹ thuật – quản trị ĐHBK Hà Nội, bài toán cốt lõi không chỉ nằm ở phần cứng tự động hóa mà ở thuật toán phân bổ SKU (Slotting Optimization) và tích hợp dữ liệu thời gian thực trên hệ thống WMS.\n\nBản tin chuyên môn tháng 10 của HLS phân tích 3 mô hình vận hành tiêu biểu và gợi ý hướng đề tài nghiên cứu khoa học cho sinh viên năm 3–4.",
                    external_url: ""
                },
                {
                    id: "news-tuyen-gen-moi",
                    title: "Đợt Tuyển Thành Viên Thường Niên HLS: Tìm Kiếm Những Mảnh Ghép Kế Cận",
                    category: "Tuyển thành viên",
                    published_at: "25/10/2026",
                    author: "Ban Nhân sự HLS",
                    is_featured: true,
                    cover_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop",
                    summary: "Cơ hội gia nhập 5 ban chức năng của CLB Logistics & Quản lý chuỗi cung ứng ĐHBK Hà Nội dành cho sinh viên toàn trường yêu thích học thuật và hoạt động thực tiễn.",
                    content: "Đợt tuyển thành viên thường niên của HLS mở rộng cánh cửa chào đón các bạn tân sinh viên và sinh viên các khóa tại Đại học Bách Khoa Hà Nội có mong muốn rèn luyện chuyên môn, kỹ năng tổ chức dự án và mở rộng mạng lưới kết nối trong ngành Chuỗi cung ứng.\n\nQuy trình tuyển chọn gồm 3 vòng: Vòng Đơn trực tuyến (Application Form), Vòng Phỏng vấn cá nhân (Interview) và Vòng Làm việc nhóm giải tình huống thực tế (Teamwork Challenge).\n\nỨng viên có thể theo dõi Fanpage chính thức hoặc nhấn vào nút 'Tham gia CLB' ngay trên website để điền biểu mẫu đăng ký trong thời gian mở đơn.",
                    external_url: ""
                },
                {
                    id: "news-workshop-python-scm",
                    title: "Tổng kết chuỗi Workshop Phân tích Dữ liệu Tồn kho & Dự báo Nhu cầu bằng Python",
                    category: "Góc Học thuật",
                    published_at: "02/11/2026",
                    author: "Ban Chuyên môn HLS",
                    is_featured: false,
                    cover_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
                    summary: "Hơn 150 sinh viên tham gia thực hành trực tiếp trên bộ dữ liệu chuỗi bán lẻ với mô hình phân loại ABC-XYZ và tính toán mức tồn kho an toàn.",
                    content: "Chuỗi Workshop kỹ năng phân tích định lượng do Ban Chuyên môn HLS tổ chức đã khép lại với 3 buổi thực hành chuyên sâu kéo dài 9 giờ làm việc trực tiếp cùng dữ liệu thực.\n\nNgười tham dự được hướng dẫn làm sạch dữ liệu đơn hàng với thư viện Pandas, trực quan hóa biến động nhu cầu theo mùa vụ và xây dựng mô hình tối ưu điểm đặt hàng lại (Reorder Point) dưới điều kiện thời gian giao hàng (Lead Time) biến thiên.",
                    external_url: ""
                }
            ]
        },

        partners: {
            title: "Nhà Tài Trợ & Đối Tác Đồng Hành",
            intro: "HLS trân trọng gửi lời tri ân sâu sắc tới các đơn vị bảo trợ, Quý Nhà tài trợ, Doanh nghiệp Logistics và Đối tác truyền thông đã luôn tin tưởng, đồng hành cùng các thế hệ sinh viên ĐHBK Hà Nội.",
            cta_title: "Đồng hành cùng sinh viên Logistics ĐHBK Hà Nội",
            cta_desc: "Liên hệ trực tiếp Ban Chủ nhiệm & Ban Đối ngoại HLS để nhận Hồ sơ Mời tài trợ (Partnership Proposal) cho các chương trình học thuật trong năm.",
            items: [
                {
                    id: "partner-1",
                    name: "Trường Kinh tế — ĐHBK Hà Nội",
                    group: "enterprise",
                    tier_label: "Đơn vị Bảo trợ Chuyên môn",
                    logo_url: "",
                    website_url: "https://hust.edu.vn",
                    description: "Định hướng học thuật, cố vấn hội đồng giám khảo và bảo trợ các chương trình chuyên môn của CLB."
                },
                {
                    id: "partner-2",
                    name: "Mạng lưới CLB Sinh viên Logistics Việt Nam",
                    group: "enterprise",
                    tier_label: "Đối tác Học thuật",
                    logo_url: "",
                    website_url: "",
                    description: "Kết nối giao lưu học thuật, phối hợp tổ chức các sân chơi sinh viên Logistics quy mô toàn quốc."
                },
                {
                    id: "partner-3",
                    name: "Doanh nghiệp Cảng & Vận tải Biển Đối tác",
                    group: "sponsor",
                    tier_label: "Nhà tài trợ Kim cương",
                    logo_url: "",
                    website_url: "",
                    description: "Tài trợ hiện kim, học bổng thực tập và tiếp đón sinh viên HLS trong chuỗi Company Tour thường niên."
                },
                {
                    id: "partner-4",
                    name: "Tập đoàn Giải pháp Chuỗi cung ứng & 3PL",
                    group: "sponsor",
                    tier_label: "Nhà tài trợ Vàng",
                    logo_url: "",
                    website_url: "",
                    description: "Đồng hành chuyên môn, cung cấp đề bài Case Study thực tế và giải thưởng cuộc thi học thuật."
                },
                {
                    id: "partner-5",
                    name: "Học viện Đào tạo Logistics & Xuất nhập khẩu",
                    group: "sponsor",
                    tier_label: "Nhà tài trợ Đồng hành",
                    logo_url: "",
                    website_url: "",
                    description: "Tài trợ suất học bổng khóa học nghiệp vụ chuyên sâu dành cho các đội thi xuất sắc nhất."
                },
                {
                    id: "partner-6",
                    name: "Kênh Thông tin Sinh viên & Báo chí Chuyên ngành",
                    group: "media",
                    tier_label: "Đối tác Truyền thông",
                    logo_url: "",
                    website_url: "",
                    description: "Bảo trợ thông tin, lan tỏa hình ảnh các sự kiện và hoạt động học thuật của HLS tới cộng đồng sinh viên."
                }
            ]
        },

        pages: {
            home_activities_title: "Hệ Sinh Thái Hoạt Động HLS",
            events_eyebrow: "Chuyên mục Hoạt động · HLS ĐHBK Hà Nội",
            events_title: "Sự Kiện Thường Niên &",
            events_highlight: "Hoạt Động CLB",
            events_intro: "Tổng hợp các chương trình trọng điểm diễn ra định kỳ hằng năm (Core Events) cùng chuỗi hội thảo, nghiên cứu khoa học và hoạt động đồng hành của sinh viên HLS.",
            hall_eyebrow: "Lưu trữ Kỷ yếu · HLS ĐHBK Hà Nội",
            hall_title: "Phòng Truyền Thống",
            hall_highlight: "HLS",
            hall_intro: "Nơi lưu giữ dấu ấn của các thế hệ thành viên từ ngày đầu thành lập đến nay. Nhấn vào chân dung mỗi thành viên để mở trang Lưu bút & Confession cá nhân trong tab mới.",
            news_eyebrow: "Chuyên mục Tin tức · HLS ĐHBK Hà Nội"
        },

        contact: {
            address_line1: "Đại học Bách Khoa Hà Nội",
            address_line2: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
            email: "hls.hust@gmail.com",
            phone: "0912 345 678",
            phone_label: "Chủ nhiệm CLB đương nhiệm",
            fanpage_url: "https://www.facebook.com/",
            join_form_url: "",
            footer_desc: "Câu lạc bộ Logistics và Quản lý chuỗi cung ứng của Đại học Bách Khoa Hà Nội. Nơi kết nối, học hỏi và phát triển của sinh viên đam mê lĩnh vực Logistics và Chuỗi cung ứng.",
            footer_quote: "Chia sẻ – Kết nối – Học hỏi",
            footer_sub_tagline: "CLB Logistics và Quản lý chuỗi cung ứng — Đại học Bách Khoa Hà Nội",
            copyright: "© 2026 HLS — CLB Logistics và Quản lý chuỗi cung ứng ĐHBK Hà Nội."
        }
    };

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

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function mergeWithDefaults(stored) {
        const result = clone(DEFAULT_CONTENT);
        if (!stored || typeof stored !== "object") return result;

        Object.keys(result).forEach((section) => {
            if (stored[section] && typeof stored[section] === "object") {
                result[section] = { ...result[section], ...stored[section] };
            }
        });

        // Nếu dữ liệu cũ chưa từng có phone_label và phone đang trống, hiển thị mẫu để Admin dễ nhận biết
        if (stored.contact && !("phone_label" in stored.contact) && !stored.contact.phone) {
            result.contact.phone = DEFAULT_CONTENT.contact.phone;
            result.contact.phone_label = DEFAULT_CONTENT.contact.phone_label;
        }

        if (!Array.isArray(result.news.items)) {
            result.news.items = clone(DEFAULT_CONTENT.news.items);
        }
        if (!Array.isArray(result.partners.items)) {
            result.partners.items = clone(DEFAULT_CONTENT.partners.items);
        }

        return result;
    }

    function getDefaultContent() {
        return clone(DEFAULT_CONTENT);
    }

    async function getContent() {
        const sb = getSupabase();
        if (sb) {
            const { data, error } = await sb
                .from("site_content")
                .select("data")
                .eq("id", CONTENT_ROW_ID)
                .maybeSingle();
            if (error) {
                throw new Error("Không thể tải nội dung trang chủ từ Supabase: " + error.message);
            }
            return mergeWithDefaults(data ? data.data : null);
        }

        try {
            const raw = localStorage.getItem(LOCAL_CONTENT_KEY);
            return mergeWithDefaults(raw ? JSON.parse(raw) : null);
        } catch (err) {
            console.warn("Không đọc được nội dung đã lưu, dùng nội dung mặc định:", err);
            return getDefaultContent();
        }
    }

    async function saveContent(content) {
        const merged = mergeWithDefaults(content);
        const sb = getSupabase();
        if (sb) {
            const { error } = await sb
                .from("site_content")
                .upsert([{ id: CONTENT_ROW_ID, data: merged, updated_at: new Date().toISOString() }], { onConflict: "id" });
            if (error) throw new Error("Lỗi lưu nội dung trang chủ: " + error.message);
            return merged;
        }

        try {
            localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(merged));
        } catch (err) {
            throw new Error("Bộ nhớ trình duyệt đã đầy (giới hạn ~5MB). Hãy dùng ảnh có dung lượng nhỏ hơn, dán URL ảnh hoặc kết nối Supabase.");
        }
        return merged;
    }

    async function resetContent() {
        const sb = getSupabase();
        if (sb) {
            const { error } = await sb.from("site_content").delete().eq("id", CONTENT_ROW_ID);
            if (error) throw new Error("Lỗi khôi phục nội dung mặc định: " + error.message);
            return getDefaultContent();
        }
        localStorage.removeItem(LOCAL_CONTENT_KEY);
        return getDefaultContent();
    }

    // Nén ảnh trước khi lưu (giữ kênh trong suốt PNG cho Logo đối tác/CLB nếu là ảnh PNG nhỏ, hoặc nén WebP/JPEG)
    function compressImage(file, maxWidth = 1400, quality = 0.84) {
        const isPng = file && file.type === "image/png";
        const outMime = isPng ? "image/png" : "image/jpeg";

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Không thể đọc tệp hình ảnh."));
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error("Tệp hình ảnh không hợp lệ."));
                img.onload = () => {
                    let { width, height } = img;
                    const cap = isPng ? Math.min(maxWidth, 800) : maxWidth;
                    if (width > cap) {
                        height = Math.round((height * cap) / width);
                        width = cap;
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => resolve({
                            blob,
                            mime: outMime,
                            ext: isPng ? "png" : "jpg",
                            dataUrl: isPng ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", quality)
                        }),
                        outMime,
                        isPng ? undefined : quality
                    );
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async function uploadSiteImage(file) {
        if (file && file.type === "image/svg+xml") {
            return new Promise((resolve, reject) => {
                const r = new FileReader();
                r.onerror = () => reject(new Error("Không đọc được tệp SVG."));
                r.onload = () => resolve(r.result);
                r.readAsDataURL(file);
            });
        }

        const compressed = await compressImage(file);
        const sb = getSupabase();
        if (!sb) return compressed.dataUrl;

        const bucket = getConfig().EVENT_STORAGE_BUCKET || "event-photos";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, "");
        const filePath = `site/${Date.now()}_${safeName}.${compressed.ext}`;

        const { error } = await sb.storage
            .from(bucket)
            .upload(filePath, compressed.blob, { contentType: compressed.mime, upsert: false });
        if (error) throw new Error("Lỗi tải ảnh lên Supabase Storage: " + error.message);

        const { data } = sb.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    }

    window.HLSContentService = {
        LOCAL_CONTENT_KEY,
        getDefaultContent,
        getContent,
        saveContent,
        resetContent,
        uploadSiteImage
    };
})();
