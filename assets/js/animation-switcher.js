// Animation Switcher for BitKill Website
document.addEventListener('DOMContentLoaded', function() {
    // Get the toggle button
    const toggleButton = document.getElementById('animation-toggle');
    
    // Get the animation script element
    const animationScript = document.getElementById('animation-script');
    
    // Function to get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // Function to update URL without reloading
    function updateUrlParameter(param, value) {
        const baseUrl = window.location.origin + window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        
        if (value === null) {
            // Remove parameter
            urlParams.delete(param);
        } else {
            // Add/update parameter
            urlParams.set(param, value);
        }
        
        const newUrl = baseUrl + (urlParams.toString() ? '?' + urlParams.toString() : '');
        window.history.pushState({path: newUrl}, '', newUrl);
    }
    
    // Check if theme parameter exists in URL
    const theme = getUrlParameter('theme');
    let isCyberTheme = theme === 'cyber';
    
    // Set initial state based on URL parameter
    if (isCyberTheme) {
        // Load the cyber theme (wallpaper-engine.js)
        animationScript.src = 'assets/js/wallpaper-engine.js';
        toggleButton.textContent = 'SWITCH TO MONO THEME';
    } else {
        // Load the mono theme (mono-engine.js) - default
        animationScript.src = 'assets/js/mono-engine.js';
        toggleButton.textContent = 'SWITCH TO CYBER THEME';
    }
    
    // Add click event listener to the toggle button
    toggleButton.addEventListener('click', function() {
        // Add glitch effect to the body
        document.body.classList.add('switching-animation');
        
        // Reload the page with the appropriate theme
        if (isCyberTheme) {
            // Switch to mono theme - reload without theme parameter
            updateUrlParameter('theme', null);
            location.reload();
        } else {
            // Switch to cyber theme - reload with cyber theme parameter
            updateUrlParameter('theme', 'cyber');
            location.reload();
        }
    });
});
