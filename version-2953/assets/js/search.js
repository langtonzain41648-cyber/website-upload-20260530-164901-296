(function () {
  var form = document.querySelector('[data-search-form]');
  var box = form && form.querySelector('input[name="q"]');
  var results = document.querySelector('[data-search-results]');
  if (!form || !box || !results || !window.SEARCH_MOVIES) return;

  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  box.value = initial;

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + tag + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a href="' + movie.url + '">' +
        '<figure><img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy"><span class="card-badge">' + movie.type + '</span></figure>' +
        '<div class="movie-card-body">' +
          '<div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span></div>' +
          '<h3>' + movie.title + '</h3>' +
          '<p>' + movie.oneLine + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</a>' +
    '</article>';
  }

  function render(query) {
    var q = query.trim().toLowerCase();
    if (!q) return;
    var words = q.split(/\s+/).filter(Boolean);
    var matches = SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.year, movie.region, movie.type, movie.category, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      return words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
    }).slice(0, 120);
    if (!matches.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
      return;
    }
    results.innerHTML = '<div class="movie-grid">' + matches.map(card).join('') + '</div>';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render(box.value);
    var url = new URL(window.location.href);
    url.searchParams.set('q', box.value.trim());
    history.replaceState(null, '', url.toString());
  });

  if (initial) render(initial);
})();
