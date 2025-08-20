// Cloudflare Turnstile bulletproof client-side validation for Web3Forms
window.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contact-form');
  var turnstileError = document.getElementById('turnstile-error');
  var turnstileInput = document.getElementById('cf-turnstile-response');
  var turnstileWidget = document.querySelector('.cf-turnstile');
  var submitBtn = form.querySelector('button[type="submit"]');

  function isTurnstileValid() {
    return turnstileInput && turnstileInput.value && turnstileInput.value.length > 0;
  }
  function setSubmitEnabled(enabled) {
    if (submitBtn) submitBtn.disabled = !enabled;
    if (enabled) {
      form.classList.add('turnstile-valid');
    } else {
      form.classList.remove('turnstile-valid');
    }
  }
  setSubmitEnabled(false);

  // Show error if widget fails to render
  function showWidgetError() {
    turnstileError.style.display = 'block';
    turnstileError.textContent = 'CAPTCHA failed to load. Please disable adblockers or try again.';
    setSubmitEnabled(false);
  }

  // Listen for Turnstile callback to set the hidden input
  window.turnstileCallback = function(token) {
    turnstileInput.value = token;
    turnstileError.style.display = 'none';
    setSubmitEnabled(true);
  };
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
  var widgetRendered = false;
  function renderTurnstileWhenReady(attempts) {
    attempts = attempts || 0;
    if (typeof turnstile !== 'undefined' && turnstileWidget) {
      try {
        turnstile.render(turnstileWidget, {
          sitekey: turnstileWidget.getAttribute('data-sitekey'),
          callback: window.turnstileCallback,
          'expired-callback': window.turnstileExpired
        });
        widgetRendered = true;
      } catch (err) {
        showWidgetError();
      }
    } else if (attempts < 50) {
      setTimeout(function() { renderTurnstileWhenReady(attempts + 1); }, 100);
    } else {
      showWidgetError();
    }
  }
  renderTurnstileWhenReady();
});
