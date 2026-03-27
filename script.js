/* ==========================================================
   Brighton Travelers — Main JavaScript
   Handles: dark mode, scroll animations, lightbox,
   community comments, contact validation, navbar, scroll-to-top
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================
     1. LOADING SCREEN
     ========================================================== */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Trigger hero zoom-in after loader fades
      document.querySelector('.hero').classList.add('loaded');
    }, 600);
  });

  /* ==========================================================
     2. DARK / LIGHT MODE TOGGLE
     Persists preference in localStorage
     ========================================================== */
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const html = document.documentElement;

  // Restore saved theme
  const savedTheme = localStorage.getItem('bt-theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  themeLabel.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('bt-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    themeLabel.textContent = next === 'dark' ? 'Light Mode' : 'Dark Mode';
  });

  /* ==========================================================
     3. STICKY NAVBAR — add background on scroll
     ========================================================== */
  const navbar = document.getElementById('navbar');
  const handleNavScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load

  /* ==========================================================
     4. MOBILE HAMBURGER MENU
     ========================================================== */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* ==========================================================
     5. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
     ========================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ==========================================================
     6. GALLERY LIGHTBOX
     ========================================================== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const fullSrc = item.getAttribute('data-full');
      if (fullSrc) {
        lightboxImg.src = fullSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent bg scroll
      }
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ==========================================================
     7. COMMUNITY COMMENTS (localStorage + placeholder posts)
     ========================================================== */
  const commentForm = document.getElementById('commentForm');
  const commentsList = document.getElementById('commentsList');
  const noComments = document.getElementById('noComments');

  // Placeholder community posts
  const placeholderPosts = [
    { name: 'Sarah M', rating: 5, message: 'The Lanes are absolutely magical — lost 3 hours in there! So many hidden gems and independent shops.', time: '15 Mar 2026' },
    { name: 'James R', rating: 4, message: 'Brighton Pride was the best weekend of my life. The energy and love in this city is incredible.', time: '12 Mar 2026' },
    { name: 'Emily T', rating: 5, message: 'The Royal Pavilion blew my mind. The interior is even more stunning than the outside!', time: '8 Mar 2026' },
    { name: 'David K', rating: 4, message: 'Fish and chips on the seafront at sunset — does it get better than that? Brighton is the perfect day trip from London.', time: '3 Mar 2026' },
    { name: 'Priya S', rating: 5, message: 'Terre à Terre is hands down the best vegetarian restaurant I\'ve ever been to. Brighton\'s food scene is world class.', time: '28 Feb 2026' }
  ];

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const renderComment = (c) => {
    const card = document.createElement('div');
    card.className = 'comment-card';
    card.innerHTML = `
      <div class="comment-header">
        <div class="comment-avatar">${getInitials(c.name)}</div>
        <div class="comment-meta">
          <strong>${escapeHtml(c.name)}</strong>
          <small>${c.time}</small>
        </div>
      </div>
      <div class="comment-stars">${renderStars(c.rating || 0)}</div>
      <p>${escapeHtml(c.message)}</p>
    `;
    return card;
  };

  // Load saved + placeholder comments on startup
  const loadComments = () => {
    const saved = JSON.parse(localStorage.getItem('bt-comments') || '[]');
    const allComments = [...saved, ...placeholderPosts];
    // Remove all existing comment cards
    commentsList.querySelectorAll('.comment-card').forEach(el => el.remove());

    if (allComments.length === 0) {
      noComments.style.display = 'block';
      return;
    }
    noComments.style.display = 'none';

    allComments.forEach(c => commentsList.appendChild(renderComment(c)));
  };

  loadComments();

  // Star rating interaction
  const starRating = document.getElementById('starRating');
  const ratingInput = document.getElementById('commentRating');
  if (starRating) {
    starRating.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.getAttribute('data-value'));
        ratingInput.value = val;
        starRating.querySelectorAll('.star').forEach((s, i) => {
          s.textContent = i < val ? '★' : '☆';
          s.classList.toggle('active', i < val);
        });
      });
    });
  }

  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('commentName').value.trim();
    const message = document.getElementById('commentMessage').value.trim();
    const rating = parseInt(ratingInput?.value || '0');
    if (!name || !message) return;

    const comments = JSON.parse(localStorage.getItem('bt-comments') || '[]');
    comments.unshift({
      name,
      message,
      rating,
      time: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    localStorage.setItem('bt-comments', JSON.stringify(comments));

    commentForm.reset();
    if (ratingInput) ratingInput.value = '0';
    if (starRating) starRating.querySelectorAll('.star').forEach(s => { s.textContent = '☆'; s.classList.remove('active'); });
    loadComments();

    // Show thank you toast
    const toast = document.getElementById('successToast');
    toast.textContent = '🎉 Thanks for your review!';
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); toast.textContent = '✅ Message sent successfully!'; }, 3500);
  });

  /* ==========================================================
     7b. EVENT CATEGORY FILTERS
     ========================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const eventItems = document.querySelectorAll('.timeline-item[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      eventItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });


  /* ==========================================================
     9. PROMOTION ENQUIRY FORM — validate + send via Formsubmit.co
     ========================================================== */
  const promoForm = document.getElementById('promoForm');

  promoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const emailRegex2 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const pName = document.getElementById('promoName');
    const pEmail = document.getElementById('promoEmail');
    const pMsg = document.getElementById('promoMsg');
    const pWeb = document.getElementById('promoWebsite');

    // Business name
    if (!pName.value.trim()) {
      pName.classList.add('error');
      document.getElementById('promoNameError').classList.add('show');
      valid = false;
    } else {
      pName.classList.remove('error');
      document.getElementById('promoNameError').classList.remove('show');
    }

    // Email
    if (!emailRegex2.test(pEmail.value.trim())) {
      pEmail.classList.add('error');
      document.getElementById('promoEmailError').classList.add('show');
      valid = false;
    } else {
      pEmail.classList.remove('error');
      document.getElementById('promoEmailError').classList.remove('show');
    }

    // Message
    if (!pMsg.value.trim()) {
      pMsg.classList.add('error');
      document.getElementById('promoMsgError').classList.add('show');
      valid = false;
    } else {
      pMsg.classList.remove('error');
      document.getElementById('promoMsgError').classList.remove('show');
    }

    if (valid) {
      // Send via Formsubmit.co
      const formData = new FormData();
      formData.append('Business Name', pName.value.trim());
      formData.append('Contact Email', pEmail.value.trim());
      formData.append('Website / Instagram', pWeb.value.trim() || 'N/A');
      formData.append('message', pMsg.value.trim());
      formData.append('_subject', `Business Enquiry from ${pName.value.trim()} — Brighton Travelers`);
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');

      fetch('https://formsubmit.co/ajax/brighton.travelers@gmail.com', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(() => {
          const promoToast = document.getElementById('successToast');
          promoToast.textContent = '🚀 Enquiry sent! We\'ll be in touch soon.';
          promoToast.classList.add('show');
          setTimeout(() => {
            promoToast.classList.remove('show');
            promoToast.textContent = '✅ Message sent successfully!';
          }, 3500);
          promoForm.reset();
        })
        .catch(() => {
          const promoToast = document.getElementById('successToast');
          promoToast.textContent = '❌ Something went wrong. Please try again.';
          promoToast.classList.add('show');
          setTimeout(() => promoToast.classList.remove('show'), 3500);
        });
    }
  });

  // Remove error styling on input — promo form
  ['promoName', 'promoEmail', 'promoMsg'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () {
      this.classList.remove('error');
      const errEl = this.parentElement.querySelector('.error-msg');
      if (errEl) errEl.classList.remove('show');
    });
  });

  /* ==========================================================
     10. SCROLL-TO-TOP BUTTON
     ========================================================== */
  const scrollTopBtn = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ==========================================================
     UTILITY: Escape HTML to prevent XSS in community comments
     ========================================================== */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});
