/**
 * js/main.js
 * Вся интерактивность страницы + отправка формы в Supabase
 */


AOS.init({
  duration: 800,
  easing: 'ease-in-out-quad',
  once: true,
  offset: 100
});


const { createClient } = supabase;

const supabaseClient = createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON
);

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

/* Phone mockup — image switcher */
const phoneScreens = [
  'https://www.figma.com/api/mcp/asset/e512004d-93b8-4a9d-a732-15bfd0f70d3a',
  'https://www.figma.com/api/mcp/asset/ca5e344f-af63-4873-a092-caefd5446329',
  'https://www.figma.com/api/mcp/asset/1bf5ce68-3417-4876-81ba-1cbdd35afb91',
];
let phoneIdx = 0;

function setPhoneScreen(idx) {
  phoneIdx = (idx + phoneScreens.length) % phoneScreens.length;
  const img = document.getElementById('phoneImg');
  if (!img) return;
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = phoneScreens[phoneIdx];
    img.style.opacity = '1';
  }, 150);
}

document.getElementById('phonePrev')?.addEventListener('click', () => setPhoneScreen(phoneIdx - 1));
document.getElementById('phoneNext')?.addEventListener('click', () => setPhoneScreen(phoneIdx + 1));

/* Events slider */
const sliderTrack = document.getElementById('sliderTrack');
const sliderPrev  = document.getElementById('sliderPrev');
const sliderNext  = document.getElementById('sliderNext');
const dots        = document.querySelectorAll('.dot');
let currentIndex  = 0;

function getSlideWidth() {
  const slide = sliderTrack.querySelector('.slide');
  return (slide?.offsetWidth || 0) + 16;
}

function getCurrentIndex() {
  const slideW = getSlideWidth();
  if (slideW === 0) return 0;
  return Math.round(sliderTrack.scrollLeft / slideW);
}

function updateDotsAndButtons() {
  currentIndex = getCurrentIndex();
  const slides = sliderTrack.querySelectorAll('.slide');
  const totalSlides = slides.length;

  dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  sliderPrev.disabled = currentIndex === 0;
  sliderNext.disabled = currentIndex >= totalSlides - 1;
}

function goToSlide(index) {
  const slides = sliderTrack.querySelectorAll('.slide');
  if (!slides[index]) return;
  const slideW = getSlideWidth();
  const targetScroll = slideW * index;
  sliderTrack.scrollTo({ left: targetScroll, behavior: 'smooth' });
  currentIndex = index;
}

// Dot click
dots.forEach(dot => {
  dot.addEventListener('click', () => goToSlide(Number(dot.dataset.index)));
});

// Navigation buttons
sliderPrev.addEventListener('click', () => {
  if (currentIndex > 0) goToSlide(currentIndex - 1);
});

sliderNext.addEventListener('click', () => {
  const slides = sliderTrack.querySelectorAll('.slide');
  if (currentIndex < slides.length - 1) goToSlide(currentIndex + 1);
});

// Update dots and buttons on scroll
sliderTrack.addEventListener('scroll', updateDotsAndButtons, { passive: true });

// Update on resize
window.addEventListener('resize', updateDotsAndButtons);

// Initialize button states
updateDotsAndButtons();

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
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // Open clicked (unless it was already open)
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
