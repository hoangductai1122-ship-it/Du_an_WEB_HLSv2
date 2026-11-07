// ============================================================================
// BỘ ĐIỀU KHIỂN TRUNG TÂM QUẢN TRỊ TOÀN DIỆN WEBSITE HLS (OBSIDIAN DARK STUDIO)
// Quản lý tập trung 100% nội dung trên toàn bộ Website với 1 tài khoản duy nhất:
// 01. Nội dung Toàn Web & Liên hệ · 02. Hoạt động & Sự kiện · 03. Tin tức
// 04. Nhà tài trợ & Đối tác · 05. Phòng truyền thống · 06. Bàn giao & Sao lưu
// ============================================================================

(function () {
    const loginView = document.getElementById("login-view");
    const dashboardView = document.getElementById("dashboard-view");
    const logoutBtn = document.getElementById("logout-btn");
    const openSecurityBtn = document.getElementById("open-security-modal-btn");
    const bannerOpenSecurityBtn = document.getElementById("banner-open-security-btn");
    const activeAdminEmailEl = document.getElementById("active-admin-email");
    const modeBadge = document.getElementById("mode-badge");
    const toastBanner = document.getElementById("toast-banner");
    const localModeBanner = document.getElementById("local-mode-banner");
    const floatingSaveBar = document.getElementById("floating-save-bar");

    // 6 Phân khu trong cùng 1 Trung tâm Quản trị (Mặc định mở 01: Nội dung Toàn Web & Liên hệ)
    const TAB_KEYS = ["content", "events", "news", "partners", "members", "handover"];
    const tabButtons = {
        content: document.getElementById("tab-btn-content"),
        events: document.getElementById("tab-btn-events"),
        news: document.getElementById("tab-btn-news"),
        partners: document.getElementById("tab-btn-partners"),
        members: document.getElementById("tab-btn-members"),
        handover: document.getElementById("tab-btn-handover")
    };
    const tabPanels = {
        content: document.getElementById("panel-content"),
        events: document.getElementById("panel-events"),
        news: document.getElementById("panel-news"),
        partners: document.getElementById("panel-partners"),
        members: document.getElementById("panel-members"),
        handover: document.getElementById("panel-handover")
    };

    // Biến trạng thái Thành viên
    const memberModal = document.getElementById("member-modal");
    const memberForm = document.getElementById("member-form");
    const avatarFileInput = document.getElementById("field-avatar-file");
    const avatarUrlInput = document.getElementById("field-avatar-url");
    const avatarPreview = document.getElementById("avatar-preview");
    let membersCache = [];
    let selectedAvatarFile = null;

    // Biến trạng thái Sự kiện
    const eventModal = document.getElementById("event-modal");
    const eventForm = document.getElementById("event-form");
    const evtCoverFileInput = document.getElementById("evt-cover-file");
    const evtCoverUrlInput = document.getElementById("evt-cover-url");
    const evtCoverPreview = document.getElementById("evt-cover-preview");
    let eventsCache = [];
    let selectedEvtCoverFile = null;
    let draftActivities = [];
    let draftEditions = [];
    let draftGallery = [];

    // Biến trạng thái Nội dung Trang chủ, Tin tức, Đối tác & Liên hệ
    let siteContentDraft = window.HLSContentService ? HLSContentService.getDefaultContent() : {};
    let isContentDirty = false;

    // Modal Tin tức, Đối tác & Supabase
    const newsModal = document.getElementById("news-modal");
    const newsForm = document.getElementById("news-form");
    let selectedNewsCoverFile = null;

    const partnerModal = document.getElementById("partner-modal");
    const partnerForm = document.getElementById("partner-form");
    let selectedPartnerLogoFile = null;
    let partnerLogoCleared = false;

    const guideModal = document.getElementById("supabase-guide-modal");
    const securityModal = document.getElementById("security-modal");
    const securityForm = document.getElementById("security-form");
    let currentSessionInfo = null;

    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getMonogram(name) {
        const words = String(name || "HLS").trim().split(/\s+/).filter(Boolean);
        if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
        return words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
    }

    function formatTodayVN() {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${dd}/${mm}/${d.getFullYear()}`;
    }

    function showToast(message, isError = false) {
        toastBanner.textContent = message;
        toastBanner.className = `mb-6 px-4 py-3 rounded-lg border text-xs font-medium ${
            isError
                ? "bg-red-950/70 border-red-500/40 text-red-200"
                : "bg-zinc-900/90 border-red-500/35 text-zinc-100 shadow-[0_10px_28px_-14px_rgba(244,42,59,0.45)]"
        }`;
        toastBanner.classList.remove("hidden");
        setTimeout(() => toastBanner.classList.add("hidden"), 4500);
    }

    function syncFloatingSaveBar() {
        if (!floatingSaveBar) return;
        const shouldShow = Boolean(isContentDirty) &&
            !tabPanels.content.classList.contains("hidden") &&
            !dashboardView.classList.contains("hidden");
        floatingSaveBar.classList.toggle("hidden", !shouldShow);
    }

    function switchAdminTab(tabName) {
        const active = TAB_KEYS.includes(tabName) ? tabName : "content";

        TAB_KEYS.forEach((key) => {
            tabPanels[key].classList.toggle("hidden", active !== key);
            const isCurrent = active === key;
            tabButtons[key].className = `px-3.5 py-3 text-xs sm:text-sm whitespace-nowrap transition-colors border-b-2 ${
                isCurrent
                    ? "font-bold border-red-500 text-white"
                    : "font-medium border-transparent text-zinc-400 hover:text-white"
            }`;
        });

        if (active === "content") {
            history.replaceState(null, "", window.location.pathname);
        } else {
            history.replaceState(null, "", `#${active}`);
        }

        syncFloatingSaveBar();
    }

    function openContentSectionAndScroll(sectionIdx, focusSelector = null) {
        switchAdminTab("content");
        const detailsList = document.querySelectorAll("#content-editor > details");
        const idx = Number(sectionIdx);
        const targetDetails = detailsList[idx];
        if (targetDetails) {
            targetDetails.open = true;
            if (idx === 4 && detailsList[5]) {
                detailsList[5].open = true;
            }
            setTimeout(() => {
                targetDetails.scrollIntoView({ behavior: "smooth", block: "start" });
                if (focusSelector) {
                    const inputEl = targetDetails.querySelector(focusSelector);
                    if (inputEl) inputEl.focus();
                }
            }, 60);
        }
    }

    TAB_KEYS.forEach((key) => {
        tabButtons[key].addEventListener("click", () => switchAdminTab(key));
    });

    document.querySelectorAll("[data-jump-tab]").forEach((btn) => {
        btn.addEventListener("click", () => switchAdminTab(btn.getAttribute("data-jump-tab")));
    });

    document.getElementById("kpi-join-card").addEventListener("click", () => {
        openContentSectionAndScroll(6, '[data-path="contact.phone"]');
    });

    document.querySelectorAll("[data-open-content-section]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const secIdx = Number(btn.getAttribute("data-open-content-section"));
            const focusSel = secIdx === 6 ? '[data-path="contact.phone"]' : null;
            openContentSectionAndScroll(secIdx, focusSel);
        });
    });

    function updateModeBadge() {
        const isCloud = HLSService.isSupabaseConfigured();
        modeBadge.classList.remove("hidden");
        if (isCloud) {
            modeBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span>Supabase Cloud</span>`;
            modeBadge.className = "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
            localModeBanner.classList.add("hidden");
        } else {
            modeBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span><span>Lưu cục bộ (Local)</span>`;
            modeBadge.className = "hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border bg-red-500/10 border-red-500/30 text-red-300";
            localModeBanner.classList.remove("hidden");
        }
    }

    function refreshDashboardKPIs() {
        const maxGen = membersCache.length
            ? membersCache.reduce((acc, m) => Math.max(acc, Number(m.gen) || 1), 1)
            : 4;
        const execCount = membersCache.filter((m) => Number(m.gen) === maxGen && Number(m.tier) === 2).length;

        document.getElementById("kpi-current-gen").textContent = `Gen ${maxGen}`;
        document.getElementById("kpi-members-count").innerHTML = `${membersCache.length} hồ sơ · <span id="kpi-current-execs" class="text-zinc-300">${execCount} BCN</span>`;
        document.getElementById("next-gen-badge").textContent = `Chuẩn bị lên Gen ${maxGen + 1}`;

        const coreCount = eventsCache.filter((e) => e.category === "core").length;
        const sideCount = eventsCache.length - coreCount;
        document.getElementById("kpi-events-count").textContent = `${eventsCache.length} sự kiện`;
        document.getElementById("kpi-events-sub").textContent = `${coreCount} Core · ${sideCount} Ngoài lề`;

        const newsItems = (siteContentDraft && siteContentDraft.news && Array.isArray(siteContentDraft.news.items))
            ? siteContentDraft.news.items
            : [];
        const newsFeaturedCount = newsItems.filter((n) => n.is_featured).length;
        document.getElementById("kpi-news-count").textContent = `${newsItems.length} bài viết`;
        document.getElementById("kpi-news-sub").textContent = `${newsFeaturedCount} ghim trang chủ`;

        const partnerItems = (siteContentDraft && siteContentDraft.partners && Array.isArray(siteContentDraft.partners.items))
            ? siteContentDraft.partners.items
            : [];
        const sponsorCount = partnerItems.filter((p) => (p.group || "sponsor") === "sponsor").length;
        const mediaCount = partnerItems.filter((p) => p.group === "media").length;
        document.getElementById("kpi-partners-count").textContent = `${partnerItems.length} đơn vị`;
        document.getElementById("kpi-partners-sub").textContent = `${sponsorCount} Tài trợ · ${mediaCount} Truyền thông`;

        const ct = (siteContentDraft && siteContentDraft.contact) || {};
        const phoneStr = (ct.phone || "").trim();
        document.getElementById("kpi-phone-display").textContent = phoneStr ? `SĐT: ${phoneStr}` : "Chưa gắn SĐT Chủ nhiệm";

        const joinUrl = (ct.join_form_url || "").trim();
        const joinStatusEl = document.getElementById("kpi-join-status");
        if (joinUrl) {
            joinStatusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span class="text-emerald-300">Đang mở form tuyển quân</span>`;
        } else {
            joinStatusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-zinc-500"></span><span class="text-zinc-400">Nhấn để đổi SĐT / Form &rarr;</span>`;
        }
    }

    // ================= XỬ LÝ ĐĂNG NHẬP, BẢO MẬT & KHÓA PHIÊN TỰ ĐỘNG =================
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const errEl = document.getElementById("login-error");
        const btn = document.getElementById("login-submit-btn");
        const passInput = document.getElementById("login-password");
        errEl.classList.add("hidden");
        btn.disabled = true;
        btn.textContent = "Đang xác thực bảo mật...";

        try {
            const email = document.getElementById("login-email").value;
            const pass = passInput.value;
            await HLSService.loginAdmin(email, pass);
            passInput.value = "";
            await checkAuthAndRender();
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
        } finally {
            btn.disabled = false;
            btn.textContent = "Mở khóa Trung tâm Quản trị";
        }
    });

    logoutBtn.addEventListener("click", async () => {
        await HLSService.logoutAdmin();
        await checkAuthAndRender();
    });

    function openSecurityModal() {
        const isCloud = HLSService.isSupabaseConfigured();
        const emailText = (currentSessionInfo && currentSessionInfo.email) ? currentSessionInfo.email : "--";
        document.getElementById("sec-current-email").textContent = emailText;
        document.getElementById("sec-mode-note").textContent = isCloud
            ? "Đang kết nối Supabase Auth — mật khẩu mới sẽ được mã hóa trực tiếp trên máy chủ Supabase."
            : "Đang chạy chế độ Lưu cục bộ — mật khẩu được băm SHA-256 trên trình duyệt này.";
        document.getElementById("sec-email-row").classList.toggle("hidden", isCloud);
        document.getElementById("sec-new-email").value = "";
        document.getElementById("sec-current-password").value = "";
        document.getElementById("sec-new-password").value = "";
        document.getElementById("sec-confirm-password").value = "";
        document.getElementById("sec-error").classList.add("hidden");
        securityModal.classList.remove("hidden");
    }

    function closeSecurityModal() {
        securityModal.classList.add("hidden");
    }

    openSecurityBtn.addEventListener("click", openSecurityModal);
    bannerOpenSecurityBtn.addEventListener("click", openSecurityModal);
    document.getElementById("close-security-modal-btn").addEventListener("click", closeSecurityModal);
    document.getElementById("cancel-security-modal-btn").addEventListener("click", closeSecurityModal);

    securityForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errEl = document.getElementById("sec-error");
        const submitBtn = document.getElementById("save-security-btn");
        errEl.classList.add("hidden");

        const currentPassword = document.getElementById("sec-current-password").value;
        const newPassword = document.getElementById("sec-new-password").value;
        const confirmPassword = document.getElementById("sec-confirm-password").value;
        const newEmail = document.getElementById("sec-new-email").value.trim();

        if (newPassword !== confirmPassword) {
            errEl.textContent = "Mật khẩu xác nhận không khớp với mật khẩu mới.";
            errEl.classList.remove("hidden");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Đang cập nhật...";

        try {
            const updatedSession = await HLSService.changeAdminPassword({
                currentPassword,
                newPassword,
                newEmail
            });
            currentSessionInfo = updatedSession;
            if (activeAdminEmailEl && updatedSession && updatedSession.email) {
                activeAdminEmailEl.textContent = updatedSession.email;
            }
            closeSecurityModal();
            showToast("Đã cập nhật thông tin bảo mật & mật khẩu quản trị thành công.");
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove("hidden");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Cập nhật mật khẩu";
        }
    });

    // Gia hạn phiên khi quản trị viên đang thao tác & tự động khóa nếu treo máy quá 30 phút
    ["pointerdown", "keydown"].forEach((evtType) => {
        document.addEventListener(evtType, () => {
            if (!dashboardView.classList.contains("hidden") && HLSService.touchAdminSession) {
                HLSService.touchAdminSession();
            }
        }, { passive: true });
    });

    setInterval(async () => {
        if (dashboardView.classList.contains("hidden")) return;
        const activeSession = await HLSService.getAdminSession();
        if (!activeSession) {
            await checkAuthAndRender();
            const errEl = document.getElementById("login-error");
            if (errEl) {
                errEl.textContent = "Phiên quản trị đã tự động khóa sau 30 phút không thao tác để đảm bảo an toàn.";
                errEl.classList.remove("hidden");
            }
        }
    }, 30000);

    // =========================================================================
    // PHẦN 01: QUẢN LÝ THÀNH VIÊN PHÒNG TRUYỀN THỐNG
    // =========================================================================
    function refreshGenFilterOptions() {
        const filterGen = document.getElementById("admin-filter-gen");
        const prev = filterGen.value;
        const gens = Array.from(new Set(membersCache.map((m) => Number(m.gen)))).sort((a, b) => b - a);
        filterGen.innerHTML = `<option value="all">Tất cả các Gen (${gens.length} Gen)</option>` +
            gens.map((g) => `<option value="${g}">Gen ${g}</option>`).join("");
        if (gens.map(String).includes(prev)) {
            filterGen.value = prev;
        }
    }

    function renderAdminList() {
        const listEl = document.getElementById("admin-members-list");
        const genVal = document.getElementById("admin-filter-gen").value;
        const tierVal = document.getElementById("admin-filter-tier").value;
        const q = document.getElementById("admin-search").value.trim().toLowerCase();

        const filtered = HLSService.sortMembersHierarchy(membersCache).filter((m) => {
            if (genVal !== "all" && String(m.gen) !== String(genVal)) return false;
            if (tierVal !== "all" && String(m.tier) !== String(tierVal)) return false;
            if (q) {
                const text = `${m.name || ""} ${m.role || ""} ${m.department || ""}`.toLowerCase();
                if (!text.includes(q)) return false;
            }
            return true;
        });

        if (!filtered.length) {
            listEl.innerHTML = `<div class="p-10 text-center text-sm text-zinc-400">Chưa có hồ sơ thành viên nào khớp với bộ lọc hiện tại.</div>`;
            return;
        }

        listEl.innerHTML = filtered.map((m) => {
            const tierMeta = HLSService.getTierMeta(m.tier);
            const badgeColor = Number(m.tier) === 1 || Number(m.tier) === 2
                ? "bg-red-500/15 text-red-300 border-red-500/35"
                : Number(m.tier) === 3
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-zinc-900 text-zinc-400 border-white/10";

            return `
                <div class="p-4 hover:bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                    <div class="flex items-center gap-4 min-w-0">
                        <img src="${escapeHtml(m.avatar_url)}"
                             alt="${escapeHtml(m.name)}"
                             onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || "HLS")}&background=111116&color=ffffff&size=128&bold=true';"
                             class="w-12 h-14 rounded object-cover object-top border border-white/15 bg-zinc-900 flex-shrink-0">

                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <span class="px-2 py-0.5 rounded bg-black/50 border border-white/15 text-[11px] font-semibold text-zinc-200">
                                    Gen ${escapeHtml(m.gen)}
                                </span>
                                <span class="px-2 py-0.5 rounded border text-[11px] font-semibold ${badgeColor}">
                                    0${escapeHtml(m.tier)} · ${escapeHtml(tierMeta.name)}
                                </span>
                                <span class="text-[11px] text-zinc-500 tabular-nums">
                                    Thứ tự #${escapeHtml(m.sort_order)}
                                </span>
                            </div>

                            <h3 class="text-sm font-bold text-white truncate">${escapeHtml(m.name)}</h3>
                            <p class="text-xs text-zinc-400 truncate">
                                <span class="text-red-400 font-medium">${escapeHtml(m.role)}</span>${m.department ? " · " + escapeHtml(m.department) : ""}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <a href="confession.html?id=${encodeURIComponent(m.id)}" target="_blank"
                           class="hls-btn-obsidian px-3 py-1.5 rounded-md text-xs font-medium">
                            Xem lưu bút
                        </a>
                        <button type="button" data-edit="${escapeHtml(m.id)}"
                            class="hls-btn-obsidian px-3 py-1.5 rounded-md text-xs font-semibold">
                            Chỉnh sửa
                        </button>
                        <button type="button" data-delete="${escapeHtml(m.id)}"
                            class="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-red-500/15 text-xs font-semibold text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-colors">
                            Xóa
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        listEl.querySelectorAll("[data-edit]").forEach((btn) => {
            btn.addEventListener("click", () => openMemberModal(btn.getAttribute("data-edit")));
        });
        listEl.querySelectorAll("[data-delete]").forEach((btn) => {
            btn.addEventListener("click", () => handleDeleteMember(btn.getAttribute("data-delete")));
        });
    }

    async function loadMembersToAdmin() {
        membersCache = await HLSService.getMembers();
        refreshGenFilterOptions();
        renderAdminList();
        refreshDashboardKPIs();
    }

    function openMemberModal(memberId = null) {
        selectedAvatarFile = null;
        avatarFileInput.value = "";

        if (memberId) {
            const m = membersCache.find((item) => String(item.id) === String(memberId));
            if (!m) return;
            document.getElementById("modal-title").textContent = `Chỉnh sửa hồ sơ: ${m.name}`;
            document.getElementById("field-id").value = m.id;
            document.getElementById("field-name").value = m.name || "";
            document.getElementById("field-cohort").value = m.cohort || "";
            document.getElementById("field-gen").value = m.gen || 1;
            document.getElementById("field-term").value = m.term || "";
            document.getElementById("field-tier").value = m.tier || 4;
            document.getElementById("field-sort-order").value = m.sort_order || 1;
            document.getElementById("field-role").value = m.role || "";
            document.getElementById("field-department").value = m.department || "";
            document.getElementById("field-avatar-url").value = m.avatar_url && !m.avatar_url.startsWith("data:") ? m.avatar_url : "";
            document.getElementById("field-quote").value = m.quote || "";
            document.getElementById("field-confession-title").value = m.confession_title || "";
            document.getElementById("field-confession").value = m.confession || "";
            avatarPreview.src = m.avatar_url || "https://ui-avatars.com/api/?name=HLS&background=111116&color=ffffff&size=256&bold=true";
        } else {
            const maxGen = membersCache.reduce((acc, m) => Math.max(acc, Number(m.gen) || 1), 4);
            document.getElementById("modal-title").textContent = "Thêm hồ sơ thành viên mới";
            memberForm.reset();
            document.getElementById("field-id").value = "";
            document.getElementById("field-gen").value = maxGen;
            document.getElementById("field-tier").value = "4";
            document.getElementById("field-sort-order").value = "1";
            avatarPreview.src = "https://ui-avatars.com/api/?name=HLS&background=111116&color=ffffff&size=256&bold=true";
        }

        memberModal.classList.remove("hidden");
    }

    function closeMemberModal() {
        memberModal.classList.add("hidden");
    }

    avatarFileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        selectedAvatarFile = file;
        avatarPreview.src = URL.createObjectURL(file);
    });

    avatarUrlInput.addEventListener("input", (e) => {
        if (!selectedAvatarFile && e.target.value.trim()) {
            avatarPreview.src = e.target.value.trim();
        }
    });

    function openNewGenExecutiveModal() {
        switchAdminTab("members");
        const nextGen = membersCache.reduce((acc, m) => Math.max(acc, Number(m.gen) || 1), 4) + 1;
        const yr = new Date().getFullYear();
        openMemberModal(null);
        document.getElementById("modal-title").textContent = `Khởi tạo Thế hệ mới: Gen ${nextGen} (Ban Chủ nhiệm)`;
        document.getElementById("field-gen").value = nextGen;
        document.getElementById("field-term").value = `${yr} - ${yr + 1}`;
        document.getElementById("field-tier").value = "2";
        document.getElementById("field-sort-order").value = "1";
        document.getElementById("field-role").value = "Chủ nhiệm CLB";
        document.getElementById("field-department").value = "Ban Chủ nhiệm";
        setTimeout(() => document.getElementById("field-name").focus(), 50);
    }

    document.getElementById("add-member-btn").addEventListener("click", () => openMemberModal(null));
    document.getElementById("init-new-gen-btn").addEventListener("click", openNewGenExecutiveModal);
    document.getElementById("handover-new-gen-btn").addEventListener("click", openNewGenExecutiveModal);
    document.getElementById("close-modal-btn").addEventListener("click", closeMemberModal);
    document.getElementById("cancel-modal-btn").addEventListener("click", closeMemberModal);

    memberForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById("save-member-btn");
        saveBtn.disabled = true;
        saveBtn.textContent = "Đang lưu...";

        try {
            const existingId = document.getElementById("field-id").value;
            const existingRecord = existingId ? membersCache.find((m) => String(m.id) === String(existingId)) : null;
            const urlInputVal = document.getElementById("field-avatar-url").value.trim();
            const fallbackAvatar = existingRecord ? existingRecord.avatar_url : "";

            const payload = {
                id: existingId || undefined,
                name: document.getElementById("field-name").value,
                cohort: document.getElementById("field-cohort").value,
                gen: Number(document.getElementById("field-gen").value),
                term: document.getElementById("field-term").value,
                tier: Number(document.getElementById("field-tier").value),
                sort_order: Number(document.getElementById("field-sort-order").value),
                role: document.getElementById("field-role").value,
                department: document.getElementById("field-department").value,
                avatar_url: urlInputVal || fallbackAvatar,
                quote: document.getElementById("field-quote").value,
                confession_title: document.getElementById("field-confession-title").value,
                confession: document.getElementById("field-confession").value
            };

            await HLSService.saveMember(payload, selectedAvatarFile);
            closeMemberModal();
            await loadMembersToAdmin();
            showToast("Đã cập nhật hồ sơ thành viên thành công.");
        } catch (err) {
            showToast(err.message, true);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = "Lưu hồ sơ";
        }
    });

    async function handleDeleteMember(id) {
        const target = membersCache.find((m) => String(m.id) === String(id));
        if (!target) return;
        if (!confirm(`Xác nhận xóa hồ sơ "${target.name}" (Gen ${target.gen}) khỏi Phòng truyền thống?`)) return;
        try {
            await HLSService.deleteMember(id);
            await loadMembersToAdmin();
            showToast(`Đã xóa hồ sơ "${target.name}".`);
        } catch (err) {
            showToast(err.message, true);
        }
    }

    document.getElementById("export-json-btn").addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(membersCache, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hls-thanh-vien-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById("import-json-input").addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            const count = await HLSService.importMembersJson(parsed);
            await loadMembersToAdmin();
            showToast(`Đã nhập thành công ${count} hồ sơ thành viên.`);
        } catch (err) {
            showToast("Lỗi nhập dữ liệu JSON: " + err.message, true);
        } finally {
            e.target.value = "";
        }
    });

    document.getElementById("admin-filter-gen").addEventListener("change", renderAdminList);
    document.getElementById("admin-filter-tier").addEventListener("change", renderAdminList);
    document.getElementById("admin-search").addEventListener("input", renderAdminList);

    // =========================================================================
    // PHẦN 02: QUẢN LÝ HOẠT ĐỘNG & SỰ KIỆN
    // =========================================================================
    function refreshEventSubtypeFilter() {
        const sel = document.getElementById("event-filter-subtype");
        const prev = sel.value;
        const subs = Array.from(new Set(eventsCache.map((e) => e.sub_type).filter(Boolean)));
        sel.innerHTML = `<option value="all">Tất cả chuyên đề</option>` +
            subs.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
        if (subs.includes(prev)) sel.value = prev;
    }

    function renderAdminEventsList() {
        const listEl = document.getElementById("admin-events-list");
        const catVal = document.getElementById("event-filter-category").value;
        const subVal = document.getElementById("event-filter-subtype").value;
        const q = document.getElementById("event-search").value.trim().toLowerCase();

        const filtered = eventsCache.filter((evt) => {
            if (catVal !== "all" && evt.category !== catVal) return false;
            if (subVal !== "all" && evt.sub_type !== subVal) return false;
            if (q) {
                const text = `${evt.title} ${evt.sub_type} ${evt.location} ${evt.annual_cycle}`.toLowerCase();
                if (!text.includes(q)) return false;
            }
            return true;
        });

        if (!filtered.length) {
            listEl.innerHTML = `<div class="p-10 text-center text-sm text-zinc-400">Không có sự kiện nào khớp với bộ lọc hiện tại.</div>`;
            return;
        }

        listEl.innerHTML = filtered.map((evt) => {
            const isCore = evt.category === "core";
            const catBadge = isCore
                ? `<span class="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/35 text-[11px] font-semibold text-red-300">Core hằng năm</span>`
                : `<span class="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[11px] font-semibold text-zinc-300">Hoạt động ngoài lề</span>`;

            const homeBadge = evt.is_featured
                ? `<button type="button" data-toggle-featured="${escapeHtml(evt.id)}" title="Đang hiển thị ở Trang chủ — nhấn để gỡ" class="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold transition-colors">Trang chủ &#10003;</button>`
                : `<button type="button" data-toggle-featured="${escapeHtml(evt.id)}" title="Nhấn để ghim lên Trang chủ" class="px-2 py-0.5 rounded bg-black/40 hover:border-red-500/50 border border-dashed border-white/20 text-zinc-400 hover:text-white text-[10px] font-semibold transition-colors">+ Ghim trang chủ</button>`;

            const actCount = (evt.activities || []).length;
            const galCount = (evt.gallery || []).length;
            const edCount = (evt.editions || []).length;

            return `
                <div class="p-4 hover:bg-white/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                    <div class="flex items-center gap-4 min-w-0">
                        <img src="${escapeHtml(evt.cover_url)}"
                             alt="${escapeHtml(evt.title)}"
                             class="w-20 h-14 rounded object-cover border border-white/15 bg-zinc-900 flex-shrink-0">

                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                ${catBadge}
                                ${homeBadge}
                                <span class="text-[11px] text-zinc-400">${escapeHtml(evt.sub_type)}</span>
                                <span class="text-[11px] text-zinc-500 tabular-nums">· Thứ tự #${escapeHtml(evt.sort_order)}</span>
                            </div>
                            <h3 class="text-sm font-bold text-white truncate">${escapeHtml(evt.title)}</h3>
                            <p class="text-xs text-zinc-400 truncate mt-0.5">
                                <span class="text-red-400 font-medium">${escapeHtml(evt.annual_cycle || evt.date_label || ("Năm " + evt.year))}</span>
                                · ${actCount} hạng mục · ${galCount} ảnh${edCount ? " · " + edCount + " mùa" : ""}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        <a href="su-kien.html?id=${encodeURIComponent(evt.id)}" target="_blank"
                           class="hls-btn-obsidian px-3 py-1.5 rounded-md text-xs font-medium">
                            Xem trang
                        </a>
                        <button type="button" data-edit-event="${escapeHtml(evt.id)}"
                            class="hls-btn-obsidian px-3 py-1.5 rounded-md text-xs font-semibold">
                            Chỉnh sửa
                        </button>
                        <button type="button" data-delete-event="${escapeHtml(evt.id)}"
                            class="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-red-500/15 text-xs font-semibold text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-colors">
                            Xóa
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        listEl.querySelectorAll("[data-toggle-featured]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-toggle-featured");
                const targetEvt = eventsCache.find((item) => String(item.id) === String(id));
                if (!targetEvt) return;
                btn.disabled = true;
                try {
                    const nextFeatured = !Boolean(targetEvt.is_featured);
                    await HLSEventsService.saveEvent({ ...targetEvt, is_featured: nextFeatured }, null);
                    await loadEventsToAdmin();
                    showToast(nextFeatured
                        ? `Đã ghim "${targetEvt.title}" lên Trang chủ.`
                        : `Đã gỡ "${targetEvt.title}" khỏi Trang chủ.`);
                } catch (err) {
                    showToast(err.message, true);
                }
            });
        });
        listEl.querySelectorAll("[data-edit-event]").forEach((btn) => {
            btn.addEventListener("click", () => openEventModal(btn.getAttribute("data-edit-event")));
        });
        listEl.querySelectorAll("[data-delete-event]").forEach((btn) => {
            btn.addEventListener("click", () => handleDeleteEvent(btn.getAttribute("data-delete-event")));
        });
    }

    async function loadEventsToAdmin() {
        eventsCache = await HLSEventsService.getEvents();
        refreshEventSubtypeFilter();
        renderAdminEventsList();
        refreshDashboardKPIs();
    }

    function renderDraftActivities() {
        const container = document.getElementById("evt-activities-rows");
        if (!draftActivities.length) {
            container.innerHTML = `<p class="text-xs text-zinc-500 italic py-2">Chưa có hạng mục hoạt động chi tiết. Nhấn "+ Thêm hạng mục hoạt động" để bổ sung.</p>`;
            return;
        }
        container.innerHTML = draftActivities.map((act, idx) => `
            <div class="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-[11px] font-bold text-red-400 uppercase tracking-wider">Hạng mục 0${idx + 1}</span>
                    <div class="flex items-center gap-1.5">
                        ${idx > 0 ? `<button type="button" data-move-act-up="${idx}" title="Đưa lên" class="hls-btn-obsidian px-2 py-0.5 rounded text-[11px] font-semibold">&uarr;</button>` : ""}
                        ${idx < draftActivities.length - 1 ? `<button type="button" data-move-act-down="${idx}" title="Đưa xuống" class="hls-btn-obsidian px-2 py-0.5 rounded text-[11px] font-semibold">&darr;</button>` : ""}
                        <button type="button" data-rm-act="${idx}" class="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 hover:border-red-500/40 text-[11px] font-semibold text-zinc-400 hover:text-red-400">Xóa mục</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input type="text" data-act-field="stage" data-idx="${idx}" value="${escapeHtml(act.stage || "")}"
                           placeholder="Thời điểm (VD: Chặng 01 · Tháng 8)" class="adm-input !text-xs">
                    <input type="text" data-act-field="title" data-idx="${idx}" value="${escapeHtml(act.title || "")}"
                           placeholder="Tên hoạt động (VD: Đêm Chung kết)" class="sm:col-span-2 adm-input !text-xs font-semibold">
                </div>
                <textarea rows="2" data-act-field="description" data-idx="${idx}"
                          placeholder="Mô tả nội dung hoạt động..." class="adm-input !text-xs">${escapeHtml(act.description || "")}</textarea>
            </div>
        `).join("");

        container.querySelectorAll("[data-act-field]").forEach((inp) => {
            inp.addEventListener("input", (e) => {
                const i = Number(e.target.getAttribute("data-idx"));
                const field = e.target.getAttribute("data-act-field");
                draftActivities[i][field] = e.target.value;
            });
        });
        container.querySelectorAll("[data-move-act-up]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const i = Number(btn.getAttribute("data-move-act-up"));
                if (i > 0) {
                    [draftActivities[i - 1], draftActivities[i]] = [draftActivities[i], draftActivities[i - 1]];
                    renderDraftActivities();
                }
            });
        });
        container.querySelectorAll("[data-move-act-down]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const i = Number(btn.getAttribute("data-move-act-down"));
                if (i < draftActivities.length - 1) {
                    [draftActivities[i + 1], draftActivities[i]] = [draftActivities[i], draftActivities[i + 1]];
                    renderDraftActivities();
                }
            });
        });
        container.querySelectorAll("[data-rm-act]").forEach((btn) => {
            btn.addEventListener("click", () => {
                draftActivities.splice(Number(btn.getAttribute("data-rm-act")), 1);
                renderDraftActivities();
            });
        });
    }

    function renderDraftEditions() {
        const container = document.getElementById("evt-editions-rows");
        if (!draftEditions.length) {
            container.innerHTML = `<p class="text-xs text-zinc-500 italic py-2">Chưa có lịch sử mùa giải. Phù hợp để ghi dấu ấn từng năm cho Sự kiện Core.</p>`;
            return;
        }
        container.innerHTML = draftEditions.map((ed, idx) => `
            <div class="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-2">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Mùa tổ chức #${idx + 1}</span>
                    <button type="button" data-rm-ed="${idx}" class="text-xs text-zinc-400 hover:text-red-400 font-semibold">Xóa mùa</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <input type="text" data-ed-field="year" data-idx="${idx}" value="${escapeHtml(ed.year || "")}"
                           placeholder="Năm (VD: 2026)" class="adm-input !text-xs font-bold text-red-400">
                    <input type="text" data-ed-field="theme" data-idx="${idx}" value="${escapeHtml(ed.theme || "")}"
                           placeholder="Chủ đề mùa giải (VD: Green Supply Chain)" class="sm:col-span-3 adm-input !text-xs font-semibold">
                </div>
                <input type="text" data-ed-field="summary" data-idx="${idx}" value="${escapeHtml(ed.summary || "")}"
                       placeholder="Kết quả / Quy mô đạt được trong năm đó..." class="adm-input !text-xs">
            </div>
        `).join("");

        container.querySelectorAll("[data-ed-field]").forEach((inp) => {
            inp.addEventListener("input", (e) => {
                const i = Number(e.target.getAttribute("data-idx"));
                const field = e.target.getAttribute("data-ed-field");
                draftEditions[i][field] = e.target.value;
            });
        });
        container.querySelectorAll("[data-rm-ed]").forEach((btn) => {
            btn.addEventListener("click", () => {
                draftEditions.splice(Number(btn.getAttribute("data-rm-ed")), 1);
                renderDraftEditions();
            });
        });
    }

    function renderDraftGallery() {
        const container = document.getElementById("evt-gallery-grid");
        if (!draftGallery.length) {
            container.innerHTML = `<p class="sm:col-span-2 text-xs text-zinc-500 italic py-2">Chưa có ảnh trong album sự kiện.</p>`;
            return;
        }
        container.innerHTML = draftGallery.map((photo, idx) => `
            <div class="p-2.5 rounded-lg bg-black/40 border border-white/10 flex items-start gap-3">
                <img src="${escapeHtml(photo.url)}" alt="Ảnh album" class="w-20 h-16 rounded object-cover bg-zinc-900 border border-white/15 flex-shrink-0">
                <div class="flex-1 min-w-0 space-y-1.5">
                    <input type="text" data-gal-caption="${idx}" value="${escapeHtml(photo.caption || "")}"
                           placeholder="Nhập chú thích cho bức ảnh..." class="adm-input !text-xs !py-1">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] text-zinc-500">Ảnh #${idx + 1}</span>
                        <button type="button" data-rm-gal="${idx}" class="text-[11px] font-semibold text-zinc-400 hover:text-red-400">Gỡ ảnh</button>
                    </div>
                </div>
            </div>
        `).join("");

        container.querySelectorAll("[data-gal-caption]").forEach((inp) => {
            inp.addEventListener("input", (e) => {
                draftGallery[Number(e.target.getAttribute("data-gal-caption"))].caption = e.target.value;
            });
        });
        container.querySelectorAll("[data-rm-gal]").forEach((btn) => {
            btn.addEventListener("click", () => {
                draftGallery.splice(Number(btn.getAttribute("data-rm-gal")), 1);
                renderDraftGallery();
            });
        });
    }

    function openEventModal(eventId = null) {
        selectedEvtCoverFile = null;
        evtCoverFileInput.value = "";
        document.getElementById("gallery-upload-status").classList.add("hidden");
        document.getElementById("gallery-url-inline-row").classList.add("hidden");
        document.getElementById("gallery-url-inline-input").value = "";

        if (eventId) {
            const evt = eventsCache.find((item) => String(item.id) === String(eventId));
            if (!evt) return;
            document.getElementById("event-modal-title").textContent = `Chỉnh sửa sự kiện: ${evt.title}`;
            document.getElementById("evt-id").value = evt.id;
            document.getElementById("evt-category").value = evt.category || "core";
            document.getElementById("evt-subtype").value = evt.sub_type || "";
            document.getElementById("evt-title").value = evt.title || "";
            document.getElementById("evt-cycle").value = evt.annual_cycle || "";
            document.getElementById("evt-date-label").value = evt.date_label || "";
            document.getElementById("evt-year").value = evt.year || 2026;
            document.getElementById("evt-location").value = evt.location || "";
            document.getElementById("evt-scale").value = evt.scale || "";
            document.getElementById("evt-sort-order").value = evt.sort_order || 1;
            document.getElementById("evt-featured").checked = Boolean(evt.is_featured);
            document.getElementById("evt-cover-url").value = evt.cover_url && !evt.cover_url.startsWith("data:") ? evt.cover_url : "";
            document.getElementById("evt-summary").value = evt.summary || "";
            document.getElementById("evt-quote").value = evt.highlight_quote || "";
            document.getElementById("evt-content").value = evt.content || "";
            evtCoverPreview.src = evt.cover_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop";

            draftActivities = (evt.activities || []).map((a) => ({ ...a }));
            draftEditions = (evt.editions || []).map((ed) => ({ ...ed }));
            draftGallery = (evt.gallery || []).map((g) => ({ ...g }));
        } else {
            document.getElementById("event-modal-title").textContent = "Thêm sự kiện / hoạt động mới";
            eventForm.reset();
            document.getElementById("evt-id").value = "";
            document.getElementById("evt-category").value = "core";
            document.getElementById("evt-year").value = new Date().getFullYear();
            document.getElementById("evt-sort-order").value = "1";
            document.getElementById("evt-featured").checked = true;
            evtCoverPreview.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop";

            draftActivities = [{ stage: "Giai đoạn 01", title: "", description: "" }];
            draftEditions = [];
            draftGallery = [];
        }

        renderDraftActivities();
        renderDraftEditions();
        renderDraftGallery();
        eventModal.classList.remove("hidden");
    }

    function closeEventModal() {
        eventModal.classList.add("hidden");
    }

    document.getElementById("add-event-btn").addEventListener("click", () => openEventModal(null));
    document.getElementById("close-event-modal-btn").addEventListener("click", closeEventModal);
    document.getElementById("cancel-event-modal-btn").addEventListener("click", closeEventModal);

    evtCoverFileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        selectedEvtCoverFile = file;
        evtCoverPreview.src = URL.createObjectURL(file);
    });

    evtCoverUrlInput.addEventListener("input", (e) => {
        if (!selectedEvtCoverFile && e.target.value.trim()) {
            evtCoverPreview.src = e.target.value.trim();
        }
    });

    document.getElementById("add-activity-stage-btn").addEventListener("click", () => {
        draftActivities.push({ stage: "", title: "", description: "" });
        renderDraftActivities();
    });

    document.getElementById("add-edition-row-btn").addEventListener("click", () => {
        draftEditions.unshift({ year: String(new Date().getFullYear()), theme: "", summary: "" });
        renderDraftEditions();
    });

    document.getElementById("evt-gallery-files").addEventListener("change", async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const statusEl = document.getElementById("gallery-upload-status");
        statusEl.textContent = `Đang xử lý và nén ${files.length} hình ảnh...`;
        statusEl.classList.remove("hidden");

        try {
            for (const file of files) {
                const uploadedUrl = await HLSEventsService.uploadEventPhoto(file);
                draftGallery.push({ url: uploadedUrl, caption: "" });
            }
            renderDraftGallery();
            statusEl.classList.add("hidden");
        } catch (err) {
            statusEl.textContent = "Lỗi tải ảnh album: " + err.message;
        } finally {
            e.target.value = "";
        }
    });

    const galleryUrlInlineRow = document.getElementById("gallery-url-inline-row");
    const galleryUrlInlineInput = document.getElementById("gallery-url-inline-input");

    function confirmInlineGalleryUrl() {
        const url = galleryUrlInlineInput.value.trim();
        if (!url) return;
        draftGallery.push({ url, caption: "" });
        galleryUrlInlineInput.value = "";
        galleryUrlInlineRow.classList.add("hidden");
        renderDraftGallery();
    }

    document.getElementById("add-gallery-url-btn").addEventListener("click", () => {
        const willOpen = galleryUrlInlineRow.classList.contains("hidden");
        galleryUrlInlineRow.classList.toggle("hidden", !willOpen);
        if (willOpen) galleryUrlInlineInput.focus();
    });
    document.getElementById("gallery-url-confirm-btn").addEventListener("click", confirmInlineGalleryUrl);
    galleryUrlInlineInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            confirmInlineGalleryUrl();
        }
    });

    eventForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById("save-event-btn");
        saveBtn.disabled = true;
        saveBtn.textContent = "Đang lưu...";

        try {
            const existingId = document.getElementById("evt-id").value;
            const existingEvt = existingId ? eventsCache.find((item) => String(item.id) === String(existingId)) : null;
            const coverUrlInput = document.getElementById("evt-cover-url").value.trim();

            const payload = {
                id: existingId || undefined,
                category: document.getElementById("evt-category").value,
                sub_type: document.getElementById("evt-subtype").value,
                title: document.getElementById("evt-title").value,
                annual_cycle: document.getElementById("evt-cycle").value,
                date_label: document.getElementById("evt-date-label").value,
                year: Number(document.getElementById("evt-year").value),
                location: document.getElementById("evt-location").value,
                scale: document.getElementById("evt-scale").value,
                sort_order: Number(document.getElementById("evt-sort-order").value),
                is_featured: document.getElementById("evt-featured").checked,
                cover_url: coverUrlInput || (existingEvt ? existingEvt.cover_url : ""),
                summary: document.getElementById("evt-summary").value,
                highlight_quote: document.getElementById("evt-quote").value,
                content: document.getElementById("evt-content").value,
                activities: draftActivities.filter((a) => (a.title || "").trim() || (a.description || "").trim()),
                editions: draftEditions.filter((ed) => (ed.year || "").trim() || (ed.theme || "").trim()),
                gallery: draftGallery.filter((g) => (g.url || "").trim())
            };

            await HLSEventsService.saveEvent(payload, selectedEvtCoverFile);
            closeEventModal();
            await loadEventsToAdmin();
            showToast("Đã lưu thông tin sự kiện và album ảnh thành công.");
        } catch (err) {
            showToast(err.message, true);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = "Lưu sự kiện";
        }
    });

    async function handleDeleteEvent(id) {
        const target = eventsCache.find((e) => String(e.id) === String(id));
        if (!target) return;
        if (!confirm(`Xác nhận xóa sự kiện "${target.title}"?`)) return;
        try {
            await HLSEventsService.deleteEvent(id);
            await loadEventsToAdmin();
            showToast(`Đã xóa sự kiện "${target.title}".`);
        } catch (err) {
            showToast(err.message, true);
        }
    }

    document.getElementById("export-events-json-btn").addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(eventsCache, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hls-su-kien-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById("import-events-json-input").addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            const count = await HLSEventsService.importEventsJson(parsed);
            await loadEventsToAdmin();
            showToast(`Đã nhập thành công ${count} sự kiện.`);
        } catch (err) {
            showToast("Lỗi nhập JSON sự kiện: " + err.message, true);
        } finally {
            e.target.value = "";
        }
    });

    document.getElementById("event-filter-category").addEventListener("change", renderAdminEventsList);
    document.getElementById("event-filter-subtype").addEventListener("change", renderAdminEventsList);
    document.getElementById("event-search").addEventListener("input", renderAdminEventsList);

    // =========================================================================
    // PHẦN 03: QUẢN LÝ TIN TỨC & BẢN TIN LOGISTICS (TAB 03)
    // =========================================================================
    function ensureNewsPartnersArrays() {
        if (!siteContentDraft.news || typeof siteContentDraft.news !== "object") {
            siteContentDraft.news = { title: "", intro: "", items: [] };
        }
        if (!Array.isArray(siteContentDraft.news.items)) {
            siteContentDraft.news.items = [];
        }
        if (!siteContentDraft.partners || typeof siteContentDraft.partners !== "object") {
            siteContentDraft.partners = { title: "", intro: "", items: [] };
        }
        if (!Array.isArray(siteContentDraft.partners.items)) {
            siteContentDraft.partners.items = [];
        }
    }

    function refreshNewsCatFilter() {
        ensureNewsPartnersArrays();
        const sel = document.getElementById("news-admin-filter-cat");
        const prev = sel.value;
        const cats = Array.from(new Set(siteContentDraft.news.items.map((n) => (n.category || "").trim()).filter(Boolean)));
        sel.innerHTML = `<option value="all">Tất cả chuyên mục (${siteContentDraft.news.items.length} bài)</option>` +
            cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
        if (cats.includes(prev)) sel.value = prev;
    }

    function renderAdminNewsList() {
        ensureNewsPartnersArrays();
        document.getElementById("news-sec-title").value = siteContentDraft.news.title || "";
        document.getElementById("news-sec-intro").value = siteContentDraft.news.intro || "";
        refreshNewsCatFilter();

        const listEl = document.getElementById("admin-news-list");
        const catVal = document.getElementById("news-admin-filter-cat").value;
        const q = document.getElementById("news-admin-search").value.trim().toLowerCase();
        const allItems = siteContentDraft.news.items;

        const indexed = allItems.map((item, idx) => ({ item, idx })).filter(({ item }) => {
            if (catVal !== "all" && (item.category || "").trim() !== catVal) return false;
            if (q) {
                const hay = `${item.title || ""} ${item.summary || ""} ${item.category || ""} ${item.author || ""}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        if (!indexed.length) {
            listEl.innerHTML = `<div class="p-10 text-center text-sm text-zinc-400">Chưa có bài viết tin tức nào khớp với bộ lọc hiện tại.</div>`;
            return;
        }

        listEl.innerHTML = indexed.map(({ item, idx }) => {
            const homeBtn = item.is_featured
                ? `<button type="button" data-news-toggle-feat="${escapeHtml(item.id)}" title="Đang ghim trên Trang chủ — nhấn để gỡ" class="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold transition-colors">Trang chủ &#10003;</button>`
                : `<button type="button" data-news-toggle-feat="${escapeHtml(item.id)}" title="Nhấn để ghim lên Trang chủ" class="px-2 py-0.5 rounded bg-black/40 hover:border-red-500/50 border border-dashed border-white/20 text-zinc-400 hover:text-white text-[10px] font-semibold transition-colors">+ Ghim trang chủ</button>`;

            return `
                <div class="p-4 hover:bg-white/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                    <div class="flex items-center gap-4 min-w-0">
                        ${item.cover_url
                            ? `<img src="${escapeHtml(item.cover_url)}" alt="${escapeHtml(item.title)}" class="w-20 h-14 rounded object-cover border border-white/15 bg-zinc-900 flex-shrink-0">`
                            : `<div class="w-20 h-14 rounded border border-white/15 bg-zinc-900 flex items-center justify-center text-[11px] font-bold text-red-400 flex-shrink-0">HLS NEWS</div>`
                        }
                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <span class="px-2 py-0.5 rounded bg-red-500/15 border border-red-500/35 text-[11px] font-semibold text-red-300">
                                    ${escapeHtml(item.category || "Tin CLB")}
                                </span>
                                ${homeBtn}
                                <span class="text-[11px] text-zinc-400 tabular-nums">${escapeHtml(item.published_at || "")}</span>
                                ${item.author ? `<span class="text-[11px] text-zinc-500">· ${escapeHtml(item.author)}</span>` : ""}
                            </div>
                            <h3 class="text-sm font-bold text-white truncate">${escapeHtml(item.title)}</h3>
                            <p class="text-xs text-zinc-400 truncate mt-0.5">${escapeHtml(item.summary || "")}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-1.5 self-end md:self-center flex-shrink-0">
                        ${idx > 0 ? `<button type="button" data-news-up="${idx}" title="Đưa lên trước" class="hls-btn-obsidian px-2.5 py-1.5 rounded-md text-xs font-semibold">&uarr;</button>` : ""}
                        ${idx < allItems.length - 1 ? `<button type="button" data-news-down="${idx}" title="Đưa xuống sau" class="hls-btn-obsidian px-2.5 py-1.5 rounded-md text-xs font-semibold">&darr;</button>` : ""}
                        <a href="tin-tuc.html?id=${encodeURIComponent(item.id)}" target="_blank"
                           class="hls-btn-obsidian px-3 py-1.5 rounded-md text-xs font-medium">
                            Xem bài
                        </a>
                        <button type="button" data-news-edit="${escapeHtml(item.id)}"
                            class="hls-btn-obsidian px-3 py-1.5 rounded-md text-xs font-semibold">
                            Chỉnh sửa
                        </button>
                        <button type="button" data-news-del="${escapeHtml(item.id)}"
                            class="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-red-500/15 text-xs font-semibold text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-colors">
                            Xóa
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        listEl.querySelectorAll("[data-news-toggle-feat]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-news-toggle-feat");
                const target = siteContentDraft.news.items.find((n) => String(n.id) === String(id));
                if (!target) return;
                target.is_featured = !Boolean(target.is_featured);
                try {
                    siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
                    renderAdminNewsList();
                    refreshDashboardKPIs();
                    showToast(target.is_featured ? `Đã ghim bài "${target.title}" lên Trang chủ.` : `Đã gỡ ghim Trang chủ cho bài "${target.title}".`);
                } catch (err) {
                    showToast(err.message, true);
                }
            });
        });

        listEl.querySelectorAll("[data-news-up]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const i = Number(btn.getAttribute("data-news-up"));
                const arr = siteContentDraft.news.items;
                if (i > 0) {
                    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                    siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
                    renderAdminNewsList();
                }
            });
        });

        listEl.querySelectorAll("[data-news-down]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const i = Number(btn.getAttribute("data-news-down"));
                const arr = siteContentDraft.news.items;
                if (i < arr.length - 1) {
                    [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                    siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
                    renderAdminNewsList();
                }
            });
        });

        listEl.querySelectorAll("[data-news-edit]").forEach((btn) => {
            btn.addEventListener("click", () => openNewsModal(btn.getAttribute("data-news-edit")));
        });

        listEl.querySelectorAll("[data-news-del]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-news-del");
                const target = siteContentDraft.news.items.find((n) => String(n.id) === String(id));
                if (!target) return;
                if (!confirm(`Xác nhận xóa bài tin "${target.title}"?`)) return;
                siteContentDraft.news.items = siteContentDraft.news.items.filter((n) => String(n.id) !== String(id));
                try {
                    siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
                    renderAdminNewsList();
                    refreshDashboardKPIs();
                    showToast(`Đã xóa bài viết "${target.title}".`);
                } catch (err) {
                    showToast(err.message, true);
                }
            });
        });
    }

    document.getElementById("save-news-header-btn").addEventListener("click", async () => {
        ensureNewsPartnersArrays();
        siteContentDraft.news.title = document.getElementById("news-sec-title").value.trim();
        siteContentDraft.news.intro = document.getElementById("news-sec-intro").value.trim();
        try {
            siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
            showToast("Đã lưu tiêu đề & lời giới thiệu chuyên mục Tin tức.");
        } catch (err) {
            showToast(err.message, true);
        }
    });

    document.getElementById("news-admin-filter-cat").addEventListener("change", renderAdminNewsList);
    document.getElementById("news-admin-search").addEventListener("input", renderAdminNewsList);

    const newsCoverFileInput = document.getElementById("news-cover-file");
    const newsCoverUrlInput = document.getElementById("news-cover-url");
    const newsCoverPreview = document.getElementById("news-cover-preview");

    function openNewsModal(newsId = null) {
        ensureNewsPartnersArrays();
        selectedNewsCoverFile = null;
        newsCoverFileInput.value = "";

        if (newsId) {
            const item = siteContentDraft.news.items.find((n) => String(n.id) === String(newsId));
            if (!item) return;
            document.getElementById("news-modal-title").textContent = `Chỉnh sửa bài tin: ${item.title}`;
            document.getElementById("news-id").value = item.id;
            document.getElementById("news-title").value = item.title || "";
            document.getElementById("news-category").value = item.category || "Tin hoạt động CLB";
            document.getElementById("news-date").value = item.published_at || formatTodayVN();
            document.getElementById("news-author").value = item.author || "Ban Truyền thông HLS";
            document.getElementById("news-featured").checked = Boolean(item.is_featured);
            document.getElementById("news-cover-url").value = item.cover_url && !item.cover_url.startsWith("data:") ? item.cover_url : "";
            document.getElementById("news-summary").value = item.summary || "";
            document.getElementById("news-content").value = item.content || "";
            document.getElementById("news-external-url").value = item.external_url || "";
            newsCoverPreview.src = item.cover_url || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop";
        } else {
            document.getElementById("news-modal-title").textContent = "Đăng bài tin tức mới";
            newsForm.reset();
            document.getElementById("news-id").value = "";
            document.getElementById("news-category").value = "Tin hoạt động CLB";
            document.getElementById("news-date").value = formatTodayVN();
            document.getElementById("news-author").value = "Ban Truyền thông HLS";
            document.getElementById("news-featured").checked = true;
            newsCoverPreview.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop";
        }

        newsModal.classList.remove("hidden");
    }

    function closeNewsModal() {
        newsModal.classList.add("hidden");
    }

    document.getElementById("add-news-btn").addEventListener("click", () => openNewsModal(null));
    document.getElementById("close-news-modal-btn").addEventListener("click", closeNewsModal);
    document.getElementById("cancel-news-modal-btn").addEventListener("click", closeNewsModal);

    newsCoverFileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        selectedNewsCoverFile = file;
        newsCoverPreview.src = URL.createObjectURL(file);
    });

    newsCoverUrlInput.addEventListener("input", (e) => {
        if (!selectedNewsCoverFile && e.target.value.trim()) {
            newsCoverPreview.src = e.target.value.trim();
        }
    });

    newsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        ensureNewsPartnersArrays();
        const saveBtn = document.getElementById("save-news-btn");
        saveBtn.disabled = true;
        saveBtn.textContent = "Đang xuất bản...";

        try {
            const existingId = document.getElementById("news-id").value.trim();
            const existingIdx = existingId
                ? siteContentDraft.news.items.findIndex((n) => String(n.id) === String(existingId))
                : -1;
            const prevItem = existingIdx >= 0 ? siteContentDraft.news.items[existingIdx] : null;

            let coverUrl = document.getElementById("news-cover-url").value.trim() || (prevItem ? prevItem.cover_url : "");
            if (selectedNewsCoverFile) {
                coverUrl = await HLSContentService.uploadSiteImage(selectedNewsCoverFile);
            }
            if (!coverUrl) {
                coverUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop";
            }

            const record = {
                id: existingId || `news-${Date.now()}`,
                title: document.getElementById("news-title").value.trim(),
                category: document.getElementById("news-category").value.trim() || "Tin hoạt động CLB",
                published_at: document.getElementById("news-date").value.trim() || formatTodayVN(),
                author: document.getElementById("news-author").value.trim() || "Ban Truyền thông HLS",
                is_featured: document.getElementById("news-featured").checked,
                cover_url: coverUrl,
                summary: document.getElementById("news-summary").value.trim(),
                content: document.getElementById("news-content").value.trim(),
                external_url: document.getElementById("news-external-url").value.trim()
            };

            if (existingIdx >= 0) {
                siteContentDraft.news.items[existingIdx] = record;
            } else {
                siteContentDraft.news.items.unshift(record);
            }

            siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
            closeNewsModal();
            renderAdminNewsList();
            refreshDashboardKPIs();
            showToast("Đã xuất bản và lưu bài viết tin tức thành công.");
        } catch (err) {
            showToast(err.message, true);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = "Lưu & Xuất bản tin";
        }
    });

    // =========================================================================
    // PHẦN 04: QUẢN LÝ NHÀ TÀI TRỢ & ĐỐI TÁC ĐỒNG HÀNH (TAB 04)
    // =========================================================================
    const PARTNER_GROUP_META = {
        sponsor: {
            label: "Nhà tài trợ",
            cls: "bg-red-500/15 text-red-300 border-red-500/35"
        },
        enterprise: {
            label: "Đối tác Doanh nghiệp & Học thuật",
            cls: "bg-white/10 text-zinc-200 border-white/20"
        },
        media: {
            label: "Đối tác Truyền thông",
            cls: "bg-rose-500/15 text-rose-200 border-rose-400/30"
        }
    };

    function renderAdminPartnersList() {
        ensureNewsPartnersArrays();
        document.getElementById("partners-sec-title").value = siteContentDraft.partners.title || "";
        document.getElementById("partners-sec-intro").value = siteContentDraft.partners.intro || "";

        const listEl = document.getElementById("admin-partners-list");
        const groupVal = document.getElementById("partner-admin-filter-group").value;
        const q = document.getElementById("partner-admin-search").value.trim().toLowerCase();
        const allItems = siteContentDraft.partners.items;

        const indexed = allItems.map((item, idx) => ({ item, idx })).filter(({ item }) => {
            if (groupVal !== "all" && (item.group || "sponsor") !== groupVal) return false;
            if (q) {
                const hay = `${item.name || ""} ${item.tier_label || ""} ${item.description || ""}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });

        if (!indexed.length) {
            listEl.innerHTML = `<div class="p-10 text-center text-sm text-zinc-400">Chưa có Nhà tài trợ hoặc Đối tác nào khớp với bộ lọc hiện tại.</div>`;
            return;
        }

        listEl.innerHTML = indexed.map(({ item, idx }) => {
            const gMeta = PARTNER_GROUP_META[item.group] || PARTNER_GROUP_META.sponsor;
            return `
                <div class="p-4 hover:bg-white/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
                    <div class="flex items-center gap-4 min-w-0">
                        <div class="w-16 h-16 rounded-xl bg-black/75 border border-white/15 flex items-center justify-center p-2 overflow-hidden flex-shrink-0">
                            ${item.logo_url
                                ? `<img src="${escapeHtml(item.logo_url)}" alt="${escapeHtml(item.name)}" class="max-w-full max-h-full object-contain">`
                                : `<span class="text-xs font-extrabold tracking-wider text-red-400">${escapeHtml(getMonogram(item.name))}</span>`
                            }
                        </div>

                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <span class="px-2 py-0.5 rounded border text-[11px] font-semibold ${gMeta.cls}">
                                    ${escapeHtml(gMeta.label)}
                                </span>
                                <span class="px-2 py-0.5 rounded bg-black/50 border border-white/15 text-[11px] font-semibold text-zinc-200">
                                    ${escapeHtml(item.tier_label || "Đồng hành")}
                                </span>
                            </div>
                            <h3 class="text-sm font-bold text-white truncate">${escapeHtml(item.name)}</h3>
                            <p class="text-xs text-zinc-400 truncate mt-0.5">${escapeHtml(item.description || "Đơn vị đồng hành cùng CLB HLS")}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-1.5 self-end md:self-center flex-shrink-0">
                        ${idx > 0 ? `<button type="button" data-partner-up="${idx}" title="Đưa lên trước" class="hls-btn-obsidian px-2.5 py-1.5 rounded-md text-xs font-semibold">&uarr;</button>` : ""}
                        ${idx < allItems.length - 1 ? `<button type="button" data-partner-down="${idx}" title="Đưa xuống sau" class="hls-btn-obsidian px-2.5 py-1.5 rounded-md text-xs font-semibold">&darr;</button>` : ""}
                        <button type="button" data-partner-edit="${escapeHtml(item.id)}"
                            class="hls-btn-obsidian px-3 py-1.5 rounded-md text-xs font-semibold">
                            Chỉnh sửa
                        </button>
                        <button type="button" data-partner-del="${escapeHtml(item.id)}"
                            class="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-red-500/15 text-xs font-semibold text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-colors">
                            Xóa
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        listEl.querySelectorAll("[data-partner-up]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const i = Number(btn.getAttribute("data-partner-up"));
                const arr = siteContentDraft.partners.items;
                if (i > 0) {
                    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                    siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
                    renderAdminPartnersList();
                }
            });
        });

        listEl.querySelectorAll("[data-partner-down]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const i = Number(btn.getAttribute("data-partner-down"));
                const arr = siteContentDraft.partners.items;
                if (i < arr.length - 1) {
                    [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                    siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
                    renderAdminPartnersList();
                }
            });
        });

        listEl.querySelectorAll("[data-partner-edit]").forEach((btn) => {
            btn.addEventListener("click", () => openPartnerModal(btn.getAttribute("data-partner-edit")));
        });

        listEl.querySelectorAll("[data-partner-del]").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.getAttribute("data-partner-del");
                const target = siteContentDraft.partners.items.find((p) => String(p.id) === String(id));
                if (!target) return;
                if (!confirm(`Xác nhận xóa đơn vị "${target.name}" khỏi danh sách tri ân?`)) return;
                siteContentDraft.partners.items = siteContentDraft.partners.items.filter((p) => String(p.id) !== String(id));
                try {
                    siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
                    renderAdminPartnersList();
                    refreshDashboardKPIs();
                    showToast(`Đã xóa đơn vị "${target.name}".`);
                } catch (err) {
                    showToast(err.message, true);
                }
            });
        });
    }

    document.getElementById("save-partners-header-btn").addEventListener("click", async () => {
        ensureNewsPartnersArrays();
        siteContentDraft.partners.title = document.getElementById("partners-sec-title").value.trim();
        siteContentDraft.partners.intro = document.getElementById("partners-sec-intro").value.trim();
        try {
            siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
            showToast("Đã lưu tiêu đề & lời tri ân chung của mục Đối tác.");
        } catch (err) {
            showToast(err.message, true);
        }
    });

    document.getElementById("partner-admin-filter-group").addEventListener("change", renderAdminPartnersList);
    document.getElementById("partner-admin-search").addEventListener("input", renderAdminPartnersList);

    const partnerLogoFileInput = document.getElementById("partner-logo-file");
    const partnerLogoUrlInput = document.getElementById("partner-logo-url");
    const partnerLogoPreview = document.getElementById("partner-logo-preview");
    const partnerLogoEmpty = document.getElementById("partner-logo-empty");
    const clearPartnerLogoBtn = document.getElementById("clear-partner-logo-btn");

    function setPartnerLogoPreviewState(src) {
        if (src) {
            partnerLogoPreview.src = src;
            partnerLogoPreview.classList.remove("hidden");
            partnerLogoEmpty.classList.add("hidden");
            clearPartnerLogoBtn.classList.remove("hidden");
        } else {
            partnerLogoPreview.src = "";
            partnerLogoPreview.classList.add("hidden");
            partnerLogoEmpty.classList.remove("hidden");
            clearPartnerLogoBtn.classList.add("hidden");
        }
    }

    function openPartnerModal(partnerId = null) {
        ensureNewsPartnersArrays();
        selectedPartnerLogoFile = null;
        partnerLogoCleared = false;
        partnerLogoFileInput.value = "";

        if (partnerId) {
            const p = siteContentDraft.partners.items.find((item) => String(item.id) === String(partnerId));
            if (!p) return;
            document.getElementById("partner-modal-title").textContent = `Chỉnh sửa đối tác: ${p.name}`;
            document.getElementById("partner-id").value = p.id;
            document.getElementById("partner-name").value = p.name || "";
            document.getElementById("partner-group").value = p.group || "sponsor";
            document.getElementById("partner-tier").value = p.tier_label || "";
            document.getElementById("partner-website").value = p.website_url || "";
            document.getElementById("partner-description").value = p.description || "";
            partnerLogoUrlInput.value = p.logo_url && !p.logo_url.startsWith("data:") ? p.logo_url : "";
            setPartnerLogoPreviewState(p.logo_url || "");
        } else {
            document.getElementById("partner-modal-title").textContent = "Thêm Nhà tài trợ / Đối tác đồng hành";
            partnerForm.reset();
            document.getElementById("partner-id").value = "";
            document.getElementById("partner-group").value = "sponsor";
            document.getElementById("partner-tier").value = "Nhà tài trợ Đồng hành";
            setPartnerLogoPreviewState("");
        }

        partnerModal.classList.remove("hidden");
    }

    function closePartnerModal() {
        partnerModal.classList.add("hidden");
    }

    document.getElementById("add-partner-btn").addEventListener("click", () => openPartnerModal(null));
    document.getElementById("close-partner-modal-btn").addEventListener("click", closePartnerModal);
    document.getElementById("cancel-partner-modal-btn").addEventListener("click", closePartnerModal);

    partnerLogoFileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        selectedPartnerLogoFile = file;
        partnerLogoCleared = false;
        setPartnerLogoPreviewState(URL.createObjectURL(file));
    });

    partnerLogoUrlInput.addEventListener("input", (e) => {
        if (!selectedPartnerLogoFile) {
            const v = e.target.value.trim();
            partnerLogoCleared = !v;
            setPartnerLogoPreviewState(v);
        }
    });

    clearPartnerLogoBtn.addEventListener("click", () => {
        selectedPartnerLogoFile = null;
        partnerLogoCleared = true;
        partnerLogoFileInput.value = "";
        partnerLogoUrlInput.value = "";
        setPartnerLogoPreviewState("");
    });

    partnerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        ensureNewsPartnersArrays();
        const saveBtn = document.getElementById("save-partner-btn");
        saveBtn.disabled = true;
        saveBtn.textContent = "Đang lưu...";

        try {
            const existingId = document.getElementById("partner-id").value.trim();
            const existingIdx = existingId
                ? siteContentDraft.partners.items.findIndex((p) => String(p.id) === String(existingId))
                : -1;
            const prevItem = existingIdx >= 0 ? siteContentDraft.partners.items[existingIdx] : null;

            let logoUrl = "";
            if (selectedPartnerLogoFile) {
                logoUrl = await HLSContentService.uploadSiteImage(selectedPartnerLogoFile);
            } else if (partnerLogoUrlInput.value.trim()) {
                logoUrl = partnerLogoUrlInput.value.trim();
            } else if (!partnerLogoCleared && prevItem) {
                logoUrl = prevItem.logo_url || "";
            }

            const record = {
                id: existingId || `partner-${Date.now()}`,
                name: document.getElementById("partner-name").value.trim(),
                group: document.getElementById("partner-group").value || "sponsor",
                tier_label: document.getElementById("partner-tier").value.trim() || "Đối tác đồng hành",
                logo_url: logoUrl,
                website_url: document.getElementById("partner-website").value.trim(),
                description: document.getElementById("partner-description").value.trim()
            };

            if (existingIdx >= 0) {
                siteContentDraft.partners.items[existingIdx] = record;
            } else {
                siteContentDraft.partners.items.push(record);
            }

            siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
            closePartnerModal();
            renderAdminPartnersList();
            refreshDashboardKPIs();
            showToast(`Đã lưu thông tin "${record.name}" thành công.`);
        } catch (err) {
            showToast(err.message, true);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = "Lưu đơn vị đồng hành";
        }
    });

    // =========================================================================
    // PHẦN 05: QUẢN LÝ NỘI DUNG TRANG CHỦ, VỀ CHÚNG TÔI & SĐT LIÊN HỆ (TAB 05)
    // =========================================================================
    const LIST_SCHEMAS = {
        "story.milestones": {
            title: "Các mốc phát triển qua từng năm",
            addLabel: "+ Thêm mốc phát triển",
            emptyText: "Chưa có mốc phát triển nào.",
            defaultItem: () => ({ year: String(new Date().getFullYear()), title: "", description: "" }),
            fields: [
                { key: "year", label: "Năm / Giai đoạn", placeholder: "VD: 2022", colClass: "sm:col-span-3" },
                { key: "title", label: "Tiêu đề dấu mốc", placeholder: "VD: Thành lập Câu lạc bộ", colClass: "sm:col-span-9" },
                { key: "description", label: "Mô tả chi tiết", placeholder: "Mô tả ngắn về cột mốc...", type: "textarea", rows: 2, colClass: "sm:col-span-12" }
            ]
        },
        "vision.values": {
            title: "Các giá trị cốt lõi",
            addLabel: "+ Thêm giá trị cốt lõi",
            emptyText: "Chưa có giá trị cốt lõi nào.",
            defaultItem: () => ({ title: "", description: "" }),
            fields: [
                { key: "title", label: "Tên giá trị cốt lõi", placeholder: "VD: Học thuật chuyên sâu", colClass: "sm:col-span-5" },
                { key: "description", label: "Nội dung giải thích", placeholder: "Mô tả ý nghĩa giá trị...", colClass: "sm:col-span-7" }
            ]
        },
        "organization.departments": {
            title: "Danh sách các ban chức năng",
            addLabel: "+ Thêm ban chức năng",
            emptyText: "Chưa có ban chức năng nào.",
            defaultItem: () => ({ name: "", lead: "", description: "" }),
            fields: [
                { key: "name", label: "Tên ban", placeholder: "VD: Ban Chuyên môn / Học thuật", colClass: "sm:col-span-7" },
                { key: "lead", label: "Trưởng ban (tùy chọn)", placeholder: "Để trống nếu chưa cập nhật", colClass: "sm:col-span-5" },
                { key: "description", label: "Chức năng & nhiệm vụ chính", placeholder: "Mô tả công việc chuyên trách của ban...", type: "textarea", rows: 2, colClass: "sm:col-span-12" }
            ]
        },
        "achievements.stats": {
            title: "Các con số ấn tượng",
            addLabel: "+ Thêm con số",
            emptyText: "Chưa có con số thống kê nào.",
            defaultItem: () => ({ value: "", label: "" }),
            fields: [
                { key: "value", label: "Con số nổi bật", placeholder: "VD: 120+", colClass: "sm:col-span-4" },
                { key: "label", label: "Ý nghĩa con số", placeholder: "VD: Thành viên qua 4 thế hệ", colClass: "sm:col-span-8" }
            ]
        },
        "achievements.awards": {
            title: "Giải thưởng & Ghi nhận",
            addLabel: "+ Thêm giải thưởng",
            emptyText: "Chưa có giải thưởng nào.",
            defaultItem: () => ({ year: String(new Date().getFullYear()), title: "", description: "" }),
            fields: [
                { key: "year", label: "Năm", placeholder: "VD: 2026", colClass: "sm:col-span-3" },
                { key: "title", label: "Tên giải thưởng / Ghi nhận", placeholder: "VD: CLB học thuật tiêu biểu", colClass: "sm:col-span-9" },
                { key: "description", label: "Chi tiết thành tích (tùy chọn)", placeholder: "Mô tả thêm về giải thưởng...", type: "textarea", rows: 2, colClass: "sm:col-span-12" }
            ]
        }
    };

    function getByPath(obj, path) {
        return String(path)
            .split(".")
            .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
    }

    function setByPath(obj, path, value) {
        const parts = String(path).split(".");
        let cur = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
            cur = cur[p];
        }
        cur[parts[parts.length - 1]] = value;
    }

    function markContentDirty(dirty) {
        isContentDirty = Boolean(dirty);
        syncFloatingSaveBar();
        const hint = document.getElementById("content-unsaved-hint");
        if (!hint) return;
        if (isContentDirty) {
            hint.innerHTML = `<span class="font-semibold text-red-400">Có thay đổi chưa lưu</span> — nhấn <span class="font-semibold text-white">Lưu toàn bộ nội dung</span> (hoặc Ctrl+S) để áp dụng lên trang chủ.`;
        } else {
            hint.innerHTML = `Mọi thay đổi ở trên đã đồng bộ. Nhấn <span class="font-semibold text-white">Lưu toàn bộ nội dung</span> sau khi chỉnh sửa.`;
        }
    }

    function renderSingleImageWidget(container) {
        const imgPath = container.getAttribute("data-image-path");
        const label = container.getAttribute("data-image-label") || "Hình ảnh";
        const currentUrl = getByPath(siteContentDraft, imgPath) || "";
        const isDataUri = currentUrl.startsWith("data:");
        const isLogoField = imgPath === "hero.logo_url";

        container.innerHTML = `
            <div class="p-4 rounded-lg bg-black/40 border border-white/10 space-y-3">
                <div class="flex items-center justify-between gap-2">
                    <label class="text-xs font-semibold text-zinc-200">${escapeHtml(label)}</label>
                    ${currentUrl ? `
                        <button type="button" data-clear-img class="text-[11px] font-semibold text-zinc-400 hover:text-red-400 transition-colors">
                            Xóa ảnh hiện tại
                        </button>
                    ` : ""}
                </div>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div class="${isLogoField ? "w-20 h-20 p-2" : "w-full sm:w-44 h-28"} rounded-lg overflow-hidden bg-zinc-950 border border-white/15 flex items-center justify-center flex-shrink-0">
                        ${currentUrl
                            ? `<img data-img-preview src="${escapeHtml(currentUrl)}" alt="Xem trước" class="${isLogoField ? "max-w-full max-h-full object-contain" : "w-full h-full object-cover"}">`
                            : `<span data-img-empty class="text-[11px] text-zinc-500 px-3 text-center">Chưa gắn ảnh</span>`
                        }
                    </div>
                    <div class="flex-1 w-full space-y-2.5">
                        <div>
                            <span class="block text-[11px] font-medium text-zinc-300 mb-1">Tải ảnh từ máy tính (hỗ trợ PNG trong suốt, SVG, JPG):</span>
                            <input data-img-file type="file" accept="image/*"
                                class="block w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer">
                        </div>
                        <div>
                            <span class="block text-[11px] font-medium text-zinc-400 mb-1">Hoặc dán đường dẫn URL ảnh:</span>
                            <input data-img-url type="text" placeholder="https://..."
                                value="${escapeHtml(isDataUri ? "" : currentUrl)}"
                                class="adm-input !text-xs !py-1.5">
                        </div>
                        <p data-img-status class="hidden text-[11px] font-medium text-red-400"></p>
                    </div>
                </div>
            </div>
        `;

        const fileInput = container.querySelector("[data-img-file]");
        const urlInput = container.querySelector("[data-img-url]");
        const clearBtn = container.querySelector("[data-clear-img]");
        const statusEl = container.querySelector("[data-img-status]");

        fileInput.addEventListener("change", async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            statusEl.textContent = "Đang xử lý và tải ảnh...";
            statusEl.classList.remove("hidden");
            try {
                const uploadedUrl = await HLSContentService.uploadSiteImage(file);
                setByPath(siteContentDraft, imgPath, uploadedUrl);
                markContentDirty(true);
                renderSingleImageWidget(container);
                showToast("Đã tải ảnh lên bản nháp. Nhấn 'Lưu toàn bộ nội dung' (Ctrl+S) để áp dụng.");
            } catch (err) {
                statusEl.textContent = err.message;
                showToast(err.message, true);
            }
        });

        urlInput.addEventListener("input", (e) => {
            const val = e.target.value.trim();
            setByPath(siteContentDraft, imgPath, val);
            markContentDirty(true);
            const preview = container.querySelector("[data-img-preview]");
            if (val && preview) {
                preview.src = val;
            } else {
                renderSingleImageWidget(container);
                const refocused = container.querySelector("[data-img-url]");
                if (refocused) {
                    refocused.focus();
                    refocused.setSelectionRange(refocused.value.length, refocused.value.length);
                }
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                setByPath(siteContentDraft, imgPath, "");
                markContentDirty(true);
                renderSingleImageWidget(container);
            });
        }
    }

    function renderSingleListEditor(container) {
        const listPath = container.getAttribute("data-list");
        const schema = LIST_SCHEMAS[listPath];
        if (!schema) return;

        let items = getByPath(siteContentDraft, listPath);
        if (!Array.isArray(items)) {
            items = [];
            setByPath(siteContentDraft, listPath, items);
        }

        container.innerHTML = `
            <div class="pt-3 border-t border-white/10 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">${escapeHtml(schema.title)} (${items.length})</span>
                    <button type="button" data-list-add class="hls-btn-obsidian px-3 py-1.5 rounded-md text-xs font-semibold">
                        ${escapeHtml(schema.addLabel)}
                    </button>
                </div>
                <div data-list-rows class="space-y-3">
                    ${items.length === 0
                        ? `<div class="p-4 rounded-lg bg-black/40 border border-dashed border-white/15 text-center text-xs text-zinc-500">${escapeHtml(schema.emptyText)}</div>`
                        : items.map((item, idx) => `
                            <div class="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-2.5">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="text-[11px] font-bold text-red-400 tabular-nums">Mục #${String(idx + 1).padStart(2, "0")}</span>
                                    <div class="flex items-center gap-1.5">
                                        ${idx > 0 ? `<button type="button" data-move-up="${idx}" title="Đưa lên" class="hls-btn-obsidian px-2 py-0.5 rounded text-[11px] font-semibold">&uarr;</button>` : ""}
                                        ${idx < items.length - 1 ? `<button type="button" data-move-down="${idx}" title="Đưa xuống" class="hls-btn-obsidian px-2 py-0.5 rounded text-[11px] font-semibold">&darr;</button>` : ""}
                                        <button type="button" data-remove-idx="${idx}" class="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 hover:border-red-500/40 text-[11px] font-semibold text-zinc-400 hover:text-red-400">Xóa</button>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                    ${schema.fields.map((f) => `
                                        <div class="${f.colClass || "sm:col-span-12"}">
                                            <label class="block text-[11px] font-semibold text-zinc-400 mb-1">${escapeHtml(f.label)}</label>
                                            ${f.type === "textarea"
                                                ? `<textarea data-item-idx="${idx}" data-item-key="${escapeHtml(f.key)}" rows="${f.rows || 2}" placeholder="${escapeHtml(f.placeholder || "")}" class="adm-input !text-xs">${escapeHtml(item[f.key] || "")}</textarea>`
                                                : `<input data-item-idx="${idx}" data-item-key="${escapeHtml(f.key)}" type="text" value="${escapeHtml(item[f.key] || "")}" placeholder="${escapeHtml(f.placeholder || "")}" class="adm-input !text-xs">`
                                            }
                                        </div>
                                    `).join("")}
                                </div>
                            </div>
                        `).join("")
                    }
                </div>
            </div>
        `;

        container.querySelector("[data-list-add]").addEventListener("click", () => {
            items.push(schema.defaultItem());
            markContentDirty(true);
            renderSingleListEditor(container);
        });

        container.querySelectorAll("[data-remove-idx]").forEach((btn) => {
            btn.addEventListener("click", () => {
                items.splice(Number(btn.getAttribute("data-remove-idx")), 1);
                markContentDirty(true);
                renderSingleListEditor(container);
            });
        });

        container.querySelectorAll("[data-move-up]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const i = Number(btn.getAttribute("data-move-up"));
                if (i > 0) {
                    [items[i - 1], items[i]] = [items[i], items[i - 1]];
                    markContentDirty(true);
                    renderSingleListEditor(container);
                }
            });
        });

        container.querySelectorAll("[data-move-down]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const i = Number(btn.getAttribute("data-move-down"));
                if (i < items.length - 1) {
                    [items[i + 1], items[i]] = [items[i], items[i + 1]];
                    markContentDirty(true);
                    renderSingleListEditor(container);
                }
            });
        });

        container.querySelectorAll("[data-item-idx]").forEach((inputEl) => {
            inputEl.addEventListener("input", (e) => {
                const i = Number(inputEl.getAttribute("data-item-idx"));
                const k = inputEl.getAttribute("data-item-key");
                if (items[i]) {
                    items[i][k] = e.target.value;
                    markContentDirty(true);
                }
            });
        });
    }

    function renderContentEditorForm() {
        const editor = document.getElementById("content-editor");
        if (!editor) return;

        editor.querySelectorAll("[data-path]").forEach((el) => {
            const path = el.getAttribute("data-path");
            const val = getByPath(siteContentDraft, path);
            if (el.type === "checkbox") {
                el.checked = Boolean(val);
            } else {
                el.value = val !== undefined && val !== null ? String(val) : "";
            }
        });

        editor.querySelectorAll("[data-image-path]").forEach(renderSingleImageWidget);
        editor.querySelectorAll("[data-list]").forEach(renderSingleListEditor);
    }

    document.querySelectorAll("#content-editor [data-path]").forEach((el) => {
        const evtName = el.type === "checkbox" ? "change" : "input";
        el.addEventListener(evtName, () => {
            const path = el.getAttribute("data-path");
            const val = el.type === "checkbox" ? el.checked : el.value;
            setByPath(siteContentDraft, path, val);
            markContentDirty(true);
        });
    });

    async function loadSiteContentToAdmin() {
        if (!window.HLSContentService) return;
        siteContentDraft = await HLSContentService.getContent();
        renderContentEditorForm();
        renderAdminNewsList();
        renderAdminPartnersList();
        markContentDirty(false);
        refreshDashboardKPIs();
        if (window.HLSEditorialUI && siteContentDraft.hero) {
            window.HLSEditorialUI.applyBrandLogo(siteContentDraft.hero.logo_url);
        }
    }

    async function handleSaveSiteContent() {
        const topBtn = document.getElementById("save-content-btn");
        const bottomBtn = document.getElementById("save-content-bottom-btn");
        const floatBtn = document.getElementById("floating-save-btn");
        [topBtn, bottomBtn, floatBtn].forEach((b) => {
            if (b) {
                b.disabled = true;
                b.textContent = "Đang lưu...";
            }
        });

        try {
            siteContentDraft = await HLSContentService.saveContent(siteContentDraft);
            markContentDirty(false);
            refreshDashboardKPIs();
            if (window.HLSEditorialUI && siteContentDraft.hero) {
                window.HLSEditorialUI.applyBrandLogo(siteContentDraft.hero.logo_url);
            }
            showToast("Đã lưu toàn bộ nội dung Website, Logo & SĐT Liên hệ thành công.");
        } catch (err) {
            showToast(err.message, true);
        } finally {
            [topBtn, bottomBtn].forEach((b) => {
                if (b) {
                    b.disabled = false;
                    b.textContent = "Lưu toàn bộ nội dung";
                }
            });
            if (floatBtn) {
                floatBtn.disabled = false;
                floatBtn.textContent = "Lưu ngay (Ctrl+S)";
            }
        }
    }

    document.getElementById("save-content-btn").addEventListener("click", handleSaveSiteContent);
    document.getElementById("save-content-bottom-btn").addEventListener("click", handleSaveSiteContent);
    document.getElementById("floating-save-btn").addEventListener("click", handleSaveSiteContent);

    document.getElementById("floating-discard-btn").addEventListener("click", async () => {
        await loadSiteContentToAdmin();
        showToast("Đã hoàn tác các thay đổi chưa lưu.");
    });

    const toggleAllDetailsBtn = document.getElementById("toggle-all-details-btn");
    toggleAllDetailsBtn.addEventListener("click", () => {
        const detailsEls = Array.from(document.querySelectorAll("#content-editor > details"));
        const allOpen = detailsEls.every((d) => d.open);
        detailsEls.forEach((d) => {
            d.open = !allOpen;
        });
        toggleAllDetailsBtn.textContent = allOpen ? "Mở tất cả các mục" : "Thu gọn tất cả các mục";
    });

    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
            const isContentTabActive = !dashboardView.classList.contains("hidden") && !tabPanels.content.classList.contains("hidden");
            const isAnyModalOpen = [memberModal, eventModal, newsModal, partnerModal, guideModal, securityModal]
                .some((m) => m && !m.classList.contains("hidden"));
            if (isContentTabActive && !isAnyModalOpen) {
                e.preventDefault();
                handleSaveSiteContent();
            }
        }
    });

    document.getElementById("reset-content-btn").addEventListener("click", async () => {
        if (!confirm("Khôi phục toàn bộ nội dung Toàn Web, Tin tức, Đối tác & Liên hệ về bản mặc định ban đầu?")) return;
        try {
            siteContentDraft = await HLSContentService.resetContent();
            renderContentEditorForm();
            renderAdminNewsList();
            renderAdminPartnersList();
            markContentDirty(false);
            refreshDashboardKPIs();
            if (window.HLSEditorialUI) window.HLSEditorialUI.applyBrandLogo("");
            showToast("Đã khôi phục nội dung mặc định.");
        } catch (err) {
            showToast(err.message, true);
        }
    });

    document.getElementById("export-content-json-btn").addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(siteContentDraft, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hls-noi-dung-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById("import-content-json-input").addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            siteContentDraft = await HLSContentService.saveContent(parsed);
            renderContentEditorForm();
            renderAdminNewsList();
            renderAdminPartnersList();
            markContentDirty(false);
            refreshDashboardKPIs();
            showToast("Đã nhập và lưu nội dung từ tệp JSON.");
        } catch (err) {
            showToast("Lỗi nhập JSON nội dung: " + err.message, true);
        } finally {
            e.target.value = "";
        }
    });

    // =========================================================================
    // PHẦN 06: BÀN GIAO NHIỆM KỲ, MASTER BACKUP & CẤU HÌNH SUPABASE
    // =========================================================================
    document.getElementById("master-backup-export-btn").addEventListener("click", () => {
        const bundle = {
            backup_type: "hls_master_backup_v2",
            club: "HLS - CLB Logistics & Quản lý Chuỗi cung ứng ĐHBK Hà Nội",
            exported_at: new Date().toISOString(),
            members: membersCache,
            events: eventsCache,
            site_content: siteContentDraft
        };
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hls-master-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Đã tải về bản Sao lưu Toàn bộ Website (.json).");
    });

    document.getElementById("master-backup-import-input").addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            const hasMembers = Array.isArray(parsed.members);
            const hasEvents = Array.isArray(parsed.events);
            const hasContent = parsed.site_content && typeof parsed.site_content === "object";

            if (!hasMembers && !hasEvents && !hasContent) {
                throw new Error("Tệp không đúng định dạng bản sao lưu tổng thể (Master Backup) của HLS.");
            }
            if (!confirm("Khôi phục toàn bộ dữ liệu từ bản sao lưu này? Thành viên, Sự kiện, Tin tức, Đối tác và Liên hệ sẽ được cập nhật.")) {
                return;
            }

            let mCount = 0;
            let eCount = 0;
            if (hasMembers) mCount = await HLSService.importMembersJson(parsed.members);
            if (hasEvents) eCount = await HLSEventsService.importEventsJson(parsed.events);
            if (hasContent && window.HLSContentService) await HLSContentService.saveContent(parsed.site_content);

            await Promise.all([loadMembersToAdmin(), loadEventsToAdmin(), loadSiteContentToAdmin()]);
            showToast(`Đã khôi phục: ${mCount} thành viên, ${eCount} sự kiện cùng toàn bộ Tin tức, Đối tác & Trang chủ.`);
        } catch (err) {
            showToast("Lỗi khôi phục bản sao lưu: " + err.message, true);
        } finally {
            e.target.value = "";
        }
    });

    function openSupabaseGuideModal() {
        const cfg = window.HLS_CONFIG || {};
        const urlInp = document.getElementById("gen-sb-url");
        const keyInp = document.getElementById("gen-sb-key");
        if (urlInp && !urlInp.value && cfg.SUPABASE_URL) urlInp.value = cfg.SUPABASE_URL;
        if (keyInp && !keyInp.value && cfg.SUPABASE_ANON_KEY) keyInp.value = cfg.SUPABASE_ANON_KEY;
        guideModal.classList.remove("hidden");
    }

    document.getElementById("open-supabase-guide-btn").addEventListener("click", openSupabaseGuideModal);
    document.getElementById("banner-open-supabase-btn").addEventListener("click", openSupabaseGuideModal);
    document.getElementById("close-guide-btn").addEventListener("click", () => guideModal.classList.add("hidden"));
    document.getElementById("copy-sql-btn").addEventListener("click", async (e) => {
        const sql = document.getElementById("supabase-sql-code").textContent;
        await navigator.clipboard.writeText(sql);
        e.target.textContent = "Đã sao chép";
        setTimeout(() => (e.target.textContent = "Sao chép SQL"), 2000);
    });

    document.getElementById("download-supabase-config-btn").addEventListener("click", () => {
        const sbUrl = document.getElementById("gen-sb-url").value.trim().replace(/\/+$/, "");
        const sbKey = document.getElementById("gen-sb-key").value.trim();
        if (!sbUrl || !sbKey) {
            showToast("Vui lòng nhập đầy đủ Project URL và anon public key của Supabase trước khi tải tệp.", true);
            return;
        }

        const baseCfg = window.HLS_CONFIG || {};
        const nextCfg = {
            SUPABASE_URL: sbUrl,
            SUPABASE_ANON_KEY: sbKey,
            STORAGE_BUCKET: baseCfg.STORAGE_BUCKET || "member-photos",
            EVENT_STORAGE_BUCKET: baseCfg.EVENT_STORAGE_BUCKET || "event-photos",
            TIERS: baseCfg.TIERS || [],
            DEPARTMENTS: baseCfg.DEPARTMENTS || [],
            EVENT_SUBTYPES: baseCfg.EVENT_SUBTYPES || []
        };

        const fileContent = [
            "// ============================================================================",
            "// CẤU HÌNH KẾT NỐI CƠ SỞ DỮ LIỆU SUPABASE - WEBSITE CLB HLS (ĐHBK HÀ NỘI)",
            "// Tự động khởi tạo từ Trang Quản trị HLS Admin",
            "// Ghi đè tệp này vào đường dẫn: js/supabase-config.js rồi đẩy lên Git / Hosting",
            "// Lưu ý bảo mật: Tuyệt đối KHÔNG lưu mật khẩu quản trị trong tệp này.",
            "// ============================================================================",
            "",
            "window.HLS_CONFIG = " + JSON.stringify(nextCfg, null, 4) + ";",
            ""
        ].join("\n");

        const blob = new Blob([fileContent], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "supabase-config.js";
        a.click();
        URL.revokeObjectURL(url);
        showToast("Đã tải tệp supabase-config.js. Hãy chép đè vào thư mục js/ của dự án.");
    });

    // Khởi tạo phiên quản trị tập trung & điều hướng theo hash (#content, #events, #news, #partners, #members, #handover)
    async function checkAuthAndRender() {
        updateModeBadge();
        const session = await HLSService.getAdminSession();
        if (session) {
            currentSessionInfo = session;
            loginView.classList.add("hidden");
            dashboardView.classList.remove("hidden");
            logoutBtn.classList.remove("hidden");
            openSecurityBtn.classList.remove("hidden");
            if (activeAdminEmailEl) {
                activeAdminEmailEl.textContent = session.email || "admin@hls.hust.edu.vn";
            }
            await Promise.all([loadMembersToAdmin(), loadEventsToAdmin(), loadSiteContentToAdmin()]);
            const hashTab = (window.location.hash || "").replace(/^#/, "");
            switchAdminTab(TAB_KEYS.includes(hashTab) ? hashTab : "content");
        } else {
            currentSessionInfo = null;
            dashboardView.classList.add("hidden");
            logoutBtn.classList.add("hidden");
            openSecurityBtn.classList.add("hidden");
            if (securityModal) securityModal.classList.add("hidden");
            if (floatingSaveBar) floatingSaveBar.classList.add("hidden");
            loginView.classList.remove("hidden");
        }
    }

    checkAuthAndRender();
})();
