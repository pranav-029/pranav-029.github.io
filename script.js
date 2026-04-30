(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // =========================
  // Footer year
  // =========================
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // =========================
  // Mobile navigation toggle
  // =========================
  // Mobile nav toggle
  const toggle = $(".nav__toggle");
  const links = $("#navLinks");
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = links.classList.contains("is-open");
      setOpen(!isOpen);
    });

    // Close when clicking a link
    $$(".nav__link", links).forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!links.classList.contains("is-open")) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (links.contains(target) || toggle.contains(target)) return;
      setOpen(false);
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // =========================
  // Smooth scrolling (in-page anchors)
  // =========================
  // Smooth scrolling for in-page links (avoids jumps if user disables CSS smooth scroll)
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (href === "#" || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
    });
  });

  // =========================
  // Active nav highlighting
  // =========================
  // Active nav highlighting (modern feel + orientation)
  const navLinks = $$(".nav__link").filter((a) => (a.getAttribute("href") || "").startsWith("#"));
  const sectionIds = navLinks
    .map((a) => (a.getAttribute("href") || "").slice(1))
    .filter(Boolean);
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el) => el instanceof HTMLElement);

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const isActive = (a.getAttribute("href") || "") === `#${id}`;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window && sections.length) {
    const navIO = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (!visible || !(visible.target instanceof HTMLElement)) return;
        setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0.12, 0.25, 0.5] }
    );
    sections.forEach((s) => navIO.observe(s));
  }

  // =========================
  // Scroll reveal animations (subtle)
  // =========================
  // Scroll reveal animations
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    // Small stagger for sibling elements only (keeps animations minimal)
    const parents = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const list = parents.get(parent) || [];
      list.push(el);
      parents.set(parent, list);
    });
    parents.forEach((list) => {
      list.forEach((el, idx) => {
        el.style.transitionDelay = `${Math.min(idx * 70, 240)}ms`;
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  // =========================
  // Profile image fallback
  // =========================
  // Profile image fallback (prevents broken image UI)
  const profileImg = $("#profileImg");
  if (profileImg instanceof HTMLImageElement) {
    profileImg.addEventListener(
      "error",
      () => {
        const svg = encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="700" height="700" viewBox="0 0 700 700">
            <defs>
              <radialGradient id="g1" cx="20%" cy="10%" r="80%">
                <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.55"/>
                <stop offset="60%" stop-color="#0a0a0a" stop-opacity="1"/>
              </radialGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0.06"/>
              </linearGradient>
            </defs>
            <rect width="700" height="700" fill="url(#g1)"/>
            <rect x="70" y="70" width="560" height="560" rx="40" fill="url(#g2)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
            <g fill="rgba(255,255,255,0.92)" font-family="Poppins, Arial, sans-serif">
              <text x="110" y="320" font-size="36" font-weight="700">Pranav Bhamre</text>
              <text x="110" y="368" font-size="18" opacity="0.85">Aspiring Data Analyst</text>
              <text x="110" y="410" font-size="14" opacity="0.7">Add your photo at images/profile.jpg</text>
            </g>
          </svg>
        `);
        profileImg.src = `data:image/svg+xml;charset=UTF-8,${svg}`;
      },
      { once: true }
    );
  }
})();

