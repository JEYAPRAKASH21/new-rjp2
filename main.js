/* ==========================================================================
   RJP GROUPS - Master JavaScript Engine
   Scroll Animation Scrubber | Vertical One-by-One Blocks | Springy Modals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_FRAMES = 300;
  const images = [];
  let loadedCount = 0;
  
  // Elements
  const canvas = document.getElementById('scroll-canvas');
  const heroContainer = document.getElementById('hero-scroll-container');
  const preloader = document.getElementById('preloader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');
  const scrollIndicator = document.getElementById('scroll-indicator');
  const navbar = document.getElementById('navbar');

  let currentFrame = 0;
  let targetFrame = 0;
  let lastScrollY = window.scrollY;

  function getFramePath(index) {
    const frameNum = String(index + 1).padStart(3, '0');
    return `assets/ezgif-frame-${frameNum}.jpg`;
  }

  // 1. Image Preloader & Canvas Engine
  if (canvas && heroContainer) {
    const ctx = canvas.getContext('2d');

    function preloadImages() {
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          loadedCount++;
          const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
          if (loaderBar) loaderBar.style.width = `${percent}%`;
          if (loaderText) loaderText.textContent = `Loading RJP Experience... ${percent}%`;

          if (i === 0) renderCanvasFrame(0);
          if (loadedCount === TOTAL_FRAMES) onAllImagesLoaded();
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === TOTAL_FRAMES) onAllImagesLoaded();
        };
        images.push(img);
      }
    }

    function onAllImagesLoaded() {
      setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
      }, 300);
    }

    function renderCanvasFrame(index) {
      const img = images[index];
      if (!img || !img.complete) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for performance
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Ultra-HD rendering settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;
      let renderW, renderH, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        renderW = width;
        renderH = width / imgRatio;
        offsetX = 0;
        offsetY = (height - renderH) / 2;
      } else {
        renderH = height;
        renderW = height * imgRatio;
        offsetX = (width - renderW) / 2;
        offsetY = 0;
      }

      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
      ctx.restore();
    }

    function updateScrollProgress() {
      const rect = heroContainer.getBoundingClientRect();
      const scrollableDistance = heroContainer.offsetHeight - window.innerHeight;

      let scrollFraction = -rect.top / scrollableDistance;
      scrollFraction = Math.max(0, Math.min(1, scrollFraction));

      targetFrame = Math.floor(scrollFraction * (TOTAL_FRAMES - 1));
      updateOverlayCards(scrollFraction);

      if (scrollIndicator) {
        scrollIndicator.style.opacity = scrollFraction > 0.02 ? '0' : '1';
      }

      // Auto-Hide Navbar on Scroll Down
      const currentScrollY = window.scrollY;
      if (navbar) {
        if (currentScrollY > 80 && currentScrollY > lastScrollY) {
          navbar.classList.add('nav-hidden');
        } else {
          navbar.classList.remove('nav-hidden');
        }

        if (currentScrollY > 80) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      lastScrollY = currentScrollY;
    }

    function tick() {
      currentFrame += (targetFrame - currentFrame) * 0.35;
      renderCanvasFrame(Math.round(currentFrame));
      requestAnimationFrame(tick);
    }

    function updateOverlayCards(fraction) {
      toggleCard(document.getElementById('card-construction'), fraction >= 0.04 && fraction <= 0.26);
      toggleCard(document.getElementById('card-travels'), fraction >= 0.28 && fraction <= 0.51);
      toggleCard(document.getElementById('card-csc'), fraction >= 0.54 && fraction <= 0.76);
    }

    function toggleCard(cardElement, shouldShow) {
      if (!cardElement) return;
      if (shouldShow) cardElement.classList.add('visible');
      else cardElement.classList.remove('visible');
    }

    window.addEventListener('resize', () => renderCanvasFrame(Math.round(currentFrame)));
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    updateScrollProgress();
    preloadImages();
    tick();
  }

  // 2. Intersection Observer for Vertical One-by-One Blocks
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, observerOptions);

  const animatedEls = document.querySelectorAll('.anim-block-1, .anim-block-2, .anim-block-3, .stats-ticker-container, .contact-anim-header, .contact-card-anim-1, .contact-card-anim-2, .contact-card-anim-3, .contact-form-anim, .scroll-reveal');

  animatedEls.forEach(el => {
    scrollObserver.observe(el);
    // Immediately show if already in viewport on load
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-visible');
    }
  });

  // 3. Interactive Springy Glass Popup Modal System
  function openModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(`modal-${modalId}`);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Re-trigger staggered card animations on each open
      if (modalId === 'csc') {
        document.querySelectorAll('.csc-card').forEach(card => {
          card.style.animation = 'none';
          card.offsetHeight; // reflow
          card.style.animation = '';
        });
      }
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetModal = trigger.getAttribute('data-open-modal');
      openModal(targetModal);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
    closeBtn.addEventListener('click', closeAllModals);
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // 4. Vehicles Filtering System inside Modal
  const vehicleTabs = document.querySelectorAll('[data-vehicle-tab]');
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  const vehiclesGrid = document.querySelector('.vehicles-grid');

  function filterVehicles(category) {
    // Step 1: Instantly hide ALL cards
    vehicleCards.forEach(card => {
      card.style.display = 'none';
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
    });

    // Step 2: Find matching cards
    const matching = Array.from(vehicleCards).filter(card =>
      category === 'all' || card.getAttribute('data-category') === category
    );

    // Step 3: Toggle single-col if only 1 card matches
    if (vehiclesGrid) {
      vehiclesGrid.classList.toggle('single-col', matching.length === 1);
    }

    // Step 4: Show matching cards with staggered fade-in
    matching.forEach((card, i) => {
      card.style.display = 'flex';
      setTimeout(() => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 40 + i * 60);
    });
  }

  vehicleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      vehicleTabs.forEach(t => t.classList.remove('active-green'));
      tab.classList.add('active-green');
      filterVehicles(tab.getAttribute('data-vehicle-tab'));
    });
  });

  // 5. CSC Search & Category Filtering inside Modal
  const cscSearchInput = document.getElementById('csc-search-input');
  const cscTabs = document.querySelectorAll('[data-csc-tab]');
  const cscCards = document.querySelectorAll('.csc-card');

  if (cscSearchInput) {
    cscSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      cscCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const keywords = card.getAttribute('data-keywords') || '';

        if (text.includes(query) || keywords.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  cscTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      cscTabs.forEach(t => t.classList.remove('active-purple'));
      tab.classList.add('active-purple');

      const category = tab.getAttribute('data-csc-tab');

      cscCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 6. WhatsApp Redirect Helper
  const WA_NUMBER = '917358656647';

  function openWhatsApp(message) {
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // Toast Notification
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  function showToast(msg) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }



  // Contact Form → WhatsApp
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = document.getElementById('user-name').value.trim();
      const phone   = document.getElementById('user-phone').value.trim();
      const service = document.getElementById('user-service');
      const serviceText = service.options[service.selectedIndex]?.text || 'General Inquiry';
      const message = document.getElementById('user-message').value.trim();

      const waMsg =
        `Hello RJP Groups!\n\n` +
        `*Name:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        `*Service Interested:* ${serviceText}\n` +
        `*Message:* ${message}\n\n` +
        `Please get back to me at your earliest convenience. Thank you!`;

      openWhatsApp(waMsg);
      contactForm.reset();
    });
  }

  // Construction Estimate Form → WhatsApp
  const modalConstructionForm = document.getElementById('modal-construction-form');
  if (modalConstructionForm) {
    modalConstructionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name     = document.getElementById('m-full-name').value.trim();
      const mobile   = document.getElementById('m-mobile-number').value.trim();
      const catEl    = document.getElementById('m-project-category');
      const category = catEl.options[catEl.selectedIndex]?.text || '';
      const budgetEl = document.getElementById('m-budget-range');
      const budget   = budgetEl.options[budgetEl.selectedIndex]?.text || '';
      const location = document.getElementById('m-site-location').value.trim();
      const details  = document.getElementById('m-project-requirements').value.trim();

      const waMsg =
        `Hello Muthu Construction! I would like a *Free Construction Estimate*.\n\n` +
        `*Name:* ${name}\n` +
        `*Mobile:* ${mobile}\n` +
        `*Project Type:* ${category}\n` +
        `*Budget Range:* ${budget}\n` +
        `*Site Location:* ${location}\n` +
        `*Requirements:* ${details}\n\n` +
        `Kindly provide a detailed quote. Thank you!`;

      closeAllModals();
      openWhatsApp(waMsg);
      modalConstructionForm.reset();
    });
  }

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
      });
    });
  }
});
