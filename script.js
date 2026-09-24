const STORAGE_KEY = 'test_projects_v1';

// Учебные данные по умолчанию
const DEFAULT_PROJECTS = [
  { id: 1, title: 'Учебный проект «Альфа»', desc: 'Тренировочный проект для студентов' },
  { id: 2, title: 'Курсовая работа', desc: 'Исследование по теме №3' },
  { id: 3, title: 'Лабораторная №1', desc: 'Базовые эксперименты' },
  { id: 4, title: 'Практика: верстка', desc: 'Адаптивная страница' }
];

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const overlay = document.getElementById('overlay');
const form = document.getElementById('projectForm');

let projects = load();   // сразу загружаем при старте

// --- Загрузка ---
// Возвращает массив проектов из localStorage.
// Если там пусто, битый JSON или не массив — возвращает дефолт.
function load() {
  let raw = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    // localStorage может быть недоступен (приватный режим, запрет cookies)
    return DEFAULT_PROJECTS.slice();
  }

  if (!raw) {
    return DEFAULT_PROJECTS.slice();
  }

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // битый JSON — тоже дефолт
    return DEFAULT_PROJECTS.slice();
  }

  // Главная проверка: должен быть именно массив
  if (!Array.isArray(parsed)) {
    console.warn('projects: в localStorage не массив, беру дефолт');
    return DEFAULT_PROJECTS.slice();
  }

  // Оставляем только «правильные» элементы (у кого есть title)
  const valid = parsed.filter(item =>
    item && typeof item === 'object' && typeof item.title === 'string'
  );

  // Если после фильтра пусто — тоже дефолт
  return valid.length > 0 ? valid : DEFAULT_PROJECTS.slice();
}

// --- Сохранение ---
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('projects: не удалось сохранить в localStorage', e);
  }
}

// --- Отрисовка списка ---
function render() {
  const query = searchEl.value.trim().toLowerCase();

  const filtered = projects.filter(p => {
    const titleMatch = p.title.toLowerCase().includes(query);
    const descMatch = (p.desc || '').toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="empty">Ничего не найдено</div>';
    return;
  }

  listEl.innerHTML = filtered.map(p => `
    <div class="card">
      <button class="card-delete" data-id="${p.id}" title="Удалить">×</button>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.desc || 'Без описания')}</p>
    </div>
  `).join('');
}

// --- Защита от XSS ---
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

// --- Поиск ---
searchEl.addEventListener('input', render);

// --- Удаление проекта ---
listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.card-delete');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const project = projects.find(p => p.id === id);
  if (!project) return;

  if (!confirm(`Удалить проект «${project.title}»?`)) return;

  projects = projects.filter(p => p.id !== id);
  save();
  render();
});

// --- Открыть форму ---
document.getElementById('openForm').addEventListener('click', () => {
  overlay.classList.add('open');
  document.getElementById('title').focus();
});

// --- Закрыть форму ---
document.getElementById('closeForm').addEventListener('click', () => {
  overlay.classList.remove('open');
  form.reset();
});

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    overlay.classList.remove('open');
    form.reset();
  }
});

// --- Сохранение нового проекта ---
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const desc = document.getElementById('desc').value.trim();
  if (!title) return;

  projects.unshift({
    id: Date.now(),
    title: title,
    desc: desc
  });

  save();
  render();

  overlay.classList.remove('open');
  form.reset();
});

// --- Первая отрисовка ---
render();