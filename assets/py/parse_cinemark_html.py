import json
from bs4 import BeautifulSoup


import json
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta


BASE_URL = "https://www.cinemark.com/theatres/nc-charlotte/cinemark-bistro-charlotte"
MOVIES_JSON = "assets/py/movies.json"
SHOWTIMES_JSON = "assets/py/showtimes.json"

clean = lambda s: s.strip() if s else ""

def fetch_html_for_date(date_str):
    url = BASE_URL if date_str == datetime.today().strftime('%Y-%m-%d') else f"{BASE_URL}?showDate={date_str}"
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def parse_showtimes(html):
    soup = BeautifulSoup(html, "html.parser")
    showtimes_inner = soup.find("div", id="showtimesInner")
    if not showtimes_inner:
        return []
    movies = []
    for movie_block in showtimes_inner.find_all("div", class_="showtimeMovieBlock"):
        h3 = movie_block.find("h3")
        title = clean(h3.text) if h3 else None
        movie_id = h3.get("id") if h3 else None
        link_tag = movie_block.find("a", class_="movieLink")
        movie_link = link_tag["href"] if link_tag and link_tag.has_attr("href") else None
        poster_img = movie_block.find("img", class_="img-responsive")
        poster_url = poster_img.get("data-srcset") if poster_img and poster_img.has_attr("data-srcset") else None
        rating_tag = movie_block.find("span", class_="showtimeMovieRating")
        rating = clean(rating_tag.text) if rating_tag else None
        runtime_tag = movie_block.find("span", class_="showtimeMovieRuntime")
        runtime = clean(runtime_tag.text) if runtime_tag else None
        attr_list = movie_block.find("ul", class_="attribute-list--movie-attributes")
        attributes = []
        if attr_list:
            for li in attr_list.find_all("li", class_="attribute-list__item"):
                attributes.append(clean(li.text))

        formats_map = {}
        showtimes_section = movie_block.find_all("div", class_="movieBlockShowtimes")
        for show_block in showtimes_section:
            showtime_rows = show_block.find_all("div", class_="showtime")
            for st_row in showtime_rows:
                st_format = st_row.get("data-print-type-name", "Standard").strip()
                a = st_row.find("a", class_="showtime-link")
                if a:
                    if st_format not in formats_map:
                        formats_map[st_format] = []
                    formats_map[st_format].append(clean(a.text))
        formats = []
        for fmt_name, showtimes in formats_map.items():
            formats.append({
                "name": fmt_name,
                "showtimes": showtimes
            })

        movies.append({
            "id": movie_id,
            "title": title,
            "link": movie_link,
            "poster": poster_url,
            "rating": rating,
            "runtime": runtime,
            "attributes": attributes,
            "formats": formats
        })
    return movies

def main():

    today = datetime.today()
    all_movies = {}
    showtimes_results = []

    for i in range(7):
        date_obj = today + timedelta(days=i)
        date_str = date_obj.strftime('%Y-%m-%d')
        print(f"Fetching and parsing for date: {date_str}")
        html = fetch_html_for_date(date_str)
        movies = parse_showtimes(html)
        day_showtimes = []
        for m in movies:
            mid = m["id"]
            mtitle = m["title"]
            # If movie already seen, compare properties for consistency
            if mid in all_movies:
                for key in ["title", "link", "poster", "rating", "runtime", "attributes"]:
                    if m[key] != all_movies[mid][key]:
                        print(f"[WARN] Movie {mid} property '{key}' differs on {date_str}. Using earliest date's value.")
            else:
                all_movies[mid] = {k: m[k] for k in ["id", "title", "link", "poster", "rating", "runtime", "attributes"]}
            # Only store showtimes/formats for this date
            day_showtimes.append({
                "movie_title": mtitle,
                "formats": m["formats"]
            })
        showtimes_results.append({
            "date": date_str,
            "showtimes": day_showtimes
        })

    # Write unique movies
    with open(MOVIES_JSON, "w", encoding="utf-8") as f:
        json.dump(list(all_movies.values()), f, indent=2, ensure_ascii=False)
    # Write showtimes by date
    with open(SHOWTIMES_JSON, "w", encoding="utf-8") as f:
        json.dump(showtimes_results, f, indent=2, ensure_ascii=False)
    print(f"Parsed movies and showtimes for 7 days. Output: {MOVIES_JSON}, {SHOWTIMES_JSON}")

if __name__ == "__main__":
    main()
