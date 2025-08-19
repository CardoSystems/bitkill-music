// Cloudflare Turnstile robust client-side validation for Web3Forms
window.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contact-form');
  var turnstileError = document.getElementById('turnstile-error');
  var turnstileInput = document.getElementById('cf-turnstile-response');
  var turnstileWidget = document.querySelector('.cf-turnstile');
  var submitBtn = form.querySelector('button[type="submit"]');

  // Helper to check if token is present
  function isTurnstileValid() {
    return turnstileInput && turnstileInput.value && turnstileInput.value.length > 0;
  }

  // Disable submit button until Turnstile is solved
  function setSubmitEnabled(enabled) {
    if (submitBtn) submitBtn.disabled = !enabled;
  }
  setSubmitEnabled(false);

  // Listen for Turnstile callback to set the hidden input
  window.turnstileCallback = function(token) {
    turnstileInput.value = token;
    turnstileError.style.display = 'none';
    setSubmitEnabled(true);
  };
  // Listen for Turnstile expiration to disable submit again
  window.turnstileExpired = function() {
    turnstileInput.value = '';
    setSubmitEnabled(false);
  };

  // Prevent form submission if Turnstile is not solved
  form.addEventListener('submit', function(e) {
    if (!isTurnstileValid()) {
      e.preventDefault();
      turnstileError.style.display = 'block';
      turnstileError.textContent = 'Please complete the CAPTCHA.';
      setSubmitEnabled(false);
      return false;
    }
    turnstileError.style.display = 'none';
    setSubmitEnabled(true);
  });

  // Wait for Turnstile API to load, then render widget
  function renderTurnstileWhenReady() {
    if (typeof turnstile !== 'undefined' && turnstileWidget) {
      turnstile.render(turnstileWidget, {
        sitekey: turnstileWidget.getAttribute('data-sitekey'),
        callback: window.turnstileCallback,
        'expired-callback': window.turnstileExpired
      });
    } else {
      setTimeout(renderTurnstileWhenReady, 100);
    }
  }
  renderTurnstileWhenReady();
});
