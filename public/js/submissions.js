document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading');
  const empty = document.getElementById('empty');
  const grid = document.getElementById('grid');

  load();

  async function load() {
    try {
      const res = await fetch('/api/feedback');
      const json = await res.json();

      loading.style.display = 'none';

      if (!json.success || !json.data || json.data.length === 0) {
        empty.style.display = 'block';
        return;
      }

      grid.style.display = 'grid';
      render(json.data);
    } catch {
      loading.style.display = 'none';
      empty.style.display = 'block';
      empty.querySelector('h3').textContent = 'Unable to load';
      empty.querySelector('.hint').textContent = 'Make sure the server is running.';
    }
  }

  function render(items) {
    grid.innerHTML = '';

    items.forEach((d, i) => {
      const el = document.createElement('article');
      el.className = 'sub-card';
      el.style.animationDelay = `${i * 0.04}s`;

      const initials = d.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

      const stars = Array.from({ length: 5 }, (_, j) =>
        `<span class="${j < d.rating ? 'on' : ''}">★</span>`
      ).join('');

      // Parse SQLite timestamp as UTC and display in local time
      const ts = d.submitted_at.replace(' ', 'T') + 'Z';
      const date = new Date(ts);
      const fmt = date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      el.innerHTML = `
        <div class="sub-top">
          <div class="sub-user">
            <div class="avatar">${initials}</div>
            <div>
              <div class="sub-name">${esc(d.name)}</div>
              <div class="sub-email">${esc(d.email)}</div>
            </div>
          </div>
          <div class="sub-stars">${stars}</div>
        </div>
        <div class="sub-event">${esc(d.event)}</div>
        ${d.comments ? `<p class="sub-comment">${esc(d.comments)}</p>` : ''}
        <div class="sub-time">${fmt}</div>
      `;

      grid.appendChild(el);
    });
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
});
