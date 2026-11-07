// ============================================================================
// DỊCH VỤ QUẢN LÝ NỘI DUNG TRANG CHỦ - HLS ĐHBK HÀ NỘI
// Quản lý: Banner (Hero), Về chúng tôi, Câu chuyện thành lập, Tầm nhìn & Sứ mệnh,
//          Cơ cấu tổ chức, Thành tích nổi bật và Thông tin liên hệ.
// Hỗ trợ song song:
// - Supabase Cloud (bảng `site_content`, 1 dòng id = 'main', cột `data` dạng jsonb)
// - Local Storage (lưu cục bộ trên trình duyệt) khi chưa cấu hình Supabase
// ============================================================================

(function () {
    const LOCAL_CONTENT_KEY = "hls_site_content_v1";
    const CONTENT_ROW_ID = "main";

    // Nội dung mặc định (mẫu) — chỉnh sửa trực tiếp trong admin.html > Tab 03
    const DEFAULT_CONTENT = {
        hero: {
            eyebrow: "Đại học Bách Khoa Hà Nội · HUST",
            title_line1: "Kết nối. Học hỏi.",
            title_highlight: "Phát triển bền vững.",
            description: "Câu lạc bộ Logistics và Quản lý chuỗi cung ứng của Đại học Bách Khoa Hà Nội — không gian học thuật chuyên sâu kết nối sinh viên, giảng viên và mạng lưới doanh nghiệp Chuỗi cung ứng.",
            primary_cta_label: "Xem hoạt động nổi bật",
            secondary_cta_label: "Phòng truyền thống"
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

        contact: {
            address_line1: "Đại học Bách Khoa Hà Nội",
            address_line2: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
            email: "hls.hust@gmail.com",
            phone: "",
            fanpage_url: "https://www.facebook.com/",
            join_form_url: ""
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
            supabaseClient = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
        }
        return supabaseClient;
    }

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Gộp dữ liệu đã lưu với mặc định: thiếu trường nào lấy trường mặc định đó
    function mergeWithDefaults(stored) {
        const result = clone(DEFAULT_CONTENT);
        if (!stored || typeof stored !== "object") return result;
        Object.keys(result).forEach((section) => {
            if (stored[section] && typeof stored[section] === "object") {
                result[section] = { ...result[section], ...stored[section] };
            }
        });
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

    // Nén ảnh trước khi lưu (tối đa 1400px chiều ngang)
    function compressImage(file, maxWidth = 1400, quality = 0.82) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Không thể đọc tệp hình ảnh."));
            reader.onload = (e) => {
                const img = new Image();
                img.onerror = () => reject(new Error("Tệp hình ảnh không hợp lệ."));
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext("2d").drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => resolve({ blob, dataUrl: canvas.toDataURL("image/jpeg", quality) }),
                        "image/jpeg",
                        quality
                    );
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Tải ảnh trang chủ lên Supabase Storage (kho event-photos, thư mục site/) hoặc trả DataURL khi lưu cục bộ
    async function uploadSiteImage(file) {
        const compressed = await compressImage(file);
        const sb = getSupabase();
        if (!sb) return compressed.dataUrl;

        const bucket = getConfig().EVENT_STORAGE_BUCKET || "event-photos";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.[^.]+$/, "");
        const filePath = `site/${Date.now()}_${safeName}.jpg`;

        const { error } = await sb.storage
            .from(bucket)
            .upload(filePath, compressed.blob, { contentType: "image/jpeg", upsert: false });
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

