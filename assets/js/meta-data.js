// meta-data.js - Dynamically updates meta tags based on content
document.addEventListener('DOMContentLoaded', function() {
  /**
   * Updates meta tags for search engines and social sharing
   * This is useful for dynamic content that might be added later
   */
  function updateMetaTags() {
    // Get current page content
    const pageTitle = document.title;
    const mainHeading = document.querySelector('h1')?.textContent || 'BitKill';
    const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.textContent).join(' ').substring(0, 300);
    
    // Construct page description from content
    const contentDescription = 
      `BITKILL - Electronic music producer specializing in cybercore, glitchcore and cyberpunk sounds. ${paragraphs.substring(0, 150)}...`;
    
    // Update meta description if content has changed
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && contentDescription.length > 50) {
      metaDescription.setAttribute('content', contentDescription);
    }
    
    // Generate relevant keywords from content
    const baseKeywords = [
      'BITKILL', 'BitKill', 'electronic music', 'cybercore', 'glitchcore', 
      'cyberpunk', 'NEXUS', 'electronic artist', 'EDM'
    ];
    
    // Extract potential keywords from page content
    const contentWords = paragraphs.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4) // Only words longer than 4 chars
      .filter(word => !baseKeywords.map(k => k.toLowerCase()).includes(word))
      .slice(0, 5); // Take up to 5 content keywords
    
    // Combine all keywords
    const allKeywords = [...baseKeywords, ...contentWords].join(', ');
    
    // Update keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', allKeywords);
    }
  }
  
  // Run the update initially
  updateMetaTags();
  
  // Update if dynamic content is loaded
  // This can be triggered after AJAX content loads or dynamic updates
  window.addEventListener('contentUpdated', updateMetaTags);
});

// Image alt tag auditor - helps search engines understand images
document.addEventListener('DOMContentLoaded', function() {
  // Find all images without alt text
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt]), img[alt=""]');
  
  // Log issues to console for developer awareness
  if (imagesWithoutAlt.length > 0) {
    console.warn(`SEO Warning: Found ${imagesWithoutAlt.length} images without alt text`);
    
    // Suggest alt text based on surrounding content
    imagesWithoutAlt.forEach(img => {
      const parent = img.parentElement;
      const nearbyHeading = parent.querySelector('h1, h2, h3, h4, h5, h6')?.textContent || 
                           parent.previousElementSibling?.querySelector('h1, h2, h3, h4, h5, h6')?.textContent;
      const nearbyText = parent.textContent.substring(0, 50).trim();
      
      if (nearbyHeading || nearbyText) {
        const suggestedAlt = nearbyHeading || nearbyText;
        console.info(`Suggested alt text for image (${img.src.split('/').pop()}): "${suggestedAlt}"`);
        
        // Add a temporary alt for this session
        img.alt = `BitKill - ${suggestedAlt}`;
      }
    });
  }
});
