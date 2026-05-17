/* ================================================================
   JDEVS. — Main JavaScript (script.js)
   Home Page | Connected pages controlled:
   All pages share this script via <script src="script.js">
   ================================================================ */


/* ----------------------------------------------------------------
   1. NAVIGATION — FLOATING NAV BEHAVIOURS
   - Scrolled class darkens the nav on scroll
   - Hamburger toggles mobile menu open/close
   - Active nav link is highlighted based on current page
---------------------------------------------------------------- */

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

// ── 1a. Scroll detection: add .scrolled when user scrolls down ──
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ── 1b. Hamburger toggle: open/close mobile dropdown ──
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', isOpen);

  // Prevent body scroll while mobile menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// ── 1c. Close mobile menu when a link is clicked ──
document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── 1d. Close mobile menu on outside click ──
document.addEventListener('click', (e) => {
  const navWrapper = document.getElementById('navWrapper');
  if (!navWrapper.contains(e.target) && mobileMenu.classList.contains('open')) {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── 1e. Highlight active nav link based on current page filename ──
(function highlightActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');  // Remove default .active if set in HTML
    }
  });
})();


/* ----------------------------------------------------------------
   2. SCROLL REVEAL ANIMATIONS
   Uses IntersectionObserver to add .visible when elements
   enter the viewport — triggering CSS fade-up / fade-in transitions.
   Elements need data-animate="fade-up|fade-right|fade-left"
   Optional: data-delay="100" (milliseconds) for staggered reveals
---------------------------------------------------------------- */

const animatedElements = document.querySelectorAll('[data-animate]');

// ── Check if browser supports IntersectionObserver ──
if ('IntersectionObserver' in window) {

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || 0, 10);

          // Apply stagger delay from data-delay attribute
          setTimeout(() => {
            el.classList.add('visible');
          }, delay);

          // Stop observing after reveal (run once)
          revealObserver.unobserve(el);
        }
      });
    },
    {
      threshold: 0.12,   // Trigger when 12% of element is visible
      rootMargin: '0px 0px -40px 0px'  // Slight bottom offset
    }
  );

  animatedElements.forEach(el => revealObserver.observe(el));

} else {
  // Fallback: show all elements immediately in older browsers
  animatedElements.forEach(el => el.classList.add('visible'));
}


/* ----------------------------------------------------------------
   3. HERO SECTION — ENTRANCE ANIMATION
   Adds 'visible' class to hero elements on page load
   (Hero is above the fold so IntersectionObserver won't trigger it)
---------------------------------------------------------------- */

window.addEventListener('DOMContentLoaded', () => {

  // Animate hero text on load
  const heroText = document.querySelector('.hero-text');
  const heroVisual = document.querySelector('.hero-visual');

  if (heroText) {
    setTimeout(() => heroText.classList.add('visible'), 100);
  }
  if (heroVisual) {
    setTimeout(() => heroVisual.classList.add('visible'), 350);
  }
});


/* ----------------------------------------------------------------
   4. SMOOTH SECTION SCROLLING (for in-page anchor links)
   Handles href="#section-id" links with offset for fixed nav
---------------------------------------------------------------- */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;  // Skip empty anchors

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    // Offset for the floating nav bar height (~80px)
    const navHeight = 90;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });

    // Close mobile menu if open
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});


/* ----------------------------------------------------------------
   5. PROJECT CARD HOVER ENHANCEMENT
   Adds a subtle tilt effect on mouse move for project cards
   (desktop only — no effect on touch devices)
---------------------------------------------------------------- */

if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.project-card').forEach(card => {

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Tilt amount: max ±6 degrees
      const tiltX = ((y - centerY) / centerY) * -4;
      const tiltY = ((x - centerX) / centerX) * 4;

      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';  // Reset on mouse leave
    });
  });
}


/* ----------------------------------------------------------------
   6. TESTIMONIAL CARDS — AUTO FADE-IN STAGGER
   Staggers testimonial card entrance with 150ms between each
---------------------------------------------------------------- */

const testiCards = document.querySelectorAll('.testimonial-card');
if (testiCards.length) {
  const testiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        testiCards.forEach((card, index) => {
          setTimeout(() => card.classList.add('visible'), index * 150);
        });
        testiObserver.disconnect();
      }
    });
  }, { threshold: 0.1 });

  if (testiCards[0]) testiObserver.observe(testiCards[0]);
}


/* ----------------------------------------------------------------
   7. FOOTER CURRENT YEAR
   Keeps the copyright year always current
---------------------------------------------------------------- */

const yearEl = document.querySelector('.footer-bottom p');
if (yearEl) {
  const year = new Date().getFullYear();
  yearEl.textContent = `© ${year} JDEVS. All rights reserved.`;
}


/* ----------------------------------------------------------------
   8. SCROLL-TO-TOP ON PAGE RELOAD
   Prevents browser from restoring scroll position on fresh load
---------------------------------------------------------------- */

if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);


/* ================================================================
   END OF script.js
   
   PAGE CONNECTION MAP:
   ─────────────────────────────────────────────────────────────────
   index.html        → Main Home Page (this file)
   portfolio.html    → Full portfolio grid with category filters
   project-detail.html → Single project case study page
   services.html     → Detailed services breakdown
   pricing.html      → Package-based pricing page
   about.html        → Designer story, tools, skills
   blog.html         → Blog/insights article listings
   quote.html        → Request a design quote (form page)
   contact.html      → Contact form + social links
   404.html          → Error page
   admin/            → Admin dashboard (separate auth-protected folder)
   ─────────────────────────────────────────────────────────────────
================================================================ */
// =====================================================
// FAB TOGGLE
// =====================================================

const fabToggle = document.getElementById('fabToggle');
const fabContainer = document.querySelector('.fab-container');
const scrollTopBtn = document.getElementById("scrollTopBtn");

