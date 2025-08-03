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
    
    // Create grid of particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1500;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Position particles in a cube
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
      
      // Random colors with a cyberpunk palette
      colors[i] = Math.random() * 0.2;  // R
      colors[i + 1] = Math.random() * 0.8 + 0.2;  // G (cyan dominant)
      colors[i + 2] = Math.random() * 0.8 + 0.2;  // B
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Add a cyberpunk grid
    const gridSize = 20;
    const gridDivisions = 20;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ffff, 0xff00ff);
    scene.add(gridHelper);
    
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
      window.animationFrameId = requestAnimationFrame(animate);
          
      // Rotate particles
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;
      
      // Rotate grid
      gridHelper.rotation.x += 0.001;
      gridHelper.rotation.y += 0.001;
      
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
        particles.rotation.z += 0.001 * (window.audioPlayer.volume * 2);
        gridHelper.material.opacity = 0.5 + window.audioPlayer.volume * 0.5;
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
        
        // Make particles move more dramatically but not crazy
        gsap.to(particles.rotation, {
          x: Math.PI / 4,
          y: Math.PI / 4,
          z: Math.PI / 6,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        });
      } else {
        // In normal mode, return to timed glitches
        glitchPass.enabled = false;
        lastGlitchTime = Date.now(); // Reset the glitch timer
        
        // Return particles to normal rotation
        gsap.killTweensOf(particles.rotation);
      }
    });
    
    animate();