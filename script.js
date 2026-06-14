const galleries = {
  serendipia: { title: 'Hotel Serendipia', pages: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
  urbano: { title: 'Diseño de vías en Surco', pages: [15, 16, 17, 18, 19, 20] },
  chabuca: { title: 'Parque Chabuca Granda', pages: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
  capilla: { title: 'Capilla San Gregorio Magno', pages: [31, 32, 33, 34, 35, 36, 37, 38, 39] },
  industrial: { title: 'Casa estilo industrial', pages: [40, 41, 42, 43, 44] },
  raimondi: { title: 'Parque Antonio Raimondi', pages: [47, 48, 49, 50, 51, 52, 53] },
  all: { title: 'Portafolio completo', pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 47, 48, 49, 50, 51, 52, 53, 54] }
};

const imagePath = page => `assets/portfolio/${page}.webp`;
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress span');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.main-nav');
const navLinks = [...nav.querySelectorAll('a')];

function updateScrollUI() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  header.classList.toggle('scrolled', window.scrollY > 18);
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});
navLinks.forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

const stageImage = document.querySelector('#work-stage-image');
const stageNumber = document.querySelector('#work-stage-number');
const stageTitle = document.querySelector('#work-stage-title');
const stageDiscipline = document.querySelector('#work-stage-discipline');
const stageButton = document.querySelector('.work-stage-button');
const projectEntries = [...document.querySelectorAll('.work-entry')];
let activeProject = 'serendipia';
let stageSwapTimer;

function setActiveProject(entry) {
  const { key, image, number, title, discipline } = entry.dataset;
  if (!key || key === activeProject) return;
  activeProject = key;
  projectEntries.forEach(item => item.classList.toggle('active', item === entry));
  stageImage.classList.add('changing');
  clearTimeout(stageSwapTimer);
  stageSwapTimer = window.setTimeout(() => {
    stageImage.onload = () => stageImage.classList.remove('changing');
    stageImage.src = imagePath(image);
    stageImage.alt = title;
    stageNumber.textContent = number;
    stageTitle.textContent = title;
    stageDiscipline.textContent = discipline;
    stageButton.dataset.openGallery = key;
    stageButton.setAttribute('aria-label', `Abrir proyecto ${title}`);
  }, 150);
}

const projectObserver = new IntersectionObserver(entries => {
  const candidates = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
  if (candidates[0]) setActiveProject(candidates[0].target);
}, { threshold: [0.18, 0.35, 0.55], rootMargin: '-18% 0px -30% 0px' });
projectEntries.forEach(entry => projectObserver.observe(entry));

const dialog = document.querySelector('.gallery-dialog');
const galleryTitle = document.querySelector('.gallery-title');
const galleryCounter = document.querySelector('.gallery-counter');
const galleryImage = document.querySelector('.gallery-image');
const galleryCanvas = document.querySelector('.gallery-canvas');
const galleryPages = document.querySelector('.gallery-pages');
const zoomButton = document.querySelector('[data-gallery-zoom]');
let currentGallery = null;
let currentIndex = 0;
let triggerElement = null;
let touchStartX = 0;

function renderPage() {
  if (!currentGallery) return;
  const page = currentGallery.pages[currentIndex];
  galleryImage.classList.add('loading');
  galleryImage.src = imagePath(page);
  galleryImage.alt = `${currentGallery.title}, lámina ${currentIndex + 1} de ${currentGallery.pages.length}`;
  galleryCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(currentGallery.pages.length).padStart(2, '0')}`;
  galleryPages.querySelectorAll('button').forEach((button, index) => {
    button.classList.toggle('active', index === currentIndex);
    if (index === currentIndex) button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
  galleryCanvas.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  const adjacent = [currentGallery.pages[currentIndex - 1], currentGallery.pages[currentIndex + 1]].filter(Boolean);
  adjacent.forEach(number => { const preload = new Image(); preload.src = imagePath(number); });
}

galleryImage.addEventListener('load', () => galleryImage.classList.remove('loading'));

function openGallery(key, trigger = null) {
  const gallery = galleries[key];
  if (!gallery) return;
  currentGallery = gallery;
  currentIndex = 0;
  triggerElement = trigger;
  galleryTitle.textContent = gallery.title;
  galleryCanvas.classList.remove('zoomed');
  zoomButton.textContent = 'Ampliar';
  galleryPages.innerHTML = gallery.pages.map((page, index) =>
    `<button type="button" data-gallery-page="${index}" aria-label="Ir a la lámina ${index + 1}">${String(index + 1).padStart(2, '0')}</button>`
  ).join('');
  renderPage();
  dialog.showModal();
  document.body.classList.add('dialog-open');
}

function closeGallery() {
  dialog.close();
}

function moveGallery(direction) {
  if (!currentGallery) return;
  currentIndex = (currentIndex + direction + currentGallery.pages.length) % currentGallery.pages.length;
  renderPage();
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-open-gallery]');
  if (trigger) openGallery(trigger.dataset.openGallery, trigger);

  const pageButton = event.target.closest('[data-gallery-page]');
  if (pageButton) {
    currentIndex = Number(pageButton.dataset.galleryPage);
    renderPage();
  }
});

document.querySelector('[data-gallery-close]').addEventListener('click', closeGallery);
document.querySelector('[data-gallery-prev]').addEventListener('click', () => moveGallery(-1));
document.querySelector('[data-gallery-next]').addEventListener('click', () => moveGallery(1));
zoomButton.addEventListener('click', () => {
  const zoomed = galleryCanvas.classList.toggle('zoomed');
  zoomButton.textContent = zoomed ? 'Ajustar' : 'Ampliar';
});
galleryImage.addEventListener('click', () => {
  if (window.innerWidth > 560) zoomButton.click();
});

dialog.addEventListener('click', event => {
  if (event.target === dialog) closeGallery();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  galleryImage.removeAttribute('src');
  galleryPages.innerHTML = '';
  currentGallery = null;
  if (triggerElement) triggerElement.focus({ preventScroll: true });
});

document.addEventListener('keydown', event => {
  if (!dialog.open) return;
  if (event.key === 'ArrowLeft') moveGallery(-1);
  if (event.key === 'ArrowRight') moveGallery(1);
});

galleryCanvas.addEventListener('pointerdown', event => { touchStartX = event.clientX; });
galleryCanvas.addEventListener('pointerup', event => {
  const distance = event.clientX - touchStartX;
  if (Math.abs(distance) > 60) moveGallery(distance > 0 ? -1 : 1);
});

document.querySelector('#year').textContent = new Date().getFullYear();
