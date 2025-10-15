// settings.js
// Handles column toggles and persistence

const COLUMN_KEYS = ["id", "poster", "title", "rating", "runtime", "rottenTomatoes", "metacritic", "imdb", "formats", "showtimes", "actions"];

function loadVisibleColumns() {
  const saved = localStorage.getItem('visibleColumns');
  if (saved) {
    visibleColumns = JSON.parse(saved);
  } else {
    visibleColumns = [...COLUMN_KEYS];
  }
}

function saveVisibleColumns() {
  localStorage.setItem('visibleColumns', JSON.stringify(visibleColumns));
}

function renderColumnToggles() {
  const container = document.getElementById('column-toggles');
  container.innerHTML = '';
  COLUMN_KEYS.forEach(key => {
    const checked = visibleColumns.includes(key);
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    container.innerHTML += `
      <div class="toggle-switch">
        <label>${label}</label>
        <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleColumn('${key}')">
      </div>
    `;
  });
}

function toggleColumn(key) {
  if (visibleColumns.includes(key)) {
    visibleColumns = visibleColumns.filter(k => k !== key);
  } else {
    visibleColumns.push(key);
  }
  saveVisibleColumns();
  renderColumnToggles();
  renderTable();
}

window.addEventListener('DOMContentLoaded', () => {
  loadVisibleColumns();
  renderColumnToggles();
});
