(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');
  var sticky = document.querySelector('.sticky-cta');
  var hero = document.querySelector('.hero');
  var auditSection = document.getElementById('audit');

  /* ---------- Mobile menu ---------- */
  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Header shadow + sticky mobile CTA ---------- */
  var auditVisible = false;

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    var pastHero = y > hero.offsetHeight * 0.6;
    sticky.classList.toggle('is-visible', pastHero && !auditVisible);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      auditVisible = entries[0].isIntersecting;
      onScroll();
    }, { threshold: 0.15 }).observe(auditSection);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
          return c.classList.contains('reveal');
        });
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 4) * 80 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- FAQ: one open at a time ---------- */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Lead form ---------- */
  var form = document.getElementById('lead-form');

  var rules = {
    name: function (v) { return v.length >= 2 || 'Please enter your name.'; },
    business: function (v) { return v.length >= 2 || 'Please enter your business name.'; },
    website: function (v) {
      if (!v) return true;
      return /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(v) || 'Please enter a valid website (e.g. yourbusiness.com).';
    },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Please enter a valid email address.'; },
    phone: function (v) {
      var digits = v.replace(/\D/g, '');
      if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1);
      return digits.length === 10 || 'Please enter a valid 10-digit US phone number.';
    }
  };

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var result = rule(input.value.trim());
    var field = input.closest('.field');
    var error = field.querySelector('.field__error');
    var ok = result === true;
    field.classList.toggle('is-invalid', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    error.textContent = ok ? '' : result;
    return ok;
  }

  // Format US phone numbers as the user types: (555) 123-4567
  var phone = form.querySelector('#phone');
  phone.addEventListener('input', function () {
    var d = phone.value.replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    d = d.slice(0, 10);
    var out = d;
    if (d.length > 6) out = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
    else if (d.length > 3) out = '(' + d.slice(0, 3) + ') ' + d.slice(3);
    else if (d.length > 0) out = '(' + d;
    phone.value = out;
  });

  form.querySelectorAll('input').forEach(function (input) {
    input.addEventListener('blur', function () {
      if (input.value.trim() || input.required) validateField(input);
    });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('is-invalid')) validateField(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var inputs = Array.prototype.slice.call(form.querySelectorAll('input'));
    var firstInvalid = null;
    inputs.forEach(function (input) {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    // TODO: Replace with your form endpoint / CRM integration, e.g.
    // fetch('https://your-endpoint', { method: 'POST', body: new FormData(form) })
    setTimeout(function () {
      form.classList.add('is-sent');
      var success = form.querySelector('.lead-form__success');
      success.hidden = false;
      success.setAttribute('tabindex', '-1');
      success.focus();

      // Google Ads / GA4 conversion hook (fires only if gtag is installed)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { form_id: 'free_audit' });
      }
    }, 600);
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
