/**
 * BITKILL Music - Contact Form Handler
 * Cyberpunk-themed form with glitch effects
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the form element
  const form = document.querySelector('.glitch-form');
  
  if (form) {
    // Add glitch effects to form controls on focus
    const formControls = document.querySelectorAll('.form-control');
    
    formControls.forEach(control => {
      // Add glitch effect on focus
      control.addEventListener('focus', function() {
        this.classList.add('glitching');
        
        // Simulate terminal typing sound
        playGlitchSound('key');
      });
      
      // Remove glitch effect on blur
      control.addEventListener('blur', function() {
        this.classList.remove('glitching');
      });
      
      // Add subtle glitch on keypress for inputs and textareas
      if (control.tagName === 'INPUT' || control.tagName === 'TEXTAREA') {
        control.addEventListener('keypress', function() {
          if (Math.random() > 0.8) {
            playGlitchSound('key');
          }
        });
      }
    });
    
    // Form submission with glitch effect
    form.addEventListener('submit', function(e) {
      // Always prevent default to handle submission with AJAX
      e.preventDefault();
      
      // Check if Turnstile token exists
      const turnstileResponse = document.getElementById('cf-turnstile-response');
      if (turnstileResponse && (!turnstileResponse.value || turnstileResponse.value.trim() === '')) {
        playGlitchSound('error');
        return false; // Let turnstile-handler.js handle this error
      }
      
      // Validate form fields before submission
      const name = form.querySelector('input[name="name"]').value.trim();
      const email = form.querySelector('input[name="email"]').value.trim();
      const message = form.querySelector('textarea[name="message"]').value.trim();
      
      // Check if any required field is empty
      if (!name || !email || !message) {
        playGlitchSound('error');
        const alertDanger = form.querySelector('[data-form-alert-danger]');
        if (alertDanger) {
          alertDanger.removeAttribute('hidden');
          setTimeout(() => {
            alertDanger.setAttribute('hidden', 'hidden');
          }, 5000);
        } else {
          showFormMessage('ERROR: ALL FIELDS REQUIRED', 'error');
        }
        
        // Highlight empty fields with glitch effect
        formControls.forEach(control => {
          if (!control.value.trim()) {
            control.classList.add('error-glitch');
            setTimeout(() => {
              control.classList.remove('error-glitch');
            }, 1000);
          }
        });
        return;
      }
      
      // Add submitting class for glitch animation
      form.classList.add('submitting');
      
      // Play glitch sound
      playGlitchSound('submit');
      
      // Simulate "hacking" terminal effect on the submit button
      const submitBtn = form.querySelector('.form-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'PROCESSING...';
      submitBtn.disabled = true;
      
      // Create and show glitch overlay
      showGlitchOverlay();

      // Prepare form data for submission
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        // Skip the honeypot field
        if (key !== 'botcheck') {
          data[key] = value;
        }
      });
      
      // Submit the form using fetch API
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        // Success handling
        console.log('Success:', data);
        
        // Show success message
        const alertSuccess = form.querySelector('[data-form-alert]');
        if (alertSuccess) {
          alertSuccess.removeAttribute('hidden');
          setTimeout(() => {
            alertSuccess.setAttribute('hidden', 'hidden');
          }, 5000);
        } else {
          showFormMessage('TRANSMISSION COMPLETE', 'success');
        }
        
        // Reset the form and Turnstile
        form.reset();
        form.classList.remove('turnstile-valid'); // Remove the class to hide submit button
        
        // Reload Turnstile widget if possible
        if (typeof turnstile !== 'undefined') {
          turnstile.reset();
        }
        
        // Remove overlay and reset button
        setTimeout(() => {
          removeGlitchOverlay();
          submitBtn.textContent = originalText;
          submitBtn.disabled = true; // Disable again until new Turnstile verification
          submitBtn.classList.remove('ready');
          submitBtn.classList.add('waiting-verification');
          form.classList.remove('submitting');
        }, 2000);
      })
      .catch(error => {
        // Error handling
        console.error('Error:', error);
        
        // Show error message
        const alertDanger = form.querySelector('[data-form-alert-danger]');
        if (alertDanger) {
          alertDanger.removeAttribute('hidden');
          setTimeout(() => {
            alertDanger.setAttribute('hidden', 'hidden');
          }, 5000);
        } else {
          showFormMessage('ERROR: TRANSMISSION FAILED', 'error');
        }
        
        // Remove overlay and reset button
        setTimeout(() => {
          removeGlitchOverlay();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false; // Re-enable for retry
          form.classList.remove('submitting');
        }, 2000);
      });
    });
    
    // Check for success parameter in URL (for when returning from Web3Forms)
    if (window.location.search.includes('success=true')) {
      // Show success message
      const alertSuccess = form.querySelector('[data-form-alert]');
      if (alertSuccess) {
        alertSuccess.removeAttribute('hidden');
        setTimeout(() => {
          alertSuccess.setAttribute('hidden', 'hidden');
        }, 5000);
      } else {
        showFormMessage('TRANSMISSION COMPLETE', 'success');
      }
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
  
  // Function to play glitch sounds
  window.playGlitchSound = function(type) {
    // Check if audio context is already defined
    if (!window.audioContext) {
      try {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.error('Web Audio API not supported:', e);
        return; // Exit if audio API not supported
      }
    }
    
    // Create oscillator
    const oscillator = window.audioContext.createOscillator();
    const gainNode = window.audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(window.audioContext.destination);
    
    // Set type and frequency based on sound type
    if (type === 'key') {
      oscillator.type = 'sine';
      oscillator.frequency.value = 440 + Math.random() * 220;
      gainNode.gain.value = 0.05;
      
      // Start and stop
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 50);
    } else if (type === 'submit') {
      oscillator.type = 'sawtooth';
      gainNode.gain.value = 0.1;
      
      // Frequency sweep
      oscillator.frequency.setValueAtTime(880, window.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, window.audioContext.currentTime + 0.5);
      
      // Start and stop
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 500);
    } else if (type === 'error') {
      oscillator.type = 'square';
      gainNode.gain.value = 0.1;
      
      // Error sound (alternating frequencies)
      oscillator.frequency.setValueAtTime(220, window.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(110, window.audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(220, window.audioContext.currentTime + 0.4);
      
      // Start and stop
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 600);
    }
  };
  
  // Function to show form message
  function showFormMessage(message, type) {
    // Remove any existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
    
    // Add glitch effect
    messageEl.style.animation = 'form-glitch 0.5s infinite';
    
    // Insert after form
    form.parentNode.insertBefore(messageEl, form.nextSibling);
    
    // Remove after 5 seconds
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }
  
  // Function to create and show glitch overlay
  function showGlitchOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'form-glitch-overlay';
    overlay.innerHTML = `
      <div class="glitch-text">ESTABLISHING CONNECTION</div>
      <div class="glitch-lines"></div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add some random glitch effect elements
    for (let i = 0; i < 10; i++) {
      const glitchLine = document.createElement('div');
      glitchLine.className = 'random-glitch-line';
      glitchLine.style.top = `${Math.random() * 100}%`;
      glitchLine.style.left = `${Math.random() * 100}%`;
      glitchLine.style.width = `${Math.random() * 50 + 10}px`;
      glitchLine.style.height = `${Math.random() * 2 + 1}px`;
      glitchLine.style.background = Math.random() > 0.5 ? 'var(--glitch-color1)' : 'var(--glitch-color2)';
      
      overlay.appendChild(glitchLine);
    }
    
    // Remove overlay after the form has been submitted (in case it doesn't redirect immediately)
    setTimeout(() => {
      removeGlitchOverlay();
    }, 5000);
  }
  
  // Function to remove glitch overlay
  function removeGlitchOverlay() {
    const overlay = document.querySelector('.form-glitch-overlay');
    if (overlay) {
      // Add closing animation
      overlay.style.animation = 'glitch-fade-out 0.5s forwards';
      
      // Remove after animation
      setTimeout(() => {
        overlay.remove();
      }, 500);
    }
  }
  
  // Add CSS for the overlay
  const style = document.createElement('style');
  style.textContent = `
    .form-glitch-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      animation: glitch-fade-in 0.3s forwards;
    }
    
    .glitch-text {
      font-family: 'Share Tech Mono', monospace;
      color: var(--glitch-color1);
      font-size: 2rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      animation: text-glitch 0.5s infinite;
    }
    
    .glitch-lines {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 255, 255, 0.1),
        rgba(0, 255, 255, 0.1) 1px,
        transparent 1px,
        transparent 2px
      );
      pointer-events: none;
      animation: scan-lines 10s linear infinite;
    }
    
    .random-glitch-line {
      position: absolute;
      animation: random-glitch 0.2s infinite;
    }
    
    .form-message {
      margin-top: 15px;
      padding: 10px;
      border: 1px solid;
      font-family: 'Share Tech Mono', monospace;
    }
    
    .form-message.success {
      border-color: var(--glitch-color1);
      color: var(--glitch-color1);
      background-color: rgba(0, 255, 255, 0.1);
    }
    
    .form-message.error {
      border-color: #ff0055;
      color: #ff0055;
      background-color: rgba(255, 0, 85, 0.1);
    }
    
    .error-glitch {
      animation: error-input-glitch 0.5s ease-in-out;
      border-color: #ff0055 !important;
      box-shadow: 0 0 10px rgba(255, 0, 85, 0.5) !important;
    }
    
    @keyframes error-input-glitch {
      0% { transform: translate(0); }
      20% { transform: translate(-5px, 0); background-color: rgba(255, 0, 85, 0.2); }
      40% { transform: translate(5px, 0); }
      60% { transform: translate(-5px, 0); background-color: rgba(255, 0, 85, 0.2); }
      80% { transform: translate(5px, 0); }
      100% { transform: translate(0); }
    }
    
    @keyframes text-glitch {
      0% { transform: translate(0); text-shadow: 0 0 0 var(--glitch-color1); }
      20% { transform: translate(-2px, 2px); text-shadow: -2px 0 0 var(--glitch-color2); }
      40% { transform: translate(2px, -2px); text-shadow: 2px 0 0 var(--glitch-color1); }
      60% { transform: translate(-2px, -2px); text-shadow: 0 2px 0 var(--glitch-color2); }
      80% { transform: translate(2px, 2px); text-shadow: -2px -2px 0 var(--glitch-color1); }
      100% { transform: translate(0); text-shadow: 0 0 0 var(--glitch-color2); }
    }
    
    @keyframes scan-lines {
      0% { background-position: 0 0; }
      100% { background-position: 0 100%; }
    }
    
    @keyframes random-glitch {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    @keyframes glitch-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes glitch-fade-out {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  
  document.head.appendChild(style);
});
