/**
 * Sound Manager for BitKill Music Website
 * This script manages two audio sources to ensure only one plays at a time:
 * - Background audio (from sound-toggle)
 * - Apple Music iframes
 */

// Create a global sound manager instance
window.SoundManager = (function() {
  // Track active sound sources
  const activeSources = {
    backgroundAudio: null,  // Main background audio (from sound-toggle)
    appleMusicActive: false // Whether any Apple Music iframe is playing
  };

  let mainVolume = 0.5;  // Default volume
  
  // Pause all Apple Music iframes
  function pauseAllAppleMusicIframes() {
    // We need to use postMessage to control iframe playback
    const iframes = document.querySelectorAll('iframe[src*="embed.music.apple.com"]');
    iframes.forEach(iframe => {
      try {
        // Send pause command to Apple Music iframe
        iframe.contentWindow.postMessage({ 'command': 'pause' }, '*');
      } catch (e) {
        console.log('Could not control Apple Music iframe:', e);
      }
    });
    activeSources.appleMusicActive = false;
  }
  
  // Pause background audio
  function pauseBackgroundAudio() {
    if (activeSources.backgroundAudio && !activeSources.backgroundAudio.paused) {
      activeSources.backgroundAudio.pause();
      
      // Update UI to reflect paused state
      const soundToggle = document.getElementById('sound-toggle');
      if (soundToggle) {
        soundToggle.classList.remove('active');
        const label = soundToggle.querySelector('.sound-label');
        if (label) {
          label.textContent = 'ACTIVATE SOUND';
        }
      }
    }
  }
  
  // Public API
  return {
    // Register background audio with the sound manager
    registerBackgroundAudio: function(audioElement) {
      activeSources.backgroundAudio = audioElement;
      
      // Set the volume based on the global volume setting
      audioElement.volume = mainVolume;
      
      // When playing background audio, pause Apple Music iframes
      if (activeSources.appleMusicActive) {
        pauseAllAppleMusicIframes();
      }
      
      return audioElement;
    },
    
    // Handle Apple Music iframe activation
    handleAppleMusicActivation: function() {
      // When Apple Music plays, pause background audio
      pauseBackgroundAudio();
      activeSources.appleMusicActive = true;
    },
    
    // Set global volume (for background audio)
    setVolume: function(volume) {
      mainVolume = volume;
      
      // Apply to background audio if it exists
      if (activeSources.backgroundAudio) {
        activeSources.backgroundAudio.volume = volume;
      }
    },
    
    // Stop all audio
    stopAll: function() {
      // Stop background audio
      pauseBackgroundAudio();
      
      // Stop Apple Music iframes
      pauseAllAppleMusicIframes();
    }
  };
})();

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Sound Manager initialized');
  
  // Set up message listener for Apple Music iframes
  window.addEventListener('message', function(event) {
    // Only process messages from Apple Music embeds
    if (event.origin.includes('embed.music.apple.com')) {
      // When Apple Music track starts playing, pause other audio
      if (event.data && event.data.status === 'playing') {
        window.SoundManager.handleAppleMusicActivation();
      }
    }
  });
  
  // Connect volume slider to sound manager
  const volumeSlider = document.getElementById('volume');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', function() {
      window.SoundManager.setVolume(this.value);
    });
    
    // Initialize with the current volume value
    window.SoundManager.setVolume(volumeSlider.value);
  }
  
  // Apply the Sound Manager to the existing audio controls
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    const originalClickHandler = soundToggle.onclick;
    
    // Override the click handler to integrate with Sound Manager
    soundToggle.addEventListener('click', function(event) {
      // Get the label element
      const label = this.querySelector('.sound-label');
      
      // Check if sound is being activated
      const isActivating = !this.classList.contains('active');
      
      if (isActivating) {
        // If we have background audio, make sure Apple Music is paused
        window.SoundManager.handleAppleMusicActivation = function() {}; // Temporarily disable
        
        // Let the original handler run to create the audio element
        if (originalClickHandler) {
          originalClickHandler.call(this, event);
        }
        
        // Re-enable Apple Music handler
        window.SoundManager.handleAppleMusicActivation = function() {
          pauseBackgroundAudio();
          activeSources.appleMusicActive = true;
        };
        
        // Register the background audio with the Sound Manager
        if (window.audioPlayer) {
          window.SoundManager.registerBackgroundAudio(window.audioPlayer);
        }
      }
    }, true); // Use capturing to run before the original handler
  }
});
