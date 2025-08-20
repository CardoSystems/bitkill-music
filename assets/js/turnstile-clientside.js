// Cloudflare Turnstile bulletproof client-side validation for Web3Forms

window.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contact-form');
  var turnstileError = document.getElementById('turnstile-error');
  var turnstileInput = document.getElementById('cf-turnstile-response');
  var turnstileWidget = document.querySelector('.cf-turnstile');
  var submitBtn = form.querySelector('button[type="submit"]');
  var isSubmitting = false;
  var cooldown = false;
  var cooldownTime = 5000; // 5 seconds cooldown after failed attempt

  function isTurnstileValid() {
    return turnstileInput && turnstileInput.value && turnstileInput.value.length > 0;
  }
  function setSubmitEnabled(enabled) {
    if (submitBtn) submitBtn.disabled = !enabled || isSubmitting || cooldown;
    if (enabled) {
      form.classList.add('turnstile-valid');
      form.classList.remove('turnstile-invalid');
    } else {
      form.classList.remove('turnstile-valid');
      form.classList.add('turnstile-invalid');
    }
  }
  setSubmitEnabled(false);

  // Show error if widget fails to render
  function showWidgetError(msg) {
    turnstileError.style.display = 'block';
    turnstileError.textContent = msg || 'CAPTCHA failed to load. Please disable adblockers or try again.';
    setSubmitEnabled(false);
    // Auto-scroll error into view
    setTimeout(function() {
      turnstileError.scrollIntoView({behavior: 'smooth', block: 'center'});
      turnstileError.focus();
    }, 100);
  }

  // Listen for Turnstile callback to set the hidden input
  window.turnstileCallback = function(token) {
    turnstileInput.value = token;
    turnstileError.style.display = 'none';
    setSubmitEnabled(true);
    // Visual feedback
    form.classList.add('turnstile-success');
    form.classList.remove('turnstile-invalid');
    setTimeout(function() { form.classList.remove('turnstile-success'); }, 1200);
    // Focus first input for accessibility
    var firstInput = form.querySelector('input:not([type=hidden]):not([tabindex="-1"])');
    if (firstInput) firstInput.focus();
  };
  window.turnstileExpired = function() {
    turnstileInput.value = '';
    setSubmitEnabled(false);
    showWidgetError('CAPTCHA expired. Please try again.');
    // Reset widget
    if (typeof turnstile !== 'undefined' && turnstileWidget) {
      try { turnstile.reset(turnstileWidget); } catch (e) {}
    }
  };

  // Prevent form submission if Turnstile is not solved or double submit
  form.addEventListener('submit', function(e) {
    if (isSubmitting || cooldown) {
      e.preventDefault();
      return false;
    }
    if (!isTurnstileValid()) {
      e.preventDefault();
      showWidgetError('Please complete the CAPTCHA.');
      setSubmitEnabled(false);
      // Visual feedback
      form.classList.add('turnstile-invalid');
      // Cooldown after failed attempt
      cooldown = true;
      setSubmitEnabled(false);
      setTimeout(function() {
        cooldown = false;
        setSubmitEnabled(isTurnstileValid());
      }, cooldownTime);
      // Reset widget
      if (typeof turnstile !== 'undefined' && turnstileWidget) {
        try { turnstile.reset(turnstileWidget); } catch (e) {}
      }
      return false;
    }
    isSubmitting = true;
    setSubmitEnabled(false);
    turnstileError.style.display = 'none';
    // Add loading state
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'SENDING...';
    // Disable all inputs
    var allInputs = form.querySelectorAll('input, textarea, select, button');
    allInputs.forEach(function(inp) { inp.disabled = true; });

    // Listen for actual response (simulate with timeout, replace with AJAX/fetch if needed)
    setTimeout(function() {
      isSubmitting = false;
      submitBtn.classList.remove('loading');
      submitBtn.textContent = 'TRANSMIT DATA';
      // Re-enable all inputs
      allInputs.forEach(function(inp) { inp.disabled = false; });
      setSubmitEnabled(isTurnstileValid());
      // Reset widget after submit
      if (typeof turnstile !== 'undefined' && turnstileWidget) {
        try { turnstile.reset(turnstileWidget); } catch (e) {}
      }
      turnstileInput.value = '';
    }, 4000);
  });
  // Optionally, listen for AJAX/fetch response and reset state there instead of timeout
  // Add CSS classes for visual feedback (success/error)

  // Wait for Turnstile API to load, then render widget
  var widgetRendered = false;
  function renderTurnstileWhenReady(attempts) {
    attempts = attempts || 0;
    if (typeof turnstile !== 'undefined' && turnstileWidget) {
      try {
        turnstile.render(turnstileWidget, {
          sitekey: turnstileWidget.getAttribute('data-sitekey'),
          callback: window.turnstileCallback,
          'expired-callback': window.turnstileExpired,
          'error-callback': function() {
            showWidgetError('CAPTCHA failed to load. Please refresh.');
          }
        });
        widgetRendered = true;
      } catch (err) {
        showWidgetError('CAPTCHA error: ' + err.message);
      }
    } else if (attempts < 50) {
      setTimeout(function() { renderTurnstileWhenReady(attempts + 1); }, 100);
    } else {
      showWidgetError();
    }
  }
  renderTurnstileWhenReady();

  // Accessibility: focus error on error
  turnstileError.setAttribute('tabindex', '-1');
  turnstileError.setAttribute('role', 'alert');
});
