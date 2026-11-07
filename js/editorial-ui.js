// ============================================================================
// HỆ THỐNG THỊ GIÁC & CHUYỂN ĐỘNG OBSIDIAN-CRIMSON — HLS ĐHBK HÀ NỘI
// Cung cấp: Sân khấu dải lụa ánh sáng đỏ động (Crimson Silk Ribbons),
// hiệu ứng khe sáng đỏ theo con trỏ trên thẻ Obsidian, Scroll Reveal mượt,
// thanh tiến độ đọc bài, đếm số thống kê và đồng bộ Logo / Link đăng ký.
// ============================================================================

(function () {
    const REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let revealObserver = null;
    let counterObserver = null;

    // 1. Dải lụa ánh sáng đỏ chuyển động mượt trên nền đen tuyền (lấy cảm hứng từ dải sóng đỏ-đen)
    function mountAmbientBackdrop() {
        if (document.querySelector(".hls-ambient-stage")) return;

        const stage = document.createElement("div");
        stage.className = "hls-ambient-stage";
        stage.setAttribute("aria-hidden", "true");

        const canvas = document.createElement("canvas");
        canvas.className = "hls-ribbon-canvas";
        const grid = document.createElement("div");
        grid.className = "hls-grid-overlay";

        stage.appendChild(canvas);
        stage.appendChild(grid);
        document.body.insertBefore(stage, document.body.firstChild);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const isStaticAdmin = document.body.hasAttribute("data-subtle-ambient");
        let width = 0;
        let height = 0;
        let dpr = 1;
        let phase = 1.4;
        let rafId = null;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 1.75);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (REDUCED_MOTION || isStaticAdmin) {
                drawFrame(phase);
            }
        }

        function drawFrame(t) {
            ctx.clearRect(0, 0, width, height);

            // Quầng sáng đỏ trầm dưới chân dải sóng
            const glowX = width * (0.58 + Math.sin(t * 0.35) * 0.08);
            const glowY = height * 0.82;
            const radial = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, Math.max(width, height) * 0.52);
            radial.addColorStop(0, isStaticAdmin ? "rgba(185, 28, 28, 0.10)" : "rgba(220, 38, 38, 0.16)");
            radial.addColorStop(0.5, "rgba(127, 29, 29, 0.06)");
            radial.addColorStop(1, "rgba(5, 5, 7, 0)");
            ctx.fillStyle = radial;
            ctx.fillRect(0, 0, width, height);

            // Vẽ 15 sợi lụa ánh sáng đỏ uốn lượn đồng pha tạo chiều sâu 3D
            const strandCount = isStaticAdmin ? 9 : 15;
            const baseY = height * 0.72;
            const amp1 = Math.min(height * 0.16, 135);
            const amp2 = Math.min(height * 0.09, 75);

            for (let i = 0; i < strandCount; i++) {
                const ratio = i / (strandCount - 1);
                const crestFocus = 1 - Math.abs(ratio - 0.65) * 1.5;
                const alpha = Math.max(0.04, (isStaticAdmin ? 0.14 : 0.28) * Math.max(0.2, crestFocus));

                ctx.beginPath();
                const steps = 36;
                for (let s = 0; s <= steps; s++) {
                    const nx = s / steps;
                    const x = nx * width;
                    const waveA = Math.sin(nx * 4.2 - t + i * 0.11) * amp1;
                    const waveB = Math.cos(nx * 2.3 + t * 0.65 - i * 0.16) * amp2;
                    const spread = (i - strandCount * 0.5) * (9 + Math.sin(nx * Math.PI) * 11);
                    const y = baseY + waveA * 0.62 + waveB * 0.52 + spread - nx * height * 0.12;
                    if (s === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                if (i === Math.floor(strandCount * 0.68)) {
                    // Sợi viền sáng nóng rực ở đỉnh sóng
                    ctx.strokeStyle = `rgba(251, 113, 133, ${(alpha * 1.55).toFixed(3)})`;
                    ctx.lineWidth = 1.6;
                } else if (i % 3 === 0) {
                    ctx.strokeStyle = `rgba(239, 68, 68, ${alpha.toFixed(3)})`;
                    ctx.lineWidth = 1.25;
                } else {
                    ctx.strokeStyle = `rgba(153, 27, 27, ${(alpha * 0.85).toFixed(3)})`;
                    ctx.lineWidth = 1;
                }
                ctx.stroke();
            }
        }

        function loop() {
            phase += 0.0055;
            drawFrame(phase);
            rafId = requestAnimationFrame(loop);
        }

        resize();
        window.addEventListener("resize", resize, { passive: true });

        if (!REDUCED_MOTION && !isStaticAdmin) {
            rafId = requestAnimationFrame(loop);
            document.addEventListener("visibilitychange", () => {
                if (document.hidden && rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                } else if (!document.hidden && !rafId) {
                    rafId = requestAnimationFrame(loop);
                }
            });
        }
    }

    // 2. Hiệu ứng khe sáng đỏ đi theo con trỏ chuột trên các khối thẻ .hls-card
    function bindCardSpotlight() {
        if (REDUCED_MOTION) return;
        document.addEventListener(
            "pointermove",
            (e) => {
                const card = e.target && e.target.closest ? e.target.closest(".hls-card") : null;
                if (!card) return;
                const rect = card.getBoundingClientRect();
                card.style.setProperty("--mx", `${Math.round(e.clientX - rect.left)}px`);
                card.style.setProperty("--my", `${Math.round(e.clientY - rect.top)}px`);
            },
            { passive: true }
        );
    }

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
        const duration = 900;
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

    function applyBrandLogo(rawUrl) {
        const logoUrl = (rawUrl || "").trim();

        let iconLink = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        if (!iconLink) {
            iconLink = document.createElement("link");
            iconLink.rel = "icon";
            document.head.appendChild(iconLink);
        }
        if (logoUrl) {
            if (logoUrl.endsWith(".svg") || logoUrl.startsWith("data:image/svg")) {
                iconLink.type = "image/svg+xml";
            } else {
                iconLink.removeAttribute("type");
            }
            iconLink.href = logoUrl;
        } else {
            iconLink.type = "image/svg+xml";
            iconLink.href = "assets/favicon.svg";
        }

        document.querySelectorAll('nav a[href="index.html"]').forEach((brandLink) => {
            const existingImg = brandLink.querySelector("img[data-brand-logo]");
            const barSpan = brandLink.querySelector("[data-brand-bar]");

            if (logoUrl) {
                if (barSpan) barSpan.classList.add("hidden");
                if (existingImg) {
                    existingImg.src = logoUrl;
                } else {
                    const img = document.createElement("img");
                    img.setAttribute("data-brand-logo", "true");
                    img.src = logoUrl;
                    img.alt = "Logo HLS";
                    img.className = "w-7 h-7 rounded object-contain flex-shrink-0";
                    brandLink.insertBefore(img, brandLink.firstChild);
                }
            } else {
                if (existingImg) existingImg.remove();
                if (barSpan) barSpan.classList.remove("hidden");
            }
        });
    }

    async function syncJoinLinks() {
        if (!window.HLSContentService) return;

        try {
            const content = await window.HLSContentService.getContent();
            const logoUrl = content && content.hero && content.hero.logo_url
                ? content.hero.logo_url.trim()
                : "";
            applyBrandLogo(logoUrl);

            // Đồng bộ SĐT & Email liên hệ cho các phần tử [data-sync-phone] / [data-sync-email] trên trang con
            const ct = (content && content.contact) || {};
            if (ct.phone) {
                document.querySelectorAll("[data-sync-phone]").forEach((el) => {
                    el.textContent = ct.phone;
                    if (el.tagName === "A") {
                        el.href = "tel:" + String(ct.phone).replace(/\s+/g, "");
                    }
                });
            }
            if (ct.email) {
                document.querySelectorAll("[data-sync-email]").forEach((el) => {
                    el.textContent = ct.email;
                    if (el.tagName === "A") {
                        el.href = "mailto:" + ct.email;
                    }
                });
            }

            const links = document.querySelectorAll("[data-join-link]");
            const formUrl = ct.join_form_url ? ct.join_form_url.trim() : "";
            if (!formUrl || !links.length) return;
            links.forEach((a) => {
                a.href = formUrl;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
            });
        } catch (_) {
            // Giữ nguyên mặc định nếu ngoại tuyến
        }
    }

    function refresh(root = document) {
        observeReveals(root);
        observeCounters(root);
    }

    document.addEventListener("DOMContentLoaded", () => {
        mountAmbientBackdrop();
        bindCardSpotlight();
        initScrollChrome();
        refresh(document);
        syncJoinLinks();
    });

    window.HLSEditorialUI = {
        refresh,
        observeReveals,
        observeCounters,
        syncJoinLinks,
        applyBrandLogo
    };
})();
