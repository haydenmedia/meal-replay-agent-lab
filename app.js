const STORAGE_KEY = 'meal-replay.entries.v1';

const state = {
  meals: loadMeals(),
  editingId: null,
  filters: {
    search: '',
    makeAgain: 'all',
    minRating: 0,
  },
};

const elements = {
  mealList: document.querySelector('#mealList'),
  emptyState: document.querySelector('#emptyState'),
  emptyStateMessage: document.querySelector('#emptyStateMessage'),
  resultCount: document.querySelector('#resultCount'),
  searchInput: document.querySelector('#searchInput'),
  makeAgainFilter: document.querySelector('#makeAgainFilter'),
  ratingFilter: document.querySelector('#ratingFilter'),
  newMealButton: document.querySelector('#newMealButton'),
  emptyAddButton: document.querySelector('#emptyAddButton'),
  dialog: document.querySelector('#mealDialog'),
  form: document.querySelector('#mealForm'),
  dialogTitle: document.querySelector('#dialogTitle'),
  closeDialogButton: document.querySelector('#closeDialogButton'),
  cancelButton: document.querySelector('#cancelButton'),
  mealId: document.querySelector('#mealId'),
  mealName: document.querySelector('#mealName'),
  mealDate: document.querySelector('#mealDate'),
  rating: document.querySelector('#rating'),
  totalTime: document.querySelector('#totalTime'),
  messLevel: document.querySelector('#messLevel'),
  whatWorked: document.querySelector('#whatWorked'),
  whatDidNotWork: document.querySelector('#whatDidNotWork'),
  notes: document.querySelector('#notes'),
  mealNameError: document.querySelector('#mealNameError'),
  mealDateError: document.querySelector('#mealDateError'),
};

bindEvents();
render();

function bindEvents() {
  elements.newMealButton.addEventListener('click', () => openMealDialog());
  elements.emptyAddButton.addEventListener('click', () => openMealDialog());
  elements.closeDialogButton.addEventListener('click', closeMealDialog);
  elements.cancelButton.addEventListener('click', closeMealDialog);

  elements.searchInput.addEventListener('input', (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });

  elements.makeAgainFilter.addEventListener('change', (event) => {
    state.filters.makeAgain = event.target.value;
    render();
  });

  elements.ratingFilter.addEventListener('change', (event) => {
    state.filters.minRating = Number(event.target.value);
    render();
  });

  elements.form.addEventListener('submit', handleSubmit);

  elements.dialog.addEventListener('click', (event) => {
    if (event.target === elements.dialog) closeMealDialog();
  });

  elements.dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeMealDialog();
  });
}

function loadMeals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMeals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.meals));
}

function render() {
  const meals = getFilteredMeals();
  elements.mealList.replaceChildren();

  for (const meal of meals) {
    elements.mealList.append(createMealCard(meal));
  }

  const isFiltering = Boolean(
    state.filters.search ||
    state.filters.makeAgain !== 'all' ||
    state.filters.minRating > 0
  );

  elements.emptyState.hidden = meals.length > 0;
  elements.emptyStateMessage.textContent = isFiltering
    ? 'No saved meals match the current search or filters.'
    : 'Add your first meal replay to start building a useful cooking history.';
  elements.resultCount.textContent = `${meals.length} ${meals.length === 1 ? 'meal' : 'meals'}`;
}

function getFilteredMeals() {
  const query = state.filters.search;

  return [...state.meals]
    .filter((meal) => {
      if (state.filters.makeAgain !== 'all' && meal.makeAgain !== state.filters.makeAgain) {
        return false;
      }
      if (Number(meal.rating) < state.filters.minRating) return false;
      if (!query) return true;

      const searchable = [
        meal.name,
        meal.whatWorked,
        meal.whatDidNotWork,
        meal.notes,
      ].join(' ').toLowerCase();

      return searchable.includes(query);
    })
    .sort((a, b) => {
      const byDate = String(b.date).localeCompare(String(a.date));
      return byDate || Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
    });
}

