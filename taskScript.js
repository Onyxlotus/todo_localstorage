// --- Данные и настройки ---
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';
let searchQuery = '';
let sortDirection = 'desc'; // от новых к старым

// --- DOM-элементы ---
const list = document.querySelector('#task-list');
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const search = document.querySelector('#search-input');
const sortBtn = document.querySelector('#sort-button');
const filterBtns = document.querySelectorAll('[data-filter]');
const clearBtnTask = document.getElementById('clear-button');
const clearBtnSearch = document.getElementById('clear-button2');

// --- Локальное хранилище ---
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// --- Рендер задач ---
function renderTasks() {
  list.innerHTML = '';

  const filteredTasks = getFilteredAndSortedTasks();

  if (filteredTasks.length === 0) {
    showEmptyMessage();
    return;
  }

  filteredTasks.forEach(task => list.appendChild(createTaskElement(task)));
}

function getFilteredAndSortedTasks() {
  return tasks
    .filter(task => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'done' && task.done) ||
        (filter === 'active' && !task.done);
      const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) =>
      sortDirection === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    );
}

function showEmptyMessage() {
  const msg = document.createElement('li');
  msg.textContent = 'Задач нет 😉';
  msg.className = 'empty-message';
  list.appendChild(msg);
}

// --- Создание элемента задачи ---
function createTaskElement(task) {
  const li = document.createElement('li');
  if (task.done) li.classList.add('completed');

  const content = document.createElement('div');
  content.className = 'task-content';

  const textSpan = document.createElement('span');
  textSpan.textContent = task.text;
  textSpan.className = 'task-text';

  const dateInfo = document.createElement('small');
  dateInfo.textContent = new Date(task.timestamp).toLocaleString();
  dateInfo.className = 'task-date';

  content.appendChild(textSpan);
  content.appendChild(dateInfo);

  const btnGroup = document.createElement('div');
  btnGroup.className = 'btn-group';
  /* sla */
  const sla = document.createElement('small');
  sla.className = 'task-sla';

  function updateSla() {
    if (task.done && task.remainingSla !== null) {
    sla.textContent = '⏸ На паузе';
    sla.style.color = 'gray';
    return;
    }


    const now = Date.now();


    let diff;

    if (task.done) {
      // В состоянии "выполнено" SLA не тикает — показываем замороженное время
      diff = task.remainingSla ?? 0;
    } else {
      diff = (task.deadline ?? now) - now;
    }


    // const diff = task.deadline - now;
    const isOverdue = diff < 0;
    const absDiff = Math.abs(diff);
    const totalSeconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formatted =
      `${isOverdue ? '-' : ''}` +
      (minutes < 10 ? '0' : '') + minutes + ':' +
      (seconds < 10 ? '0' : '') + seconds;

    sla.textContent = `⏱ ${formatted}`;
    sla.style.color = diff >= 0 ? 'green' : 'red';
  }

  updateSla();
  const timerId = setInterval(() => {
    if (!document.body.contains(li)) return clearInterval(timerId);
    updateSla();
  }, 1000);
  content.appendChild(sla);
  /* sla done */
  const doneBtn = document.createElement('button');
  doneBtn.textContent = task.done ? 'Сбросить' : 'Выполнено';
  doneBtn.addEventListener('click', e => {
    e.preventDefault();

    const now = Date.now();
    if (!task.done) {
      // Помечаем как выполненную — ставим SLA на паузу
      task.remainingSla = task.deadline - now;
      task.deadline = null; // отключаем таймер
    } else {
      // Возобновляем задачу — пересчитываем дедлайн
      task.deadline = now + (task.remainingSla || SLA_DURATION);
      task.remainingSla = null;
    }
    task.done = !task.done;
    saveTasks();
    renderTasks();
  });

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Удалить';
  removeBtn.addEventListener('click', e => {
    e.preventDefault();
    tasks = tasks.filter(t => t !== task);
    saveTasks();
    renderTasks();
  });

  btnGroup.appendChild(doneBtn);
  btnGroup.appendChild(removeBtn);

  li.appendChild(content);
  li.appendChild(btnGroup);

  return li;
}

// --- Обработчики событий ---
form.addEventListener('submit', e => {
  e.preventDefault();
  let text = input.value.trim().toLowerCase();
  const SLA_DURATION = 5 * 60 * 1000; // 5 минут
  if (text) {
    text = text[0].toUpperCase() + text.slice(1); // первая буква — заглавная
    tasks.push({ 
      id: Date.now(),
      text,
      done: false,
      timestamp: Date.now(),
      deadline: Date.now() + SLA_DURATION,
      remainingSla: null
    });
    saveTasks();
    renderTasks();
    input.value = '';
    input.focus();
    toggleClearButtons();
  }
});

search.addEventListener('input', () => {
  searchQuery = search.value;
  renderTasks();
  toggleClearButtons();
});

sortBtn.addEventListener('click', e => {
  e.preventDefault();
  sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
  sortBtn.dataset.order = sortDirection;
  sortBtn.textContent = `Сортировка: ${sortDirection === 'desc' ? '↓' : '↑'}`;
  renderTasks();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});

// --- Очистка полей ---
function toggleClearButtons() {
  clearBtnTask.style.display = input.value.length > 0 ? 'inline' : 'none';
  clearBtnSearch.style.display = search.value.length > 0 ? 'inline' : 'none';
}

function clearTaskInput() {
  input.value = '';
  toggleClearButtons();
}

function clearSearchInput() {
  search.value = '';
  searchQuery = '';
  toggleClearButtons();
  renderTasks();
}

// --- Старт ---
renderTasks();
toggleClearButtons();
