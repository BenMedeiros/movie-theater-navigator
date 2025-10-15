# Movie Theater Navigator

A static, mobile-friendly web app for browsing movie showtimes and ratings from Cinemark theaters.

**Live Demo:** [https://benmedeiros.github.io/movie-theater-navigator/](https://benmedeiros.github.io/movie-theater-navigator/)

## Features
- Parses Cinemark HTML to generate `movies.json` and `showtimes.json` (Python script)
- Displays showtimes in a responsive table with advanced filtering and column toggles
- Shows movie posters, ratings (Rotten Tomatoes, Metacritic, IMDb), and user actions (watched/not interested)
- User actions and column settings persist via localStorage
- Modular frontend: HTML, vanilla JS, CSS
- Data files: `movies.json`, `showtimes.json`, `movie_ratings.json`

## Setup
1. **Python Parsing (optional):**
   - Run `assets/py/parse_cinemark_html.py` to generate `movies.json` and `showtimes.json` from Cinemark HTML
   - Run `assets/py/fetch_movie_ratings.py` to fetch ratings and save to `movie_ratings.json`
2. **Manual Data Entry:**
   - You can manually edit `movies.json`, `showtimes.json`, and `movie_ratings.json` as needed
3. **Static Site:**
   - Open `index.html` in your browser
   - Or run a local server: `python -m http.server 8000`

## Usage
- Use the date selector to browse showtimes by day
- Toggle columns in the settings panel to customize the table
- Mark movies as "watched" or "not interested" (mutually exclusive)
- Ratings columns show Rotten Tomatoes, Metacritic, and IMDb scores

## File Structure
- `index.html` — Main webpage
- `assets/css/style.css` — Styles
- `assets/js/main.js` — Main logic
- `assets/js/settings.js` — Column toggles
- `assets/py/parse_cinemark_html.py` — Cinemark HTML parser
- `assets/py/fetch_movie_ratings.py` — Ratings fetcher
- `assets/py/movies.json` — Movie data
- `assets/py/showtimes.json` — Showtimes data
- `assets/py/movie_ratings.json` — Ratings data

## Notes
- All data is loaded client-side; no backend required
- CORS restrictions prevent direct client-side scraping of external sites
- For personal use, you can run the Python scripts to update data

---

Feel free to customize or expand the project for your own needs!
