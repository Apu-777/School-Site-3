// Brightlands International School — shared site behavior

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- Theme toggle (dark/light, persisted) ---------- */
  var themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("bl-theme", next); } catch (e) {}
    });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  /* ---------- Dismissible notice bar (remembered per browser) ---------- */
  var notice = document.querySelector(".notice-bar");
  var noticeClose = document.querySelector(".notice-close");
  if (notice && noticeClose) {
    var dismissed = false;
    try { dismissed = localStorage.getItem("bl-notice-dismissed") === "1"; } catch (e) {}
    if (dismissed) notice.classList.add("hidden");
    noticeClose.addEventListener("click", function () {
      notice.classList.add("hidden");
      try { localStorage.setItem("bl-notice-dismissed", "1"); } catch (e) {}
    });
  }

  /* ---------- Scroll-reveal animations ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Animated stat counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1400;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var value = Math.floor(progress * target);
          el.textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- Curriculum tabs ---------- */
  var tabButtons = document.querySelectorAll(".tab-btn");
  var tabPanels = document.querySelectorAll(".tab-panel");
  if (tabButtons.length && tabPanels.length) {
    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");
        tabButtons.forEach(function (b) { b.classList.remove("active"); });
        tabPanels.forEach(function (p) { p.classList.remove("active"); });
        btn.classList.add("active");
        var panel = document.querySelector('.tab-panel[data-tab="' + target + '"]');
        if (panel) panel.classList.add("active");
      });
    });
  }

  /* ---------- Testimonial slider (autoplay + dots + manual) ---------- */
  var slider = document.querySelector(".testimonial-slider");
  if (slider) {
    var slidesTrack = slider.querySelector(".testimonial-slides");
    var slides = slider.querySelectorAll(".testimonial-slide");
    var dotsWrap = slider.querySelector(".testimonial-dots");
    var current = 0;
    var slideTimer;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      if (i === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      dot.addEventListener("click", function () { goTo(i); resetTimer(); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll("button");

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slidesTrack.style.transform = "translateX(-" + (current * 100) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("active", i === current); });
    }
    function resetTimer() {
      clearInterval(slideTimer);
      slideTimer = setInterval(function () { goTo(current + 1); }, 5000);
    }
    resetTimer();
    slider.addEventListener("mouseenter", function () { clearInterval(slideTimer); });
    slider.addEventListener("mouseleave", resetTimer);
  }

  /* ---------- Teacher search + department filter (combined) ---------- */
  var teacherCards = document.querySelectorAll(".teacher-card");
  var filterButtons = document.querySelectorAll(".filter-btn");
  var searchInput = document.querySelector(".teacher-search input");
  var noResults = document.querySelector(".no-results");
  var activeDept = "all";

  function applyTeacherFilter() {
    if (!teacherCards.length) return;
    var query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    var visibleCount = 0;
    teacherCards.forEach(function (card) {
      var dept = card.getAttribute("data-dept");
      var name = card.getAttribute("data-name") || "";
      var deptMatch = activeDept === "all" || dept === activeDept;
      var searchMatch = name.toLowerCase().indexOf(query) !== -1;
      var show = deptMatch && searchMatch;
      card.style.display = show ? "" : "none";
      if (show) visibleCount++;
    });
    if (noResults) noResults.classList.toggle("show", visibleCount === 0);
  }
  if (filterButtons.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeDept = btn.getAttribute("data-filter");
        applyTeacherFilter();
      });
    });
  }
  if (searchInput) searchInput.addEventListener("input", applyTeacherFilter);

  /* ---------- Gallery lightbox ---------- */
  var galleryButtons = document.querySelectorAll(".gallery-grid button");
  var lightbox = document.querySelector(".lightbox");
  if (galleryButtons.length && lightbox) {
    var lightboxImg = lightbox.querySelector("img");
    var lightboxClose = lightbox.querySelector(".lightbox-close");
    galleryButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var src = btn.querySelector("img").getAttribute("src");
        lightboxImg.setAttribute("src", src);
        lightbox.classList.add("open");
      });
    });
    function closeLightbox() { lightbox.classList.remove("open"); }
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ---------- Animated results bar chart ---------- */
  var barChart = document.querySelector(".bar-chart");
  if (barChart && "IntersectionObserver" in window) {
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(".bar").forEach(function (bar) {
          var pct = bar.getAttribute("data-height");
          bar.style.height = pct + "%";
        });
        barObserver.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    barObserver.observe(barChart);
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-answer").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  /* ---------- Blog category filter ---------- */
  var blogTagButtons = document.querySelectorAll("[data-blog-filter]");
  var blogCards = document.querySelectorAll(".blog-card");
  if (blogTagButtons.length && blogCards.length) {
    blogTagButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-blog-filter");
        blogTagButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        blogCards.forEach(function (card) {
          var match = cat === "all" || card.getAttribute("data-category") === cat;
          card.classList.toggle("is-hidden", !match);
        });
      });
    });
  }

  /* ---------- Contact form validation ---------- */
  var contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      contactForm.querySelectorAll("[required]").forEach(function (field) {
        var wrapper = field.closest(".form-field");
        var isEmail = field.type === "email";
        var emailOk = !isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        if (!field.value.trim() || !emailOk) {
          wrapper.classList.add("error");
          valid = false;
        } else {
          wrapper.classList.remove("error");
        }
      });
      var status = contactForm.querySelector(".form-status");
      if (status) {
        status.textContent = valid
          ? "Thanks — this is a demo form, so nothing was actually sent yet."
          : "Please fill in the highlighted fields correctly.";
        status.classList.toggle("success", valid);
      }
    });
  }

  /* ---------- Newsletter form (footer) ---------- */
  var newsletterForm = document.querySelector(".newsletter");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector("input");
      var note = newsletterForm.parentElement.querySelector(".newsletter-note");
      if (input && input.value.trim() && note) {
        note.textContent = "Thanks for subscribing — demo only, no email sent.";
        input.value = "";
      }
    });
  }

  /* ---------- Back to top button ---------- */
  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("show", window.scrollY > 400);
    });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

});
