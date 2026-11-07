// ============================================================================
// HỆ THỐNG TƯƠNG TÁC & CHUYỂN ĐỘNG BIÊN TẬP — HLS ĐHBK HÀ NỘI
// Cung cấp: Scroll Reveal tiết chế, trạng thái Navbar khi cuộn, thanh tiến độ
// đọc bài, đếm số thống kê mượt và đồng bộ link đăng ký thành viên trên mọi trang.
// ============================================================================

(function () {
    const REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let revealObserver = null;
    let counterObserver = null;

    function ensureRevealObserver() {
        if (REDUCED_MOTION || !("IntersectionObserver" in window)) return null;
        if (revealObserver) return revealObserver;

        revealObserver = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px -36px 0px" }
        );
        return revealObserver;
    }

    // Gắn hiệu ứng xuất hiện cho các phần tử [data-reveal] trong container (hoặc toàn trang)
    function observeReveals(root = document) {
        const targets = root.querySelectorAll("[data-reveal]:not(.hls-reveal-bound)");
        if (!targets.length) return;

        const obs = ensureRevealObserver();
        targets.forEach((el, idx) => {
            el.classList.add("hls-reveal-bound");
            if (!obs) {
                el.classList.add("is-visible");
                return;
            }
            const customDelay = el.getAttribute("data-reveal-delay");
            const delayMs = customDelay !== null ? Number(customDelay) : Math.min((idx % 6) * 55, 275);
            el.style.setProperty("--reveal-delay", `${delayMs}ms`);
            el.classList.add("hls-reveal");
            obs.observe(el);
        });
    }

    // Hiệu ứng đếm số nhẹ nhàng cho các chỉ số dạng "120+", "2.000+", "15+"
    function animateCountElement(el) {
        const raw = (el.getAttribute("data-countup") || el.textContent || "").trim();
        const match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
        if (!match || REDUCED_MOTION) {
            el.textContent = raw;
            return;
        }

        const prefix = match[1] || "";
        const numPart = match[2];
        const suffix = match[3] || "";
        const useDotThousands = numPart.includes(".") && numPart.split(".").pop().length === 3;
        const normalized = useDotThousands ? numPart.replace(/\./g, "") : numPart.replace(/,/g, "");
        const target = parseInt(normalized, 10);

        if (isNaN(target) || target <= 0) {
            el.textContent = raw;
            return;
        }

        const padLen = numPart.startsWith("0") && numPart.length === 2 ? 2 : 0;
        const duration = 850;
        const start = performance.now();

        function formatNum(val) {
            if (padLen) return String(val).padStart(padLen, "0");
            if (useDotThousands) return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            return String(val);
        }

        function tick(now) {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            const current = Math.round(target * eased);
            el.textContent = `${prefix}${formatNum(current)}${suffix}`;
            if (elapsed < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = raw;
            }
        }

        requestAnimationFrame(tick);
    }

    function observeCounters(root = document) {
        const els = root.querySelectorAll("[data-countup]:not(.hls-count-bound)");
        if (!els.length) return;

        if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
            els.forEach((el) => el.classList.add("hls-count-bound"));
            return;
        }

        if (!counterObserver) {
            counterObserver = new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            animateCountElement(entry.target);
                            obs.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.25 }
            );
        }

        els.forEach((el) => {
            el.classList.add("hls-count-bound");
            counterObserver.observe(el);
        });
    }

    // Đổ bóng mảnh cho Navbar khi cuộn + Cập nhật thanh tiến độ đọc bài (nếu có)
    function initScrollChrome() {
        const nav = document.querySelector(".hls-nav");
        const bar = document.getElementById("reading-progress");
        if (!nav && !bar) return;

        function onScroll() {
            const y = window.scrollY || window.pageYOffset || 0;
            if (nav) {
                nav.classList.toggle("is-scrolled", y > 12);
            }
            if (bar) {
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const pct = docHeight > 40 ? Math.min(100, Math.max(0, (y / docHeight) * 100)) : 0;
                bar.style.width = pct.toFixed(1) + "%";
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    // Đồng bộ link form đăng ký thành viên từ Admin cho mọi nút [data-join-link] trên trang con
    async function syncJoinLinks() {
        if (!window.HLSContentService) return;
        const links = document.querySelectorAll("[data-join-link]");
        if (!links.length) return;

        try {
            const content = await window.HLSContentService.getContent();
            const formUrl = content && content.contact && content.contact.join_form_url
                ? content.contact.join_form_url.trim()
                : "";
            if (!formUrl) return;
            links.forEach((a) => {
                a.href = formUrl;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
            });
        } catch (_) {
            // Giữ nguyên liên kết mặc định nếu không tải được
        }
    }

    function refresh(root = document) {
        observeReveals(root);
        observeCounters(root);
    }

    document.addEventListener("DOMContentLoaded", () => {
        initScrollChrome();
        refresh(document);
        syncJoinLinks();
    });

    window.HLSEditorialUI = {
        refresh,
        observeReveals,
        observeCounters,
        syncJoinLinks
    };
})();

