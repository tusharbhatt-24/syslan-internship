document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedbackForm');
  const submitBtn = document.getElementById('submitBtn');
  const alertOk = document.getElementById('alertOk');
  const alertErr = document.getElementById('alertErr');
  const alertErrMsg = document.getElementById('alertErrMsg');

  // ===== Star Rating =====
  const starsGroup = document.getElementById('starsGroup');
  const starLabels = starsGroup.querySelectorAll('label');
  let rating = 0;

  starLabels.forEach(label => {
    label.addEventListener('click', () => {
      rating = parseInt(label.dataset.val, 10);
      paintStars(rating);
      clearErr('ratingErr', null);
    });

    label.addEventListener('mouseenter', () => paintStars(parseInt(label.dataset.val, 10)));
    label.addEventListener('mouseleave', () => paintStars(rating));
  });

  function paintStars(n) {
    starLabels.forEach(l => {
      l.classList.toggle('lit', parseInt(l.dataset.val, 10) <= n);
    });
  }

  // ===== Validation =====
  function validate() {
    let ok = true;
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const event = document.getElementById('event');

    if (!name.value.trim()) { showErr('nameErr', name); ok = false; } else { clearErr('nameErr', name); }

    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showErr('emailErr', email); ok = false;
    } else { clearErr('emailErr', email); }

    if (!event.value) { showErr('eventErr', event); ok = false; } else { clearErr('eventErr', event); }

    if (rating === 0) { showErr('ratingErr', null); ok = false; } else { clearErr('ratingErr', null); }

    return ok;
  }

  function showErr(id, el) {
    const e = document.getElementById(id);
    if (e) e.classList.add('show');
    if (el) el.classList.add('invalid');
  }

  function clearErr(id, el) {
    const e = document.getElementById(id);
    if (e) e.classList.remove('show');
    if (el) el.classList.remove('invalid');
  }

  // Clear on interaction — listen to both 'input' and 'change' events
  ['name', 'email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { clearErr(id + 'Err', el); hideAlerts(); });
  });

  const eventEl = document.getElementById('event');
  if (eventEl) eventEl.addEventListener('change', () => { clearErr('eventErr', eventEl); hideAlerts(); });

  // ===== Submit =====
  form.addEventListener('submit', async e => {
    e.preventDefault();
    hideAlerts();

    if (!validate()) return;

    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      event: document.getElementById('event').value,
      rating,
      comments: document.getElementById('comments').value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alertOk.classList.add('show');
        form.reset();
        rating = 0;
        paintStars(0);
        setTimeout(() => alertOk.classList.remove('show'), 5000);
      } else {
        alertErrMsg.textContent = data.errors ? data.errors.join(' ') : 'Submission failed.';
        alertErr.classList.add('show');
      }
    } catch {
      alertErrMsg.textContent = 'Network error. Check your connection.';
      alertErr.classList.add('show');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Feedback';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function hideAlerts() {
    alertOk.classList.remove('show');
    alertErr.classList.remove('show');
  }
});