if (fabToggle && fabContainer) {

  let isOpen = false;

  fabToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    fabContainer.classList.toggle('open', isOpen);

    // Hide scroll button when FAB is open
    if (isOpen) {
      scrollTopBtn.classList.remove('show');
    } else {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
      }
    }
  });

  fabContainer.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', () => {
    isOpen = false;
    fabContainer.classList.remove('open');

    // Show scroll button again if needed
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('show');
    }
  });
}


// =====================================================
// SCROLL TO TOP BUTTON
// =====================================================

// Show/hide based on scroll (but NOT when FAB is open)
window.addEventListener("scroll", () => {
  if (
    window.scrollY > 300 &&
    !fabContainer.classList.contains('open')
  ) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

// Scroll to top when clicked
scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

/* ================================================================
   PORTFOLIO FILTER — portfolio.html
   Filters portfolio items by data-category on filter button click
================================================================ */

(function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  const emptyState = document.getElementById('portfolioEmpty');

  if (!filterBtns.length) return; // Not on portfolio page

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      let visibleCount = 0;

      portfolioItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        const match = filter === 'all' || cat === filter;

        if (match) {
          item.classList.remove('hidden');
          visibleCount++;
        } else {
          item.classList.add('hidden');
        }
      });

      // Show or hide empty state
      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    });
  });

  // Auto-trigger filter from URL param e.g. portfolio.html?filter=logo
  const urlParams = new URLSearchParams(window.location.search);
  const urlFilter = urlParams.get('filter');
  if (urlFilter) {
    const matchBtn = document.querySelector(`.filter-btn[data-filter="${urlFilter}"]`);
    if (matchBtn) matchBtn.click();
  }
})();


/* ================================================================
   SERVICES PAGE — JS Sticky Sidebar
   Bypasses CSS overflow/sticky browser bugs by manually fixing
   the aside panel. Three zones: natural → fixed → bottom-stop.
   A placeholder div holds the grid column open when aside is fixed
   so .svc-cards never collapses into the vacated space.
   Only active on desktop (> 1024 px); mobile uses static layout.
================================================================ */
(function initStickySidebar() {
  const aside  = document.querySelector('.svc-aside');
  const layout = document.querySelector('.svc-layout');
  if (!aside || !layout) return;

  const NAV_OFFSET = 110; // px — clears the floating navbar + breathing room

  /* Placeholder that keeps the grid column alive when aside is fixed */
  const placeholder = document.createElement('div');
  placeholder.style.cssText = 'display:none;';
  layout.insertBefore(placeholder, aside);

  function absTop(el) {
    let t = 0;
    while (el) { t += el.offsetTop; el = el.offsetParent; }
    return t;
  }

  let layoutAbsTop, asideNaturalWidth, asideNaturalLeft;

  function showPlaceholder() {
    placeholder.style.cssText = [
      'display:block',
      `width:${asideNaturalWidth}px`,
      `height:${aside.offsetHeight}px`,
      'flex-shrink:0'
    ].join(';');
  }

  function hidePlaceholder() {
    placeholder.style.cssText = 'display:none;';
  }

  function measure() {
    if (window.innerWidth <= 1024) return;
    /* Reset aside and hide placeholder so we read natural layout */
    hidePlaceholder();
    aside.style.cssText = '';
    requestAnimationFrame(() => {
      layoutAbsTop      = absTop(layout);
      asideNaturalWidth = aside.offsetWidth;
      asideNaturalLeft  = aside.getBoundingClientRect().left + window.scrollX;
      update();
    });
  }

  function update() {
    if (window.innerWidth <= 1024) {
      hidePlaceholder();
      aside.style.cssText = '';
      return;
    }

    const scrollY     = window.scrollY;
    const layoutH     = layout.offsetHeight;
    const asideH      = aside.offsetHeight;
    const stickyStart = layoutAbsTop - NAV_OFFSET;
    const stickyEnd   = layoutAbsTop + layoutH - asideH - NAV_OFFSET;

    if (scrollY < stickyStart) {
      /* Zone 1 — natural position, placeholder not needed */
      hidePlaceholder();
      aside.style.cssText = '';

    } else if (scrollY <= stickyEnd) {
      /* Zone 2 — aside fixed; placeholder holds the column open */
      showPlaceholder();
      aside.style.cssText = [
        'position:fixed',
        `top:${NAV_OFFSET}px`,
        `left:${asideNaturalLeft}px`,
        `width:${asideNaturalWidth}px`,
        'z-index:10'
      ].join(';');

    } else {
      /* Zone 3 — past all content, aside absolute at layout bottom.
         Aside is still out of grid flow so placeholder must stay ON */
      showPlaceholder();
      aside.style.cssText = [
        'position:absolute',
        `top:${layoutH - asideH}px`,
        'left:0',
        `width:${asideNaturalWidth}px`
      ].join(';');
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 100);
  });
  window.addEventListener('scroll', update, { passive: true });

  if (document.readyState === 'complete') {
    measure();
  } else {
    window.addEventListener('load', measure);
  }
})();


/* ================================================================
   SERVICES PAGE — Active aside link on scroll
   Highlights the correct sidebar nav item as user scrolls
================================================================ */

(function initServicesScroll() {
  const asideLinks = document.querySelectorAll('.svc-aside-link');
  if (!asideLinks.length) return;

  const sections = ['logo', 'branding', 'print', 'web', 'social']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const onScroll = () => {
    // Default to the first section so a link is always highlighted
    let current = sections[0] ? sections[0].id : '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      // Mark as current once its top edge passes the sticky nav + a small buffer
      if (rect.top <= 140) current = sec.id;
    });
    asideLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active-link', href === current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load
})();


// =====================================================
// PRICING PAGE — Billing toggle (null-safe)
// =====================================================
(function initPricingToggle() {
  const toggle = document.getElementById("toggleBilling");
  if (!toggle) return;

  const prices = document.querySelectorAll(".price");

  toggle.addEventListener("change", () => {
    prices.forEach(p => {
      const value = toggle.checked ? p.dataset.year : p.dataset.month;
      if (value !== undefined) p.textContent = value;
    });
  });
})();


