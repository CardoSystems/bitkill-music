    AOS.init({
      duration: 1000,
      once: false,
      mirror: true
    });

    // Initialize Vanilla Tilt
    VanillaTilt.init(document.querySelectorAll(".crt-frame"), {
      max: 10,
      speed: 400,
      glare: true,
      "max-glare": 0.5,
    });
    
    // Handle responsive tilt - disable on mobile
    function handleResponsiveTilt() {
      if (window.innerWidth < 768) {
        // Disable tilt on mobile for Apple Music frames
        document.querySelectorAll('.apple-music-frame').forEach(frame => {
          if (frame.vanillaTilt) {
            frame.vanillaTilt.destroy();
          }
        });
      }
    }
    
    // Run on load and resize
    handleResponsiveTilt();
    window.addEventListener('resize', handleResponsiveTilt);

    // Scrolling Text Animation
    const scrollTopText = document.getElementById('scroll-top');
    const scrollBottomText = document.getElementById('scroll-bottom');
    
    function animateScrollText() {
      gsap.to(scrollTopText, {
        x: '-50%',
        duration: 20,
        repeat: -1,
        ease: 'linear'
      });
      
      gsap.to(scrollBottomText, {
        x: '50%',
        duration: 20,
        repeat: -1,
        ease: 'linear'
      });
    }
    
    animateScrollText();

    // Simple Canvas Audio Visualizer
    const canvas = document.getElementById('audio-vis');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const gainNode = audioCtx.createGain();
    let source;
    let isPlaying = false;

    // Audio controls
    const playBtn = document.getElementById('play-audio');
    const stopBtn = document.getElementById('stop-audio');
    const volumeSlider = document.getElementById('volume');

    playBtn.addEventListener('click', () => {
      if (!isPlaying) {
        startAudio();
      }
    });

    stopBtn.addEventListener('click', () => {
      if (isPlaying && source) {
        source.stop();
        isPlaying = false;
      }
    });

    volumeSlider.addEventListener('input', () => {
      gainNode.gain.value = volumeSlider.value;
    });

    function startAudio() {
      if (isPlaying) return;
      
      audioCtx.resume().then(() => {
        source = audioCtx.createBufferSource();
        
        fetch('https://media.xperia.pt/bitkill/mp3/demo1.mp3')
          .then(res => res.arrayBuffer())
          .then(buffer => audioCtx.decodeAudioData(buffer))
          .then(decoded => {
            source.buffer = decoded;
            source.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            gainNode.gain.value = volumeSlider.value;
            source.start(0);
            isPlaying = true;
            source.onended = () => {
              isPlaying = false;
            };
            animate();
          });
      });
    }

    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
      if (!isPlaying) return;
      
      requestAnimationFrame(animate);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / bufferLength;
      
      for (let i = 0; i < bufferLength; i++) {
        const y = dataArray[i] * 2;
        const x = i * barWidth;
        
        // Create monochrome effect instead of rainbow
        const brightness = Math.floor((i / bufferLength) * 100 + 155); // 155-255 range
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        
        // Bottom bars
        ctx.fillRect(x, canvas.height - y, barWidth, y);
        
        // Top bars (mirrored)
        ctx.fillRect(x, 0, barWidth, y / 2);
        
        // Center line
        if (i % 2 === 0 && dataArray[i] > 50) {
          ctx.fillStyle = '#fff'; // White for center line
          ctx.fillRect(x, canvas.height / 2 - dataArray[i] / 20, barWidth * 2, dataArray[i] / 10);
        }
      }
      
      // Draw circular visualizer
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff'; // White instead of cyan
      ctx.stroke();
      
      for (let i = 0; i < bufferLength; i++) {
        const amplitude = dataArray[i] / 128.0;
        const angle = i * 2 * Math.PI / bufferLength;
        const x = centerX + Math.cos(angle) * (radius * amplitude);
        const y = centerY + Math.sin(angle) * (radius * amplitude);
        
        if (i === 0) {
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        // Add some random glitch points
        if (Math.random() > 0.98) {
          ctx.lineTo(x + (Math.random() * 20 - 10), y + (Math.random() * 20 - 10));
        }
      }
      
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // White with transparency instead of cyan
      ctx.stroke();
    }

    // Terminal typing effect with Mr. Robot-inspired realistic terminal output
    const terminalText = document.getElementById('terminal-text');
    const terminalLines = [
      '> ssh -l fsociety@192.168.1.43',
      '> Password: **********',
      '> Access granted. Welcome to the BitKill mainframe.',
      '> cat /etc/shadow',
      '> Permission denied. Attempting privilege escalation...',
      '> sudo ./exploit.sh',
      '> Kernel vulnerability detected (CVE-2023-4567)',
      '> Executing memory overflow...',
      '> Root shell established',
      '> Scanning network for vulnerable nodes...',
      '> WARNING: Intrusion detection triggered',
      '> Deploying countermeasures...',
      '> Connection rerouted through proxy chain',
      '> 7 active nodes found. Initiating data extraction...',
      '> Downloading encrypted payloads [████████████] 100%',
      '> Decryption sequence initialized...',
      '> Remember: Control is an illusion.'
    ];

    let lineIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 50;
    let pauseTime = 2000;

    function typeTerminal() {
      const currentLine = terminalLines[lineIndex];
      
      if (isDeleting) {
        terminalText.innerHTML = currentLine.substring(0, charIndex - 1) + '<span class="terminal-cursor">█</span>';
        charIndex--;
        typingSpeed = 30;
        
        if (charIndex === 0) {
          isDeleting = false;
          lineIndex = (lineIndex + 1) % terminalLines.length;
          typingSpeed = 50;
          setTimeout(typeTerminal, 500);
          return;
        }
      } else {
        // Add random typing irregularities for realism
        typingSpeed = Math.random() > 0.9 ? 300 : Math.random() > 0.5 ? 80 : 40;
        
        terminalText.innerHTML = currentLine.substring(0, charIndex) + '<span class="terminal-cursor">█</span>';
        charIndex++;
        
        if (charIndex > currentLine.length) {
          isDeleting = Math.random() > 0.7; // Sometimes clear line, sometimes just move to next
          setTimeout(typeTerminal, pauseTime);
          return;
        }
      }
      
      setTimeout(typeTerminal, typingSpeed);
    }

    // Occasionally add "system glitches" to the terminal
    setInterval(() => {
      if (Math.random() > 0.9) {
        const originalContent = terminalText.innerHTML;
        terminalText.innerHTML = originalContent.replace(/[a-zA-Z]/g, c => 
          Math.random() > 0.8 ? String.fromCharCode(Math.random() > 0.5 ? 0x30A0 + Math.random() * 40 : c.charCodeAt(0)) : c);
        
        setTimeout(() => {
          terminalText.innerHTML = originalContent;
        }, 100);
      }
    }, 3000);

    // Start typing
    typeTerminal();

    // Glitch effect button
    const glitchBtn = document.getElementById('glitch-btn');
    let glitchMode = false;
    
    glitchBtn.addEventListener('click', () => {
      glitchMode = !glitchMode;
      document.body.classList.toggle('extreme-glitch');
      
      if (glitchMode) {
        startGlitchEffects();
      } else {
        stopGlitchEffects();
      }
    });
    
    function startGlitchEffects() {
      // Create more intense glitch effects, but maintain the monochrome theme
      document.querySelectorAll('.crt-frame:not(.visualizer-frame)').forEach(frame => {
        gsap.to(frame, {
          skewX: "random(-10, 10)",
          skewY: "random(-5, 5)",
          x: "random(-20, 20)",
          y: "random(-20, 20)",
          duration: 0.2,
          repeat: -1,
          yoyo: true,
          ease: "none"
        });
      });
      
      // Glitch the logo without changing scale
      gsap.to('#logo', {
        x: "random(-10, 10)",
        y: "random(-10, 10)",
        rotation: "random(-10, 10)",
        duration: 0.2,
        repeat: -1,
        yoyo: true
      });
      
      // Use monochrome flickering - only white, light gray, dark gray
      const monochromePalette = ['#ffffff', '#aaaaaa', '#555555', '#222222'];
      const flickerInterval = setInterval(() => {
        // Randomly pick colors from monochrome palette
        const randomColor = monochromePalette[Math.floor(Math.random() * monochromePalette.length)];
        document.documentElement.style.setProperty('--glitch-color1', randomColor);
      }, 300);
      
      window.flickerInterval = flickerInterval;
    }
    
    function stopGlitchEffects() {
      document.querySelectorAll('.crt-frame').forEach(frame => {
        gsap.killTweensOf(frame);
        gsap.to(frame, {
          skewX: 0,
          skewY: 0,
          x: 0,
          y: 0,
          scale: frame.classList.contains('visualizer-frame') ? 0.6 : 1, // Keep scale at 0.6 for visualizer
          duration: 0.5
        });
      });
      
      gsap.killTweensOf('#logo');
      gsap.to('#logo', {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.5
      });
      
      clearInterval(window.flickerInterval);
      // Reset to monochrome white for --glitch-color1
      document.documentElement.style.setProperty('--glitch-color1', '#ffffff');
    }

    // Add interactive cursor trail
    document.addEventListener('mousemove', function(e) {
      if (Math.random() > 0.8) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.position = 'fixed';
        trail.style.width = '5px';
        trail.style.height = '5px';
        trail.style.borderRadius = '50%';
        // Use monochrome colors
        const brightness = Math.floor(Math.random() * 200) + 55; // Value between 55-255
        trail.style.backgroundColor = `rgb(${brightness}, ${brightness}, ${brightness})`;
        trail.style.boxShadow = '0 0 10px currentColor';
        trail.style.left = `${e.clientX}px`;
        trail.style.top = `${e.clientY}px`;
        trail.style.pointerEvents = 'none';
        trail.style.zIndex = '9999';
        document.body.appendChild(trail);
        
        gsap.to(trail, {
          opacity: 0,
          scale: 3,
          duration: 1,
          onComplete: () => {
            trail.remove();
          }
        });
      }
    });

    // Random glitch elements - monochrome only
    setInterval(() => {
      if (Math.random() > 0.9) {
        const glitchOverlay = document.createElement('div');
        glitchOverlay.style.position = 'fixed';
        glitchOverlay.style.top = '0';
        glitchOverlay.style.left = '0';
        glitchOverlay.style.width = '100%';
        glitchOverlay.style.height = '100%';
        // Use monochrome colors
        const brightness = Math.floor(Math.random() * 255);
        glitchOverlay.style.backgroundColor = `rgba(${brightness}, ${brightness}, ${brightness}, 0.1)`;
        glitchOverlay.style.mixBlendMode = 'overlay';
        glitchOverlay.style.zIndex = '1000';
        glitchOverlay.style.pointerEvents = 'none';
        document.body.appendChild(glitchOverlay);
        
        setTimeout(() => {
          glitchOverlay.remove();
        }, 100);
      }
    }, 2000);