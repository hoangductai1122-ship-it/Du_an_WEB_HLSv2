// ============================================================================
// DỊCH VỤ QUẢN LÝ DỮ LIỆU HOẠT ĐỘNG & SỰ KIỆN (CORE HẰNG NĂM & NGOÀI LỀ) - HLS
// Hỗ trợ song song:
// - Supabase Cloud (bảng `events` + kho ảnh `event-photos`) khi đã cấu hình khóa
// - Local Storage kèm dữ liệu mẫu chuẩn HLS ĐHBK Hà Nội để sử dụng ngay lập tức
// ============================================================================

(function () {
    const LOCAL_EVENTS_KEY = "hls_events_archive_v1";

    const SEED_EVENTS = [
        // ================= SỰ KIỆN CORE THƯỜNG NIÊN =================
        {
            id: "evt-core-vylt",
            title: "Vietnam Young Logistics Talents — Vòng Cấp Trường ĐHBK Hà Nội",
            category: "core",
            sub_type: "Cuộc thi Học thuật",
            annual_cycle: "Thường niên · Tháng 08 – Tháng 10",
            date_label: "28/09/2026",
            year: 2026,
            location: "Hội trường C2, Đại học Bách Khoa Hà Nội",
            scale: "45+ đội thi · 500+ sinh viên tham dự",
            is_featured: true,
            sort_order: 1,
            cover_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
            summary: "Cuộc thi tìm kiếm tài năng trẻ Logistics quy mô toàn quốc. HLS đảm nhận vai trò đơn vị đồng hành tổ chức vòng tuyển chọn cấp trường tại Đại học Bách Khoa Hà Nội.",
            highlight_quote: "Nơi bản lĩnh phân tích định lượng của sinh viên Bách Khoa tỏa sáng trước những bài toán chuỗi cung ứng thực chiến.",
            content: "Vietnam Young Logistics Talents (VYLT) là sân chơi học thuật uy tín bậc nhất dành cho sinh viên đam mê Logistics và Quản lý chuỗi cung ứng trên toàn quốc. Hằng năm, Câu lạc bộ HLS tự hào đảm nhận vai trò đơn vị tổ chức Vòng cấp trường tại Đại học Bách Khoa Hà Nội (HUST).\n\nKhông dừng lại ở một cuộc thi tuyển chọn, chuỗi sự kiện VYLT tại HUST được HLS thiết kế thành một hành trình đào tạo bài bản kéo dài gần hai tháng — nơi các đội thi được cố vấn trực tiếp bởi giảng viên chuyên ngành và chuyên gia quản lý chuỗi cung ứng từ các tập đoàn đa quốc gia.",
            activities: [
                {
                    stage: "Chặng 01 · Tuần 1 Tháng 08",
                    title: "Phát động & Ngày hội Thông tin (Information Day)",
                    description: "Công bố thể lệ thi đấu, kết nối ghép đội liên ngành Kỹ thuật – Kinh tế và giao lưu cùng các cựu quán quân HLS."
                },
                {
                    stage: "Chặng 02 · Tuần 3 Tháng 08",
                    title: "Vòng Sơ loại Trực tuyến & Chuỗi Training Học thuật",
                    description: "Kiểm tra kiến thức nền tảng về vận tải đa phương thức, Incoterms, quản trị kho bãi và phân tích dữ liệu chuỗi cung ứng."
                },
                {
                    stage: "Chặng 03 · Đầu Tháng 09",
                    title: "Mentoring 1-1 cùng Chuyên gia Doanh nghiệp",
                    description: "Top 6 đội thi xuất sắc nhất giải quyết Case Study thực tế từ doanh nghiệp đối tác dưới sự hướng dẫn của Ban Cố vấn."
                },
                {
                    stage: "Chặng 04 · Cuối Tháng 09",
                    title: "Đêm Chung kết Cấp trường tại Hội trường C2",
                    description: "Tranh biện trực tiếp trên sân khấu trước Hội đồng Giám khảo để chọn ra đại diện xuất sắc nhất của ĐHBK Hà Nội bước vào Vòng Bán kết & Chung kết Toàn quốc."
                }
            ],
            editions: [
                {
                    year: "2026",
                    theme: "Green & Resilient Supply Chain",
                    summary: "Quy tụ 48 đội thi từ 7 trường/viện thuộc ĐHBK Hà Nội; giải pháp tối ưu phát thải kho lạnh giành ngôi vị Quán quân cấp trường."
                },
                {
                    year: "2025",
                    theme: "AI & Data-Driven Logistics",
                    summary: "39 đội thi tranh tài với sự đồng hành chuyên môn của 6 doanh nghiệp 3PL và hãng tàu quốc tế."
                },
                {
                    year: "2024",
                    theme: "Digitalization in Multimodal Transport",
                    summary: "Đánh dấu bước ngoặt mở rộng quy mô tổ chức tại hội trường lớn với hơn 450 khán giả theo dõi trực tiếp."
                }
            ],
            gallery: [
                {
                    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
                    caption: "Toàn cảnh khán phòng Đêm Chung kết cấp trường tại Đại học Bách Khoa Hà Nội"
                },
                {
                    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000&auto=format&fit=crop",
                    caption: "Phần thuyết trình và phản biện giải pháp tối ưu chuỗi cung ứng của các đội thi"
                },
                {
                    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
                    caption: "Buổi làm việc chuyên sâu giữa đội thi và cố vấn chuyên môn trước thềm Chung kết"
                }
            ]
        },
        {
            id: "evt-core-hlc",
            title: "HUST Logistics Case Competition — Giải Bài Toán Chuỗi Cung Ứng",
            category: "core",
            sub_type: "Cuộc thi Học thuật",
            annual_cycle: "Thường niên · Tháng 04 – Tháng 06",
            date_label: "Tháng 06/2026",
            year: 2026,
            location: "Đại học Bách Khoa Hà Nội",
            scale: "300+ thí sinh toàn miền Bắc",
            is_featured: true,
            sort_order: 2,
            cover_url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
            summary: "Cuộc thi giải tình huống thực chiến thường niên do HLS khởi xướng, tập trung vào mô hình hóa toán học, hoạch định nhu cầu và thiết kế mạng lưới phân phối.",
            highlight_quote: "Đưa bài toán thực tế từ kho bãi và cảng biển vào giảng đường đại học.",
            content: "HUST Logistics Case Competition là sự kiện học thuật thường niên trọng điểm mỗi dịp học kỳ II của HLS, được thiết kế riêng nhằm phát huy thế mạnh tư duy định lượng, lập trình tối ưu và phân tích hệ thống của sinh viên khối kỹ thuật – kinh tế.\n\nĐề thi hằng năm được xây dựng trực tiếp từ dữ liệu vận hành thực tế của doanh nghiệp sản xuất và phân phối lớn tại miền Bắc, yêu cầu các đội thi không chỉ đề xuất ý tưởng mà còn chứng minh tính khả thi bằng mô hình số liệu cụ thể.",
            activities: [
                {
                    stage: "Vòng 01 · Đánh giá năng lực phân tích",
                    title: "Xử lý bộ dữ liệu vận hành (Data Cleansing & Forecasting)",
                    description: "Các đội thi làm sạch dữ liệu lịch sử đơn hàng và xây dựng mô hình dự báo nhu cầu theo mùa vụ."
                },
                {
                    stage: "Vòng 02 · Thiết kế mạng lưới",
                    title: "Simulation & Tối ưu hóa tuyến đường vận tải",
                    description: "Xây dựng phương án bố trí kho trung chuyển và lộ trình giao hàng chi phí tối thiểu."
                },
                {
                    stage: "Vòng 03 · Chung kết đối kháng",
                    title: "Bảo vệ phương án trước Hội đồng Doanh nghiệp",
                    description: "Trình bày báo cáo chiến lược và xử lý tình huống biến động đứt gãy nguồn cung trực tiếp trên sân khấu."
                }
            ],
            editions: [
                {
                    year: "2026",
                    theme: "Cold Chain Optimization",
                    summary: "Giải quyết bài toán tối ưu chi phí vận chuyển nông sản lạnh xuất khẩu với 36 đội tham dự."
                },
                {
                    year: "2025",
                    theme: "Last-mile Delivery in Urban Areas",
                    summary: "Tối ưu mạng lưới giao hàng chặng cuối nội đô Hà Nội."
                }
            ],
            gallery: [
                {
                    url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop",
                    caption: "Các đội tuyển thảo luận chiến lược giải Case Study tại vòng Bán kết"
                },
                {
                    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop",
                    caption: "Ban Giám khảo nhận xét mô hình định lượng của các đội thi xuất sắc"
                }
            ]
        },
        {
            id: "evt-core-fieldtrip",
            title: "HLS Annual Company Tour — Thực Tế Cảng Biển & Trung Tâm Phân Phối",
            category: "core",
            sub_type: "Thực tế Doanh nghiệp (Company Tour)",
            annual_cycle: "Thường niên · 2 đợt/năm (Tháng 03 & Tháng 11)",
            date_label: "Tháng 11/2026",
            year: 2026,
            location: "Hải Phòng & Bắc Ninh",
            scale: "60 – 80 thành viên / đợt",
            is_featured: false,
            sort_order: 3,
            cover_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop",
            summary: "Chương trình tham quan thực địa định kỳ hằng năm đưa sinh viên HLS trực tiếp quan sát quy trình khai thác cảng container, kho ngoại quan và trung tâm chia chọn tự động.",
            highlight_quote: "Trăm trang lý thuyết trên giảng đường trở nên sống động ngay trước cầu cảng và dây chuyền phân loại tự động.",
            content: "Với phương châm gắn kết chặt chẽ lý thuyết học thuật với thực tiễn vận hành công nghiệp, HLS duy trì tổ chức chuỗi Company Tour định kỳ mỗi học kỳ tới các đầu mối hạ tầng Logistics trọng điểm khu vực phía Bắc.\n\nThông qua chuyến đi, thành viên CLB được trực tiếp quan sát quy trình xếp dỡ tàu container, hệ thống quản trị kho thông minh (WMS), quy trình thông quan hải quan và đối thoại trực tiếp cùng các kỹ sư trưởng vận hành tại hiện trường.",
            activities: [
                {
                    stage: "Buổi sáng · 08:00 – 11:30",
                    title: "Khảo sát thực địa cầu cảng & bãi container (CY)",
                    description: "Tìm hiểu quy trình điều độ cẩu bờ QC, cẩu bãi RTG và hệ thống điều hành cảng điện tử e-Port."
                },
                {
                    stage: "Buổi chiều · 13:30 – 16:30",
                    title: "Tham quan Trung tâm Phân phối & Kho thông minh",
                    description: "Quan sát quy trình Inbound, lưu trữ kệ cao tầng, lấy hàng (Order Picking) và đóng gói xuất kho."
                },
                {
                    stage: "Phiên thảo luận · 16:30 – 17:30",
                    title: "Tọa đàm định hướng nghề nghiệp cùng Quản lý Vận hành",
                    description: "Giải đáp thắc mắc về tiêu chuẩn tuyển dụng kỹ sư vận hành chuỗi cung ứng và cơ hội thực tập cho sinh viên HUST."
                }
            ],
            editions: [
                {
                    year: "2026",
                    theme: "Smart Port & Automated Fulfillment Center",
                    summary: "Tham quan tổ hợp cảng nước sâu Lạch Huyện (Hải Phòng) và trung tâm phân phối tự động tại KCN VSIP Bắc Ninh."
                },
                {
                    year: "2025",
                    theme: "Air Cargo & Bonded Warehouse Operations",
                    summary: "Khảo sát nhà ga hàng hóa hàng không Nội Bài và hệ thống kho ngoại quan."
                }
            ],
            gallery: [
                {
                    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop",
                    caption: "Hoạt động khai thác và lưu bãi tại khu vực cảng container"
                },
                {
                    url: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop",
                    caption: "Hệ thống kệ kho tiêu chuẩn cao tại trung tâm phân phối hiện đại"
                }
            ]
        },

        // ================= HOẠT ĐỘNG NGOÀI LỀ / ĐỒNG HÀNH =================
        {
            id: "evt-side-nckh-2026",
            title: "Báo cáo Nghiên cứu Khoa học Sinh viên — Tối ưu hóa Vận tải & T-Seal",
            category: "side",
            sub_type: "Nghiên cứu Khoa học",
            annual_cycle: "Hoạt động Chuyên đề",
            date_label: "15/05/2026",
            year: 2026,
            location: "Thư viện Tạ Quang Bửu, ĐHBK Hà Nội",
            scale: "12 nhóm nghiên cứu thành viên HLS",
            is_featured: true,
            sort_order: 1,
            cover_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop",
            summary: "Các nhóm nghiên cứu thuộc Ban Chuyên môn HLS trình bày giải pháp niêm phong điện tử T-Seal và thuật toán định tuyến phương tiện tại Hội nghị Sinh viên NCKH.",
            highlight_quote: "Nuôi dưỡng tư duy nghiên cứu độc lập và ứng dụng công nghệ vào bài toán vận tải Việt Nam.",
            content: "Bên cạnh các sân chơi quy mô lớn, nhóm Nghiên cứu Khoa học trực thuộc Ban Chuyên môn HLS hoạt động xuyên suốt năm học để ươm mầm các đề tài ứng dụng IoT, thuật toán tối ưu hóa (VRP, MILP) và mô phỏng hệ thống rời rạc trong quản trị chuỗi cung ứng.\n\nTại Hội nghị Sinh viên Nghiên cứu Khoa học năm 2026, các thành viên HLS đã báo cáo thành công đề tài tích hợp khóa niêm phong định vị T-Seal kết hợp mô hình tối ưu hóa ghép tải container chiều về, nhận được đánh giá cao từ hội đồng chuyên môn.",
            activities: [
                {
                    stage: "Phần 01 · Báo cáo chuyên đề",
                    title: "Trình bày mô hình toán tối ưu ghép tải vận tải đường bộ",
                    description: "Phân tích hiệu quả cắt giảm quãng đường xe chạy rỗng bằng giải thuật heuristic trên bộ dữ liệu tuyến Hà Nội – Hải Phòng."
                },
                {
                    stage: "Phần 02 · Demo kỹ thuật",
                    title: "Thử nghiệm giải pháp giám sát hành trình & niêm phong T-Seal",
                    description: "Minh họa cơ chế cảnh báo sớm khi phát sinh mở niêm phong trái phép hoặc lệch lộ trình quy định."
                }
            ],
            editions: [],
            gallery: [
                {
                    url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
                    caption: "Nhóm nghiên cứu kiểm thử mô hình và hoàn thiện số liệu thực nghiệm"
                }
            ]
        },
        {
            id: "evt-side-workshop-python",
            title: "Workshop Nội bộ & Mở rộng: Phân tích Dữ liệu Tồn kho với Python",
            category: "side",
            sub_type: "Workshop Chuyên môn",
            annual_cycle: "Chuỗi Workshop Kỹ năng",
            date_label: "12/04/2026",
            year: 2026,
            location: "Tòa nhà D9, Đại học Bách Khoa Hà Nội",
            scale: "90 sinh viên tham dự",
            is_featured: true,
            sort_order: 2,
            cover_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
            summary: "Buổi thực hành chuyên sâu hướng dẫn sử dụng Python và Pandas để phân tích ABC-XYZ, tính toán mức tồn kho an toàn (Safety Stock) và điểm đặt hàng lại (ROP).",
            highlight_quote: "Trang bị bộ công cụ phân tích dữ liệu thực chiến cho sinh viên theo đuổi Supply Chain Analytics.",
            content: "Nhằm giúp sinh viên vượt qua rào cản giữa công thức lý thuyết quản trị tồn kho và khối lượng dữ liệu hàng chục nghìn mã SKU ngoài thực tế doanh nghiệp, Ban Chuyên môn HLS đã tổ chức buổi Workshop thực hành trực tiếp trên máy tính.\n\nNgười tham dự được cung cấp bộ dữ liệu mẫu ẩn danh từ ngành hàng tiêu dùng nhanh (FMCG) và trực tiếp viết mã phân nhóm ABC-XYZ cũng như mô phỏng chính sách đặt hàng tối ưu.",
            activities: [
                {
                    stage: "Phiên 01 · 60 phút",
                    title: "Chuẩn hóa dữ liệu SKU & Phân tích ma trận ABC-XYZ",
                    description: "Thực hành xử lý dữ liệu thiếu, biến động nhu cầu và phân loại danh mục hàng hóa tự động bằng Python."
                },
                {
                    stage: "Phiên 02 · 90 phút",
                    title: "Mô phỏng Safety Stock & Mức độ phục vụ (Service Level)",
                    description: "Đánh giá sự đánh đổi giữa chi phí lưu kho và tỷ lệ thiếu hụt hàng hóa khi thời gian giao hàng (Lead Time) biến động."
                }
            ],
            editions: [],
            gallery: [
                {
                    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
                    caption: "Thực hành trực quan hóa biểu đồ tồn kho và dự báo nhu cầu"
                }
            ]
        },
        {
            id: "evt-side-career-talk",
            title: "Talkshow Hướng nghiệp: Lộ trình Quản trị viên Tập sự Ngành Chuỗi Cung Ứng",
            category: "side",
            sub_type: "Hội thảo & Talkshow",
            annual_cycle: "Sự kiện Đồng hành Doanh nghiệp",
            date_label: "22/03/2026",
            year: 2026,
            location: "Hội trường Thư viện Tạ Quang Bửu, ĐHBK Hà Nội",
            scale: "220 sinh viên tham dự",
            is_featured: true,
            sort_order: 3,
            cover_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop",
            summary: "Giao lưu trực tiếp cùng các anh chị cựu thành viên HLS và quản lý cấp trung tại các tập đoàn FMCG, sản xuất công nghiệp về lộ trình ứng tuyển Management Trainee.",
            highlight_quote: "Định vị rõ năng lực cốt lõi ngay từ năm hai, năm ba để bứt phá trong các kỳ tuyển dụng lớn.",
            content: "Buổi Talkshow quy tụ 3 diễn giả là các anh chị đang công tác ở mảng Demand Planning, Procurement và Logistics Operations tại các tập đoàn đa quốc gia.\n\nKhông chỉ giải mã cấu trúc các vòng thi Aptitude Test, Assessment Center của chương trình Quản trị viên Tập sự (Management Trainee), chương trình còn có phiên sửa CV trực tiếp cho các bạn sinh viên năm ba và năm cuối ĐHBK Hà Nội.",
            activities: [
                {
                    stage: "Phần 01 · Bức tranh nghề nghiệp",
                    title: "Phân biệt các mảng công việc trong Supply Chain hiện đại",
                    description: "So sánh yêu cầu kỹ năng giữa Planning, Sourcing/Procurement, Manufacturing, Warehouse và Customer Service."
                },
                {
                    stage: "Phần 02 · Bàn tròn thảo luận & Review CV",
                    title: "Giải mã vòng Assessment Center & Hỏi đáp trực tiếp",
                    description: "Chia sẻ kinh nghiệm làm việc nhóm giải Case trong thời gian ngắn và góp ý trực tiếp hồ sơ ứng tuyển."
                }
            ],
            editions: [],
            gallery: [
                {
                    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000&auto=format&fit=crop",
                    caption: "Không khí trao đổi cởi mở giữa diễn giả khách mời và sinh viên tham dự"
                }
            ]
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

    function sortEvents(events) {
        return [...events].sort((a, b) => {
            // Core lên trước Side khi cùng ngữ cảnh chung, sau đó theo sort_order tăng dần, rồi theo năm mới nhất
            if (a.category !== b.category) {
                return a.category === "core" ? -1 : 1;
            }
            const orderA = Number(a.sort_order) || 999;
            const orderB = Number(b.sort_order) || 999;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            const yearA = Number(a.year) || 0;
            const yearB = Number(b.year) || 0;
            if (yearA !== yearB) {
                return yearB - yearA;
            }
            return (a.title || "").localeCompare(b.title || "", "vi");
        });
    }

    function normalizeEventRecord(item) {
        return {
            id: item.id || "evt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
            title: (item.title || "").trim(),
            category: item.category === "core" ? "core" : "side",
            sub_type: (item.sub_type || "Hoạt động CLB").trim(),
            annual_cycle: (item.annual_cycle || "").trim(),
            date_label: (item.date_label || "").trim(),
            year: Number(item.year) || new Date().getFullYear(),
            location: (item.location || "").trim(),
            scale: (item.scale || "").trim(),
            is_featured: Boolean(item.is_featured),
            sort_order: Number(item.sort_order) || 10,
            cover_url: (item.cover_url || "").trim(),
            summary: (item.summary || "").trim(),
            highlight_quote: (item.highlight_quote || "").trim(),
            content: (item.content || "").trim(),
            activities: Array.isArray(item.activities) ? item.activities : [],
            editions: Array.isArray(item.editions) ? item.editions : [],
            gallery: Array.isArray(item.gallery) ? item.gallery : []
        };
    }

    function readLocalEvents() {
        try {
            const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
            if (!raw) {
                localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(SEED_EVENTS));
                return SEED_EVENTS.map(normalizeEventRecord);
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(SEED_EVENTS));
                return SEED_EVENTS.map(normalizeEventRecord);
            }
            return parsed.map(normalizeEventRecord);
        } catch (err) {
            console.warn("Không thể đọc localStorage cho sự kiện, dùng dữ liệu mẫu:", err);
            return SEED_EVENTS.map(normalizeEventRecord);
        }
    }

    function writeLocalEvents(events) {
        localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
    }

    // Nén ảnh sự kiện chuẩn sắc nét (cho phép bề ngang lớn hơn ảnh chân dung: 1280px)
    function compressEventImage(file, maxWidth = 1280, quality = 0.82) {
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

    // Upload 1 ảnh sự kiện (dùng cho ảnh bìa hoặc từng ảnh trong Album)
    async function uploadEventPhoto(file) {
        const compressed = await compressEventImage(file);
        const sb = getSupabase();
        if (!sb) {
            return compressed.dataUrl;
        }

        const cfg = getConfig();
        const bucket = cfg.EVENT_STORAGE_BUCKET || "event-photos";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `events/${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${safeName.replace(/\.[^.]+$/, "")}.jpg`;

        const { error: uploadError } = await sb.storage
            .from(bucket)
            .upload(filePath, compressed.blob, {
                contentType: "image/jpeg",
                upsert: false
            });

        if (uploadError) {
            throw new Error("Lỗi tải ảnh sự kiện lên Supabase Storage: " + uploadError.message);
        }

        const { data } = sb.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    }

    async function getEvents() {
        const sb = getSupabase();
        if (sb) {
            const { data, error } = await sb
                .from("events")
                .select("*")
                .order("sort_order", { ascending: true })
                .order("year", { ascending: false });

            if (error) {
                throw new Error("Không thể tải danh sách sự kiện từ Supabase: " + error.message);
            }
            return sortEvents((data || []).map(normalizeEventRecord));
        }

        return sortEvents(readLocalEvents());
    }

    async function getEventById(id) {
        const all = await getEvents();
        if (!id) {
            // Nếu không truyền id, trả về sự kiện Core tiêu biểu đầu tiên
            return all.find((e) => e.category === "core") || all[0] || null;
        }
        return all.find((e) => String(e.id) === String(id)) || null;
    }

    async function saveEvent(eventPayload, coverFile) {
        let coverUrl = (eventPayload.cover_url || "").trim();
        if (coverFile) {
            coverUrl = await uploadEventPhoto(coverFile);
        }
        if (!coverUrl && Array.isArray(eventPayload.gallery) && eventPayload.gallery.length > 0) {
            coverUrl = eventPayload.gallery[0].url;
        }
        if (!coverUrl) {
            coverUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop";
        }

        const record = normalizeEventRecord({
            ...eventPayload,
            cover_url: coverUrl
        });

        const sb = getSupabase();
        if (sb) {
            if (eventPayload.id) {
                const { id, ...updateData } = record;
                const { data, error } = await sb
                    .from("events")
                    .update(updateData)
                    .eq("id", id)
                    .select()
                    .single();
                if (error) throw new Error("Lỗi cập nhật sự kiện: " + error.message);
                return normalizeEventRecord(data);
            } else {
                const { data, error } = await sb
                    .from("events")
                    .insert([record])
                    .select()
                    .single();
                if (error) throw new Error("Lỗi thêm sự kiện mới: " + error.message);
                return normalizeEventRecord(data);
            }
        }

        const events = readLocalEvents();
        if (eventPayload.id) {
            const idx = events.findIndex((e) => String(e.id) === String(eventPayload.id));
            if (idx >= 0) {
                events[idx] = record;
            } else {
                events.push(record);
            }
        } else {
            events.push(record);
        }
        writeLocalEvents(events);
        return record;
    }

    async function deleteEvent(id) {
        const sb = getSupabase();
        if (sb) {
            const { error } = await sb.from("events").delete().eq("id", id);
            if (error) throw new Error("Lỗi xóa sự kiện: " + error.message);
            return true;
        }

        const remaining = readLocalEvents().filter((e) => String(e.id) !== String(id));
        writeLocalEvents(remaining);
        return true;
    }

    async function importEventsJson(items) {
        if (!Array.isArray(items)) throw new Error("Tệp JSON sự kiện không hợp lệ.");
        const cleaned = items.map(normalizeEventRecord);
        const sb = getSupabase();
        if (sb) {
            const { error } = await sb.from("events").upsert(cleaned, { onConflict: "id" });
            if (error) throw new Error("Lỗi nhập dữ liệu sự kiện lên Supabase: " + error.message);
            return cleaned.length;
        }
        writeLocalEvents(cleaned);
        return cleaned.length;
    }

    window.HLSEventsService = {
        LOCAL_EVENTS_KEY,
        getEvents,
        getEventById,
        saveEvent,
        deleteEvent,
        uploadEventPhoto,
        importEventsJson,
        sortEvents
    };
})();

