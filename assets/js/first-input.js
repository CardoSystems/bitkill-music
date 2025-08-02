    document.addEventListener('DOMContentLoaded', function() {
      // Variables to track user interaction
      let userInteracted = false;
      
      // Function to handle first user interaction
      function handleFirstInteraction() {
        if (!userInteracted) {
          userInteracted = true;
          
          // Trigger the sound toggle button
          const soundToggle = document.getElementById('sound-toggle');
          if (soundToggle && !soundToggle.classList.contains('active')) {
            soundToggle.click();
          }
          
          // Remove the event listeners once triggered
          document.removeEventListener('click', handleFirstInteraction);
          document.removeEventListener('keydown', handleFirstInteraction);
          document.removeEventListener('touchstart', handleFirstInteraction);
          document.removeEventListener('scroll', handleFirstInteraction);
        }
      }
      
      // Add event listeners for various user interactions
      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);
      document.addEventListener('scroll', handleFirstInteraction);
      
      // Show a notification to encourage interaction
      setTimeout(function() {
        if (!userInteracted) {
          const terminal = document.getElementById('terminal-text');
          if (terminal) {
            terminal.innerHTML += '<br>// WAITING FOR USER INPUT TO ACTIVATE AUDIO STREAM...';
          }
        }
      }, 3000);
    });