// =====================================================
// FAQ ACCORDION (null-safe — shared across pages)
// =====================================================
(function initFaq() {
  document.querySelectorAll(".faq-item button").forEach(btn => {
    btn.onclick = () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains("active");
      // Close all others first
      document.querySelectorAll(".faq-item.active").forEach(el => el.classList.remove("active"));
      if (!isOpen) item.classList.add("active");
    };
  });
})();


// =====================================================
// LEGACY scroll / fab references (null-safe guards)
// =====================================================
(function initLegacyScrollFab() {
  const scrollBtn = document.getElementById("scrollTop");
  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.classList.toggle("show", window.scrollY > 300);
    });
    scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const fab = document.getElementById("fab");
  if (fab) {
    fab.onclick = function () { this.classList.toggle("open"); };
  }
})();


// =====================================================
// LIGHTBOX (null-safe — services page only)
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const thumbs = document.querySelectorAll(".svc-block-thumb");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox-close");

  if (!lightbox || !lightboxImg || !closeBtn) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      lightboxImg.src = thumb.getAttribute("data-img");
      lightbox.style.display = "flex";
    });
  });

  closeBtn.onclick = () => (lightbox.style.display = "none");

  lightbox.onclick = (e) => {
    if (e.target === lightbox) lightbox.style.display = "none";
  };
});


/* ================================================================
   PROJECT DETAIL PAGE — script.js additions
================================================================ */

