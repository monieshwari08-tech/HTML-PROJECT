// YouTube Learning Notes Saver - Content Script
// This file handles integration with YouTube video player

// Global variables
let videoElement = null;
let videoInfo = null;
let isYouTubePage = false;

// Initialize the content script
(function init() {
    console.log('YouTube Notes Saver content script initialized');
    
    // Check if we're on a YouTube video page
    checkYouTubePage();
    
    // Set up message listener
    setupMessageListener();
    
    // Wait for video element to load
    findVideoElement();
})();

/**
 * Check if current page is a YouTube video page
 */
function checkYouTubePage() {
    isYouTubePage = window.location.hostname === 'www.youtube.com' && 
                   window.location.pathname === '/watch';
    
    if (isYouTubePage) {
        extractVideoInfo();
    }
}

/**
 * Find the YouTube video element
 */
function findVideoElement() {
    // Try to find video element
    videoElement = document.querySelector('video.html5-main-video');
    
    if (videoElement) {
        console.log('YouTube video element found');
        extractVideoInfo();
    } else {
        // If not found, wait and try again
        setTimeout(findVideoElement, 1000);
    }
}

/**
 * Extract video information from YouTube page
 */
function extractVideoInfo() {
    if (!isYouTubePage) return;
    
    try {
        // Get video ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('v');
        
        if (!videoId) return;
        
        // Get video title
        const titleElement = document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string');
        const title = titleElement ? titleElement.textContent.trim() : 'Unknown Video';
        
        // Get video duration
        let duration = 0;
        if (videoElement) {
            duration = videoElement.duration || 0;
        }
        
        // Create video info object
        videoInfo = {
            id: videoId,
            title: title,
            url: window.location.href,
            duration: duration,
            currentTime: videoElement ? videoElement.currentTime : 0
        };
        
        console.log('Video info extracted:', videoInfo);
        
    } catch (error) {
        console.error('Error extracting video info:', error);
    }
}

/**
 * Set up message listener for popup communication
 */
function setupMessageListener() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log('Message received in content script:', request);
        
        switch (request.action) {
            case 'getVideoInfo':
                handleGetVideoInfo(sendResponse);
                break;
                
            case 'getCurrentTime':
                handleGetCurrentTime(sendResponse);
                break;
                
            case 'jumpToTime':
                handleJumpToTime(request.data, sendResponse);
                break;
                
            default:
                sendResponse({ success: false, message: 'Unknown action' });
        }
        
        return true; // Keep the message channel open for async response
    });
}

/**
 * Handle get video info request
 */
function handleGetVideoInfo(sendResponse) {
    // Refresh video info
    extractVideoInfo();
    
    if (videoInfo) {
        sendResponse({ 
            success: true, 
            data: videoInfo 
        });
    } else {
        sendResponse({ 
            success: false, 
            message: 'No video information available' 
        });
    }
}

/**
 * Handle get current time request
 */
function handleGetCurrentTime(sendResponse) {
    if (!videoElement) {
        sendResponse({ 
            success: false, 
            message: 'Video element not found' 
        });
        return;
    }
    
    const currentTime = videoElement.currentTime || 0;
    
    sendResponse({ 
        success: true, 
        data: { 
            currentTime: currentTime 
        } 
    });
}

/**
 * Handle jump to time request
 */
function handleJumpToTime(data, sendResponse) {
    if (!videoElement) {
        sendResponse({ 
            success: false, 
            message: 'Video element not found' 
        });
        return;
    }
    
    try {
        const targetTime = data.time || 0;
        
        // Set video time
        videoElement.currentTime = targetTime;
        
        // Play video if paused
        if (videoElement.paused) {
            videoElement.play().catch(error => {
                console.log('Auto-play prevented:', error);
            });
        }
        
        // Scroll to video element to ensure visibility
        videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        sendResponse({ 
            success: true, 
            message: `Jumped to ${formatTime(targetTime)}` 
        });
        
    } catch (error) {
        console.error('Error jumping to time:', error);
        sendResponse({ 
            success: false, 
            message: 'Failed to jump to timestamp' 
        });
    }
}

