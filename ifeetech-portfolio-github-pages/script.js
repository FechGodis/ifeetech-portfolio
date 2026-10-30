(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const menuToggle = $("#menuToggle");
  const navLinks = $("#navLinks");
  const themeToggle = $("#themeToggle");
  const toast = $("#toast");
  let toastTimer;

  // Footer year stays current automatically.
  $("#year").textContent = new Date().getFullYear();

  // Mobile navigation: closes on selection, outside click, and Escape.
  const closeMenu = () => {
    navLinks?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  };
  menuToggle?.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  $$("#navLinks a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", event => {
    if (navLinks?.classList.contains("open") &&
        !navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  // Persist theme preference when local storage is available.
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* private browsing */ } }
  };
  const savedTheme = storage.get("ifeetech-theme");
  if (savedTheme === "dark") document.body.classList.add("theme-dark");
  const syncThemeLabel = () => {
    const dark = document.body.classList.contains("theme-dark");
    themeToggle?.setAttribute("aria-label", dark ? "Switch to light colour theme" : "Switch to dark colour theme");
    themeToggle?.setAttribute("title", dark ? "Switch to light theme" : "Switch to dark theme");
    if (themeToggle) themeToggle.innerHTML = dark ? '<span aria-hidden="true">☼</span>' : '<span aria-hidden="true">◐</span>';
  };
  syncThemeLabel();
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("theme-dark");
    storage.set("ifeetech-theme", document.body.classList.contains("theme-dark") ? "dark" : "light");
    syncThemeLabel();
    showToast(document.body.classList.contains("theme-dark") ? "Dark theme enabled" : "Light theme enabled");
  });

  // Reveal content as it enters view; respects reduced-motion settings.
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add("visible"));

  // Keep active section indicator in sync with the user's scroll position.
  const sectionLinks = $$("#navLinks a");
  const sections = sectionLinks.map(link => $(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          if (active) link.classList.add("active");
          else link.classList.remove("active");
        });
      });
    }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Lightweight feedback for copy-to-contact actions and helpful link handling.
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  // Add subtle pointer response to cards only on devices that support hover.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$(".skill-card, .project-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
      });
    });
  }

  // Make mail links gracefully fall back to a copyable email if no mail app opens.
  $$('a[href="mailto:ifeegod112@gmail.com"]').forEach(link => {
    link.addEventListener("contextmenu", () => showToast("Email: ifeegod112@gmail.com"));
  });
})();