/* ----------------------------------------------------------------
   PROJECT DATA REGISTRY
   Each project has: id, title, category, tags, desc, overview,
   deliverables, tools, images[], related[]
   Images point to assets/img/portfolio/ — replace with real paths.
---------------------------------------------------------------- */
const JDEVS_PROJECTS = {
  'herolab': {
    title: 'MYKHA ENTERPRISE LTD',
    category: 'Logo Design',
    tags: ['Logo Design'],
    desc: 'A complete brand identity for HeroLab — a technology-driven startup focused on science, innovation, and performance.',
    overview: 'The goal was to create a bold, memorable logo that communicates authority, scientific precision, and forward momentum. We explored multiple concepts before landing on a geometric mark that balances strength with clarity. The final design works across all brand touchpoints — from digital screens to embroidered apparel.',
    deliverables: ['Primary Logo', 'Icon / Monogram', 'Brand Color Palette', 'Typography System', 'Usage Guidelines'],
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    images: [
      'assets/img/Logos/MYKHA ENTERPRISES LTD LOGO ASSETS/MYKHA ENTERPRISES LTD LOGO -FORGE CHARCOAL.jpg',
      'assets/img/Logos/MYKHA ENTERPRISES LTD LOGO ASSETS/MYKHA ENTERPRISES LTD LOGO - COPPER EMBER.jpg',
      'assets/img/Logos/MYKHA ENTERPRISES LTD LOGO ASSETS/MYKHA ENTERPRISES LTD LOGO- WHITE.jpg',
    ],
    related: ['velocity-logo', 'coffee-brand', 'beyond-boundaries'],
  },
  'coffee-brand': {
    title: 'Coffee Brand Identity',
    category: 'Branding · Packaging',
    tags: ['Branding', 'Packaging Design'],
    desc: 'A complete brand identity for a premium coffee label including logo, packaging, business cards, and brand guidelines.',
    overview: 'We developed an earthy yet sophisticated visual language for this specialty coffee brand. From hand-drawn logo elements to a cohesive packaging system, every detail was crafted to communicate warmth, quality, and origin story. The packaging design is print-ready and shelf-competitive.',
    deliverables: ['Logo Design', 'Packaging Design', '2 Revisions', 'Business Card', 'Brand Guidelines'],
    tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign'],
    images: [
      'assets/img/portfolio/coffee-1.jpg',
      'assets/img/portfolio/coffee-2.jpg',
      'assets/img/portfolio/coffee-3.jpg',
    ],
    related: ['beyond-boundaries', 'vortex-card', 'herolab'],
  },
  'beyond-boundaries': {
    title: 'Beyond Boundaries',
    category: 'Branding',
    tags: ['Branding'],
    desc: 'Brand identity for a lifestyle and adventure company that redefines what it means to push limits.',
    overview: 'Beyond Boundaries needed a brand that matched their fearless philosophy. We created a dynamic identity system anchored in bold typography, high-contrast color and energetic visual patterns that translate perfectly across apparel, digital and print media.',
    deliverables: ['Logo Suite', 'Brand Guidelines', 'Stationery Design', 'Social Media Kit'],
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    images: [
      'assets/img/portfolio/beyond-1.jpg',
      'assets/img/portfolio/beyond-2.jpg',
    ],
    related: ['coffee-brand', 'hermes-card', 'vortex-card'],
  },
  'vortex-card': {
    title: 'Vortex Business Card',
    category: 'Branding',
    tags: ['Branding'],
    desc: 'Premium double-sided business card for Vortex — a high-performance consulting firm.',
    overview: 'Designed to leave a lasting impression. The Vortex business card uses a stark black base, foil-ready logotype and clean typographic hierarchy. Delivered as print-ready CMYK artwork with full-bleed and safe zones specified.',
    deliverables: ['Business Card (Front & Back)', 'Print-Ready Files', 'Brand Guidelines'],
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    images: [
      'assets/img/portfolio/vortex-1.jpg',
      'assets/img/portfolio/vortex-2.jpg',
    ],
    related: ['hermes-card', 'coffee-brand', 'beyond-boundaries'],
  },
  'modern-invoice': {
    title: 'Modern Invoice',
    category: 'Print Design',
    tags: ['Print Design'],
    desc: 'A clean, professional invoice template designed for creative agencies and freelancers.',
    overview: 'A fresh take on invoicing — this template strips away the corporate stuffiness and replaces it with a crisp, white-space-heavy layout. Delivered as an editable InDesign and Word template.',
    deliverables: ['Invoice Template (InDesign)', 'Invoice Template (Word)', 'PDF Export'],
    tools: ['Adobe InDesign', 'Microsoft Word'],
    images: [
      'assets/img/portfolio/invoice-1.jpg',
      'assets/img/portfolio/invoice-2.jpg',
    ],
    related: ['real-estate-flyer', 'tech-conference', 'motivation-poster'],
  },
  'landing-page-ui': {
    title: 'Landing Page UI',
    category: 'Web Design',
    tags: ['Web Design'],
    desc: 'High-converting landing page UI design for a SaaS product launch.',
    overview: 'Designed with conversion in mind — this landing page uses strategic layout hierarchy, compelling CTAs and strong visual storytelling to guide users from awareness to action. Delivered as a Figma file ready for handoff.',
    deliverables: ['Full Landing Page Design', 'Desktop + Mobile', 'Figma Handoff File'],
    tools: ['Figma', 'Adobe Photoshop'],
    images: [
      'assets/img/portfolio/landing-1.jpg',
      'assets/img/portfolio/landing-2.jpg',
      'assets/img/portfolio/landing-3.jpg',
    ],
    related: ['tech-conference', 'nature-care', 'herolab'],
  },
  'nature-care': {
    title: 'Nature Care',
    category: 'Social Media',
    tags: ['Social Media'],
    desc: 'A set of social media graphics for a natural wellness brand — cohesive, calming, and conversion-ready.',
    overview: 'Nature Care needed a consistent visual presence across Instagram, Facebook and Pinterest. We created a template system rooted in earthy tones, organic shapes and clean typographic pairings that communicate trust and purity.',
    deliverables: ['10 Social Media Posts', 'Story Templates', 'Brand Style Guide'],
    tools: ['Adobe Photoshop', 'Canva Pro'],
    images: [
      'assets/img/portfolio/nature-1.jpg',
      'assets/img/portfolio/nature-2.jpg',
    ],
    related: ['tech-conference', 'real-estate-flyer', 'motivation-poster'],
  },
  'real-estate-flyer': {
    title: 'Real Estate Flyer',
    category: 'Print Design',
    tags: ['Print Design'],
    desc: 'Bold, eye-catching property listing flyer for a premium real estate agency.',
    overview: 'Designed to stop prospective buyers in their tracks. This flyer uses strong property photography placement, clear pricing hierarchy and a trustworthy brand feel. Print-ready at A4 and US-Letter sizes.',
    deliverables: ['A4 Flyer (Print-Ready)', 'US-Letter Version', 'Digital Version (RGB)'],
    tools: ['Adobe InDesign', 'Adobe Photoshop'],
    images: [
      'assets/img/portfolio/realestate-1.jpg',
      'assets/img/portfolio/realestate-2.jpg',
    ],
    related: ['modern-invoice', 'tech-conference', 'motivation-poster'],
  },
  'tech-conference': {
    title: 'Tech Conference',
    category: 'Print Design',
    tags: ['Print Design'],
    desc: 'Event branding and print collateral for an annual technology and innovation conference.',
    overview: 'Full suite of conference print materials — from the main event poster to attendee badges, sponsorship decks and program booklets. The design system is bold, futuristic and highly legible across large-format print.',
    deliverables: ['Event Poster (A1)', 'Badge Design', 'Program Booklet', 'Digital Assets'],
    tools: ['Adobe Illustrator', 'Adobe InDesign', 'Adobe Photoshop'],
    images: [
      'assets/img/portfolio/tech-1.jpg',
      'assets/img/portfolio/tech-2.jpg',
      'assets/img/portfolio/tech-3.jpg',
    ],
    related: ['modern-invoice', 'real-estate-flyer', 'landing-page-ui'],
  },
  'motivation-poster': {
    title: 'Motivation Poster',
    category: 'Print Design',
    tags: ['Poster Design'],
    desc: 'A bold typographic motivation poster series for gyms, offices and personal spaces.',
    overview: 'Designed to inspire at a glance. This poster series leverages dramatic typography, minimal composition and high-contrast colour to create wall-worthy pieces that feel premium without being cluttered.',
    deliverables: ['3 Poster Designs (A2)', 'Print-Ready PDF', 'Digital JPG Versions'],
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    images: [
      'assets/img/portfolio/poster-1.jpg',
      'assets/img/portfolio/poster-2.jpg',
    ],
    related: ['real-estate-flyer', 'tech-conference', 'velocity-logo'],
  },
  'velocity-logo': {
    title: 'Velocity Logo',
    category: 'Logo Design',
    tags: ['Logo Design'],
    desc: 'Dynamic logo design for Velocity — a motorsport and performance training brand.',
    overview: 'Speed. Power. Direction. The Velocity logo translates kinetic energy into a mark that works at any scale. Built on a lightning-fast wordmark and a precision geometric icon, the identity system is designed to dominate both digital and physical brand moments.',
    deliverables: ['Primary Logo', 'Alternate Lockup', 'Icon Mark', 'Brand Colors', 'Brand Guidelines'],
    tools: ['Adobe Illustrator'],
    images: [
      'assets/img/portfolio/velocity-1.jpg',
      'assets/img/portfolio/velocity-2.jpg',
      'assets/img/portfolio/velocity-3.jpg',
    ],
    related: ['herolab', 'motivation-poster', 'beyond-boundaries'],
  },
  'hermes-card': {
    title: 'Hermes Business Card',
    category: 'Branding',
    tags: ['Branding'],
    desc: 'Luxury business card design for Hermes — an executive consulting and advisory firm.',
    overview: 'Refined, minimal and unmistakably premium. The Hermes business card uses letterpress-inspired typography, a single gold accent line and a matte black base. Every element earns its space.',
    deliverables: ['Business Card (Front & Back)', 'Gold Foil Specification', 'Print-Ready Files'],
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    images: [
      'assets/img/portfolio/hermes-1.jpg',
      'assets/img/portfolio/hermes-2.jpg',
    ],
    related: ['vortex-card', 'beyond-boundaries', 'coffee-brand'],
  },
};