/**
 * Format time in seconds to MM:SS format
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Monitor video page changes
 */
function monitorPageChanges() {
    // Create a MutationObserver to detect page changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                // Video URL changed, extract new video info
                setTimeout(extractVideoInfo, 1000);
            }
        });
    });
    
    // Start observing the document
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
}

/**
 * Add keyboard shortcuts for note-taking
 */
function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(event) {
        // Alt + N: Focus on note input (if popup is open)
        if (event.altKey && event.key === 'n') {
            // This would require popup to be open, handled by popup.js
            console.log('Note shortcut triggered');
        }
        
        // Alt + T: Get current timestamp
        if (event.altKey && event.key === 't') {
            if (videoElement) {
                const currentTime = videoElement.currentTime;
                console.log('Current timestamp:', formatTime(currentTime));
                // Copy to clipboard
                navigator.clipboard.writeText(formatTime(currentTime));
            }
        }
    });
}

/**
 * Add visual indicators for better user experience
 */
function addVisualIndicators() {
    if (!isYouTubePage) return;
    
    // Add a small indicator that the extension is active
    const indicator = document.createElement('div');
    indicator.id = 'youtube-notes-indicator';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #007bff;
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-family: Arial, sans-serif;
        z-index: 10000;
        opacity: 0.8;
        transition: opacity 0.3s ease;
        pointer-events: none;
    `;
    indicator.textContent = '📝 Notes Ready';
    
    document.body.appendChild(indicator);
    
    // Hide indicator after 3 seconds
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 300);
    }, 3000);
}

/**
 * Handle video events for better integration
 */
function handleVideoEvents() {
    if (!videoElement) return;
    
    // Listen for video time updates
    videoElement.addEventListener('timeupdate', function() {
        // Update current time in video info
        if (videoInfo) {
            videoInfo.currentTime = videoElement.currentTime;
        }
    });
    
    // Listen for video loaded metadata
    videoElement.addEventListener('loadedmetadata', function() {
        if (videoInfo) {
            videoInfo.duration = videoElement.duration;
        }
    });
    
    // Listen for video end
    videoElement.addEventListener('ended', function() {
        console.log('Video ended - notes session complete');
    });
}

/**
 * Error handling and recovery
 */
function setupErrorHandling() {
    window.addEventListener('error', function(event) {
        console.error('Content script error:', event.error);
    });
    
    // Handle YouTube page navigation
    window.addEventListener('beforeunload', function() {
        console.log('Page unloading - cleaning up');
    });
}

/**
 * Initialize all features
 */
function initializeFeatures() {
    if (isYouTubePage && videoElement) {
        monitorPageChanges();
        addKeyboardShortcuts();
        addVisualIndicators();
        handleVideoEvents();
        setupErrorHandling();
    }
}

// Initialize features when video is found
if (videoElement) {
    initializeFeatures();
} else {
    // Wait for video to load
    const checkInterval = setInterval(() => {
        if (videoElement) {
            clearInterval(checkInterval);
            initializeFeatures();
        }
    }, 1000);
    
    // Stop checking after 10 seconds
    setTimeout(() => clearInterval(checkInterval), 10000);
}

// Handle YouTube's dynamic loading
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        findVideoElement();
    }, 2000);
});

// Handle SPA navigation
let lastUrl = window.location.href;
new MutationObserver(() => {
    const url = window.location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
            checkYouTubePage();
            findVideoElement();
        }, 1000);
    }
}).observe(document, { subtree: true, childList: true });

// Export functions for testing (in development)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractVideoInfo,
        formatTime,
        handleGetVideoInfo,
        handleGetCurrentTime,
        handleJumpToTime
    };
}
