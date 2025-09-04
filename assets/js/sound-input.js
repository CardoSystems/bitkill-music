    // Sound activation button functionality
    let audioPlayer = null;
    
    document.getElementById('sound-toggle').addEventListener('click', function() {
      this.classList.toggle('active');
      const label = this.querySelector('.sound-label');
      
      if (this.classList.contains('active')) {
        // Start background audio
        if (!audioPlayer) {
          audioPlayer = new Audio('https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/63/bb/69/63bb69f8-2673-dcb0-f654-e067369c3c3e/mzaf_6808948158192795690.plus.aac.ep.m4a');
          audioPlayer.loop = true;
          audioPlayer.volume = 0.5; // Start at half volume
        }
        
        audioPlayer.play().then(() => {
          label.textContent = 'SOUND ACTIVE';
          this.style.animation = 'glitch 0.3s ease';
          setTimeout(() => {
            this.style.animation = 'pulse 2s infinite alternate';
          }, 300);
        }).catch(error => {
          console.error('Audio playback failed:', error);
          this.classList.remove('active');
        });
      } else {
        // Stop background audio
        if (audioPlayer) {
          audioPlayer.pause();
        }
        label.textContent = 'ACTIVATE SOUND';
      }
    });
    
    // Allow volume adjustment with the volume slider
    document.getElementById('volume').addEventListener('input', function() {
      if (audioPlayer) {
        audioPlayer.volume = this.value;
      }
    });
    
    // Connect play/stop buttons to the background audio
    document.getElementById('play-audio').addEventListener('click', function() {
      const soundToggle = document.getElementById('sound-toggle');
      if (!soundToggle.classList.contains('active')) {
        soundToggle.click(); // Activate sound if it's not active
      } else if (audioPlayer && audioPlayer.paused) {
        audioPlayer.play();
      }
    });
    
    document.getElementById('stop-audio').addEventListener('click', function() {
      if (audioPlayer && !audioPlayer.paused) {
        audioPlayer.pause();
        const soundToggle = document.getElementById('sound-toggle');
        soundToggle.classList.remove('active');
        soundToggle.querySelector('.sound-label').textContent = 'ACTIVATE SOUND';
      }

    });