/* ----------------------------------------------------------------
   CAROUSEL INITIALISER
---------------------------------------------------------------- */
function initCarousel(track, dots, prevBtn, nextBtn) {
  let current = 0;
  const slides = track.querySelectorAll('.pd-carousel-slide');
  const total = slides.length;
  const counter = track.parentElement.querySelector('.pd-slide-counter');

  if (!total) return;

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('.pd-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  }

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'pd-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  });

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch / swipe support
  let startX = 0;
  track.parentElement.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.parentElement.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Set initial counter
  if (counter) counter.textContent = `1 / ${total}`;
}


/* ----------------------------------------------------------------
   PROJECT DETAIL PAGE BOOT
---------------------------------------------------------------- */
(function initProjectDetail() {
  // Only run on project-detail.html
  if (!document.getElementById('pdTitle')) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || 'herolab';
  const project = JDEVS_PROJECTS[id];

  if (!project) {
    document.getElementById('pdTitle').textContent = 'Project Not Found';
    return;
  }

  // ── Breadcrumb ──
  const breadEl = document.getElementById('pdBreadcrumbTitle');
  if (breadEl) breadEl.textContent = project.title;

  // ── Update page title ──
  document.title = `JDEVS. — ${project.title}`;

  // ── Hero fields ──
  document.getElementById('pdTitle').textContent = project.title;
  document.getElementById('pdDesc').textContent = project.desc;

  // Category tag in section-tag pill
  const catEl = document.getElementById('pdCategory');
  if (catEl) catEl.textContent = project.category;

  // Tags row
  const tagsEl = document.getElementById('pdTags');
  if (tagsEl) {
    project.tags.forEach(t => {
      const pill = document.createElement('span');
      pill.className = 'pd-tag-pill';
      pill.textContent = t;
      tagsEl.appendChild(pill);
    });
  }

  // Meta card
  const metaCat = document.getElementById('pdMetaCat');
  const metaTools = document.getElementById('pdMetaTools');
  const metaDel = document.getElementById('pdMetaDel');
  if (metaCat) metaCat.textContent = project.category;
  if (metaTools) metaTools.textContent = project.tools.join(', ');
  if (metaDel) metaDel.textContent = project.deliverables.join(', ');

  // ── Carousel slides ──
  const track = document.getElementById('pdCarouselTrack');
  if (track) {
    project.images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'pd-carousel-slide';
      slide.innerHTML = `
        <img src="${src}" alt="${project.title} — Image ${i + 1}"
             onerror="this.parentElement.innerHTML='<div class=\\'slide-placeholder\\'><i class=\\'ri-image-2-line\\'></i><span>Add your image to ${src}</span></div>'">
      `;
      track.appendChild(slide);
    });

    const dots = document.getElementById('pdDots');
    const prev = document.getElementById('pdPrev');
    const next = document.getElementById('pdNext');
    if (dots && prev && next) initCarousel(track, dots, prev, next);
  }

  // ── Overview ──
  const ovText = document.getElementById('pdOverviewText');
  if (ovText) ovText.textContent = project.overview;

  const checklist = document.getElementById('pdChecklist');
  if (checklist) {
    project.deliverables.forEach(d => {
      const item = document.createElement('div');
      item.className = 'pd-check-item';
      item.innerHTML = `<i class="ri-checkbox-circle-fill"></i><span>${d}</span>`;
      checklist.appendChild(item);
    });
  }

  // ── Tools ──
  const toolsList = document.getElementById('pdToolsList');
  if (toolsList) {
    project.tools.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'pd-tool-chip';
      chip.innerHTML = `<i class="ri-tools-line"></i>${t}`;
      toolsList.appendChild(chip);
    });
  }

  // ── Related projects ──
  const relatedGrid = document.getElementById('pdRelatedGrid');
  if (relatedGrid && project.related) {
    project.related.forEach(relId => {
      const rel = JDEVS_PROJECTS[relId];
      if (!rel) return;
      const card = document.createElement('a');
      card.className = 'pd-related-item';
      card.href = `project-detail.html?id=${relId}`;
      card.innerHTML = `
        <div class="pd-related-thumb">
          <img src="${rel.images[0]}" alt="${rel.title}"
               onerror="this.parentElement.innerHTML='<div class=\\'pd-related-thumb-placeholder\\'><i class=\\'ri-image-2-line\\'></i></div>'">
        </div>
        <div class="pd-related-info">
          <h4>${rel.title}</h4>
          <span>${rel.category}</span>
        </div>
      `;
      relatedGrid.appendChild(card);
    });
  }
})();


/* ================================================================
   ABOUT PAGE — Skill bar fill animation on scroll
================================================================ */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;

  const animateBars = () => {
    fills.forEach(fill => {
      const rect = fill.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80 && !fill.classList.contains('animated')) {
        fill.classList.add('animated');
        fill.style.width = (fill.dataset.width || 0) + '%';
      }
    });
  };

  window.addEventListener('scroll', animateBars, { passive: true });
  animateBars(); // run once on load in case already in view
})();

// JavaScript to handle sliding panel toggle 

// =====================================================
// AUTH PAGE — Sign-up / Sign-in panel toggle (null-safe)
// =====================================================
(function initAuthToggle() {
  const signUpButton = document.getElementById('signUpBtn');
  const signInButton = document.getElementById('signInBtn');
  const authContainer = document.getElementById('authContainer');
  if (!signUpButton || !signInButton || !authContainer) return;

  signUpButton.addEventListener('click', () => {
    authContainer.classList.add('right-panel-active');
  });
  signInButton.addEventListener('click', () => {
    authContainer.classList.remove('right-panel-active');
  });
})();

