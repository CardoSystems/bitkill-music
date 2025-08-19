// Cloudflare Turnstile client-side validation
window.onload = function() {
  var form = document.getElementById('contact-form');
  var turnstileError = document.getElementById('turnstile-error');
  form.addEventListener('submit', function(e) {
    var token = document.querySelector('input[name="cf-turnstile-response"]').value;
    if (!token) {
      e.preventDefault();
      turnstileError.style.display = 'block';
      return false;
    } else {
      turnstileError.style.display = 'none';
    }
  });
  // Listen for Turnstile callback to set the hidden input
  window.turnstileCallback = function(token) {
    document.getElementById('cf-turnstile-response').value = token;
  };
};
// Register Turnstile callback
window.onloadTurnstile = function() {
  turnstile.render(document.querySelector('.cf-turnstile'), {
    sitekey: '0x4AAAAAABoZlpXdAQbvzlo-',
    callback: window.turnstileCallback
  });
};