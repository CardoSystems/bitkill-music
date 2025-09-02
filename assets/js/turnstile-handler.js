/**
 * BITKILL - Cloudflare Turnstile Form Handler
 * Prevents form submission without valid Turnstile token
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get references to form elements
  const contactForm = document.getElementById('contact-form');
  const turnstileError = document.getElementById('turnstile-error');
  const submitButton = contactForm.querySelector('button[type="submit"]');

  // Add visual indicators for initial state
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.classList.add('waiting-verification');
    console.log('[Turnstile] Submit button disabled until verification');
  }

  // Function to validate the Turnstile token before form submission
  function validateTurnstileToken(event) {
    // Get the Turnstile response token
    const turnstileResponse = document.getElementById('cf-turnstile-response').value;
    
    // Check if the token exists
    if (!turnstileResponse || turnstileResponse.trim() === '') {
      // Prevent form submission
      event.preventDefault();
      
      // Show error message with glitch effect
      turnstileError.style.display = 'block';
      turnstileError.classList.add('glitch-text');
      
      // Play error sound if sound-input.js is available
      if (typeof playGlitchSound === 'function') {
        playGlitchSound('error');
      }
      
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
    
    // Play submit sound if sound-input.js is available
    if (typeof playGlitchSound === 'function') {
      playGlitchSound('submit');
    }
    
    return true;
  }

  // Add event listener to the form for submission
  if (contactForm) {
    contactForm.addEventListener('submit', validateTurnstileToken);
  }

  // Set up Turnstile callbacks
  // This one is called by the Turnstile widget when successfully completed
  window.turnstileCallback = function(token) {
    document.getElementById('cf-turnstile-response').value = token;
    
    // When token is received, enable the submit button and add validation class
    if (contactForm) {
      // Add class to show the submit button via CSS
      contactForm.classList.add('turnstile-valid');
      
      // Enable the button and update its state
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('waiting-verification');
        submitButton.classList.add('ready');
        
        // Flash effect on sound waves
        const soundWaves = submitButton.querySelectorAll('.sound-wave');
        soundWaves.forEach(wave => {
          wave.style.background = 'var(--glitch-color2)';
          setTimeout(() => {
            wave.style.background = '';
          }, 500);
        });
      }
    }
    
    // Hide error message if it's visible
    turnstileError.style.display = 'none';
    
    // Play success sound if sound-input.js is available
    if (typeof playGlitchSound === 'function') {
      playGlitchSound('key');
    }
    
    console.log('[Turnstile] Verification completed successfully');
  };
  
  // Handle token expiration
  window.turnstileExpired = function() {
    document.getElementById('cf-turnstile-response').value = '';
    
    // When token expires, disable the submit button and remove validation class
    if (contactForm) {
      contactForm.classList.remove('turnstile-valid');
      
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('waiting-verification');
        submitButton.classList.remove('ready');
      }
    }
    
    console.log('[Turnstile] Token expired, verification required');
  };
});