function createMealCard(meal) {
  const card = document.createElement('article');
  card.className = 'meal-card';

  const top = document.createElement('div');
  top.className = 'card-top';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = meal.name;
  const date = document.createElement('div');
  date.className = 'card-date';
  date.textContent = formatDate(meal.date);
  titleWrap.append(title, date);

  const rating = document.createElement('span');
  rating.className = 'rating-badge';
  rating.textContent = `${meal.rating}/5`;
  rating.setAttribute('aria-label', `Rating ${meal.rating} out of 5`);
  top.append(titleWrap, rating);

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  meta.append(
    makePill(meal.totalTime ? `${meal.totalTime} min` : 'Time not recorded'),
    makePill(`Mess ${meal.messLevel}/5`),
    makePill(meal.makeAgain === 'yes' ? 'Make again: Yes' : 'Make again: No')
  );

  card.append(top, meta);

  appendTextSection(card, 'What worked', meal.whatWorked);
  appendTextSection(card, 'What did not work', meal.whatDidNotWork);
  appendTextSection(card, 'Notes', meal.notes);

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const editButton = document.createElement('button');
  editButton.className = 'card-action';
  editButton.type = 'button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => openMealDialog(meal));

  const deleteButton = document.createElement('button');
  deleteButton.className = 'card-action danger';
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deleteMeal(meal.id));

  actions.append(editButton, deleteButton);
  card.append(actions);
  return card;
}

function makePill(text) {
  const pill = document.createElement('span');
  pill.className = 'meta-pill';
  pill.textContent = text;
  return pill;
}

function appendTextSection(card, heading, value) {
  if (!value) return;
  const section = document.createElement('section');
  section.className = 'replay-section';
  const title = document.createElement('h4');
  title.textContent = heading;
  const body = document.createElement('p');
  body.textContent = value;
  section.append(title, body);
  card.append(section);
}

function openMealDialog(meal = null) {
  clearErrors();
  state.editingId = meal?.id ?? null;
  elements.dialogTitle.textContent = meal ? 'Edit meal' : 'Add meal';
  elements.mealId.value = meal?.id ?? '';
  elements.mealName.value = meal?.name ?? '';
  elements.mealDate.value = meal?.date ?? todayAsLocalDate();
  elements.rating.value = String(meal?.rating ?? 3);
  elements.totalTime.value = meal?.totalTime ?? '';
  elements.messLevel.value = String(meal?.messLevel ?? 3);
  elements.whatWorked.value = meal?.whatWorked ?? '';
  elements.whatDidNotWork.value = meal?.whatDidNotWork ?? '';
  elements.notes.value = meal?.notes ?? '';

  const makeAgainValue = meal?.makeAgain ?? 'yes';
  const radio = elements.form.querySelector(`input[name="makeAgain"][value="${makeAgainValue}"]`);
  if (radio) radio.checked = true;

  elements.dialog.showModal();
  elements.mealName.focus();
}

function closeMealDialog() {
  if (elements.dialog.open) elements.dialog.close();
  elements.form.reset();
  state.editingId = null;
  clearErrors();
}

function handleSubmit(event) {
  event.preventDefault();
  clearErrors();

  const name = elements.mealName.value.trim();
  const date = elements.mealDate.value;
  let valid = true;

  if (!name) {
    elements.mealNameError.textContent = 'Meal name is required.';
    valid = false;
  }
  if (!date) {
    elements.mealDateError.textContent = 'Date is required.';
    valid = false;
  }
  if (!valid) return;

  const now = Date.now();
  const existing = state.meals.find((meal) => meal.id === state.editingId);
  const meal = {
    id: existing?.id ?? createId(),
    name,
    date,
    rating: Number(elements.rating.value),
    totalTime: elements.totalTime.value === '' ? '' : Number(elements.totalTime.value),
    messLevel: Number(elements.messLevel.value),
    whatWorked: elements.whatWorked.value.trim(),
    whatDidNotWork: elements.whatDidNotWork.value.trim(),
    makeAgain: elements.form.elements.makeAgain.value,
    notes: elements.notes.value.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    state.meals = state.meals.map((item) => item.id === existing.id ? meal : item);
  } else {
    state.meals.push(meal);
  }

  saveMeals();
  closeMealDialog();
  render();
}

function deleteMeal(id) {
  const meal = state.meals.find((item) => item.id === id);
  if (!meal) return;
  const confirmed = window.confirm(`Delete “${meal.name}”? This cannot be undone.`);
  if (!confirmed) return;
  state.meals = state.meals.filter((item) => item.id !== id);
  saveMeals();
  render();
}

function clearErrors() {
  elements.mealNameError.textContent = '';
  elements.mealDateError.textContent = '';
}

function createId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `meal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayAsLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return 'No date';
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
