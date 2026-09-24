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

// Загрузка из localStorage или дефолт
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_PROJECTS.slice();
}

function save(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

let projects = load();

function render() {
  const query = searchEl.value.trim().toLowerCase();
  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(query) ||
    (p.desc || '').toLowerCase().includes(query)
  );

  if (!filtered.length) {
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

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}

// Поиск
searchEl.addEventListener('input', render);

// Удаление проекта (делегирование события на контейнер списка)
listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.card-delete');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const project = projects.find(p => p.id === id);
  if (!project) return;

  if (!confirm(`Удалить проект «${project.title}»?`)) return;

  projects = projects.filter(p => p.id !== id);
  save(projects);
  render();
});

// Открыть форму
document.getElementById('openForm').addEventListener('click', () => {
  overlay.classList.add('open');
  document.getElementById('title').focus();
});

// Закрыть форму
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

// Сохранение нового проекта
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const desc = document.getElementById('desc').value.trim();
  if (!title) return;

  projects.unshift({
    id: Date.now(),
    title,
    desc
  });

  save(projects);
  render();

  overlay.classList.remove('open');
  form.reset();
});

render();