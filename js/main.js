/**
 * js/main.js
 * Вся интерактивность страницы + отправка формы в Supabase
 */

try {
  AOS.init({ duration: 800, easing: 'ease-in-out-quad', once: true, offset: 100 });
} catch(e) {}

let supabaseClient = null;
try {
  const { createClient } = supabase;
  supabaseClient = createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON
  );
} catch(e) {
  console.warn('Supabase не загружен:', e);
}

/* mobile nav*/
const burgerBtn = document.getElementById('burgerBtn');
const mobNav    = document.getElementById('mobNav');

burgerBtn.addEventListener('click', () => {
  const isOpen = mobNav.classList.toggle('open');
  burgerBtn.classList.toggle('open', isOpen);
  burgerBtn.setAttribute('aria-expanded', isOpen);
});

// Close mobile nav when a link is clicked
mobNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobNav.classList.remove('open');
    burgerBtn.classList.remove('open');
  });
});

/* Phone mockup sliders */
function makePhoneSlider(prevId, nextId, imgId, images) {
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  const img  = document.getElementById(imgId);
  if (!prev || !next || !img || !images.length) return;
  let idx = 0;
  img.src = images[0];
  function show(i) {
    idx = (i + images.length) % images.length;
    img.style.opacity = '0';
    setTimeout(() => { img.src = images[idx]; img.style.opacity = '1'; }, 150);
  }
  prev.addEventListener('click', () => show(idx - 1));
  next.addEventListener('click', () => show(idx + 1));
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

/* Events slider — infinite + autoplay */
(function(){
  const track = document.getElementById('sliderTrack');
  const btnPrev = document.getElementById('sliderPrev');
  const btnNext = document.getElementById('sliderNext');
  if (!track) return;

  const origSlides = Array.from(track.children);
  const N = origSlides.length;
  if (!N) return;

  // Clone for infinite loop
  origSlides.forEach(s => track.appendChild(s.cloneNode(true)));

  let vIdx = N;
  let cur = 0;
  let busy = false;
  let autoT = null;

  function sw() {
    const s = track.firstElementChild;
    const cs = getComputedStyle(track);
    return s.offsetWidth + (parseFloat(cs.gap) || 16);
  }

  function jumpSilent(i) {
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = sw() * i;
    void track.offsetWidth;
    track.style.scrollBehavior = '';
  }

  function go(delta) {
    if (busy) return;
    busy = true;
    vIdx += delta;
    cur = ((vIdx - N) % N + N) % N;
    track.scrollTo({ left: sw() * vIdx, behavior: 'smooth' });
    setTimeout(() => {
      if (vIdx < N) { vIdx += N; jumpSilent(vIdx); }
      else if (vIdx >= N * 2) { vIdx -= N; jumpSilent(vIdx); }
      busy = false;
    }, 420);
  }

  // Init
  jumpSilent(N);

  btnNext?.addEventListener('click', () => { resetAuto(); go(1); });
  btnPrev?.addEventListener('click', () => { resetAuto(); go(-1); });

  function startAuto() { autoT = setInterval(() => go(1), 3500); }
  function stopAuto()  { clearInterval(autoT); }
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

  startAuto();
})();




// Drag to scroll
let isDragging = false;
let dragStartX = 0;
let dragScrollLeft = 0;
let dragVelocity = 0;
let lastX = 0;

sliderTrack.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.pageX;
  dragScrollLeft = sliderTrack.scrollLeft;
  lastX = e.pageX;
});

sliderTrack.addEventListener('mouseleave', () => {
  isDragging = false;
});

sliderTrack.addEventListener('mouseup', () => {
  isDragging = false;
});

sliderTrack.addEventListener('mousemove', e => {
  if (!isDragging) return;
  e.preventDefault();
  const deltaX = e.pageX - lastX;
  dragVelocity = deltaX;
  lastX = e.pageX;
  sliderTrack.scrollLeft = dragScrollLeft - (e.pageX - dragStartX);
});

/* FAQ accordion */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* Contact form → Supabase */
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');
const submitBtn   = document.getElementById('submitBtn');

function setStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className = `form-status ${type}`;
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name    = contactForm.name.value.trim();
  const contact = contactForm.contact.value.trim();
  const message = contactForm.message.value.trim();

  // validation
  if (!name) { setStatus('Пожалуйста, укажите ваше имя.', 'error'); return; }
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
