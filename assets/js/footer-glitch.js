  document.addEventListener('DOMContentLoaded', () => {
      // Add random glitch effects to social media icons
      const socialLinks = document.querySelectorAll('.social-link');
      
      socialLinks.forEach(link => {
        // Random glitch effect on random interval
        setInterval(() => {
          if (Math.random() > 0.7) {
            const icon = link.querySelector('.icon-glitch');
            
            // Add glitch class
            icon.classList.add('glitching');
            
            // Create glitch overlay
            const glitchOverlay = document.createElement('div');
            glitchOverlay.classList.add('glitch-overlay');
            icon.appendChild(glitchOverlay);
            
            // Remove after short duration
            setTimeout(() => {
              icon.classList.remove('glitching');
              if (glitchOverlay.parentNode === icon) {
                icon.removeChild(glitchOverlay);
              }
            }, 200);
          }
        }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
      });
      
      // Add occasional footer-wide glitch effect
      setInterval(() => {
        if (Math.random() > 0.9) {
          const footer = document.querySelector('.cyber-footer');
          footer.style.clipPath = `inset(${Math.random() * 10}% 0 ${Math.random() * 5}% 0)`;
          
          setTimeout(() => {
            footer.style.clipPath = 'none';
          }, 150);
        }
      }, 5000);
    });