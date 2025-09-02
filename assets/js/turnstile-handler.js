/**
 * BITKILL - Cloudflare Turnstile Form Handler
 * Prevents form submission without valid Turnstile token
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get references to form elements
  const contactForm = document.getElementById('contact-form');
  const turnstileError = document.getElementById('turnstile-error');
  const submitButton = contactForm.querySelector('button[type="submit"]');

  // Function to validate the Turnstile token before form submission
  function validateTurnstileToken(event) {
    // Get the Turnstile response token
    const turnstileResponse = document.getElementById('cf-turnstile-response').value;
    
    // Check if the token exists
    if (!turnstileResponse || turnstileResponse.trim() === '') {
      // Prevent form submission
      event.preventDefault();
      
      // Show error message
      turnstileError.style.display = 'block';
      
      // Add glitch animation to the error message
      turnstileError.classList.add('glitch-text');
      
      // Scroll to the error message
      turnstileError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        turnstileError.style.display = 'none';
        turnstileError.classList.remove('glitch-text');
      }, 5000);
      
      return false;
    }
    
    // If token exists, hide error message (if visible)
    turnstileError.style.display = 'none';
    return true;
  }

  // Add event listener to the form for submission
  if (contactForm) {
    contactForm.addEventListener('submit', validateTurnstileToken);
  }

  // Add Turnstile callback function to window object
  window.onTurnstileSuccess = function() {
    // Enable submit button when Turnstile is successfully completed
    if (submitButton) {
      submitButton.disabled = false;
      
      // Optional: Add visual indicator that the form is ready to submit
      submitButton.classList.add('ready');
      
      // Hide error message if it's visible
      turnstileError.style.display = 'none';
    }
  };

  // Optional: Disable submit button until Turnstile is completed
  if (submitButton) {
    submitButton.disabled = true;
  }

  // Watch for token expiration and handle accordingly
  window.turnstileCallback = function(token) {
    document.getElementById('cf-turnstile-response').value = token;
    
    // When token is received, enable the submit button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.classList.add('ready');
    }
    
    // Hide error message if it's visible
    turnstileError.style.display = 'none';
  };
  
  // Handle token expiration
  window.turnstileExpired = function() {
    document.getElementById('cf-turnstile-response').value = '';
    
    // When token expires, disable the submit button
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.remove('ready');
    }
  };
});