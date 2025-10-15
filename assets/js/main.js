// main.js
// Loads data, renders UI, handles date selection

const MOVIES_URL = 'assets/py/movies.json';
const RATINGS_URL = 'assets/py/movie_ratings.json';
const SHOWTIMES_URL = 'assets/py/showtimes.json';

let movies = [];
let showtimes = [];
let currentDateIndex = 0;
let visibleColumns = ["id", "title", "rating", "runtime", "formats", "showtimes", "actions"];
let filterValue = "";

// Utility
function formatDateText(dateStr, todayStr, tomorrowStr) {
  // Parse both dates as UTC to avoid timezone issues
  const today = new Date();
  const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const parts = dateStr.split('-');
  const utcDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
  const diff = Math.round((utcDate - utcToday) / (1000*60*60*24));
  if (diff === 0) return todayStr;
  if (diff === 1) return tomorrowStr;
  return utcDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function loadJSON(url) {
  return fetch(url).then(r => r.json());
}

function getShowtimesForDate(idx) {
  if (!showtimes[idx]) return [];
  return showtimes[idx].showtimes;
}

function getMovieByTitle(title) {
  return movies.find(m => m.title === title);
}

function renderDateSelector() {
  const dateSpan = document.getElementById('current-date');
  const prevBtn = document.getElementById('prev-date');
  const nextBtn = document.getElementById('next-date');
  const dateObj = showtimes[currentDateIndex];
  if (!dateObj) return;
  dateSpan.textContent = dateObj.date;
  prevBtn.disabled = currentDateIndex === 0;
  nextBtn.disabled = currentDateIndex === showtimes.length - 1;
}

function renderTable() {
  const table = document.getElementById('movies-table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  const dateShowtimes = getShowtimesForDate(currentDateIndex);

  // Build filtered list
  let filtered = dateShowtimes.filter(entry => {
    const movie = getMovieByTitle(entry.movie_title);
    if (!movie) return false;
    let text = [movie.title, movie.rating, movie.runtime, ...movie.attributes].join(' ');
    text += entry.formats.map(f => f.name + ' ' + f.showtimes.join(' ')).join(' ');
    return text.toLowerCase().includes(filterValue.toLowerCase());
  });

  // Table columns
  const columns = [
  { key: "id", label: "ID" },
  { key: "poster", label: "Poster" },
  { key: "title", label: "Title" },
  { key: "rating", label: "Rating" },
  { key: "runtime", label: "Runtime" },
  { key: "rottenTomatoes", label: "Rotten Tomatoes" },
  { key: "metacritic", label: "Metacritic" },
  { key: "imdb", label: "IMDb" },
  { key: "formats", label: "Formats" },
  { key: "showtimes", label: "Showtimes" },
  { key: "actions", label: "Actions" }
  ];
  const activeCols = columns.filter(col => visibleColumns.includes(col.key));

  // Render header
  thead.innerHTML = '<tr>' + activeCols.map(col => `<th>${col.label}</th>`).join('') + '</tr>';

  // Render body
  tbody.innerHTML = '';
  filtered.forEach(entry => {
    const movie = getMovieByTitle(entry.movie_title);
    if (!movie) return;
    let row = '';
    let isWatched = getWatched(movie.title);
    let isNotInterested = getNotInterested(movie.title);
    let rowClass = '';
    if (isWatched) rowClass = 'row-watched';
    if (isNotInterested) rowClass = 'row-not-interested';
    activeCols.forEach(col => {
      if (col.key === "id") {
        row += `<td>${movie.id}</td>`;
      } else if (col.key === "poster") {
        row += `<td><img src="${movie.poster}" alt="${movie.title} poster" style="width:48px;height:auto;border-radius:4px;" /></td>`;
      } else if (col.key === "title") {
        row += `<td>${movie.title}</td>`;
      } else if (col.key === "rating") {
        row += `<td>${movie.rating}</td>`;
      } else if (col.key === "runtime") {
        row += `<td>${movie.runtime}</td>`;
      } else if (col.key === "rottenTomatoes") {
        row += `<td>${movie.rottenTomatoes || ''}</td>`;
      } else if (col.key === "metacritic") {
        row += `<td>${movie.metacritic != null ? movie.metacritic : ''}</td>`;
      } else if (col.key === "imdb") {
        row += `<td>${movie.imdb || ''}</td>`;
      } else if (col.key === "formats") {
        row += `<td>` + entry.formats.map(f => {
          let isNonStandard = f.name !== "Standard Format Luxury Lounger";
          let cls = isNonStandard ? 'format-nonstandard' : '';
          let suffix = isNonStandard ? ' *' : '';
          return `<span class=\"${cls}\">${f.name}${suffix}</span>`;
        }).join('<br>') + `</td>`;
      } else if (col.key === "showtimes") {
        row += `<td>` + entry.formats.map(f => {
          let isNonStandard = f.name !== "Standard Format Luxury Lounger";
          return f.showtimes.map(st => `<span class=\"showtime-box\">${st}${isNonStandard ? ' *' : ''}</span>`).join(' ');
        }).join('<br>') + `</td>`;
      } else if (col.key === "actions") {
        row += `<td>` + renderActionToggles(movie.title) + `</td>`;
      }
    });
    tbody.innerHTML += `<tr id="row-${movie.title}" class="${rowClass}">${row}</tr>`;
  });
}

function renderActionToggles(title) {
  const watched = getWatched(title);
  const notInterested = getNotInterested(title);
  let html = '';
  // Escape single quotes for JS string
  const escTitle = title.replace(/'/g, "\\'");
  if (watched) {
    html += `<button class="action-toggle watched" title="Watched" onclick="toggleWatched('${escTitle}')">&#x2714;</button>`;
    // Hide not interested button
  } else if (notInterested) {
    html += `<button class="action-toggle not-interested" title="Not Interested" onclick="toggleNotInterested('${escTitle}')">&#x2716;</button>`;
    // Hide watched button
  } else {
    html += `<button class="action-toggle" title="Watched" onclick="toggleWatched('${escTitle}')">&#x2714;</button>`;
    html += `<button class="action-toggle" title="Not Interested" onclick="toggleNotInterested('${escTitle}')">&#x2716;</button>`;
  }
  return html;
}

function getWatched(title) {
  return localStorage.getItem('watched_' + title) === '1';
}
function getNotInterested(title) {
  return localStorage.getItem('notinterested_' + title) === '1';
}
function toggleWatched(title) {
  if (getWatched(title)) {
    localStorage.setItem('watched_' + title, '0');
  } else {
    localStorage.setItem('watched_' + title, '1');
    localStorage.setItem('notinterested_' + title, '0'); // Remove not interested
  }
  renderTable();
}
function toggleNotInterested(title) {
  if (getNotInterested(title)) {
    localStorage.setItem('notinterested_' + title, '0');
  } else {
    localStorage.setItem('notinterested_' + title, '1');
    localStorage.setItem('watched_' + title, '0'); // Remove watched
  }
  renderTable();
}

function setupDateSelector() {
  document.getElementById('prev-date').onclick = () => {
    if (currentDateIndex > 0) {
      currentDateIndex--;
      renderDateSelector();
      renderTable();
    }
  };
  document.getElementById('next-date').onclick = () => {
    if (currentDateIndex < showtimes.length - 1) {
      currentDateIndex++;
      renderDateSelector();
      renderTable();
    }
  };
}

function setupFilter() {
  document.getElementById('filter-input').oninput = e => {
    filterValue = e.target.value;
    renderTable();
  };
}

function setupSettingsPanel() {
  const btn = document.getElementById('settings-btn');
  const panel = document.getElementById('settings-panel');
  btn.onclick = () => {
    panel.classList.toggle('hidden');
  };
}

window.onload = async function() {
  movies = await loadJSON(MOVIES_URL);
  let ratings = [];
  try {
    ratings = await loadJSON(RATINGS_URL);
  } catch (e) {
    ratings = [];
  }
  // Merge ratings into movies by id
  if (Array.isArray(ratings)) {
    const ratingsMap = {};
    ratings.forEach(r => { ratingsMap[r.id] = r; });
    movies.forEach(m => {
      const r = ratingsMap[m.id];
      if (r) {
        m.rottenTomatoes = r.rottenTomatoes || '';
        m.metacritic = r.metacritic != null ? r.metacritic : '';
        m.imdb = r.imdb || '';
      }
    });
  }
  showtimes = await loadJSON(SHOWTIMES_URL);
  if (window.loadVisibleColumns) {
    loadVisibleColumns();
  }
  setupDateSelector();
  setupFilter();
  setupSettingsPanel();
  renderDateSelector();
  renderTable();
};