/* ================================================================
   DASHBOARD — Sidebar scrolls away from footer
   When the footer becomes visible the sidebar height is clamped so
   the panel never overlays the footer area.
================================================================ */
(function initSidebarFooter() {
  const sidebar = document.getElementById('dbSidebar');
  const footer  = document.getElementById('footer');
  if (!sidebar || !footer) return;

  // Match the CSS: top: 5.5rem (88px at 16px base)
  const NAV_H = parseFloat(getComputedStyle(document.documentElement).fontSize) * 5.5;

  function update() {
    // Only apply on breakpoints where the sidebar is visible and fixed
    if (window.innerWidth <= 860) {
      sidebar.style.height = '';
      return;
    }
    const footerTop = footer.getBoundingClientRect().top;
    if (footerTop < window.innerHeight) {
      // Footer is partly in view — shrink sidebar to stop just above it
      sidebar.style.height = Math.max(0, footerTop - NAV_H) + 'px';
    } else {
      sidebar.style.height = ''; // reset to CSS default
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* ================================================================
   DASHBOARD.HTML — Specific JavaScript
   Extracted from dashboard.html inline <script> block
   Guard at top prevents this from running on other pages.
================================================================ */
(function() {
  if (!document.getElementById('dbSidebar')) return; // Not on dashboard page

(function() {

  /* ── View switcher ──────────────────────────────────────────── */
  const viewMeta = {
    'overview':    { title: 'Overview',      subtitle: "Welcome back — here's what's happening with your projects." },
    'requests':    { title: 'My Requests',   subtitle: 'All your quote and design requests in one place.' },
    'new-request': { title: 'New Request',   subtitle: 'Fill in the form below to submit a new design request.' },
    'projects':    { title: 'My Projects',   subtitle: 'Track progress on all your active and past projects.' },
    'invoices':    { title: 'Invoices & Quotations', subtitle: 'View your payment history and formal quotes from JDEVS.' },
    'profile':     { title: 'My Profile',    subtitle: 'Manage your personal information and preferences.' },
    'settings':    { title: 'Settings',      subtitle: 'Customise your dashboard experience.' },
  };

  window.switchView = function(viewId) {
    // Hide all views
    document.querySelectorAll('.db-view').forEach(v => v.classList.remove('active'));
    // Show target
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.add('active');

    // Update topbar
    const meta = viewMeta[viewId] || {};
    document.getElementById('viewTitle').textContent = meta.title || viewId;
    document.getElementById('viewSubtitle').textContent = meta.subtitle || '';

    // Highlight sidebar item
    document.querySelectorAll('.db-nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.trim().toLowerCase().startsWith(meta.title?.toLowerCase()?.split(' ')[0] || '')) {
        btn.classList.add('active');
      }
    });

    // Close mobile sidebar
    document.getElementById('dbSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('open');

    // Animate progress bars when switching to overview/projects
    setTimeout(animateProgressBars, 100);
  };

  /* ── Sidebar mobile toggle ──────────────────────────────────── */
  const sidebarToggle = document.getElementById('sidebarToggle');
  const dbSidebar = document.getElementById('dbSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      dbSidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('open');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      dbSidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    });
  }

  /* ── Notification panel ─────────────────────────────────────── */
  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');

  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
        notifPanel.classList.remove('open');
      }
    });
  }

  /* ── Multi-step form ────────────────────────────────────────── */
  let currentStep = 1;
  let selectedService = '';

  window.selectService = function(el) {
    document.querySelectorAll('.db-service-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedService = el.dataset.service;
  };

  window.goStep = function(step) {
    // Hide all panels
    for (let i = 1; i <= 4; i++) {
      const panel = document.getElementById('stepPanel' + i);
      if (panel) panel.style.display = 'none';
      const stepEl = document.getElementById('step' + i);
      if (stepEl) {
        stepEl.classList.remove('active', 'done');
        if (i < step) stepEl.classList.add('done');
      }
    }

    // Show current panel
    currentStep = step;
    const panel = document.getElementById('stepPanel' + step);
    if (panel) panel.style.display = 'block';
    const stepEl = document.getElementById('step' + step);
    if (stepEl) stepEl.classList.add('active');

    // Update confirm view
    if (step === 4) {
      const confirmService = document.getElementById('confirmService');
      if (confirmService) confirmService.textContent = selectedService || 'Not selected';
      const confirmDate = document.getElementById('confirmDate');
      if (confirmDate) confirmDate.textContent = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    }
  };

  window.submitRequest = function() {
    showToast('Request Submitted!', 'Your quote request has been sent. We\'ll respond within 24–48 hours.');
    setTimeout(() => switchView('requests'), 2200);
  };

  /* ── Toast ──────────────────────────────────────────────────── */
  window.showToast = function(title, msg) {
    const toast = document.getElementById('dbToast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  };

  /* ── Requests filter ────────────────────────────────────────── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Update button styles
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
      });
      this.classList.add('btn-primary');
      this.classList.remove('btn-outline');

      const filter = this.dataset.filter;
      document.querySelectorAll('#requestsTable tbody tr').forEach(row => {
        if (filter === 'all' || row.dataset.status === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  /* ── Progress bar animation on load ────────────────────────── */
  function animateProgressBars() {
    document.querySelectorAll('.db-progress-fill').forEach(bar => {
      const target = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = target;
        });
      });
    });
  }

  // Trigger on initial load
  setTimeout(animateProgressBars, 300);

  /* ── Greeting ───────────────────────────────────────────────── */
  function updateGreeting() {
    const hour = new Date().getHours();
    const greetingEl = document.querySelector('.db-welcome-text h2');
    if (!greetingEl) return;
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';
    greetingEl.innerHTML = `${greeting}, <span class="accent">John</span> 👋`;
  }
  updateGreeting();

  /* ── Sidebar nav active state tracking ─────────────────────── */
  document.querySelectorAll('.db-nav-item').forEach((btn, idx) => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.db-nav-item').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  /* ── File drop zone visual ──────────────────────────────────── */
  const fileDrop = document.getElementById('fileDrop');
  if (fileDrop) {
    fileDrop.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDrop.style.borderColor = 'var(--clr-accent)';
      fileDrop.style.background = 'rgba(181,255,46,0.05)';
    });

    fileDrop.addEventListener('dragleave', () => {
      fileDrop.style.borderColor = '';
      fileDrop.style.background = '';
    });

    fileDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDrop.style.borderColor = 'var(--clr-accent)';
      fileDrop.innerHTML = `<i class="ri-file-check-line" style="color:var(--clr-accent);font-size:2rem;display:block;margin-bottom:0.5rem;"></i><p style="color:var(--clr-white);">${e.dataTransfer.files.length} file(s) ready</p>`;
    });
  }

})();

})();


