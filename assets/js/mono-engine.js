    // Create a Three.js scene for the background
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '-2';
    renderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(renderer.domElement);
    
    // Create floating particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000; // Increased particle count for better effect
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = []; // Array to store particle velocities for floating effect
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Position particles in a wider space
      positions[i] = (Math.random() - 0.5) * 15;
      positions[i + 1] = (Math.random() - 0.5) * 15;
      positions[i + 2] = (Math.random() - 0.5) * 15;
      
      // Store random velocities for each particle
      velocities.push({
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      });
      
      // Monochrome color palette with slight variations for glitch effect
      const brightness = Math.random() * 0.5 + 0.5; // Value between 0.5 and 1.0
      colors[i] = brightness; // R
      colors[i + 1] = brightness; // G
      colors[i + 2] = brightness; // B
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08, // Slightly larger particles
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending, // Add glow effect
      sizeAttenuation: true // Particles change size based on distance
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Setup post-processing for glitch effect
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const glitchPass = new THREE.GlitchPass();
    glitchPass.goWild = false;
    glitchPass.enabled = false; // Start with glitch disabled
    composer.addPass(glitchPass);
    
    // Camera position
    camera.position.z = 5;
    
    // Control variables for glitch timing
    let lastGlitchTime = 0;
    const glitchInterval = 7000; // 7 seconds between glitches
    const glitchDuration = 500; // Glitch lasts for 0.5 seconds
    let isGlitchIntense = false;
    
    function animate() {
      requestAnimationFrame(animate);
      
      // Update particle positions to float around
      const positions = particleGeometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        
        // Update positions based on velocities
        positions[idx] += velocities[i].x;
        positions[idx + 1] += velocities[i].y;
        positions[idx + 2] += velocities[i].z;
        
        // Create boundary limits and wrap particles around
        if (positions[idx] > 7.5) positions[idx] = -7.5;
        if (positions[idx] < -7.5) positions[idx] = 7.5;
        if (positions[idx + 1] > 7.5) positions[idx + 1] = -7.5;
        if (positions[idx + 1] < -7.5) positions[idx + 1] = 7.5;
        if (positions[idx + 2] > 7.5) positions[idx + 2] = -7.5;
        if (positions[idx + 2] < -7.5) positions[idx + 2] = 7.5;
        
        // Occasionally change velocity for more natural movement
        if (Math.random() < 0.01) {
          velocities[i].x = (Math.random() - 0.5) * 0.01;
          velocities[i].y = (Math.random() - 0.5) * 0.01;
          velocities[i].z = (Math.random() - 0.5) * 0.01;
        }
      }
      
      // Flag the position attribute as needing an update
      particleGeometry.attributes.position.needsUpdate = true;
      
      // Slightly rotate the entire particle system
      particles.rotation.x += 0.0005;
      particles.rotation.y += 0.0003;
      
      // Handle timed glitches
      const currentTime = Date.now();
      if (currentTime - lastGlitchTime > glitchInterval) {
        // Time for a new glitch
        glitchPass.enabled = true;
        
        // Use a milder glitch effect (not wild)
        glitchPass.goWild = false;
        
        // Subtle camera shake during glitch
        gsap.to(camera.position, {
          x: (Math.random() - 0.5) * 0.2, // Reduced movement
          y: (Math.random() - 0.5) * 0.2, // Reduced movement
          duration: 0.2,
          onComplete: () => {
            gsap.to(camera.position, {
              x: 0,
              y: 0,
              duration: 0.2
            });
          }
        });
        
        // Set a timeout to disable the glitch after the duration
        setTimeout(() => {
          glitchPass.enabled = false;
        }, glitchDuration);
        
        // Update the last glitch time
        lastGlitchTime = currentTime;
      }
      
      // Respond to audio if available
      if (window.audioPlayer && !window.audioPlayer.paused) {
        // Create effect synchronized with audio
        const volume = window.audioPlayer.volume || 0.5;
        
        // Increase the glitch probability based on audio volume
        if (Math.random() < volume * 0.1) {
          // Temporarily change some particle colors for a glitch effect
          const colors = particleGeometry.attributes.color.array;
          for (let i = 0; i < particleCount * 3; i += 9) { // Only affect some particles
            const glitchIntensity = Math.random() * 0.3 + 0.7; // Strong white flash
            colors[i] = glitchIntensity;
            colors[i + 1] = glitchIntensity;
            colors[i + 2] = glitchIntensity;
          }
          particleGeometry.attributes.color.needsUpdate = true;
        }
        
        // Make particles move faster with higher volume
        for (let i = 0; i < particleCount; i++) {
          velocities[i].x *= (1 + volume * 0.01);
          velocities[i].y *= (1 + volume * 0.01);
          velocities[i].z *= (1 + volume * 0.01);
        }
      }
      
      composer.render();
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Connect glitch button to Three.js effects
    document.getElementById('glitch-btn').addEventListener('click', function() {
      // Toggle between normal mode and glitch mode
      isGlitchIntense = !isGlitchIntense;
      
      if (isGlitchIntense) {
        // In glitch mode, enable constant but mild glitches
        glitchPass.enabled = true;
        glitchPass.goWild = false;
        
        // Make particles move more erratically
        for (let i = 0; i < particleCount; i++) {
          velocities[i].x *= 2.5;
          velocities[i].y *= 2.5;
          velocities[i].z *= 2.5;
        }
        
        // Flash the particles in monochrome
        const colors = particleGeometry.attributes.color.array;
        for (let i = 0; i < particleCount * 3; i += 3) {
          // Create high contrast monochrome effect
          const val = Math.random() > 0.5 ? 1.0 : 0.1;
          colors[i] = val;     // R
          colors[i + 1] = val; // G
          colors[i + 2] = val; // B
        }
        particleGeometry.attributes.color.needsUpdate = true;
      } else {
        // In normal mode, return to timed glitches
        glitchPass.enabled = false;
        lastGlitchTime = Date.now(); // Reset the glitch timer
        
        // Return particles to normal speed
        for (let i = 0; i < particleCount; i++) {
          velocities[i].x /= 2.5;
          velocities[i].y /= 2.5;
          velocities[i].z /= 2.5;
        }
        
        // Reset the colors to normal monochrome
        const colors = particleGeometry.attributes.color.array;
        for (let i = 0; i < particleCount * 3; i += 3) {
          const brightness = Math.random() * 0.5 + 0.5;
          colors[i] = brightness;     // R
          colors[i + 1] = brightness; // G
          colors[i + 2] = brightness; // B
        }
        particleGeometry.attributes.color.needsUpdate = true;
      }
    });
    
    animate();