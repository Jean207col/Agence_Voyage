
/* ===========================
   AGENCE VOYAGE — script.js
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------
     NAV — scroll effect + burger
  -------------------------------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const links = document.querySelector('.nav__links');
    const isOpen = links.style.display === 'flex';
    links.style.display = isOpen ? '' : 'flex';
    if (!isOpen) {
      Object.assign(links.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        background: 'rgba(26,22,16,0.98)',
        height: '100vh',
        zIndex: '99'
      });
    } else {
      links.removeAttribute('style');
    }
  });

  /* Close mobile menu on link click */
  document.querySelectorAll('.nav__links a').forEach(link => {
    link.addEventListener('click', () => {
      const links = document.querySelector('.nav__links');
      links.removeAttribute('style');
    });
  });


  /* --------------------------------
     SCROLL REVEAL
  -------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.section__header, .dest-card, .service-card, .about__image-col, .about__text-col, .testimonial-card, .strip__item'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.index
          ? parseInt(entry.target.dataset.index) * 80
          : 0;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));


  /* --------------------------------
     TESTIMONIALS — dot navigation
  -------------------------------- */
  const track = document.getElementById('testimonialsTrack');
  const dots = document.querySelectorAll('.dot');

  if (track && dots.length) {
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.dataset.index);
        const cardWidth = track.querySelector('.testimonial-card').offsetWidth + 24;
        track.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
        dots.forEach(d => d.classList.remove('dot--active'));
        dot.classList.add('dot--active');
      });
    });

    /* Sync dots on manual scroll */
    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const cardWidth = track.querySelector('.testimonial-card').offsetWidth + 24;
        const index = Math.round(track.scrollLeft / cardWidth);
        dots.forEach((d, i) => d.classList.toggle('dot--active', i === index));
      }, 80);
    }, { passive: true });

    /* Auto-advance on desktop */
    if (window.innerWidth > 768) {
      let autoIndex = 0;
      setInterval(() => {
        autoIndex = (autoIndex + 1) % dots.length;
        dots[autoIndex].click();
      }, 5000);
    }
  }


  /* --------------------------------
     HERO SLIDER DYNAMIQUE
  -------------------------------- */
  class HeroSlider {
    constructor() {
      this.slider = document.getElementById('heroSlider');
      this.slides = document.querySelectorAll('.hero__slide');
      this.dots = document.querySelectorAll('.hero__dot');
      this.currentIndex = 0;
      this.autoplayInterval = null;
      this.slideDuration = 5000; // 5 secondes par slide
      this.isTransitioning = false;
      
      if (this.slider && this.slides.length > 0) {
        this.init();
      }
    }
    
    init() {
      // Précharger toutes les images
      this.preloadImages();
      
      // Initialiser la première slide
      this.showSlide(0);
      
      // Démarrer l'autoplay
      this.startAutoplay();
      
      // Ajouter les écouteurs d'événements
      this.setupEventListeners();
      
      // Mettre en pause l'autoplay au survol
      this.setupPauseOnHover();
    }
    
    preloadImages() {
      const imageUrls = [
        'images/image1.png',
        'images/image2.jpeg',
        'images/image3.jpeg',
        'images/image4.jpeg',
        'images/image5.jpeg',
        'images/image7.jpeg',
        'images/image8.jpeg',
        'images/image9.jpeg',
        'images/image10.jpeg'
      ];
      
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    }
    
    setupEventListeners() {
      // Navigation par dots
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          if (!this.isTransitioning) {
            this.goToSlide(index);
            this.restartAutoplay();
          }
        });
      });
      
      // Navigation clavier
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !this.isTransitioning) {
          this.previousSlide();
          this.restartAutoplay();
        } else if (e.key === 'ArrowRight' && !this.isTransitioning) {
          this.nextSlide();
          this.restartAutoplay();
        }
      });
      
      // Touch/swipe support pour mobile
      this.setupTouchSupport();
    }
    
    setupTouchSupport() {
      let touchStartX = 0;
      let touchEndX = 0;
      
      this.slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      this.slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX);
      }, { passive: true });
    }
    
    handleSwipe(startX, endX) {
      const swipeThreshold = 50;
      const diff = startX - endX;
      
      if (Math.abs(diff) > swipeThreshold && !this.isTransitioning) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.previousSlide();
        }
        this.restartAutoplay();
      }
    }
    
    setupPauseOnHover() {
      this.slider.addEventListener('mouseenter', () => {
        this.pauseAutoplay();
      });
      
      this.slider.addEventListener('mouseleave', () => {
        this.startAutoplay();
      });
    }
    
    showSlide(index) {
      if (index < 0 || index >= this.slides.length) return;
      
      this.isTransitioning = true;
      
      // Masquer la slide actuelle
      this.slides[this.currentIndex].classList.remove('hero__slide--active');
      this.dots[this.currentIndex].classList.remove('hero__dot--active');
      
      // Afficher la nouvelle slide
      this.currentIndex = index;
      this.slides[this.currentIndex].classList.add('hero__slide--active');
      this.dots[this.currentIndex].classList.add('hero__dot--active');
      
      // Réinitialiser l'animation Ken Burns
      const slideBg = this.slides[this.currentIndex].querySelector('.hero__slide-bg');
      if (slideBg) {
        slideBg.style.animation = 'none';
        slideBg.offsetHeight; // Force reflow
        slideBg.style.animation = '';
      }
      
      // Fin de la transition
      setTimeout(() => {
        this.isTransitioning = false;
      }, 1200);
    }
    
    nextSlide() {
      const nextIndex = (this.currentIndex + 1) % this.slides.length;
      this.showSlide(nextIndex);
    }
    
    previousSlide() {
      const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
      this.showSlide(prevIndex);
    }
    
    goToSlide(index) {
      this.showSlide(index);
    }
    
    startAutoplay() {
      this.stopAutoplay();
      this.autoplayInterval = setInterval(() => {
        this.nextSlide();
      }, this.slideDuration);
    }
    
    pauseAutoplay() {
      this.stopAutoplay();
    }
    
    stopAutoplay() {
      if (this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    }
    
    restartAutoplay() {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }
  
  // Initialiser le slider
  const heroSlider = new HeroSlider();
  
  /* --------------------------------
     HERO parallax (maintenu pour compatibilité)
  -------------------------------- */
  const heroBg = document.getElementById('heroBg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.35}px)`;
    }, { passive: true });
  }


  /* --------------------------------
     CONTACT FORM
  -------------------------------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!name || !email) {
        formNote.textContent = 'Veuillez renseigner votre nom et email.';
        formNote.style.color = '#e07070';
        return;
      }

      /* Simulate sending */
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(() => {
        formNote.textContent = `Merci ${name} — notre équipe vous contactera sous 24h.`;
        formNote.style.color = '';
        form.reset();
        btn.textContent = 'Envoyer ma demande';
        btn.disabled = false;
        btn.style.opacity = '';
      }, 1600);
    });
  }


  /* --------------------------------
     SMOOTH ANCHOR OFFSET (fixed nav)
  -------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 20;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});