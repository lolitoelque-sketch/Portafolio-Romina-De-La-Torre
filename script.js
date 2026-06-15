const projects = {
  serendipia: { number: '01', title: 'Hotel Serendipia', pages: [5,6,7,8,9,10,11,12,13,14] },
  urbano: { number: '02', title: 'Vías en Surco', pages: [15,16,17,18,19,20] },
  chabuca: { number: '03', title: 'Parque Chabuca Granda', pages: [21,22,23,24,25,26,27,28,29,30] },
  capilla: { number: '04', title: 'Capilla San Gregorio Magno', pages: [31,32,33,34,35,36,37,38,39] },
  industrial: { number: '05', title: 'Casa estilo industrial', pages: [40,41,42,43,44] },
  raimondi: { number: '06', title: 'Parque Antonio Raimondi', pages: [47,48,49,50,51,52,53] }
};

const body = document.body;
const menu = document.querySelector('.site-menu');
const menuButtons = document.querySelectorAll('.menu-button');
const menuClose = document.querySelector('.menu-close');

function setMenu(open) {
  if (!menu) return;
  menu.classList.toggle('open', open);
  body.classList.toggle('menu-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuButtons.forEach(button => button.setAttribute('aria-expanded', String(open)));
}
menuButtons.forEach(button => button.addEventListener('click', () => setMenu(true)));
menuClose?.addEventListener('click', () => setMenu(false));
menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.classList.contains('open')) setMenu(false);
});

const clock = document.querySelector('#clock');
function updateClock() {
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 30000);

const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('.project-card');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    projectCards.forEach(card => {
      const categories = card.dataset.category.split(' ');
      card.classList.toggle('hidden', filter !== 'all' && !categories.includes(filter));
    });
  });
});

const dialog = document.querySelector('.gallery-dialog');
const galleryImage = document.querySelector('#galleryImage');
const galleryTitle = document.querySelector('#galleryTitle');
const galleryNumber = document.querySelector('#galleryNumber');
const galleryCounter = document.querySelector('#galleryCounter');
const galleryDots = document.querySelector('#galleryDots');
let activeProject = null;
let galleryIndex = 0;
let pointerStart = 0;

function imagePath(page) { return `assets/portfolio/${page}.webp`; }
function renderGallery() {
  if (!activeProject || !galleryImage) return;
  const page = activeProject.pages[galleryIndex];
  galleryImage.src = imagePath(page);
  galleryImage.alt = `${activeProject.title}, lámina ${galleryIndex + 1}`;
  galleryCounter.textContent = `${String(galleryIndex + 1).padStart(2,'0')} / ${String(activeProject.pages.length).padStart(2,'0')}`;
  galleryDots?.querySelectorAll('button').forEach((dot, index) => dot.classList.toggle('active', index === galleryIndex));
}
function openGallery(key) {
  if (!dialog || !projects[key]) return;
  activeProject = projects[key];
  galleryIndex = 0;
  galleryTitle.textContent = activeProject.title;
  galleryNumber.textContent = activeProject.number;
  galleryDots.innerHTML = activeProject.pages.map((_, index) => `<button type="button" data-gallery-dot="${index}" aria-label="Ir a imagen ${index + 1}"></button>`).join('');
  renderGallery();
  dialog.showModal();
  body.classList.add('gallery-open');
}
function moveGallery(direction) {
  if (!activeProject) return;
  galleryIndex = (galleryIndex + direction + activeProject.pages.length) % activeProject.pages.length;
  renderGallery();
}

document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => openGallery(button.dataset.project)));
document.querySelector('[data-gallery-close]')?.addEventListener('click', () => dialog.close());
document.querySelector('[data-gallery-prev]')?.addEventListener('click', () => moveGallery(-1));
document.querySelector('[data-gallery-next]')?.addEventListener('click', () => moveGallery(1));
galleryDots?.addEventListener('click', event => {
  const target = event.target.closest('[data-gallery-dot]');
  if (!target) return;
  galleryIndex = Number(target.dataset.galleryDot);
  renderGallery();
});
dialog?.addEventListener('close', () => {
  body.classList.remove('gallery-open');
  galleryImage?.removeAttribute('src');
});
dialog?.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
galleryImage?.addEventListener('pointerdown', event => { pointerStart = event.clientX; });
galleryImage?.addEventListener('pointerup', event => {
  if (Math.abs(event.clientX - pointerStart) > 45) moveGallery(event.clientX > pointerStart ? -1 : 1);
});
document.addEventListener('keydown', event => {
  if (!dialog?.open) return;
  if (event.key === 'ArrowLeft') moveGallery(-1);
  if (event.key === 'ArrowRight') moveGallery(1);
});
