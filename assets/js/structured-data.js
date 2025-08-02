// structured-data.js 
document.addEventListener('DOMContentLoaded', function() {
  // JSON-LD script element
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  
  // Define the structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": "BITKILL",
    "alternateName": "BitKill",
    "url": "https://bitkillmusic.com",
    "logo": "https://media.xperia.pt/bitkill/img/favicon.jpg",
    "image": "https://media.xperia.pt/bitkill/img/favicon.jpg",
    "description": "Electronic music producer specializing in cybercore, glitchcore and cyberpunk sounds.",
    "genre": ["Cybercore", "Glitchcore", "Electronic", "Cyberpunk"],
    "sameAs": [
      "https://www.instagram.com/bitkillmusic",
      "https://www.tiktok.com/@bitkillmusic",
      "https://music.apple.com/ca/artist/bitkill/1798375079",
      "https://open.spotify.com/artist/77rJyhZHx1Hryl3kroO28A"
    ],
    "potentialAction": {
      "@type": "ListenAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://open.spotify.com/artist/77rJyhZHx1Hryl3kroO28A"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://bitkillmusic.com"
    },
    "musicAlbumReleaseType": "SingleRelease",
    "album": {
      "@type": "MusicAlbum",
      "name": "NEXUS",
      "datePublished": "2025-01-01"
    }
  };
  
  // Add the data to the script element
  script.textContent = JSON.stringify(structuredData);
  
  // Add script to the document head
  document.head.appendChild(script);
});
