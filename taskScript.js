let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';
let searchQuery = '';
let sortDirection = 'desc'; // от новых к старым

const list = document.querySelector('#task-list');
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const search = document.querySelector('#search-input');
const sortBtn = document.querySelector('#sort-button');
const filterBtns = document.querySelectorAll('[data-filter]');

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  list.innerHTML = '';

  let filteredTasks = tasks.filter(task => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'done' && task.done) ||
      (filter === 'active' && !task.done);
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  filteredTasks.sort((a, b) =>
    sortDirection === 'asc'
      ? a.timestamp - b.timestamp
      : b.timestamp - a.timestamp
  );

  if (filteredTasks.length === 0) {
    const emptyMsg = document.createElement('li');
    emptyMsg.textContent = 'Задач нет';
    emptyMsg.className = 'empty-message';
    list.appendChild(emptyMsg);
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement('li');
    if (task.done) li.classList.add('completed');

    const content = document.createElement('div');
    content.className = 'task-content';

    const span = document.createElement('span');
    span.textContent = task.text;
    span.className = 'task-text';

    const info = document.createElement('small');
    info.textContent = new Date(task.timestamp).toLocaleString();
    info.className = 'task-date';

    content.appendChild(span);
    content.appendChild(info);

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    const doneBtn = document.createElement('button');
    doneBtn.textContent = task.done ? 'Сбросить' : 'Выполнено';
    doneBtn.addEventListener('click', (e) => {
      e.preventDefault();
      task.done = !task.done;
      saveTasks();
      renderTasks();
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Удалить';
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      tasks = tasks.filter(t => t !== task);
      saveTasks();
      renderTasks();
    });

    btnGroup.appendChild(doneBtn);
    btnGroup.appendChild(removeBtn);

    li.appendChild(content);
    li.appendChild(btnGroup);
    list.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let text = input.value.trim().toLowerCase();
  if (text) {
    // Только первая буква первой строки — заглавная
    text = text[0].toUpperCase() + text.slice(1);

    tasks.push({
      text,
      done: false,
      timestamp: Date.now(),
    });
    saveTasks();
    renderTasks();
    input.value = '';
    input.focus();
    toggleClearButton();
  }
});

search.addEventListener('input', () => {
  searchQuery = search.value;
  renderTasks();
});

sortBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sortDirection = sortBtn.dataset.order === 'desc' ? 'asc' : 'desc';
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

function toggleClearButton() {
  const taskInput = document.getElementById('task-input');
  const searchInput = document.getElementById('search-input');
  const clearBtnTask = document.getElementById('clear-button');
  const clearBtnSearch = document.getElementById('clear-button2');

  // Показать кнопку очистки для taskInput, если есть текст
  clearBtnTask.style.display = taskInput.value.length > 0 ? 'inline' : 'none';

  // Показать кнопку очистки для searchInput, если есть текст
  clearBtnSearch.style.display = searchInput.value.length > 0 ? 'inline' : 'none';
}

function clearTaskInput() {
  const taskInput = document.getElementById('task-input');
  taskInput.value = '';
  toggleClearButton();
}

function clearSearchInput() {
  const searchInput = document.getElementById('search-input');
  searchInput.value = '';
  toggleClearButton();
  renderTasks(); // если нужно перерисовать задачи при очистке поиска
}

renderTasks();