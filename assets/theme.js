/* ============================================================
   Damon — theme.js
   Vanilla JS, no framework, no build step.
   Pattern: each behavior is its own IIFE that finds elements
   by data-* attributes documented in design-system/components.md.
   ============================================================ */

(function () {
  'use strict';

  // ---------------------------------------------- Easter egg: binary search → "Damon Intelligence" logo
  // Trigger: any search input value matching ^[01]{10,}$.
  // Ephemeral by design — refresh or navigation resets the logo.
  var intelTriggered = false;

  function isBinaryQuery(s) {
    if (!s) return false;
    var v = String(s).trim();
    return v.length >= 10 && /^[01]+$/.test(v);
  }

  function applyIntelLogo() {
    if (intelTriggered) return;
    intelTriggered = true;
    document.querySelectorAll('[data-logo]').forEach(function (el) {
      el.classList.add('is-intel');
    });
    if (window.DamonToast) {
      window.DamonToast('Damon Intelligence unlocked', {
        sub: 'You found the binary easter egg.',
        duration: 5000
      });
    }
  }

  // Live trigger from typing in any search field
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.matches) return;
    if (!t.matches('input[type="search"], input[name="q"]')) return;
    if (intelTriggered) return;
    if (isBinaryQuery(t.value)) applyIntelLogo();
  });

  // ---------------------------------------------- Easter egg: bee swarm 🐝
  // Double-click a variant tile to release a swarm. Bees have randomized
  // trajectories, scale curves, and a wing flutter. Auto-cleanup.
  function beeSvg() {
    return ''
      + '<svg viewBox="0 0 32 22" xmlns="http://www.w3.org/2000/svg">'
      +   '<ellipse class="damon-bee__wing" cx="13" cy="7" rx="5" ry="4" fill="rgba(255,255,255,0.78)" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"/>'
      +   '<ellipse class="damon-bee__wing damon-bee__wing--r" cx="20" cy="7" rx="5" ry="4" fill="rgba(255,255,255,0.78)" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"/>'
      +   '<ellipse cx="16" cy="14" rx="9" ry="6" fill="#FBBF24"/>'
      +   '<rect x="11" y="9.5" width="2.6" height="8" fill="#1F2937"/>'
      +   '<rect x="17" y="9.5" width="2.6" height="8" fill="#1F2937"/>'
      +   '<circle cx="8" cy="14" r="3" fill="#1F2937"/>'
      +   '<circle cx="7.4" cy="13" r="0.7" fill="#fff"/>'
      +   '<path d="M25 14 l2.5 0 l-2 1.5 z" fill="#1F2937"/>'
      + '</svg>';
  }

  function spawnBees(originRect, count) {
    var cx = originRect.left + originRect.width / 2;
    var cy = originRect.top + originRect.height / 2;
    var vw = window.innerWidth, vh = window.innerHeight;

    function rand(a, b) { return a + Math.random() * (b - a); }

    for (var i = 0; i < count; i++) {
      // Stagger emergence — bees come out one by one, not all at once.
      var emergeDelay = i * rand(60, 140);

      (function (idx) {
        setTimeout(function () {
          var bee = document.createElement('div');
          bee.className = 'damon-bee';
          bee.innerHTML = beeSvg();

          // Bees vary in size — close ones bigger, far ones smaller. Adds depth.
          var depthScale = rand(0.7, 1.25);

          // Start somewhere just inside the variant tile
          var sx = cx + (Math.random() - 0.5) * Math.min(originRect.width, 50);
          var sy = cy + (Math.random() - 0.5) * Math.min(originRect.height, 24);

          // Each bee picks a wandering direction — biased upward and outward.
          var angle = (Math.random() - 0.5) * Math.PI * 0.9;
          var distance = Math.max(vw, vh) * rand(1.05, 1.55);
          var ex = sx + Math.sin(angle) * distance;
          var ey = sy - Math.abs(Math.cos(angle)) * distance * 0.85;

          // Five intermediate waypoints with curving wanders. Each wobbles
          // perpendicular to the flight path, giving a real "drifting" feel.
          var perpX =  Math.cos(angle);
          var perpY = -Math.sin(angle);
          function waypoint(t, wobble) {
            var px = sx + (ex - sx) * t;
            var py = sy + (ey - sy) * t;
            return {
              x: px + perpX * wobble,
              y: py + perpY * wobble
            };
          }
          var w1 = waypoint(0.18, rand(-30, 30));   // hovering hesitation just past the button
          var w2 = waypoint(0.36, rand(-80, 80));   // wandering left/right
          var w3 = waypoint(0.55, rand(-110, 110)); // bigger drift
          var w4 = waypoint(0.78, rand(-90, 90));   // settling into trajectory
          var rotEnd = (Math.random() - 0.5) * 360;
          var duration = rand(3200, 5400);

          bee.style.left = '0';
          bee.style.top  = '0';
          bee.style.transform = 'translate(' + sx + 'px, ' + sy + 'px) scale(0.1)';
          document.body.appendChild(bee);

          bee.animate([
            { transform: 'translate(' + sx + 'px, '   + sy + 'px) rotate(0deg) scale(0.1)',                                opacity: 0,    offset: 0 },
            { transform: 'translate(' + sx + 'px, '   + sy + 'px) rotate(' + (rotEnd * 0.03) + 'deg) scale(' + depthScale + ')',  opacity: 1, offset: 0.05 },
            { transform: 'translate(' + w1.x + 'px, ' + w1.y + 'px) rotate(' + (rotEnd * 0.12) + 'deg) scale(' + depthScale + ')', opacity: 1, offset: 0.18 },
            { transform: 'translate(' + w2.x + 'px, ' + w2.y + 'px) rotate(' + (rotEnd * 0.32) + 'deg) scale(' + depthScale + ')', opacity: 1, offset: 0.36 },
            { transform: 'translate(' + w3.x + 'px, ' + w3.y + 'px) rotate(' + (rotEnd * 0.55) + 'deg) scale(' + (depthScale * 0.96) + ')', opacity: 1, offset: 0.55 },
            { transform: 'translate(' + w4.x + 'px, ' + w4.y + 'px) rotate(' + (rotEnd * 0.78) + 'deg) scale(' + (depthScale * 0.85) + ')', opacity: 0.92, offset: 0.78 },
            { transform: 'translate(' + ex + 'px, '   + ey + 'px) rotate(' + rotEnd + 'deg) scale(' + (depthScale * 0.5) + ')',     opacity: 0, offset: 1 }
          ], { duration: duration, easing: 'cubic-bezier(0.32, 0.04, 0.5, 1)', fill: 'forwards' });

          setTimeout(function () { bee.remove(); }, duration + 120);
        }, emergeDelay);
      })(i);
    }
  }
  // Expose so other components can also summon them
  window.DamonBees = spawnBees;

  document.addEventListener('dblclick', function (e) {
    var tile = e.target.closest('[data-variant-tile]');
    if (!tile) return;
    // Don't fire if user prefers reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    var rect = tile.getBoundingClientRect();
    var count = 9 + Math.floor(Math.random() * 4); // 9–12 bees
    spawnBees(rect, count);
  });

  // ---------------------------------------------- Toasts
  function showToast(message, options) {
    options = options || {};
    var host = document.querySelector('[data-toasts]');
    if (!host) return;
    var t = document.createElement('div');
    t.className = 'toast' + (options.variant ? ' toast--' + options.variant : '');
    var iconChar = options.variant === 'error' ? '!' : '✓';
    var sub = options.sub ? '<span>' + options.sub + '</span>' : '';
    var actionBtn = options.action ? '<button type="button" class="toast__action">' + options.action.label + '</button>' : '';
    t.innerHTML = '<span class="toast__icon" aria-hidden="true">' + iconChar + '</span>'
                + '<div class="toast__msg"><b>' + message + '</b>' + sub + '</div>'
                + actionBtn;
    host.appendChild(t);
    if (options.action && options.action.onClick) {
      t.querySelector('.toast__action').addEventListener('click', options.action.onClick);
    }
    requestAnimationFrame(function () { t.classList.add('is-on'); });
    var timeout = setTimeout(dismiss, options.duration || 4000);
    function dismiss() {
      clearTimeout(timeout);
      t.classList.add('is-leaving');
      t.classList.remove('is-on');
      setTimeout(function () { t.remove(); }, 320);
    }
    t.addEventListener('click', function (e) {
      if (!e.target.closest('.toast__action')) dismiss();
    });
  }
  window.DamonToast = showToast;

  // ---------------------------------------------- Cart count
  function updateCartCount() {
    fetch('/cart.js', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
        });
      })
      .catch(function () { /* fail quietly */ });
  }

  document.addEventListener('DOMContentLoaded', updateCartCount);

  // ---------------------------------------------- Add to cart
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('[data-add-to-cart-form]')) return;
    e.preventDefault();

    // Defense-in-depth: if the submit button is disabled (OOS / locked /
    // any other can't-purchase state), don't even send the request. The
    // disabled attr should already block native form submission, but a
    // dispatched submit event or future JS picker could bypass that — so
    // we also guard here.
    var submitBtn = form.querySelector('[type=submit]');
    if (submitBtn && submitBtn.disabled) return;

    var formData = new FormData(form);
    fetch('/cart/add.js', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    })
      .then(function (r) {
        if (!r.ok) throw new Error('Add to cart failed');
        return r.json();
      })
      .then(function () {
        updateCartCount();
        document.dispatchEvent(new CustomEvent('cart:added', { detail: { form: form } }));
      })
      .catch(function () { form.submit(); });
  });

  // ---------------------------------------------- Quick add from product cards
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-quick-add]');
    if (!btn || btn.disabled) return; // disabled = OOS or locked (defense-in-depth)
    e.preventDefault();
    e.stopPropagation();
    var variantId = btn.getAttribute('data-quick-add');
    if (!variantId) return;

    // Optional data-qty override (e.g. My Products "Reorder" button
    // sends the previously-ordered quantity). Defaults to 1 for
    // ordinary product-card quick-add.
    var qty = parseInt(btn.getAttribute('data-qty') || '1', 10);
    if (isNaN(qty) || qty < 1) qty = 1;

    var origLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Adding…';

    fetch('/cart/add.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: parseInt(variantId, 10), quantity: qty })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('add-failed');
        return r.json();
      })
      .then(function (item) {
        updateCartCount();
        var card = btn.closest('.product-card');
        var title = card ? (card.querySelector('.product-card__title') || {}).textContent : item.product_title;
        showToast('Added to cart', {
          sub: title ? title.trim() : '',
          action: {
            label: 'View cart',
            onClick: function () { document.dispatchEvent(new CustomEvent('cart:open')); }
          }
        });
      })
      .catch(function () {
        showToast('Could not add to cart', { variant: 'error', sub: 'Try again or open the product page.' });
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = origLabel;
      });
  });

  // ---------------------------------------------- Mobile nav toggle
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-nav-toggle]');
    if (!trigger) return;
    var nav = document.querySelector('[data-mobile-nav]');
    if (!nav) return;
    var isOpen = nav.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
    nav.setAttribute('aria-hidden', String(!isOpen));
  });

  // ---------------------------------------------- Predictive search
  function initPredictiveSearch() {
    var form  = document.querySelector('[data-predictive-search]');
    if (!form) return;
    var input = form.querySelector('[data-predictive-input]');
    var panel = form.querySelector('[data-predictive-results]');
    if (!input || !panel) return;

    var debounceTimer;
    var lastQ = '';
    // Prefix shown before the price when a product has variants at different
    // prices (e.g. "Starting at $4.99"). Set by Liquid from theme settings;
    // blank string means "don't show a prefix, just show price_min".
    var rangePrefix = (form.getAttribute('data-price-range-prefix') || '').trim();

    function close() { panel.hidden = true; panel.innerHTML = ''; }

    function escapeHtml(s) {
      return String(s || '').replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    // /search/suggest.json returns price as a raw decimal string (e.g. "1.57"
    // in dollars) — format it with the shop's active currency. Falls back to
    // USD if Shopify's currency global isn't available (rare).
    function formatPrice(value) {
      if (value == null || value === '') return '';
      var str = String(value).trim();
      // Already-formatted prices (start with a currency symbol) pass through.
      if (/^[^\d.\-]/.test(str)) return str;
      var num = parseFloat(str);
      if (isNaN(num)) return '';
      var currency = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD';
      try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(num);
      } catch (e) {
        return '$' + num.toFixed(2);
      }
    }

    function render(products, q) {
      if (!products.length) {
        panel.innerHTML = '<div class="predictive__empty">No products match "' + escapeHtml(q) + '". <a href="/search?q=' + encodeURIComponent(q) + '" style="color:var(--red);font-weight:700;">Search anyway →</a></div>';
        panel.hidden = false;
        return;
      }
      var html = '<div class="predictive__head">Products</div>';
      products.forEach(function (p) {
        var img = p.featured_image && p.featured_image.url
          ? '<img src="' + p.featured_image.url + '&width=96" alt="">'
          : '';
        // Detect variable-price products from /suggest.json. The API exposes
        // price_min/price_max as decimal strings — compare as numbers because
        // string compare ("9.00" vs "10.00") would lie.
        var priceMin = parseFloat(p.price_min);
        var priceMax = parseFloat(p.price_max);
        var varies = !isNaN(priceMin) && !isNaN(priceMax) && priceMin !== priceMax;
        var displayPrice = varies ? formatPrice(p.price_min) : formatPrice(p.price);
        var prefixHtml = (varies && rangePrefix)
          ? '<span class="predictive__item-price-prefix">' + escapeHtml(rangePrefix) + '</span>'
          : '';
        html += '<a href="' + p.url + '" class="predictive__item">'
              +   '<span class="predictive__item-img">' + img + '</span>'
              +   '<span><span class="predictive__item-title">' + escapeHtml(p.title) + '</span>'
              +   (p.product_type ? '<span class="predictive__item-cat">' + escapeHtml(p.product_type) + '</span>' : '')
              +   '</span>'
              +   '<span class="predictive__item-price">' + prefixHtml + displayPrice + '</span>'
              + '</a>';
      });
      html += '<a class="predictive__view-all" href="/search?q=' + encodeURIComponent(q) + '">See all results →</a>';
      panel.innerHTML = html;
      panel.hidden = false;
    }

    function fetchSuggest(q) {
      lastQ = q;
      panel.hidden = false;
      panel.innerHTML = '<div class="predictive__loading">Searching…</div>';
      var url = '/search/suggest.json?q=' + encodeURIComponent(q)
              + '&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last';
      fetch(url, { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (q !== lastQ) return; // stale
          var products = (data.resources && data.resources.results && data.resources.results.products) || [];
          render(products, q);
        })
        .catch(function () { close(); });
    }

    input.addEventListener('input', function () {
      var q = (input.value || '').trim();
      clearTimeout(debounceTimer);
      if (q.length < 2) { close(); return; }
      debounceTimer = setTimeout(function () { fetchSuggest(q); }, 200);
    });
    input.addEventListener('focus', function () {
      if ((input.value || '').trim().length >= 2 && panel.innerHTML) panel.hidden = false;
    });

    document.addEventListener('click', function (e) {
      if (!form.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }
  document.addEventListener('DOMContentLoaded', initPredictiveSearch);

  // ---------------------------------------------- Generic modal (sample request, etc.)
  function openModal(selector, context) {
    var modal = document.querySelector(selector);
    if (!modal) return;
    if (context && selector === '[data-sample-modal]') {
      var prodInput = modal.querySelector('[data-sample-product]');
      var urlInput  = modal.querySelector('[data-sample-url]');
      if (prodInput) prodInput.value = context.title || '';
      if (urlInput)  urlInput.value  = context.url || window.location.href;
      // Update size labels (modal title + body copy) to match the product's
      // damon.sample_size metafield, passed in via data-sample-size on the trigger.
      if (context.size) {
        modal.querySelectorAll('[data-sample-size-label]').forEach(function (el) {
          el.textContent = context.size;
        });
      }
    }
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    setTimeout(function () {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }, 260);
  }
  document.addEventListener('click', function (e) {
    var trig = e.target.closest('[data-sample-trigger]');
    if (trig) {
      e.preventDefault();
      openModal('[data-sample-modal]', {
        title: trig.getAttribute('data-product-title') || document.title,
        size:  trig.getAttribute('data-sample-size') || '',
        url:   window.location.href
      });
      return;
    }
    var closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      var modal = closeBtn.closest('.modal');
      if (modal) closeModal(modal);
      return;
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.is-open').forEach(closeModal);
    }
  });

  // ---------------------------------------------- Image lightbox
  function openLightbox(src, alt) {
    var box = document.querySelector('[data-lightbox]');
    var img = document.querySelector('[data-lightbox-img]');
    if (!box || !img) return;
    img.src = src;
    img.alt = alt || '';
    box.hidden = false;
    box.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { box.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    var box = document.querySelector('[data-lightbox]');
    if (!box) return;
    box.classList.remove('is-open');
    setTimeout(function () {
      box.hidden = true;
      box.setAttribute('aria-hidden', 'true');
      var img = document.querySelector('[data-lightbox-img]');
      if (img) img.src = '';
      document.body.style.overflow = '';
    }, 220);
  }
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.pdp__main img');
    if (trigger) {
      e.preventDefault();
      // Use a larger size if Shopify CDN URL — bump width param to 2000
      var src = trigger.currentSrc || trigger.src;
      var bigger = src.replace(/(\?|&)width=\d+/, '$1width=2000');
      if (bigger === src && /\?/.test(src)) bigger = src + '&width=2000';
      else if (bigger === src) bigger = src + '?width=2000';
      openLightbox(bigger, trigger.alt);
      return;
    }
    if (e.target.closest('[data-lightbox-close]')) { closeLightbox(); return; }
    var lightbox = e.target.closest('[data-lightbox]');
    if (lightbox && e.target === lightbox) { closeLightbox(); return; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var box = document.querySelector('[data-lightbox]');
      if (box && !box.hidden) closeLightbox();
    }
  });

  // ---------------------------------------------- Sticky condensed header
  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var threshold = 60;
    var scrolled = false;
    function update() {
      var s = window.scrollY > threshold;
      if (s !== scrolled) {
        scrolled = s;
        header.classList.toggle('is-scrolled', s);
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
  document.addEventListener('DOMContentLoaded', initStickyHeader);

  // ---------------------------------------------- Facet filters auto-submit + mobile drawer
  function isMobileViewport() { return window.matchMedia('(max-width: 1100px)').matches; }

  function initFacets() {
    document.querySelectorAll('[data-facets-form]').forEach(function (form) {
      var debounceTimer;
      form.addEventListener('change', function (e) {
        if (e.target.matches('input[type="checkbox"]') && !isMobileViewport()) {
          form.submit();
        }
      });
      form.addEventListener('input', function (e) {
        if (e.target.matches('input[type="number"]') && !isMobileViewport()) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(function () { form.submit(); }, 700);
        }
      });
    });
    // Sort dropdown auto-submit
    document.querySelectorAll('[data-sort-form] [data-sort-select]').forEach(function (sel) {
      sel.addEventListener('change', function () { sel.form.submit(); });
    });

    // Mobile drawer open/close
    var facets = document.querySelector('[data-facets]');
    var backdrop = document.querySelector('.facets__backdrop');
    function openFilters() {
      if (!facets) return;
      if (backdrop) { backdrop.hidden = false; requestAnimationFrame(function () { backdrop.classList.add('is-open'); }); }
      facets.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeFilters() {
      if (!facets) return;
      facets.classList.remove('is-open');
      if (backdrop) {
        backdrop.classList.remove('is-open');
        setTimeout(function () { backdrop.hidden = true; }, 280);
      }
      document.body.style.overflow = '';
    }
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-filter-open]')) { e.preventDefault(); openFilters(); }
      else if (e.target.closest('[data-filter-close]')) { e.preventDefault(); closeFilters(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && facets && facets.classList.contains('is-open')) closeFilters();
    });
  }
  document.addEventListener('DOMContentLoaded', initFacets);

  // ---------------------------------------------- Catnav chevron scroller
  function initCatnav() {
    document.querySelectorAll('[data-catnav]').forEach(function (root) {
      var scroller = root.querySelector('[data-catnav-scroller]');
      var prev     = root.querySelector('[data-catnav-prev]');
      var next     = root.querySelector('[data-catnav-next]');
      if (!scroller || !prev || !next) return;

      function step() { return Math.max(160, Math.round(scroller.clientWidth * 0.7)); }

      function refresh() {
        var max = scroller.scrollWidth - scroller.clientWidth - 1;
        var atStart = scroller.scrollLeft <= 0;
        var atEnd   = scroller.scrollLeft >= max;
        var canScroll = scroller.scrollWidth > scroller.clientWidth + 1;
        prev.hidden = !canScroll;
        next.hidden = !canScroll;
        prev.disabled = atStart;
        next.disabled = atEnd;
      }

      prev.addEventListener('click', function () { scroller.scrollBy({ left: -step(), behavior: 'smooth' }); });
      next.addEventListener('click', function () { scroller.scrollBy({ left:  step(), behavior: 'smooth' }); });
      scroller.addEventListener('scroll', refresh, { passive: true });
      window.addEventListener('resize', refresh);

      // Auto-scroll active pill into view on load
      var active = scroller.querySelector('.catnav__link--active');
      if (active) {
        var aLeft  = active.offsetLeft;
        var aRight = aLeft + active.offsetWidth;
        if (aLeft < scroller.scrollLeft || aRight > scroller.scrollLeft + scroller.clientWidth) {
          scroller.scrollLeft = Math.max(0, aLeft - 32);
        }
      }
      refresh();
    });
  }
  document.addEventListener('DOMContentLoaded', initCatnav);

  // ---------------------------------------------- Cart drawer
  function moneyFormat(cents) {
    return '$' + (cents / 100).toFixed(2);
  }

  function renderCart(cart) {
    var body = document.querySelector('[data-cart-body]');
    var foot = document.querySelector('[data-cart-foot]');
    var sub  = document.querySelector('[data-cart-subtotal]');
    var cnt  = document.querySelectorAll('[data-cart-count]');
    var drawer = document.querySelector('[data-cart-drawer]');
    var freightBlock = document.querySelector('[data-cart-freight]');
    var freightMsg = document.querySelector('[data-freight-msg]');
    var freightFill = document.querySelector('[data-freight-fill]');
    if (!body) return;

    cnt.forEach(function (el) { el.textContent = cart.item_count; });

    // Free-freight progress bar
    if (drawer && freightBlock && freightMsg && freightFill) {
      var threshold = parseFloat(drawer.getAttribute('data-free-freight-threshold')) || 0;
      if (threshold > 0 && cart.item_count > 0) {
        var thresholdCents = threshold * 100;
        var subtotal = cart.total_price; // already in cents
        var pct = Math.min(100, (subtotal / thresholdCents) * 100);
        var remaining = Math.max(0, thresholdCents - subtotal);
        freightFill.style.width = pct + '%';
        if (remaining === 0) {
          freightBlock.classList.add('is-met');
          freightMsg.classList.add('is-met');
          freightMsg.innerHTML = '✓ <b>Free freight unlocked</b> — ships from Alliance, OH';
        } else {
          freightBlock.classList.remove('is-met');
          freightMsg.classList.remove('is-met');
          freightMsg.innerHTML = "Add <b>" + moneyFormat(remaining) + "</b> for free freight";
        }
        freightBlock.hidden = false;
      } else {
        freightBlock.hidden = true;
      }
    }

    if (cart.item_count === 0) {
      body.innerHTML = '<div class="cart-drawer__empty"><h3>Your cart is empty</h3><p>Add a product to get started.</p><a href="/collections/all" class="btn btn--red">Browse products</a></div>';
      if (foot) foot.hidden = true;
      return;
    }

    var html = '';
    cart.items.forEach(function (item) {
      var img = item.featured_image && item.featured_image.url
        ? '<img src="' + item.featured_image.url + '&width=128" alt="' + (item.featured_image.alt || '') + '">'
        : '';
      var variant = item.variant_title && item.variant_title !== 'Default Title' ? item.variant_title : '';
      html += '<div class="cart-drawer__line" data-line-key="' + item.key + '">'
            +   '<a href="' + item.url + '" class="cart-drawer__line-img">' + img + '</a>'
            +   '<div class="cart-drawer__line-info">'
            +     '<b><a href="' + item.url + '">' + item.product_title + '</a></b>'
            +     (variant ? '<div class="cart-drawer__line-variant">' + variant + '</div>' : '')
            +     '<div class="cart-drawer__line-qty">'
            +       '<button type="button" data-cart-dec aria-label="Decrease">−</button>'
            +       '<span data-line-qty>' + item.quantity + '</span>'
            +       '<button type="button" data-cart-inc aria-label="Increase">+</button>'
            +     '</div>'
            +   '</div>'
            +   '<div class="cart-drawer__line-right">'
            +     '<span class="cart-drawer__line-price">' + moneyFormat(item.final_line_price) + '</span>'
            +     '<button type="button" class="cart-drawer__line-remove" data-cart-remove>Remove</button>'
            +   '</div>'
            + '</div>';
    });
    body.innerHTML = html;
    if (foot) foot.hidden = false;
    if (sub) sub.textContent = moneyFormat(cart.total_price);
  }

  function fetchCart() {
    return fetch('/cart.js', { credentials: 'same-origin' }).then(function (r) { return r.json(); });
  }

  function changeLine(key, qty) {
    return fetch('/cart/change.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty })
    }).then(function (r) { return r.json(); });
  }

  function openDrawer() {
    var drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { drawer.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    fetchCart().then(renderCart).catch(function () {});
  }
  function closeDrawer() {
    var drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () {
      drawer.hidden = true;
      drawer.setAttribute('aria-hidden', 'true');
    }, 280);
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-cart-trigger]');
    if (trigger) { e.preventDefault(); openDrawer(); return; }
    var closer  = e.target.closest('[data-cart-close]');
    if (closer) { e.preventDefault(); closeDrawer(); return; }

    var line = e.target.closest('[data-line-key]');
    if (!line) return;
    var key = line.getAttribute('data-line-key');
    var qtyEl = line.querySelector('[data-line-qty]');
    var qty   = qtyEl ? parseInt(qtyEl.textContent, 10) : 1;

    if (e.target.closest('[data-cart-inc]')) {
      changeLine(key, qty + 1).then(renderCart);
    } else if (e.target.closest('[data-cart-dec]')) {
      changeLine(key, Math.max(0, qty - 1)).then(renderCart);
    } else if (e.target.closest('[data-cart-remove]')) {
      changeLine(key, 0).then(renderCart);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  // When something is added via [data-add-to-cart-form], pop the drawer.
  // Quick-add from cards uses showToast instead — it dispatches cart:open
  // only if the user clicks "View cart" in the toast.
  document.addEventListener('cart:added', openDrawer);
  document.addEventListener('cart:open',  openDrawer);
})();
