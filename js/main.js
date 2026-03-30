/**
 * js/main.js
 */

try {
  AOS.init({ duration: 800, easing: 'ease-in-out-quad', once: true, offset: 100 });
} catch(e) {}

let supabaseClient = null;
try {
  const { createClient } = supabase;
  supabaseClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON);
} catch(e) {
  console.warn('Supabase не загружен:', e);
}

/* ── Mobile nav ── */
const burgerBtn = document.getElementById('burgerBtn');
const mobNav    = document.getElementById('mobNav');

if (burgerBtn && mobNav) {
  burgerBtn.addEventListener('click', () => {
    const isOpen = mobNav.classList.toggle('open');
    burgerBtn.classList.toggle('open', isOpen);
    burgerBtn.setAttribute('aria-expanded', isOpen);
  });
  mobNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobNav.classList.remove('open');
      burgerBtn.classList.remove('open');
    });
  });
}

/* ── Phone mockup sliders ──
   Desktop: prev/next buttons
   Mobile:  touch-swipe (buttons hidden via CSS)
*/
function makePhoneSlider(prevId, nextId, imgId, images) {
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  const img  = document.getElementById(imgId);
  if (!img || !images.length) return;

  let idx = 0;
  img.src = images[0];

  const wrap = img.closest('.phone-wrap') || img.parentElement;

  function show(i) {
    idx = (i + images.length) % images.length;
    img.style.opacity = '0';
    setTimeout(() => { img.src = images[idx]; img.style.opacity = '1'; }, 150);
  }

  if (prev) prev.addEventListener('click', () => show(idx - 1));
  if (next) next.addEventListener('click', () => show(idx + 1));

  // Touch swipe на враппере телефона
  let touchStartX = 0;
  wrap.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 35) show(dx < 0 ? idx + 1 : idx - 1);
  }, { passive: true });
}

makePhoneSlider('phonePrev', 'phoneNext', 'phoneImg', [
  'img/phone1.webp',
  'img/phone2.webp',
  'img/phone3.webp',
]);
makePhoneSlider('orgPrev', 'orgNext', 'orgPhoneImg', [
  'img/org1.webp',
  'img/org2.webp',
]);
makePhoneSlider('usrPrev', 'usrNext', 'usrPhoneImg', [
  'img/usr1.webp',
  'img/usr2.webp',
]);

/* ── Events slider — infinite + autoplay ── */
(function () {
  const track   = document.getElementById('sliderTrack');
  const btnPrev = document.getElementById('sliderPrev');
  const btnNext = document.getElementById('sliderNext');
  if (!track) return;

  const origSlides = Array.from(track.children);
  const N = origSlides.length;
  if (!N) return;

  // Клоны в конец и в начало
  origSlides.forEach(s => track.appendChild(s.cloneNode(true)));
  origSlides.forEach(s => track.insertBefore(s.cloneNode(true), track.firstChild));
  // Порядок: [клоны-конец][оригинал N штук][клоны-начало]
  // Индекс первого оригинала = N

  let vIdx = N;
  let busy = false;
  let autoT = null;

  function slideWidth() {
    const s = track.firstElementChild;
    return s ? s.offsetWidth + (parseFloat(getComputedStyle(track).gap) || 16) : 316;
  }

  function jumpSilent(i) {
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = slideWidth() * i;
    void track.offsetWidth; // reflow
    track.style.scrollBehavior = '';
  }

  function go(delta) {
    if (busy) return;
    busy = true;
    vIdx += delta;
    track.scrollTo({ left: slideWidth() * vIdx, behavior: 'smooth' });
    setTimeout(() => {
      if (vIdx < N)       { vIdx += N; jumpSilent(vIdx); }
      else if (vIdx >= N * 2) { vIdx -= N; jumpSilent(vIdx); }
      busy = false;
    }, 850);
  }

  jumpSilent(N);

  if (btnNext) btnNext.addEventListener('click', () => { resetAuto(); go(1); });
  if (btnPrev) btnPrev.addEventListener('click', () => { resetAuto(); go(-1); });

  function startAuto() { autoT = setInterval(() => go(1), 3500); }
  function stopAuto()  { clearInterval(autoT); autoT = null; }
  function resetAuto() { stopAuto(); startAuto(); }

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) { resetAuto(); go(dx < 0 ? 1 : -1); }
  }, { passive: true });

  // Mouse drag
  let dragging = false, dragStartX = 0, dragScrollLeft = 0;
  track.addEventListener('mousedown', e => {
    dragging = true;
    dragStartX = e.pageX;
    dragScrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    const moved = track.scrollLeft - dragScrollLeft;
    dragging = false;
    track.style.cursor = '';
    if (Math.abs(moved) > 40) {
      resetAuto();
      vIdx = Math.round(track.scrollLeft / slideWidth());
      if (vIdx < N)           { vIdx += N; jumpSilent(vIdx); }
      else if (vIdx >= N * 2) { vIdx -= N; jumpSilent(vIdx); }
    } else {
      track.scrollTo({ left: slideWidth() * vIdx, behavior: 'smooth' });
    }
  });
  track.addEventListener('mousemove', e => {
    if (!dragging) return;
    e.preventDefault();
    track.scrollLeft = dragScrollLeft - (e.pageX - dragStartX);
  });

  startAuto();
})();

/* ── FAQ accordion ── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── Contact form → Supabase ── */
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');
const submitBtn   = document.getElementById('submitBtn');

function setStatus(msg, type) {
  if (!formStatus) return;
  formStatus.textContent = msg;
  formStatus.className = `form-status ${type}`;
}

if (contactForm && submitBtn) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = contactForm.name?.value.trim() || '';
    const contact = contactForm.contact?.value.trim() || '';
    const message = contactForm.message?.value.trim() || '';

    if (!name)    { setStatus('Пожалуйста, укажите ваше имя.', 'error'); return; }
    if (!contact) { setStatus('Пожалуйста, укажите email или телефон.', 'error'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';
    setStatus('', '');

    try {
      if (!supabaseClient) throw new Error('Supabase недоступен');
      const { error } = await supabaseClient
        .from('contact_submissions')
        .insert([{ name, contact, message }]);
      if (error) throw error;
      setStatus('✓ Сообщение отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
      contactForm.reset();
    } catch (err) {
      console.error('Supabase error:', err);
      setStatus('Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить';
    }
  });
}
