const list = document.querySelector('[data-news-pagination]');

if (list) {
  const cards = [...list.querySelectorAll('.news-card')];
  const navigation = list.querySelector('.news-pagination');
  const previous = navigation.querySelector('[data-news-previous]');
  const next = navigation.querySelector('[data-news-next]');
  const status = navigation.querySelector('[data-news-page-label]');
  const filters = list.querySelector('.news-filters');
  const year = filters.querySelector('[data-news-year]');
  const month = filters.querySelector('[data-news-month]');
  const nature = filters.querySelector('select[data-news-nature]');
  const domain = filters.querySelector('[data-news-domain]');
  const controls = [['year', year], ['month', month], ['nature', nature], ['domain', domain]];
  let pages = 1;
  let current = 1;

  const render = (moveFocus = false) => {
    const params = new URL(location.href).searchParams;
    controls.forEach(([key, control]) => { control.value = params.get(key) || ''; });
    const matching = cards.filter((card) => (!year.value || card.dataset.newsDate.startsWith(year.value))
      && (!month.value || card.dataset.newsDate.slice(5, 7) === month.value)
      && (!nature.value || card.dataset.newsNature === nature.value)
      && (!domain.value || card.dataset.newsDomains.split(' ').includes(domain.value)));
    pages = Math.max(1, Math.ceil(matching.length / 9));
    const value = params.get('page');
    const requested = value && /^\d+$/.test(value) ? Number(value) : 1;
    current = Math.max(1, Math.min(pages, requested));
    cards.forEach((card) => { card.hidden = true; });
    matching.slice((current - 1) * 9, current * 9).forEach((card) => { card.hidden = false; });
    previous.disabled = current === 1;
    next.disabled = current === pages;
    status.textContent = matching.length ? status.dataset.newsPageLabel.replace('{page}', current).replace('{pages}', pages) : status.dataset.newsEmptyLabel;
    navigation.hidden = false;
    filters.hidden = false;
    document.querySelectorAll('.lang a, .footer-languages a').forEach((link) => {
      const url = new URL(link.href);
      if (current === 1) url.searchParams.delete('page');
      else url.searchParams.set('page', current);
      for (const [key, control] of controls) {
        const value = control.value;
        if (value) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      }
      link.href = url.href;
    });
    if (moveFocus) {
      list.focus({ preventScroll: true });
      list.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  };
  const navigate = (page) => {
    const url = new URL(location.href);
    if (page === 1) url.searchParams.delete('page');
    else url.searchParams.set('page', page);
    history.pushState(null, '', url);
    render(true);
  };
  previous.addEventListener('click', () => navigate(current - 1));
  next.addEventListener('click', () => navigate(current + 1));
  filters.addEventListener('change', () => {
    const url = new URL(location.href);
    url.searchParams.delete('page');
    for (const [key, control] of controls) {
      const value = control.value;
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    history.pushState(null, '', url);
    render();
  });
  window.addEventListener('popstate', () => render(true));
  render();
}
