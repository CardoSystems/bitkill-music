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
      e.preventDefault();
      
      // Add submitting class for glitch animation
      form.classList.add('submitting');
      
      // Play glitch sound
      playGlitchSound('submit');
      
      // Simulate "hacking" terminal effect on the submit button
      const submitBtn = form.querySelector('.form-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'PROCESSING...';
      
      // Create and show glitch overlay
      showGlitchOverlay();
      
      // Fake processing delay
      setTimeout(function() {
        // Submit the form data using fetch
        const formData = new FormData(form);
        
        fetch(form.action, {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Show success message
          showFormMessage('TRANSMISSION COMPLETE', 'success');
          form.reset();
        })
        .catch(error => {
          // Show error message
          showFormMessage('TRANSMISSION FAILED: RETRY', 'error');
          console.error('Error:', error);
        })
        .finally(() => {
          // Remove submitting class
          form.classList.remove('submitting');
          submitBtn.textContent = originalText;
          removeGlitchOverlay();
        });
      }, 2000);
    });
  }
  
  // Function to play glitch sounds
  function playGlitchSound(type) {
    // Create a simple oscillator for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
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
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5);
      
      // Start and stop
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 500);
    }
  }
  
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