// ── Legal Pages: TOC Active Highlight on Scroll ──────────
if (document.querySelector('.legal-section')) {
  const legalSections = document.querySelectorAll('.legal-section');
  const tocLinks     = document.querySelectorAll('.toc-list a');

  const tocObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(
          `.toc-list a[href="#${entry.target.id}"]`
        );
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-10% 0px -80% 0px' });

  legalSections.forEach(s => tocObserver.observe(s));
}

/* ================================================================
   DASHBOARD — LIGHT / DARK THEME TOGGLE
   Toggled via the switch in Settings → Dashboard Theme.
   Scoped to .db-shell only; navbar & footer stay dark.
================================================================ */

window.toggleDashboardTheme = function() {
  const shell        = document.getElementById('dbShell');
  const toggle       = document.getElementById('themeToggle');
  const label        = document.getElementById('themeSettingLabel');
  const sunIcon      = document.getElementById('themeIconSun');
  const moonIcon     = document.getElementById('themeIconMoon');
  // Sidebar sync elements
  const sidebarToggle    = document.getElementById('sidebarThemeToggle');
  const sidebarLabel     = document.getElementById('sidebarThemeLabel');
  const sidebarSunIcon   = document.getElementById('sidebarThemeIconSun');
  const sidebarMoonIcon  = document.getElementById('sidebarThemeIconMoon');

  if (!shell) return;

  shell.classList.toggle('light-mode');
  const lightActive = shell.classList.contains('light-mode');

  // Sync theme to invoice preview modal (bypasses position:fixed cascade issues)
  const invBackdrop = document.getElementById('usrInvModalBackdrop');
  if (invBackdrop) invBackdrop.classList.toggle('light-mode', lightActive);

  // Sync theme to completed-project panel (same position:fixed cascade fix)
  const cpPanel = document.getElementById('cpPanel');
  if (cpPanel) cpPanel.classList.toggle('light-mode', lightActive);

  // Sync Settings toggle knob
  if (toggle) toggle.classList.toggle('active', !lightActive);

  // Sync sidebar toggle knob
  if (sidebarToggle) sidebarToggle.classList.toggle('active', !lightActive);

  // Update Settings label
  if (label) label.textContent = lightActive ? 'Currently using Light Mode' : 'Currently using Dark Mode';

  // Update sidebar label
  if (sidebarLabel) sidebarLabel.textContent = lightActive ? 'Light Mode' : 'Dark Mode';

  // Highlight active icon — Settings
  if (sunIcon)  sunIcon.style.color  = lightActive  ? 'var(--clr-accent-dim)' : 'var(--clr-muted)';
  if (moonIcon) moonIcon.style.color = !lightActive ? 'var(--clr-accent)'     : 'var(--clr-muted)';

  // Highlight active icon — Sidebar
  if (sidebarSunIcon)  sidebarSunIcon.style.color  = lightActive  ? 'var(--clr-accent-dim)' : 'var(--clr-muted)';
  if (sidebarMoonIcon) sidebarMoonIcon.style.color = !lightActive ? 'var(--clr-accent)'     : 'var(--clr-muted)';

  // Persist preference
  try { localStorage.setItem('jdevs-db-theme', lightActive ? 'light' : 'dark'); } catch(e) {}

  // Toast feedback
  if (window.showToast) {
    const mode = lightActive ? 'Light Mode' : 'Dark Mode';
    showToast('Theme Changed', `Dashboard switched to ${mode}.`);
  }
};

/* ── Restore saved theme on page load ────────────────────────── */
(function restoreTheme() {
  const shell  = document.getElementById('dbShell');
  const toggle = document.getElementById('themeToggle');
  const label  = document.getElementById('themeSettingLabel');
  const sunIcon  = document.getElementById('themeIconSun');
  const moonIcon = document.getElementById('themeIconMoon');
  // Sidebar elements
  const sidebarToggle   = document.getElementById('sidebarThemeToggle');
  const sidebarLabel    = document.getElementById('sidebarThemeLabel');
  const sidebarSunIcon  = document.getElementById('sidebarThemeIconSun');
  const sidebarMoonIcon = document.getElementById('sidebarThemeIconMoon');

  if (!shell) return;

  let saved;
  try { saved = localStorage.getItem('jdevs-db-theme'); } catch(e) {}

  // Default is light; only switch to dark if saved preference says so
  const useDark = saved === 'dark';

  // Grab invoice modal backdrop for theme sync
  const invBackdrop = document.getElementById('usrInvModalBackdrop');

  // Grab completed-project panel for theme sync
  const cpPanel = document.getElementById('cpPanel');

  if (useDark) {
    shell.classList.remove('light-mode');
    if (invBackdrop) invBackdrop.classList.remove('light-mode');
    if (cpPanel) cpPanel.classList.remove('light-mode');
    if (toggle) toggle.classList.add('active');
    if (sidebarToggle) sidebarToggle.classList.add('active');
    if (label)  label.textContent = 'Currently using Dark Mode';
    if (sidebarLabel) sidebarLabel.textContent = 'Dark Mode';
    if (sunIcon)  sunIcon.style.color  = 'var(--clr-muted)';
    if (moonIcon) moonIcon.style.color = 'var(--clr-accent)';
    if (sidebarSunIcon)  sidebarSunIcon.style.color  = 'var(--clr-muted)';
    if (sidebarMoonIcon) sidebarMoonIcon.style.color = 'var(--clr-accent)';
  } else {
    shell.classList.add('light-mode');
    if (invBackdrop) invBackdrop.classList.add('light-mode');
    if (cpPanel) cpPanel.classList.add('light-mode');
    if (toggle) toggle.classList.remove('active');
    if (sidebarToggle) sidebarToggle.classList.remove('active');
    if (label)  label.textContent = 'Currently using Light Mode';
    if (sidebarLabel) sidebarLabel.textContent = 'Light Mode';
    if (sunIcon)  sunIcon.style.color  = 'var(--clr-accent-dim)';
    if (moonIcon) moonIcon.style.color = 'var(--clr-muted)';
    if (sidebarSunIcon)  sidebarSunIcon.style.color  = 'var(--clr-accent-dim)';
    if (sidebarMoonIcon) sidebarMoonIcon.style.color = 'var(--clr-muted)';
  }
})();


