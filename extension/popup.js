// YouTube Learning Notes Saver - Popup JavaScript
// This file handles the popup UI functionality and note management

// Global variables
let currentVideoInfo = null;
let notes = [];
let filteredNotes = [];

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('YouTube Notes Saver popup loaded');
    
    // Load current video information
    loadCurrentVideoInfo();
    
    // Load saved notes
    loadNotes();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start periodic updates
    startPeriodicUpdates();
});

/**
 * Set up event listeners for all interactive elements
 */
function setupEventListeners() {
    // Save note button
    document.getElementById('saveNote').addEventListener('click', saveNote);
    
    // Clear input button
    document.getElementById('clearInput').addEventListener('click', clearNoteInput);
    
    // Export notes button
    document.getElementById('exportNotes').addEventListener('click', exportNotes);
    
    // Clear all notes button
    document.getElementById('clearAllNotes').addEventListener('click', clearAllNotes);
    
    // Search functionality
    document.getElementById('searchNotes').addEventListener('input', searchNotes);
    
    // Enter key to save note
    document.getElementById('noteInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && event.ctrlKey) {
            saveNote();
        }
    });
    
    // Auto-resize textarea
    document.getElementById('noteInput').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

/**
 * Load current video information from content script
 */
function loadCurrentVideoInfo() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].url.includes('youtube.com/watch')) {
            // Send message to content script to get video info
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getVideoInfo' }, function(response) {
                if (response && response.success) {
                    currentVideoInfo = response.data;
                    updateVideoInfo();
                    loadNotes();
                } else {
                    showNoVideoMessage();
                }
            });
        } else {
            showNoVideoMessage();
        }
    });
}

/**
 * Update video information display
 */
function updateVideoInfo() {
    if (!currentVideoInfo) return;
    
    document.getElementById('videoTitle').textContent = currentVideoInfo.title || 'Unknown Video';
    document.getElementById('videoUrl').textContent = currentVideoInfo.url || '';
    document.getElementById('videoDuration').textContent = formatTime(currentVideoInfo.duration || 0);
    
    // Update current time periodically
    updateCurrentTime();
}

/**
 * Show message when no YouTube video is detected
 */
function showNoVideoMessage() {
    document.getElementById('videoTitle').textContent = 'No video detected';
    document.getElementById('videoUrl').textContent = 'Please open a YouTube video';
    document.getElementById('currentTime').textContent = '00:00';
    document.getElementById('videoDuration').textContent = '00:00';
    
    // Disable save button
    document.getElementById('saveNote').disabled = true;
}

/**
 * Load notes from local storage
 */
function loadNotes() {
    if (!currentVideoInfo) return;
    
    const storageKey = `youtube_notes_${currentVideoInfo.id}`;
    
    chrome.storage.local.get([storageKey], function(result) {
        notes = result[storageKey] || [];
        filteredNotes = [...notes];
        displayNotes();
        updateStatistics();
    });
}

/**
 * Save a new note
 */
function saveNote() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();
    
    if (!noteText) {
        showMessage('Please enter a note content', 'error');
        return;
    }
    
    if (!currentVideoInfo) {
        showMessage('No video detected', 'error');
        return;
    }
    
    // Get current timestamp
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getCurrentTime' }, function(response) {
            const currentTime = response && response.success ? response.data.currentTime : 0;
            
            const newNote = {
                id: Date.now().toString(),
                timestamp: currentTime,
                content: noteText,
                videoId: currentVideoInfo.id,
                videoTitle: currentVideoInfo.title,
                videoUrl: currentVideoInfo.url,
                createdAt: new Date().toISOString()
            };
            
            // Add note to array
            notes.unshift(newNote);
            filteredNotes = [...notes];
            
            // Save to storage
            saveNotesToStorage();
            
            // Update UI
            displayNotes();
            updateStatistics();
            
            // Clear input
            clearNoteInput();
            
            // Show success message
            showMessage('Note saved successfully!', 'success');
        });
    });
}

/**
 * Clear the note input field
 */
function clearNoteInput() {
    const noteInput = document.getElementById('noteInput');
    noteInput.value = '';
    noteInput.style.height = 'auto';
    noteInput.focus();
}

/**
 * Delete a specific note
 */
function deleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    notes = notes.filter(note => note.id !== noteId);
    filteredNotes = filteredNotes.filter(note => note.id !== noteId);
    
    saveNotesToStorage();
    displayNotes();
    updateStatistics();
    
    showMessage('Note deleted', 'success');
}

/**
 * Jump to video timestamp
 */
function jumpToTimestamp(timestamp) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'jumpToTime', 
            data: { time: timestamp } 
        }, function(response) {
            if (response && response.success) {
                showMessage('Jumped to timestamp', 'success');
            }
        });
    });
}

/**
 * Export notes to text format
 */
function exportNotes() {
    if (filteredNotes.length === 0) {
        showMessage('No notes to export', 'error');
        return;
    }
    
    const exportText = generateExportText();
    downloadTextFile(exportText, `youtube-notes-${currentVideoInfo.id}.txt`);
    showMessage('Notes exported successfully!', 'success');
}

/**
 * Generate export text
 */
