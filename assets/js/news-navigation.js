const tools = document.querySelector('.article-mobile-tools');
const header = document.querySelector('.site-header');

if (tools && header) {
  const updateOffset = () => {
    document.documentElement.style.setProperty('--news-sticky-top', `${header.getBoundingClientRect().height + 12}px`);
  };
  new ResizeObserver(updateOffset).observe(header);
  updateOffset();

  tools.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      tools.querySelectorAll('details[open]').forEach((detail) => { detail.open = false; });
    }
  });
  tools.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const detail = tools.querySelector('details[open]');
    if (detail) {
      detail.open = false;
      detail.querySelector('summary').focus();
    }
  });
}