/* ================================================================
   USER DASHBOARD — INVOICES & QUOTATIONS
   Tab switcher, preview modal, accept/decline actions
================================================================ */

(function initUserInvoices() {

  /* ── Tab switching ─────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const tab = e.target.closest('.usr-inv-tab[data-tab]');
    if (!tab) return;

    document.querySelectorAll('.usr-inv-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.dataset.tab;
    document.querySelectorAll('.usr-inv-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(
      target === 'invoices' ? 'usrPanelInvoices' : 'usrPanelQuotations'
    );
    if (panel) panel.classList.add('active');
  });

  /* ── Preview modal ─────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.usr-inv-preview-btn');
    if (!btn) return;

    const ref     = btn.dataset.ref    || '—';
    const desc    = btn.dataset.desc   || '—';
    const amount  = btn.dataset.amount || '0';
    const date    = btn.dataset.date   || '—';
    const due     = btn.dataset.due    || '—';
    const status  = btn.dataset.status || 'invoice';

    const isQuotation = status.startsWith('quotation');

    // Populate modal fields
    document.getElementById('modalRef').textContent       = ref;
    document.getElementById('modalType').textContent      = isQuotation ? 'Quotation' : 'Invoice';
    document.getElementById('modalDate').textContent      = date;
    document.getElementById('modalDue').textContent       = due;
    document.getElementById('modalDueLabel').textContent  = isQuotation ? 'Valid Until / Status' : 'Due Date';
    document.getElementById('modalDesc').textContent      = desc;
    document.getElementById('modalItemAmt').textContent   = amount;
    document.getElementById('modalSubtotal').textContent  = 'KES ' + Number(amount).toLocaleString();
    document.getElementById('modalTotal').textContent     = 'KES ' + Number(amount).toLocaleString();

    // Show/hide footer action buttons
    const payBtn    = document.getElementById('usrInvPayBtn');
    const acceptBtn = document.getElementById('usrInvAcceptBtn');
    if (payBtn)    payBtn.style.display    = status === 'due' ? '' : 'none';
    if (acceptBtn) acceptBtn.style.display = status === 'quotation' ? '' : 'none';

    // Open modal — stamp current theme so CSS doesn't rely on fixed-position parent cascade
    const backdrop = document.getElementById('usrInvModalBackdrop');
    if (backdrop) {
      const shell = document.getElementById('dbShell');
      backdrop.classList.toggle('light-mode', !!(shell && shell.classList.contains('light-mode')));
      backdrop.classList.add('open');
    }
  });

  // Close modal
  document.addEventListener('click', function (e) {
    const backdrop = document.getElementById('usrInvModalBackdrop');
    if (!backdrop) return;
    if (
      e.target.closest('#usrInvModalClose') ||
      (e.target === backdrop)
    ) {
      backdrop.classList.remove('open');
    }
  });

  /* ── Download stub ─────────────────────────────────────────── */
  const dlBtn = document.getElementById('usrInvDownloadBtn');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const ref = document.getElementById('modalRef')?.textContent || 'document';
      showDashToast('Download Started', ref + ' PDF is being prepared.', 'green');
    });
  }

  /* ── Accept quotation ──────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.usr-quo-accept-btn');
    if (!btn) return;

    // Close modal if open
    document.getElementById('usrInvModalBackdrop')?.classList.remove('open');

    const row = btn.closest('.usr-quo-row');
    if (row) {
      // Update badge
      const badge = row.querySelector('.usr-quo-badge');
      if (badge) badge.classList.add('accepted');
      // Swap buttons for accepted state
      const actions = row.querySelector('.usr-inv-row-actions');
      if (actions) {
        const acceptBtn = actions.querySelector('.usr-quo-accept-btn');
        const declineBtn = actions.querySelector('.usr-quo-decline-btn');
        if (acceptBtn)  acceptBtn.remove();
        if (declineBtn) declineBtn.remove();
        // Add accepted badge
        const badge2 = document.createElement('span');
        badge2.className = 'db-status completed';
        badge2.style.marginLeft = '0.35rem';
        badge2.textContent = 'Accepted';
        actions.appendChild(badge2);
      }
    }
    showDashToast('Quotation Accepted', 'Your acceptance has been noted. JDEVS will begin work shortly.', 'green');
  });

  /* ── Decline quotation ─────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.usr-quo-decline-btn');
    if (!btn) return;

    const row = btn.closest('.usr-quo-row');
    if (row) {
      row.style.opacity = '0';
      row.style.transform = 'scale(0.97)';
      row.style.transition = 'all 0.3s ease';
      setTimeout(() => row.remove(), 300);
    }
    showDashToast('Quotation Declined', 'The quotation has been declined. Contact us if you have questions.', 'red');
  });

})();

/* ── Reusable toast for user dashboard ─────────────────────── */
function showDashToast(title, message, type) {
  const toast = document.getElementById('dbToast');
  if (!toast) return;

  const icon  = toast.querySelector('.db-toast-icon');
  const tTitle = document.getElementById('toastTitle');
  const tMsg   = document.getElementById('toastMsg');

  if (icon) {
    icon.className = type === 'green'
      ? 'ri-checkbox-circle-fill db-toast-icon'
      : 'ri-close-circle-fill db-toast-icon';
    icon.style.color = type === 'green' ? 'var(--clr-accent)' : '#FF4D4D';
  }
  if (tTitle) tTitle.textContent = title;
  if (tMsg)   tMsg.textContent   = message;

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3800);
}