function generateExportText() {
    let exportText = `YouTube Learning Notes\n`;
    exportText += `====================\n`;
    exportText += `Video: ${currentVideoInfo.title}\n`;
    exportText += `URL: ${currentVideoInfo.url}\n`;
    exportText += `Export Date: ${new Date().toLocaleString()}\n\n`;
    
    exportText += `TIMESTAMP | NOTE\n`;
    exportText += `----------|--------------------------------------------------\n`;
    
    filteredNotes.forEach(note => {
        const timestamp = formatTime(note.timestamp);
        const content = note.content.replace(/\n/g, ' ');
        exportText += `${timestamp.padEnd(9)} | ${content}\n`;
    });
    
    return exportText;
}

/**
 * Download text file
 */
function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Clear all notes
 */
function clearAllNotes() {
    if (filteredNotes.length === 0) {
        showMessage('No notes to clear', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete all ${filteredNotes.length} notes?`)) return;
    
    notes = [];
    filteredNotes = [];
    
    saveNotesToStorage();
    displayNotes();
    updateStatistics();
    
    showMessage('All notes cleared', 'success');
}

/**
 * Search notes
 */
function searchNotes() {
    const searchTerm = document.getElementById('searchNotes').value.toLowerCase();
    
    if (searchTerm === '') {
        filteredNotes = [...notes];
    } else {
        filteredNotes = notes.filter(note => 
            note.content.toLowerCase().includes(searchTerm)
        );
    }
    
    displayNotes();
}

/**
 * Display notes in the UI
 */
function displayNotes() {
    const notesList = document.getElementById('notesList');
    const noNotesMessage = document.getElementById('noNotesMessage');
    
    if (filteredNotes.length === 0) {
        notesList.style.display = 'none';
        noNotesMessage.style.display = 'block';
        return;
    }
    
    notesList.style.display = 'block';
    noNotesMessage.style.display = 'none';
    
    // Sort notes by timestamp
    filteredNotes.sort((a, b) => b.timestamp - a.timestamp);
    
    notesList.innerHTML = '';
    
    filteredNotes.forEach(note => {
        const noteElement = createNoteElement(note);
        notesList.appendChild(noteElement);
    });
}

/**
 * Create a note element
 */
function createNoteElement(note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note-item';
    
    const noteHeader = document.createElement('div');
    noteHeader.className = 'note-header';
    
    const timestamp = document.createElement('span');
    timestamp.className = 'note-timestamp';
    timestamp.textContent = formatTime(note.timestamp);
    timestamp.addEventListener('click', () => jumpToTimestamp(note.timestamp));
    timestamp.title = 'Click to jump to this timestamp';
    
    const noteActions = document.createElement('div');
    noteActions.className = 'note-actions';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'note-action-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete note';
    deleteBtn.addEventListener('click', () => deleteNote(note.id));
    
    noteActions.appendChild(deleteBtn);
    noteHeader.appendChild(timestamp);
    noteHeader.appendChild(noteActions);
    
    const noteContent = document.createElement('div');
    noteContent.className = 'note-content';
    noteContent.textContent = note.content;
    
    const noteDate = document.createElement('div');
    noteDate.className = 'note-date';
    noteDate.textContent = `Created: ${new Date(note.createdAt).toLocaleString()}`;
    
    noteDiv.appendChild(noteHeader);
    noteDiv.appendChild(noteContent);
    noteDiv.appendChild(noteDate);
    
    return noteDiv;
}

/**
 * Save notes to local storage
 */
function saveNotesToStorage() {
    if (!currentVideoInfo) return;
    
    const storageKey = `youtube_notes_${currentVideoInfo.id}`;
    const dataToSave = {};
    dataToSave[storageKey] = notes;
    
    chrome.storage.local.set(dataToSave, function() {
        console.log('Notes saved to storage');
    });
}

/**
 * Update current time display
 */
function updateCurrentTime() {
    if (!currentVideoInfo) return;
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getCurrentTime' }, function(response) {
            if (response && response.success) {
                document.getElementById('currentTime').textContent = formatTime(response.data.currentTime);
            }
        });
    });
}

/**
 * Update statistics
 */
function updateStatistics() {
    document.getElementById('totalNotes').textContent = filteredNotes.length;
}

/**
 * Start periodic updates
 */
function startPeriodicUpdates() {
    // Update current time every second
    setInterval(updateCurrentTime, 1000);
}

/**
 * Show message to user
 */
function showMessage(text, type = 'success') {
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    
    successText.textContent = text;
    
    if (type === 'error') {
        successMessage.style.background = '#dc3545';
    } else {
        successMessage.style.background = '#28a745';
    }
    
    successMessage.style.display = 'block';
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
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
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + S to save note
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveNote();
    }
    
    // Ctrl/Cmd + E to export notes
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        exportNotes();
    }
    
    // Escape to clear input
    if (event.key === 'Escape') {
        clearNoteInput();
    }
});

// Error handling
window.addEventListener('error', function(event) {
    console.error('Popup error:', event.error);
    showMessage('An error occurred. Please try again.', 'error');
});

// Handle extension context invalidation
chrome.runtime.onSuspend.addListener(function() {
    console.log('Extension context suspended');
});
