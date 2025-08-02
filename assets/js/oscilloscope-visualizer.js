    // Audio Oscilloscope Visualizer
    document.addEventListener('DOMContentLoaded', function() {
      const canvas = document.getElementById('oscilloscope');
      const ctx = canvas.getContext('2d');
      
      // Setup canvas size
      function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      // Audio context setup
      let audioContext;
      let analyser;
      let dataArray;
      let isListening = false;
      let oscillator;
      let oscillator2;
      let time = 0;
      
      // Mouse interaction variables
      let mouseX = 0;
      let mouseY = 0;
      let mouseInside = false;
      let mouseFrequency = 440;
      let mouseAmplitude = 50;
      let visualizationMode = 0; // 0: default, 1: circular, 2: bars, 3: dots
      
      // Initialize dummy oscillator
      function initDummyVisualizer() {
        if (audioContext) return;
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        // Create dummy oscillators
        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        
        oscillator2 = audioContext.createOscillator();
        oscillator2.type = 'sawtooth';
        oscillator2.frequency.setValueAtTime(220, audioContext.currentTime);
        
        // Create gain nodes for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime); // Silent output
        
        // Connect the oscillators
        oscillator.connect(analyser);
        oscillator2.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start the oscillators
        oscillator.start();
        oscillator2.start();
        isListening = true;
        
        // Start drawing
        drawOscilloscope();
      }
      
      // Draw the oscilloscope
      function drawOscilloscope() {
        if (!isListening) return;
        
        requestAnimationFrame(drawOscilloscope);
        
        // Update the oscillator frequencies based on mouse position if inside canvas
        time += 0.01;
        
        if (mouseInside) {
          // Use mouse position to control frequencies
          oscillator.frequency.setValueAtTime(mouseFrequency, audioContext.currentTime);
          oscillator2.frequency.setValueAtTime(mouseFrequency / 2, audioContext.currentTime);
          mouseAmplitude = mouseY / canvas.height * 100;
        } else {
          // Default behavior when mouse is not over canvas
          oscillator.frequency.setValueAtTime(440 + Math.sin(time) * 100, audioContext.currentTime);
          oscillator2.frequency.setValueAtTime(220 + Math.cos(time * 0.5) * 50, audioContext.currentTime);
          mouseAmplitude = 50;
        }
        
        // Generate dummy waveform data
        for (let i = 0; i < dataArray.length; i++) {
          // Create a mix of sine waves for interesting patterns
          const t = time + i * 0.001;
          const v = Math.sin(t * 5) * mouseAmplitude + Math.sin(t * 10) * (mouseAmplitude * 0.6) + Math.sin(t * 20) * (mouseAmplitude * 0.3);
          dataArray[i] = 128 + v;
        }
        
        // Clear canvas with fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'; // Cyan grid lines to match website theme
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        const gridStep = canvas.height / 10;
        for (let i = 0; i < canvas.height; i += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(canvas.width, i);
          ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i < canvas.width; i += gridStep) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        
        // Choose visualization based on mode
        switch(visualizationMode) {
          case 0: 
            drawWaveform();
            break;
          case 1:
            drawCircular();
            break;
          case 2:
            drawBars();
            break;
          case 3:
            drawDots();
            break;
        }
        
        // Add CRT phosphor glow effect
        const glowColor = mouseInside ? `rgba(${Math.sin(time*3)*50+200}, ${Math.cos(time*2)*50+200}, 255, 0.05)` : 'rgba(0, 255, 255, 0.05)';
        ctx.fillStyle = glowColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add glitch effect occasionally
        if (Math.random() > 0.97) {
          addGlitchEffect();
        }
      }
      
      // Draw standard waveform
      function drawWaveform() {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'var(--glitch-color1)'; // Match website cyan color
        ctx.beginPath();
        
        const sliceWidth = canvas.width / dataArray.length;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          
          x += sliceWidth;
        }
        
        ctx.stroke();
      }
      
      // Draw circular visualization
      function drawCircular() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 3;
        
        ctx.strokeStyle = 'var(--glitch-color2)'; // Pink color
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < dataArray.length; i += 4) {
          const angle = (i / dataArray.length) * Math.PI * 2;
          const amplitude = (dataArray[i] / 128.0) - 1;
          const x = centerX + Math.cos(angle) * (radius + amplitude * 50);
          const y = centerY + Math.sin(angle) * (radius + amplitude * 50);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.stroke();
      }
      
      // Draw bar visualization
      function drawBars() {
        const barWidth = canvas.width / 64;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i += 32) {
          const barHeight = (dataArray[i] / 256.0) * canvas.height;
          
          // Gradient based on bar height
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, 'var(--glitch-color3)'); // Green at top
          gradient.addColorStop(1, 'var(--glitch-color1)'); // Cyan at bottom
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
          if (x > canvas.width) break;
        }
      }
      
      // Draw dots visualization
      function drawDots() {
        const step = Math.floor(dataArray.length / 100);
        
        for (let i = 0; i < dataArray.length; i += step) {
          const x = (i / dataArray.length) * canvas.width;
          const y = (dataArray[i] / 256.0) * canvas.height;
          const size = (dataArray[i] / 256.0) * 10 + 2;
          
          // Change color based on position
          const hue = (i / dataArray.length) * 360;
          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Add glitch effect
      function addGlitchEffect() {
        const glitchHeight = Math.random() * canvas.height;
        const glitchWidth = canvas.width;
        const glitchY = Math.random() * canvas.height;
        
        // Get image data from canvas
        const imageData = ctx.getImageData(0, glitchY, glitchWidth, glitchHeight);
        const data = imageData.data;
        
        // Shift color channels
        for (let i = 0; i < data.length; i += 4) {
          if (Math.random() > 0.5) {
            // Swap R and B channels
            const temp = data[i];
            data[i] = data[i + 2];
            data[i + 2] = temp;
          }
        }
        
        // Put the manipulated image data back
        ctx.putImageData(imageData, 0, glitchY);
        
        // Draw horizontal glitch lines
        ctx.strokeStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.8)`;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.moveTo(0, glitchY + Math.random() * glitchHeight);
        ctx.lineTo(canvas.width, glitchY + Math.random() * glitchHeight);
        ctx.stroke();
      }
      
      // Mouse interaction
      canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        // Map X position to frequency between 220-880 Hz
        mouseFrequency = 220 + (mouseX / canvas.width) * 660;
      });
      
      canvas.addEventListener('mouseenter', function() {
        mouseInside = true;
      });
      
      canvas.addEventListener('mouseleave', function() {
        mouseInside = false;
      });
      
      // Click to change visualization mode
      canvas.addEventListener('click', function() {
        if (!isListening) {
          initDummyVisualizer();
        } else {
          // Cycle through visualization modes
          visualizationMode = (visualizationMode + 1) % 4;
        }
      });
      
      // Initialize visualizer automatically
      setTimeout(initDummyVisualizer, 1000);
      
      // Connect to global audio if available
      document.addEventListener('audioready', function(e) {
        if (window.audioPlayer && audioContext) {
          // Connect to the main audio player if it exists
          try {
            const source = audioContext.createMediaElementSource(window.audioPlayer);
            source.connect(analyser);
          } catch (err) {
            console.log('Could not connect to audio player');
          }
        }
      });
      
      // Display initial message
      ctx.fillStyle = 'var(--glitch-color1)';
      ctx.font = '16px "Share Tech Mono"';
      ctx.textAlign = 'center';
      ctx.fillText('INITIALIZING NEURAL OSCILLATOR...', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText('CLICK TO CHANGE VISUALIZATION MODE', canvas.width / 2, canvas.height / 2 + 20);
    });