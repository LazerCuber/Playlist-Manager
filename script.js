// --- DOM Elements ---
// (Keep all DOM element selections as they are necessary)
const playlistNameInput = document.getElementById('playlistName');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const playlistListEl = document.getElementById('playlistList');
const playlistSearchInput = document.getElementById('playlistSearch');
const noPlaylistsMessageEl = document.getElementById('noPlaylistsMessage');
const videoUrlInput = document.getElementById('videoUrl');
const addVideoBtn = document.getElementById('addVideoBtn');
const videoGridEl = document.getElementById('videoGrid');
const currentPlaylistTitleEl = document.getElementById('currentPlaylistTitle');
const videoFormEl = document.getElementById('videoForm');
const playerWrapperEl = document.getElementById('playerWrapper');
const videoPlaceholderEl = document.getElementById('videoPlaceholder');
const playlistActionsEl = document.getElementById('playlistActions');
const autoplayToggle = document.getElementById('autoplayToggle'); // Direct reference to checkbox
const autoplaySwitchDiv = document.querySelector('.control-group .switch'); // For visual click
const clearPlaylistBtn = document.getElementById('clearPlaylistBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const importFileEl = document.getElementById('importFile');
const toastContainerEl = document.getElementById('toastContainer');
const htmlEl = document.documentElement;
const bodyEl = document.body; // Keep if needed elsewhere, otherwise potentially remove
const closePlayerBtn = document.getElementById('closePlayerBtn');
const sidebarEl = document.querySelector('.sidebar');
const sidebarResizerEl = document.getElementById('sidebarResizer');
const shufflePlaylistBtn = document.getElementById('shufflePlaylistBtn');
// Pagination Elements
const paginationControlsEl = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfoEl = document.getElementById('pageInfo');

// --- State ---
let playlists = [];
let currentPlaylistId = null;
let ytPlayer = null;
let isPlayerReady = false;
let videoIdToPlayOnReady = null; // Video ID queued before player ready
let isAutoplayEnabled = false;
let currentlyPlayingVideoId = null; // ID of the video successfully playing
let intendedVideoId = null;       // ID of the video we are trying to play/load
let draggedVideoId = null;        // ID of the video being dragged (mouse/touch)
let dragTargetElement = null;     // Element we are dragging over (mouse/touch)
let currentTheme = 'light';
let isResizing = false;
// Touch drag state - simplified, combined with mouse drag state where possible
let isTouchDragging = false;
let touchDragStartY = 0;
let touchDraggedElement = null;
// Pagination State
const VIDEOS_PER_PAGE = 20;
let currentPage = 1;
// Web Audio Keep-Alive - REINSTATED
let audioContext = null;
let silentSourceNode = null; // Keep track of the silent node
let wakeLock = null;
let isWakeLockSupported = 'wakeLock' in navigator;

// --- Icons ---
// (Keep ICONS object as is)
const ICONS = {
    add: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>`,
    loading: `<span class="spinner"></span>`,
    rename: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V12h2.293l6.5-6.5z"/></svg>`,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>`,
    drag: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>`
};

// --- Initialization ---
function init() {
    loadTheme();
    loadPlaylists();
    loadAutoplaySetting();
    loadSidebarWidth();
    setupEventListeners(); // Setup listeners early
    updateThemeIcon(); // Set initial theme icon

    // YouTube API script is loaded externally via <script> tag.
    // onYouTubeIframeAPIReady will be called automatically by the API when ready.

    const lastSelectedId = localStorage.getItem('lastSelectedPlaylistId');
    const playlistToSelect = playlists.find(p => p.id === parseInt(lastSelectedId)) || playlists[0];

    if (playlistToSelect) {
        selectPlaylist(playlistToSelect.id);
    } else {
        updateUIForNoSelection();
    }
    renderPlaylists(); // Initial playlist render

    // Try to create AudioContext early (might start suspended)
    // User interaction will be needed to properly start/resume it.
    ensureAudioContext();
}

// --- Local Storage & State Helpers ---
const Storage = {
    get: (key, defaultValue = null) => JSON.parse(localStorage.getItem(key)) ?? defaultValue,
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    getRaw: (key, defaultValue = null) => localStorage.getItem(key) ?? defaultValue,
    setRaw: (key, value) => localStorage.setItem(key, value),
    remove: (key) => localStorage.removeItem(key)
};

function savePlaylistsState() { Storage.set('playlists', playlists); }
function loadPlaylists() {
    playlists = Storage.get('playlists', []);
    // Ensure structure consistency
    playlists.forEach(p => { if (!Array.isArray(p.videos)) p.videos = []; });
}

function saveAutoplaySetting() { Storage.setRaw('autoplayEnabled', isAutoplayEnabled); }
function loadAutoplaySetting() {
    isAutoplayEnabled = Storage.getRaw('autoplayEnabled') === 'true';
    autoplayToggle.checked = isAutoplayEnabled;
}

function saveLastSelectedPlaylist(id) { Storage.setRaw('lastSelectedPlaylistId', id ? String(id) : ''); }

function saveSidebarWidth(width) { Storage.setRaw('sidebarWidth', width); }
function loadSidebarWidth() {
    const savedWidth = Storage.getRaw('sidebarWidth');
    if (savedWidth) {
        sidebarEl.style.width = savedWidth + 'px';
    }
}

// --- Helper Function ---
function getCurrentPlaylist() {
    return playlists.find(p => p.id === currentPlaylistId);
}

// --- Web Audio Keep-Alive ---

/**
 * Ensures the AudioContext exists and attempts to resume it if suspended.
 * Needs to be called in response to user interaction (click, tap) initially.
 * Returns true if context exists (even if suspended), false otherwise.
 */
function ensureAudioContext() {
    if (!audioContext) {
        try {
            // Standard context
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("AudioContext created. Initial state:", audioContext.state);
            // If it starts running right away (less common without interaction), play silence.
            if (audioContext.state === 'running') {
                playSilentSound();
            }
            // Add listeners for state changes (optional but good practice)
            audioContext.onstatechange = () => {
                console.log("AudioContext state changed to:", audioContext.state);
                if (audioContext.state === 'running') {
                    playSilentSound(); // Ensure silence plays if context resumes unexpectedly
                }
            };
        } catch (e) {
            console.error("Web Audio API not supported or context creation failed.", e);
            audioContext = null; // Ensure it's null on failure
            return false;
        }
    }

    // If context exists but is suspended, try to resume it.
    // This often requires a recent user gesture.
    if (audioContext && audioContext.state === 'suspended') {
        console.log("AudioContext suspended. Attempting to resume...");
        audioContext.resume().then(() => {
            console.log("AudioContext resumed successfully. State:", audioContext.state);
            // playSilentSound(); // State change handler should now trigger this
        }).catch(e => {
            // This warning is common if resume is called without a direct user action
            console.warn("Failed to resume AudioContext automatically (may need user interaction):", e);
        });
    } else if (audioContext && audioContext.state === 'running') {
        // If already running, ensure silent sound is playing (it might have stopped unexpectedly)
        playSilentSound();
    }

    return !!audioContext; // Return true if context exists
}

/**
 * Plays a continuous silent sound loop using the Web Audio API.
 * Requires the audioContext to be in the 'running' state.
 */
function playSilentSound() {
    if (!audioContext || audioContext.state !== 'running') {
        // console.log("Cannot play silent sound: AudioContext not running.");
        return; // Don't proceed if context isn't running
    }

    // Stop and clear existing node if it exists AND if it's not already playing the same buffer
    if (silentSourceNode) {
        // Basic check to see if it might be the same node already running
        // A more robust check isn't strictly necessary here as re-creating is usually fine
        if (silentSourceNode.buffer && silentSourceNode.loop) {
           // Already playing, likely don't need to restart
           // console.log("Silent node appears to be running already.");
           return;
        }
        // If different or stopped, clear it
        try {
            silentSourceNode.stop();
        } catch (e) { /* Might already be stopped or not started */ }
        silentSourceNode.disconnect();
        silentSourceNode = null;
        // console.log("Cleared previous silent node.");
    }

    // Create a minimal buffer (1 frame)
    const buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
    // No need to fill with data, it's silent by default

    // Create buffer source
    silentSourceNode = audioContext.createBufferSource();
    silentSourceNode.buffer = buffer;
    silentSourceNode.loop = true; // Loop indefinitely

    // Connect to the output (speakers)
    silentSourceNode.connect(audioContext.destination);

    // Handle node ending unexpectedly (though loop=true should prevent this)
    silentSourceNode.onended = () => {
        // console.log("Silent node ended unexpectedly. Clearing reference.");
        if (silentSourceNode) {
            silentSourceNode.disconnect(); // Ensure disconnect on end
            silentSourceNode = null;
            // Optionally, try to restart it immediately if context is still running
            // if (audioContext && audioContext.state === 'running') {
            //     playSilentSound();
            // }
        }
    };

    // Start playing
    try {
        silentSourceNode.start(0);
        // console.log("Silent audio node started.");
    } catch (e) {
        console.error("Error starting silent audio node:", e);
        // Clear the node reference if starting failed
        if (silentSourceNode) {
            try { silentSourceNode.disconnect(); } catch (err) {}
            silentSourceNode = null;
        }
    }
}


// --- Event Listeners Setup ---
function setupEventListeners() {
    createPlaylistBtn.addEventListener('click', handleCreatePlaylist);
    playlistNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleCreatePlaylist(); });
    addVideoBtn.addEventListener('click', handleAddVideo);
    videoUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !addVideoBtn.disabled) handleAddVideo(); });
    videoUrlInput.addEventListener('input', () => { addVideoBtn.disabled = videoUrlInput.value.trim() === ''; });
    autoplayToggle.addEventListener('change', handleAutoplayToggle);
    autoplaySwitchDiv.addEventListener('click', handleVisualSwitchClick); // Handles clicks on the visual switch area
    clearPlaylistBtn.addEventListener('click', handleClearPlaylist);
    themeToggleBtn.addEventListener('click', toggleTheme);
    shufflePlaylistBtn.addEventListener('click', handleShufflePlaylist);
    playlistSearchInput.addEventListener('input', debounce(handlePlaylistSearch, 300));
    importBtn.addEventListener('click', () => importFileEl.click());
    importFileEl.addEventListener('change', handleImportPlaylists);
    exportBtn.addEventListener('click', handleExportPlaylists);
    sidebarResizerEl.addEventListener('mousedown', initSidebarResize);
    closePlayerBtn.addEventListener('click', handleClosePlayer);

    // --- Event Delegation ---
    playlistListEl.addEventListener('click', handlePlaylistListActions);
    videoGridEl.addEventListener('click', handleVideoGridClick);

    // --- Drag and Drop (Mouse & Touch) ---
    setupDragAndDropListeners();
    setupTouchDragListeners(); // Separate setup for touch

    // --- Pagination ---
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));

    // --- Attempt to resume AudioContext on any user interaction ---
    // Add a general listener to resume context on first interaction if suspended
    // Use { once: true } so it only runs once after the page loads
    const resumeAudio = () => {
        console.log("User interaction detected, ensuring audio context...");
        ensureAudioContext();
    };
    document.body.addEventListener('click', resumeAudio, { once: true, capture: true });
    document.body.addEventListener('touchstart', resumeAudio, { once: true, capture: true });
    document.body.addEventListener('keydown', resumeAudio, { once: true, capture: true });

    // Add this line in setupEventListeners()
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

// --- Playlist List Event Handler (Delegation) ---
function handlePlaylistListActions(event) {
    const playlistItem = event.target.closest('.playlist-item');
    if (!playlistItem) return;
    const playlistId = parseInt(playlistItem.dataset.id);

    // *** Ensure context active on user interaction ***
    ensureAudioContext();

    if (event.target.closest('.rename-btn')) {
        event.stopPropagation(); handleRenamePlaylist(playlistId);
    } else if (event.target.closest('.delete-btn')) {
        event.stopPropagation(); handleDeletePlaylist(playlistId);
    } else {
        selectPlaylist(playlistId);
    }
}

// --- Video Grid Event Handler (Delegation) ---
function handleVideoGridClick(event) {
    const videoCard = event.target.closest('.video-card');
    if (!videoCard) return;
    const videoId = videoCard.dataset.videoId;

    // *** Ensure AudioContext is active on user click BEFORE playing ***
    ensureAudioContext(); // This is a key interaction point

    if (event.target.closest('.delete-video-btn')) {
        event.stopPropagation(); handleDeleteVideo(videoId);
    } else if (!event.target.closest('.drag-handle')) { // Don't play if clicking the handle
        playVideo(videoId);
    }
}

// --- Pagination Control ---
function changePage(delta) {
    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist) return;
    const totalPages = Math.ceil(currentPlaylist.videos.length / VIDEOS_PER_PAGE);
    const newPage = currentPage + delta;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderVideos(); // Re-render videos for the new page
    }
}

// --- Sidebar Resizing ---
// (Keep initSidebarResize, handleSidebarResize, stopSidebarResize as they are standard)
function initSidebarResize(e) {
    isResizing = true;
    sidebarResizerEl.classList.add('resizing');
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleSidebarResize);
    document.addEventListener('mouseup', stopSidebarResize);
    e.preventDefault();
}

function handleSidebarResize(e) {
    if (!isResizing) return;
    const containerRect = document.querySelector('.container').getBoundingClientRect();
    const minWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-min-width'));
    const maxWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-max-width'));
    const newWidth = Math.max(minWidth, Math.min(e.clientX - containerRect.left, maxWidth));
    sidebarEl.style.width = newWidth + 'px';
}

function stopSidebarResize() {
    if (!isResizing) return; // Prevent saving if not resizing
    isResizing = false;
    sidebarResizerEl.classList.remove('resizing');
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleSidebarResize);
    document.removeEventListener('mouseup', stopSidebarResize);
    saveSidebarWidth(sidebarEl.getBoundingClientRect().width);
}

// --- Drag and Drop (Mouse) ---
function setupDragAndDropListeners() {
    videoGridEl.addEventListener('dragstart', handleDragStart);
    videoGridEl.addEventListener('dragend', handleDragEnd);
    videoGridEl.addEventListener('dragover', handleDragOver);
    videoGridEl.addEventListener('dragleave', handleDragLeave);
    videoGridEl.addEventListener('drop', handleDrop);
}

function handleDragStart(event) {
    const videoCard = event.target.closest('.video-card[draggable="true"]');
    if (videoCard) {
        draggedVideoId = videoCard.dataset.videoId;
        event.dataTransfer.effectAllowed = 'move';
        setTimeout(() => videoCard.classList.add('dragging'), 0);
    } else {
        event.preventDefault(); // Prevent dragging if not on a draggable element
    }
}

function handleDragEnd(event) {
    const draggingElement = videoGridEl.querySelector('.video-card.dragging');
    if (draggingElement) draggingElement.classList.remove('dragging');
    clearDragOverStyles();
    draggedVideoId = null;
    dragTargetElement = null;
}

function handleDragOver(event) {
    event.preventDefault();
    if (!draggedVideoId) return;

    const targetCard = event.target.closest('.video-card');
    if (targetCard && targetCard.dataset.videoId !== draggedVideoId) {
        if (dragTargetElement !== targetCard) {
            clearDragOverStyles();
            targetCard.classList.add('drag-over');
            dragTargetElement = targetCard;
        }
        event.dataTransfer.dropEffect = 'move';
    } else {
        if (dragTargetElement) { // Clear if over empty space or self
            clearDragOverStyles();
            dragTargetElement = null;
        }
        event.dataTransfer.dropEffect = 'none';
    }
}

function handleDragLeave(event) {
    const relatedTarget = event.relatedTarget;
    const targetCard = event.target.closest('.video-card');

    // Check if leaving the grid container entirely or entering a non-card element within the grid
    const leavingGridContainer = !videoGridEl.contains(relatedTarget);
    const enteringNonCard = relatedTarget && !relatedTarget.closest('.video-card');

    if (targetCard && targetCard === dragTargetElement && (leavingGridContainer || enteringNonCard || !targetCard.contains(relatedTarget))) {
        clearDragOverStyles();
        dragTargetElement = null;
    }
}


function handleDrop(event) {
    event.preventDefault();
    clearDragOverStyles();
    const targetCard = event.target.closest('.video-card');
    const dropTargetId = targetCard ? targetCard.dataset.videoId : null; // Can be null if dropped in empty space

    if (draggedVideoId && dropTargetId !== draggedVideoId) { // Ensure dropTargetId is not the dragged item itself
        handleReorderVideo(draggedVideoId, dropTargetId);
    } else if (draggedVideoId && !dropTargetId) {
        // Handle drop in empty space (append to end)
        handleReorderVideo(draggedVideoId, null); // Pass null target to indicate append
    }
    // Reset state regardless of successful drop
    draggedVideoId = null;
    dragTargetElement = null;
}

function clearDragOverStyles() {
    videoGridEl.querySelectorAll('.video-card.drag-over').forEach(card => card.classList.remove('drag-over'));
}

// --- Drag and Drop (Touch) ---
function setupTouchDragListeners() {
    videoGridEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    videoGridEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    videoGridEl.addEventListener('touchend', handleTouchEnd);
    videoGridEl.addEventListener('touchcancel', handleTouchEnd);
}

function handleTouchStart(event) {
    const targetCard = event.target.closest('.video-card[draggable="true"]');
    const dragHandle = event.target.closest('.drag-handle');

    if (targetCard && dragHandle) {
         // *** Ensure context active on user interaction ***
        ensureAudioContext();

        isTouchDragging = true;
        draggedVideoId = targetCard.dataset.videoId; // Use the same state var
        touchDraggedElement = targetCard; // Specific element being touched
        touchDragStartY = event.touches[0].clientY;
        touchDraggedElement.classList.add('dragging');
        // Optional: navigator.vibrate(50);
        event.preventDefault(); // Prevent default scroll/zoom only if dragging starts on handle
    } else {
        isTouchDragging = false; // Reset if touch didn't start on handle
    }
}

function handleTouchMove(event) {
    if (!isTouchDragging || !touchDraggedElement) return;
    event.preventDefault(); // Prevent scrolling *during* drag

    const touch = event.touches[0];
    // Find element under touch
    touchDraggedElement.style.visibility = 'hidden'; // Temporarily hide dragged item
    const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
    touchDraggedElement.style.visibility = ''; // Make it visible again

    const targetCard = elementUnderTouch ? elementUnderTouch.closest('.video-card') : null;

    clearDragOverStyles(); // Use the same clearing function

    if (targetCard && targetCard !== touchDraggedElement) {
        targetCard.classList.add('drag-over');
        dragTargetElement = targetCard; // Use the same state var
    } else {
        dragTargetElement = null; // Reset if over self or empty space
    }

    // Optional: Visual feedback like moving the element with touch
    // const deltaY = touch.clientY - touchDragStartY;
    // touchDraggedElement.style.transform = `translateY(${deltaY}px)`;
}

function handleTouchEnd(event) {
    if (!isTouchDragging || !touchDraggedElement) return;

    touchDraggedElement.classList.remove('dragging');
    // touchDraggedElement.style.transform = ''; // Reset visual transform if used
    clearDragOverStyles();

    const dropTargetId = dragTargetElement ? dragTargetElement.dataset.videoId : null;

    if (draggedVideoId && dropTargetId !== draggedVideoId) { // Dropped onto another card
        handleReorderVideo(draggedVideoId, dropTargetId);
    } else if (draggedVideoId && !dropTargetId) { // Dropped onto empty space
        // Check if the touch ended within the videoGridEl bounds
        const touch = event.changedTouches[0];
        const gridRect = videoGridEl.getBoundingClientRect();
        if (touch.clientX >= gridRect.left && touch.clientX <= gridRect.right &&
            touch.clientY >= gridRect.top && touch.clientY <= gridRect.bottom) {
             handleReorderVideo(draggedVideoId, null); // Append to end
        }
    }

    // Reset all touch-related state
    isTouchDragging = false;
    draggedVideoId = null; // Reset shared state
    touchDraggedElement = null;
    dragTargetElement = null; // Reset shared state
    touchDragStartY = 0;
}

// --- Theme Management ---
// (Keep loadTheme, applyTheme, toggleTheme, updateThemeIcon as they are straightforward)
function loadTheme() {
    applyTheme(Storage.getRaw('uiTheme', 'light'));
}
function applyTheme(themeName) {
    currentTheme = themeName;
    htmlEl.dataset.theme = themeName;
    updateThemeIcon();
    Storage.setRaw('uiTheme', themeName);
}
function toggleTheme() {
    // *** Ensure context active on user interaction ***
    ensureAudioContext();
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
}
function updateThemeIcon() {
    themeToggleBtn.innerHTML = currentTheme === 'dark' ? ICONS.sun : ICONS.moon;
    themeToggleBtn.title = currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
}

// --- YouTube Player API ---
// This function MUST be global
function onYouTubeIframeAPIReady() {
    console.log("YT API Ready.");
    if (document.getElementById('player')) {
        ytPlayer = new YT.Player('player', {
            height: '100%', 
            width: '100%',
            playerVars: { 
                'playsinline': 1, 
                'rel': 0,
                // Add these crucial parameters for background audio playback
                'enablejsapi': 1,
                'fs': 0,
                'modestbranding': 1,
                'iv_load_policy': 3,
                'disablekb': 1
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    } else {
        console.warn("Player element ('#player') not found.");
    }
}

// Add this code after the player is initialized
function configureBackgroundAudio() {
    // Create a hidden audio element to keep audio session active
    const audioElement = document.createElement('audio');
    audioElement.setAttribute('id', 'background-audio');
    audioElement.setAttribute('playsinline', 'true');
    audioElement.setAttribute('webkit-playsinline', 'true');
    audioElement.setAttribute('loop', 'true');
    audioElement.src = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    audioElement.volume = 0.001; // Nearly silent, just to keep audio session alive
    document.body.appendChild(audioElement);
    
    // Play the silent audio when a video starts playing to keep iOS audio session active
    if (ytPlayer && ytPlayer.addEventListener) {
        ytPlayer.addEventListener('onStateChange', function(e) {
            if (e.data === YT.PlayerState.PLAYING) {
                audioElement.play().catch(err => console.log('Silent audio play failed:', err));
            }
        });
    }
}

function onPlayerReady(event) {
    console.log("Player Ready.");
    isPlayerReady = true;
    // *** Try to ensure context is running when player is ready ***
    // This might still be suspended if no user interaction happened yet
    ensureAudioContext();
    setupMediaSessionActionHandlers(); // Setup MediaSession handlers
    configureBackgroundAudio(); // Add this line
    if (videoIdToPlayOnReady) {
        const videoToPlay = videoIdToPlayOnReady;
        videoIdToPlayOnReady = null;
        // playVideo will call ensureAudioContext again before loading
        playVideo(videoToPlay); // Play the queued video
    }
}

function onPlayerStateChange(event) {
    const state = event.data;
    const currentPlaylist = getCurrentPlaylist(); // Get playlist context if needed

    // Update Media Session state based on player state
    if ('mediaSession' in navigator) {
        switch (state) {
            case YT.PlayerState.PLAYING:
            case YT.PlayerState.BUFFERING: // Treat buffering as playing for media session
                navigator.mediaSession.playbackState = "playing";
                break;
            case YT.PlayerState.PAUSED:
                navigator.mediaSession.playbackState = "paused";
                break;
            case YT.PlayerState.ENDED:
            case YT.PlayerState.CUED: // Cued is ambiguous, maybe paused? Or none if nothing was intended?
            case YT.PlayerState.UNSTARTED:
            default:
                 navigator.mediaSession.playbackState = "none";
                 break; // Let specific logic below handle state more granularly if needed
        }
    }


    switch (state) {
        case YT.PlayerState.PLAYING:
            currentlyPlayingVideoId = intendedVideoId;
            updatePlayingVideoHighlight(currentlyPlayingVideoId);
            ensureAudioContext();
            requestWakeLock();
            break;
        case YT.PlayerState.PAUSED:
            // *** Keep context active even when paused (for background resume) ***
            ensureAudioContext();
            break;
        case YT.PlayerState.ENDED:
            const endedVideoId = currentlyPlayingVideoId || intendedVideoId;
            currentlyPlayingVideoId = null;
            intendedVideoId = null; // Clear intention as video finished naturally
            updatePlayingVideoHighlight(null);
            if (isAutoplayEnabled) {
                // *** Ensure context is active before next play attempt ***
                // playNextVideo will call ensureAudioContext again before loading
                playNextVideo(endedVideoId);
            } else {
                 if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "none";
            }
            break;
        // Other states (BUFFERING, CUED, UNSTARTED) don't require immediate action here,
        // but their MediaSession state is set above.
    }
}

function onPlayerError(event) {
    const erroredVideoId = intendedVideoId; // Capture the ID we were trying to play
    console.error(`YouTube Player Error: ${event.data} for video ID: ${erroredVideoId || 'unknown'}`);

    let errorMsg = `Player error code: ${event.data}`;
    switch (event.data) {
        case 2: errorMsg = 'Invalid video ID.'; break;
        case 5: errorMsg = 'HTML5 player error.'; break;
        case 100: errorMsg = 'Video not found (removed/private).'; break;
        case 101: case 150: errorMsg = 'Playback disallowed (embedding disabled).'; break;
    }
    showToast(`Player Error: ${errorMsg}`, 'error', 5000);

    // Reset state for the failed video
    if (erroredVideoId === currentlyPlayingVideoId) currentlyPlayingVideoId = null; // If it was somehow marked as playing
    if (erroredVideoId === intendedVideoId) intendedVideoId = null; // Clear the failed intention
    updatePlayingVideoHighlight(null);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';

    // Autoplay skip logic
    if (isAutoplayEnabled && erroredVideoId) {
        showToast(`Skipping to next video.`, 'info', 4000);
        // playNextVideo will call ensureAudioContext
        setTimeout(() => playNextVideo(erroredVideoId), 500); // Delay slightly
    } else if (!isAutoplayEnabled) {
        // If not autoplaying, hide the player on error
        handleClosePlayer(); // Calls stopVideo which clears state
    }
}

// --- Playlist Management ---
function handleCreatePlaylist() {
     // *** Ensure context active on user interaction ***
    ensureAudioContext();

    const name = playlistNameInput.value.trim();
    if (!name) { showToast('Please enter a playlist name.', 'error'); playlistNameInput.focus(); return; }
    const newPlaylist = { id: Date.now(), name: name, videos: [] };
    playlists.unshift(newPlaylist);
    savePlaylistsState();
    playlistSearchInput.value = ''; // Clear search
    renderPlaylists(); // Render updated list
    selectPlaylist(newPlaylist.id); // Select the new playlist
    playlistNameInput.value = '';
    showToast(`Playlist "${escapeHTML(name)}" created.`, 'success');
}

function handleDeletePlaylist(id) {
     // *** Ensure context active on user interaction ***
    ensureAudioContext();

    const playlistIndex = playlists.findIndex(p => p.id === id);
    if (playlistIndex === -1) return;
    const playlistName = playlists[playlistIndex].name;

    if (!confirm(`Delete playlist "${escapeHTML(playlistName)}"? This cannot be undone.`)) return;

    playlists.splice(playlistIndex, 1);

    // If the deleted playlist was selected
    if (currentPlaylistId === id) {
        currentPlaylistId = null; // Clear selection
        const nextPlaylist = playlists[playlistIndex] || playlists[playlistIndex - 1] || playlists[0];
        if (nextPlaylist) {
            selectPlaylist(nextPlaylist.id); // Select adjacent or first
        } else {
            updateUIForNoSelection(); // No playlists left
        }
    }

    savePlaylistsState();
    renderPlaylists(); // Re-render potentially filtered list
    showToast(`Playlist "${escapeHTML(playlistName)}" deleted.`, 'info');
}

function handleRenamePlaylist(id) {
     // *** Ensure context active on user interaction ***
    ensureAudioContext();

    const playlist = playlists.find(p => p.id === id); // Don't need getCurrentPlaylist here
    if (!playlist) return;
    const oldName = playlist.name;
    const newName = prompt('Enter new name:', oldName)?.trim(); // Use optional chaining and trim

    if (newName && newName !== oldName) {
        playlist.name = newName;
        savePlaylistsState();
        renderPlaylists(); // Re-render list
        if (currentPlaylistId === id) { // Update title if it was the selected one
            currentPlaylistTitleEl.textContent = escapeHTML(newName);
        }
        showToast(`Playlist renamed to "${escapeHTML(newName)}".`, 'info');
    }
}

function selectPlaylist(id) {
    // Called via handlePlaylistListActions, which already ensures context

    const selectedPlaylist = playlists.find(p => p.id === id);
    if (!selectedPlaylist) {
        console.error("Attempted to select non-existent playlist ID:", id);
        updateUIForNoSelection();
        return;
    }

    currentPlaylistId = id;
    currentPage = 1; // Reset pagination
    saveLastSelectedPlaylist(id);
    playlistSearchInput.value = ''; // Clear search on selection

    // Update UI elements
    currentPlaylistTitleEl.textContent = escapeHTML(selectedPlaylist.name);
    videoFormEl.classList.remove('hidden');
    playlistActionsEl.classList.remove('hidden');
    addVideoBtn.disabled = videoUrlInput.value.trim() === '';
    videoPlaceholderEl.classList.add('hidden');
    playerWrapperEl.classList.add('hidden'); // Hide player on playlist switch
    stopVideo(); // Stop any current video and clear state

    renderPlaylists(); // Update active state in the list
    renderVideos(); // Render videos for the selected playlist
}

function handleClearPlaylist() {
     // *** Ensure context active on user interaction ***
    ensureAudioContext();

    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist || currentPlaylist.videos.length === 0) {
        showToast('Playlist is already empty.', 'info');
        return;
    }
    if (!confirm(`Remove all videos from "${escapeHTML(currentPlaylist.name)}"?`)) return;

    currentPlaylist.videos = [];
    savePlaylistsState();
    stopVideo();
    handleClosePlayer(); // Ensure player is hidden
    renderVideos(); // Re-render empty grid/placeholder
    renderPlaylists(); // Update video count in sidebar
    showToast(`Cleared playlist "${escapeHTML(currentPlaylist.name)}".`, 'info');
}

function handlePlaylistSearch() {
    renderPlaylists(); // Re-render filtered list
}

function handleShufflePlaylist() {
     // *** Ensure context active on user interaction ***
    ensureAudioContext();

    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist) { showToast('Select a playlist to shuffle.', 'info'); return; }
    if (currentPlaylist.videos.length < 2) { showToast('Need at least two videos to shuffle.', 'info'); return; }

    // Fisher-Yates Shuffle
    for (let i = currentPlaylist.videos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentPlaylist.videos[i], currentPlaylist.videos[j]] = [currentPlaylist.videos[j], currentPlaylist.videos[i]];
    }

    savePlaylistsState();
    currentPage = 1; // Reset to first page
    renderVideos();
    showToast(`Playlist "${escapeHTML(currentPlaylist.name)}" shuffled!`, 'success');
}

// --- Video Management ---
function updatePlayingVideoHighlight(videoId) {
    videoGridEl.querySelectorAll('.video-card.playing').forEach(card => card.classList.remove('playing'));
    if (videoId) {
        const currentVideoCard = videoGridEl.querySelector(`.video-card[data-video-id="${videoId}"]`);
        if (currentVideoCard) currentVideoCard.classList.add('playing');
    }
}

async function handleAddVideo() {
     // *** Ensure context active on user interaction ***
    ensureAudioContext();

    const url = videoUrlInput.value.trim();
    const currentPlaylist = getCurrentPlaylist(); // Use helper
    if (!url) { showToast('Please enter a YouTube video URL.', 'error'); return; }
    if (!currentPlaylist) { showToast('No playlist selected.', 'error'); return; } // Should not happen

    const videoId = extractVideoId(url);
    if (!videoId) { showToast('Invalid YouTube URL.', 'error', 4000); videoUrlInput.focus(); return; }
    if (currentPlaylist.videos.some(v => v.id === videoId)) { showToast('Video already in this playlist.', 'info'); return; }

    // UI Feedback
    addVideoBtn.disabled = true;
    addVideoBtn.innerHTML = ICONS.loading + ' Adding...';
    videoUrlInput.disabled = true;

    try {
        // Use a CORS proxy for noembed if direct fetching might be blocked (optional but safer)
        // Example proxy (replace with your own or a reliable public one if needed):
        // const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        // const fetchUrl = `${proxyUrl}https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
        const fetchUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            let errorMsg = `Failed to fetch video info (HTTP ${response.status}).`;
            try {
                const errData = await response.json();
                if (errData.error) errorMsg = errData.error;
             } catch (_) { /* Ignore if response is not JSON */ }
            // Provide more specific advice for common CORS issues
            if (response.status === 0 || response.type === 'opaque' || response.status === 403) {
                 errorMsg += ' This might be a CORS issue. Try using a CORS proxy if not already doing so.';
            }
            throw new Error(errorMsg);
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error); // Handle noembed specific errors

        const video = {
            id: videoId,
            title: data.title || 'Untitled Video',
            thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`, // Fallback
            url: `https://youtu.be/${videoId}` // Consistent short URL
        };

        currentPlaylist.videos.push(video);
        currentPage = Math.ceil(currentPlaylist.videos.length / VIDEOS_PER_PAGE); // Go to last page
        savePlaylistsState();
        renderVideos();
        renderPlaylists(); // Update count
        videoUrlInput.value = ''; // Clear input
        showToast(`Added "${escapeHTML(video.title)}"`, 'success');

    } catch (error) {
        console.error('Add video error:', error);
        showToast(`Error adding video: ${error.message || 'Unknown error'}`, 'error', 6000);
    } finally {
        // Restore button state
        addVideoBtn.innerHTML = ICONS.add + ' Add Video';
        videoUrlInput.disabled = false;
        addVideoBtn.disabled = videoUrlInput.value.trim() === ''; // Disable if input is empty now
        videoUrlInput.focus();
    }
}

function handleDeleteVideo(videoId) {
    // Called via handleVideoGridClick, which already ensures context

    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist) return;
    const videoIndex = currentPlaylist.videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) return;

    const videoTitle = currentPlaylist.videos[videoIndex].title;

    // Stop if playing this video
    if (videoId === currentlyPlayingVideoId || videoId === intendedVideoId) {
        stopVideo();
        handleClosePlayer(); // Hide player too
    }

    currentPlaylist.videos.splice(videoIndex, 1);

    // Adjust pagination if needed
    const totalPages = Math.ceil(currentPlaylist.videos.length / VIDEOS_PER_PAGE);
    if (currentPlaylist.videos.length > 0 && currentPage > totalPages) {
        currentPage = totalPages;
    } else if (currentPlaylist.videos.length === 0) {
        currentPage = 1;
    }

    savePlaylistsState();
    renderVideos();
    renderPlaylists(); // Update count
    showToast(`Removed "${escapeHTML(videoTitle)}".`, 'info');
}

function handleReorderVideo(videoIdToMove, targetVideoId) {
    // Called via drop handlers (mouse/touch), which stem from user interaction

    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist) return;

    const videoToMoveIndex = currentPlaylist.videos.findIndex(v => v.id === videoIdToMove);
    if (videoToMoveIndex === -1) return;

    const [videoToMoveData] = currentPlaylist.videos.splice(videoToMoveIndex, 1); // Remove

    if (targetVideoId === null) {
        // Append to the end if targetVideoId is null (dropped in empty space)
        currentPlaylist.videos.push(videoToMoveData);
    } else {
        const targetIndex = currentPlaylist.videos.findIndex(v => v.id === targetVideoId);
        if (targetIndex !== -1) {
            currentPlaylist.videos.splice(targetIndex, 0, videoToMoveData); // Insert before target
        } else {
            // Fallback: If target somehow not found, append to end
            console.warn("Drag/drop target video not found, appending to end.");
            currentPlaylist.videos.push(videoToMoveData);
        }
    }

    savePlaylistsState();
    // Always re-render the current page after a reorder to reflect changes
    renderVideos();
    // No toast needed for reorder
}


function playVideo(videoId) {
    if (!videoId) { console.error("playVideo: Invalid videoId."); return; }
    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist) { console.error("playVideo: No current playlist."); return; }
    const videoData = currentPlaylist.videos.find(v => v.id === videoId);
    if (!videoData) { console.error(`playVideo: Video ${videoId} not found in playlist.`); return; }

    intendedVideoId = videoId;
    playerWrapperEl.classList.remove('hidden');
    updatePlayingVideoHighlight(videoId); // Highlight optimistically

    // Update Media Session metadata
    if ('mediaSession' in navigator) {
        updateMediaSessionMetadata(videoData);
        navigator.mediaSession.playbackState = "playing"; // Optimistic state
    }

    // *** CRITICAL: Ensure AudioContext is active right before playback attempt ***
    ensureAudioContext();

    if (ytPlayer && isPlayerReady) {
        // Only attempt playback if audio context is running or we expect it to resume
        if (audioContext && (audioContext.state === 'running' || audioContext.state === 'suspended')) {
            try {
                // Add a small delay IF the audio context MIGHT have just been resumed
                // or if we're immediately trying after ensuring it.
                const delay = (audioContext.state === 'suspended') ? 100 : 50; // Increased delay slightly

                console.log(`playVideo: Scheduling loadVideoById for ${videoId} in ${delay}ms (AudioContext state: ${audioContext.state})`);
                setTimeout(() => {
                    if (intendedVideoId === videoId) { // Check if still the intended video
                         console.log(`playVideo: Executing loadVideoById for ${videoId}`);
                         ytPlayer.loadVideoById(videoId);
                    } else {
                         console.log(`playVideo: Playback for ${videoId} cancelled, different video intended.`);
                    }
                    // ytPlayer.playVideo(); // Usually not needed, loadVideoById often autoplays
                }, delay);

            } catch (error) {
                console.error("playVideo: Error calling loadVideoById:", error);
                showToast("Failed to load video.", "error");
                handlePlayerErrorCleanup(videoId); // Use a common cleanup function
            }
        } else {
             console.warn(`playVideo: Cannot play video ${videoId}. AudioContext not available or in closed state.`);
             showToast("Audio system not ready. Please interact with the page (click/tap).", "error");
             handlePlayerErrorCleanup(videoId);
             handleClosePlayer(); // Hide player if audio isn't ready
        }
    } else {
        console.log(`Player not ready, queuing video: ${videoId}`);
        videoIdToPlayOnReady = videoId;
        // Still ensure highlight is set for queued video
        updatePlayingVideoHighlight(videoId);
    }
}


function playNextVideo(previousVideoId) {
    // ensureAudioContext() will be called within playVideo

    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist || currentPlaylist.videos.length < 1) {
        handleClosePlayer();
        return;
    }

    let currentIndex = -1;
    if (previousVideoId) {
        currentIndex = currentPlaylist.videos.findIndex(v => v.id === previousVideoId);
    }

    // If previous video not found, or no previous ID, play the first video
    if (currentIndex === -1 && currentPlaylist.videos.length > 0) {
        playVideo(currentPlaylist.videos[0].id);
        return;
    }

    // Calculate next index, wrapping around
    const nextIndex = (currentIndex + 1) % currentPlaylist.videos.length;
    const nextVideo = currentPlaylist.videos[nextIndex];

    if (nextVideo) {
        playVideo(nextVideo.id);
    } else {
        // Should not happen with modulo logic if list isn't empty
        console.error("playNextVideo: Could not determine next video. Stopping.");
        handleClosePlayer();
    }
}

function playPreviousVideo(currentVideoId) {
    // ensureAudioContext() will be called within playVideo

    const currentPlaylist = getCurrentPlaylist();
    if (!currentPlaylist || currentPlaylist.videos.length < 1) {
        handleClosePlayer();
        return;
    }

    let currentIndex = currentPlaylist.videos.findIndex(v => v.id === currentVideoId);

    // If current video not found, play the last video
    if (currentIndex === -1 && currentPlaylist.videos.length > 0) {
        playVideo(currentPlaylist.videos[currentPlaylist.videos.length - 1].id);
        return;
    }

    // Calculate previous index, wrapping around
    const previousIndex = (currentIndex - 1 + currentPlaylist.videos.length) % currentPlaylist.videos.length;
    const previousVideo = currentPlaylist.videos[previousIndex];

    if (previousVideo) {
        playVideo(previousVideo.id);
    } else {
        console.error("playPreviousVideo: Could not determine previous video. Stopping.");
        handleClosePlayer();
    }
}

function stopVideo() {
    if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
        try {
            // Only stop if player is in a state that allows stopping
            const state = typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() : -1;
            if (state !== YT.PlayerState.UNSTARTED && state !== -1 && state !== YT.PlayerState.ENDED) {
                ytPlayer.stopVideo();
            }
        } catch (e) {
            console.warn("Error calling ytPlayer.stopVideo():", e);
        }
    }
    // Clear playback state variables
    currentlyPlayingVideoId = null;
    intendedVideoId = null;
    videoIdToPlayOnReady = null;
    updatePlayingVideoHighlight(null);
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
        // Metadata is cleared by handleClosePlayer or when playing next video
    }
}

// Helper for cleaning up player state after errors or closure
function handlePlayerErrorCleanup(videoId) {
    if (videoId === currentlyPlayingVideoId) currentlyPlayingVideoId = null;
    if (videoId === intendedVideoId) intendedVideoId = null;
    if (videoId === videoIdToPlayOnReady) videoIdToPlayOnReady = null;
    updatePlayingVideoHighlight(null);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
    // Don't necessarily hide player here, onError/handleClosePlayer decides that
}

function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// --- Rendering ---
function renderPlaylists() {
    const searchTerm = playlistSearchInput.value.toLowerCase();
    const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(searchTerm));

    if (filteredPlaylists.length === 0 && playlists.length > 0 && searchTerm) {
        playlistListEl.innerHTML = ''; // Clear list
        noPlaylistsMessageEl.textContent = 'No playlists match search.';
        noPlaylistsMessageEl.classList.remove('hidden');
    } else if (playlists.length === 0) {
         playlistListEl.innerHTML = ''; // Clear list
        noPlaylistsMessageEl.textContent = 'No playlists created yet.';
        noPlaylistsMessageEl.classList.remove('hidden');
    }
    else {
        noPlaylistsMessageEl.classList.add('hidden');
        const fragment = document.createDocumentFragment();
        const listToRender = searchTerm ? filteredPlaylists : playlists; // Render all if no search

        listToRender.forEach(playlist => {
            const li = document.createElement('li');
            li.className = `playlist-item ${playlist.id === currentPlaylistId ? 'active' : ''}`;
            li.dataset.id = playlist.id;
            // Simplified innerHTML setting
            li.innerHTML = `
                <span class="playlist-name">${escapeHTML(playlist.name)}</span>
                <span class="playlist-count">${playlist.videos.length}</span>
                <div class="controls">
                    <button class="icon-button rename-btn" title="Rename Playlist">${ICONS.rename}<span class="visually-hidden">Rename ${escapeHTML(playlist.name)}</span></button>
                    <button class="icon-button delete-btn" title="Delete Playlist">${ICONS.delete}<span class="visually-hidden">Delete ${escapeHTML(playlist.name)}</span></button>
                </div>`;
            fragment.appendChild(li);
        });
        playlistListEl.innerHTML = ''; // Clear before appending
        playlistListEl.appendChild(fragment);
    }
}

function renderVideos() {
    const currentPlaylist = getCurrentPlaylist();

    if (!currentPlaylist || currentPlaylist.videos.length === 0) {
        videoGridEl.innerHTML = '';
        paginationControlsEl.classList.add('hidden');
        videoPlaceholderEl.textContent = currentPlaylist ? `Playlist "${escapeHTML(currentPlaylist.name)}" is empty.` : 'Select or create a playlist.';
        videoPlaceholderEl.classList.remove('hidden');
        updatePlayingVideoHighlight(null); // Ensure no highlight on empty
        return;
    }

    videoPlaceholderEl.classList.add('hidden');
    const totalVideos = currentPlaylist.videos.length;
    const totalPages = Math.ceil(totalVideos / VIDEOS_PER_PAGE);

    // Validate currentPage
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
    const endIndex = startIndex + VIDEOS_PER_PAGE;
    const videosToRender = currentPlaylist.videos.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();
    videosToRender.forEach(video => {
        const div = document.createElement('div');
        // Add playing class based on INTENDED or CURRENTLY playing video ID
        const isPlaying = video.id === currentlyPlayingVideoId || video.id === intendedVideoId;
        div.className = `video-card ${isPlaying ? 'playing' : ''}`;
        div.dataset.videoId = video.id;
        div.draggable = true;
        div.innerHTML = `
            <div class="thumbnail-wrapper">
                <img src="${escapeHTML(video.thumbnail)}" class="thumbnail" alt="" loading="lazy">
            </div>
            <div class="video-info">
                <h4>${escapeHTML(video.title)}</h4>
                <div class="video-controls">
                    <span class="drag-handle" title="Drag to reorder">${ICONS.drag}<span class="visually-hidden">Reorder</span></span>
                    <button class="icon-button delete-video-btn" title="Remove from playlist">${ICONS.delete}<span class="visually-hidden">Remove</span></button>
                </div>
            </div>`;
        fragment.appendChild(div);
    });

    videoGridEl.innerHTML = ''; // Clear before append
    videoGridEl.appendChild(fragment);
    renderPaginationControls(totalVideos, totalPages);
    // Highlight update is handled by adding class during element creation now
}


function renderPaginationControls(totalVideos, totalPages) {
    if (totalVideos <= VIDEOS_PER_PAGE) {
        paginationControlsEl.classList.add('hidden');
    } else {
        paginationControlsEl.classList.remove('hidden');
        pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }
}

// --- UI Updates ---
function updateUIForNoSelection() {
    currentPlaylistId = null;
    saveLastSelectedPlaylist(null); // Save cleared state

    currentPlaylistTitleEl.textContent = 'No playlist selected';
    videoFormEl.classList.add('hidden');
    playlistActionsEl.classList.add('hidden');
    addVideoBtn.disabled = true;
    videoGridEl.innerHTML = '';
    paginationControlsEl.classList.add('hidden');
    handleClosePlayer(); // Stop video and hide player
    videoPlaceholderEl.textContent = 'Create or select a playlist.';
    videoPlaceholderEl.classList.remove('hidden');

    renderPlaylists(); // Update playlist list (no active item)
}

function handleAutoplayToggle() {
    // *** Ensure context active on user interaction ***
    ensureAudioContext();

    isAutoplayEnabled = autoplayToggle.checked;
    saveAutoplaySetting();
    showToast(`Autoplay ${isAutoplayEnabled ? 'enabled' : 'disabled'}.`, 'info');
}

function handleVisualSwitchClick(event) {
    // If the click is on the visual part (not the hidden input), toggle the input's state.
    if (event.target !== autoplayToggle) {
         // *** Ensure context active on user interaction ***
        ensureAudioContext();
        autoplayToggle.click(); // Programmatically click the checkbox to trigger its change event
    }
}

// --- Import / Export ---
// (Keep handleExportPlaylists and handleImportPlaylists largely as is, they use standard APIs)
function handleExportPlaylists() {
    // *** Ensure context active on user interaction ***
    ensureAudioContext();

    if (playlists.length === 0) { showToast('No playlists to export.', 'info'); return; }
    try {
        const dataStr = JSON.stringify(playlists, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `playlists_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url); // Clean up blob URL
        link.remove(); // Clean up link element
        showToast('Playlists exported.', 'success');
    } catch (error) {
        console.error("Export error:", error);
        showToast('Failed to export playlists.', 'error');
    }
}

function handleImportPlaylists(event) {
    // *** Ensure context active on user interaction ***
    ensureAudioContext();

    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData)) throw new Error("Invalid format: Not an array.");

            let addedCount = 0, skippedCount = 0;
            const existingIds = new Set(playlists.map(p => p.id));

            importedData.forEach(p => {
                // Basic validation
                if (!p || typeof p.id !== 'number' || typeof p.name !== 'string') { // ID should be number
                    console.warn('Skipping invalid playlist during import:', p);
                    skippedCount++;
                    return;
                }
                // Ensure videos array exists and filter invalid videos
                p.videos = Array.isArray(p.videos)
                    ? p.videos.filter(v => v && typeof v.id === 'string' && v.id.length === 11 && typeof v.title === 'string' && typeof v.thumbnail === 'string' && typeof v.url === 'string')
                    : [];

                if (!existingIds.has(p.id)) {
                    playlists.push(p);
                    existingIds.add(p.id);
                    addedCount++;
                } else {
                    // Simple merge: skip duplicates by ID
                    console.log(`Skipping playlist '${p.name}' (ID: ${p.id}) during import, ID already exists.`);
                    skippedCount++;
                }
            });

            if (addedCount > 0) savePlaylistsState();
            playlistSearchInput.value = ''; // Clear search
            renderPlaylists();
            showToast(`Imported ${addedCount} playlists. Skipped ${skippedCount}.`, 'success');
            // Select first playlist if none was selected
            if (!currentPlaylistId && playlists.length > 0) {
                selectPlaylist(playlists[0].id);
            } else if (currentPlaylistId) {
                // Re-render videos if the current playlist might have been modified by import (though unlikely with skip logic)
                renderVideos();
            }

        } catch (error) {
            console.error("Import error:", error);
            showToast(`Import failed: ${error.message}`, 'error');
        } finally {
            importFileEl.value = ''; // Reset file input
        }
    };
    reader.onerror = () => { showToast('Error reading file.', 'error'); importFileEl.value = ''; };
    reader.readAsText(file);
}

// --- Utility Functions ---
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
    // Alternative (potentially faster for very frequent use, but less safe if misused):
    // return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ''');
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`; // info, success, error
    const icon = ICONS[type] || ICONS.info;
    toast.innerHTML = `${icon}<span>${escapeHTML(message)}</span>`;
    toastContainerEl.appendChild(toast);

    // Force reflow to ensure animation plays
    toast.offsetHeight;

    // Animate in & schedule removal
    requestAnimationFrame(() => {
        toast.classList.add('show');
        const timeoutId = setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, duration);
        // Click to dismiss early
        toast.addEventListener('click', () => {
            clearTimeout(timeoutId);
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, { once: true }); // Listener removed after click
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

function handleClosePlayer() {
    stopVideo();
    playerWrapperEl.classList.add('hidden');
    if ('mediaSession' in navigator) {
        updateMediaSessionMetadata(null); // Clear metadata
        navigator.mediaSession.playbackState = 'none';
    }
    if (wakeLock) {
        wakeLock.release().then(() => {
            console.log('Wake lock released on player close');
            wakeLock = null;
        });
    }
    // Decide whether to stop the silent sound here. Keeping it running is
    // usually better for preventing future playback issues after closing/reopening player.
    // if (silentSourceNode) {
    //     try { silentSourceNode.stop(); } catch(e) {}
    //     silentSourceNode.disconnect();
    //     silentSourceNode = null;
    //     console.log("Silent audio node stopped on player close.");
    // }
}

// --- Media Session API ---
function updateMediaSessionMetadata(video) {
    if (!('mediaSession' in navigator)) return;

    if (!video) {
        navigator.mediaSession.metadata = null;
        // State is handled elsewhere (stopVideo, onStateChange)
        return;
    }

    const currentPlaylist = getCurrentPlaylist();
    const playlistName = currentPlaylist ? currentPlaylist.name : 'Playlist';

    navigator.mediaSession.metadata = new MediaMetadata({
        title: video.title,
        artist: 'YouTube', // Simplified
        album: playlistName,
        artwork: [
            // Provide multiple sizes, browser picks best
            { src: video.thumbnail.replace('mqdefault.jpg', 'maxresdefault.jpg'), sizes: '1280x720', type: 'image/jpeg' },
            { src: video.thumbnail.replace('mqdefault.jpg', 'sddefault.jpg'), sizes: '640x480', type: 'image/jpeg' },
            { src: video.thumbnail.replace('mqdefault.jpg', 'hqdefault.jpg'), sizes: '480x360', type: 'image/jpeg' },
            { src: video.thumbnail, sizes: '320x180', type: 'image/jpeg' }, // mqdefault
        ]
    });
}

function setupMediaSessionActionHandlers() {
    if (!('mediaSession' in navigator)) return;

    const actions = {
        play: () => {
            // *** Ensure context active for media session play ***
            ensureAudioContext();
            if (ytPlayer && isPlayerReady && typeof ytPlayer.playVideo === 'function') {
                // Add a small delay here too, in case resume was needed
                 console.log("Media Session: Attempting playVideo...");
                setTimeout(() => ytPlayer.playVideo(), 100); // Increased delay for media session
            } else if (intendedVideoId || currentlyPlayingVideoId) {
                 console.log("Media Session: Calling playVideo function...");
                // playVideo already calls ensureAudioContext and handles delay
                playVideo(intendedVideoId || currentlyPlayingVideoId);
            } else {
                 console.log("Media Session: No video to play.");
            }
             navigator.mediaSession.playbackState = "playing";
        },
        pause: () => {
            if (ytPlayer && isPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
                console.log("Media Session: Calling pauseVideo...");
                ytPlayer.pauseVideo();
            }
            // *** Keep context active even when paused via media session ***
            ensureAudioContext();
             navigator.mediaSession.playbackState = "paused";
        },
        stop: () => {
             console.log("Media Session: Calling handleClosePlayer...");
             handleClosePlayer();
        },
        previoustrack: () => {
            console.log("Media Session: Calling playPreviousVideo...");
            // playPreviousVideo already calls ensureAudioContext/playVideo
            playPreviousVideo(currentlyPlayingVideoId || intendedVideoId);
        },
        nexttrack: () => {
            console.log("Media Session: Calling playNextVideo...");
            // playNextVideo already calls ensureAudioContext/playVideo
            playNextVideo(currentlyPlayingVideoId || intendedVideoId);
        }
        // Seek actions (seekbackward, seekforward, seekto) could be added if desired
    };

    // Set handlers using the actions object
    Object.keys(actions).forEach(action => {
        try {
            navigator.mediaSession.setActionHandler(action, actions[action]);
        } catch (error) {
            console.warn(`Could not set MediaSession action handler for ${action}:`, error);
        }
    });
}

// Add this function after setupMediaSessionActionHandlers()
function handleVisibilityChange() {
  if (document.hidden && (currentlyPlayingVideoId || intendedVideoId)) {
    // Page hidden but video was playing - mark for resume when visible
    document.addEventListener('visibilitychange', attemptResumePlayback, {once: true});
  }
}

function attemptResumePlayback() {
  if (!document.hidden && (currentlyPlayingVideoId || intendedVideoId)) {
    ensureAudioContext();
    setTimeout(() => {
      if (ytPlayer && isPlayerReady && ytPlayer.getPlayerState() === YT.PlayerState.PAUSED) {
        ytPlayer.playVideo();
      }
    }, 300);
  }
}

// Add this function after the attemptResumePlayback function
async function requestWakeLock() {
  if (!isWakeLockSupported) return;
  
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Wake lock activated');
    
    wakeLock.addEventListener('release', () => {
      console.log('Wake lock released');
      wakeLock = null;
    });
  } catch (err) {
    console.log(`Wake lock request failed: ${err.name}, ${err.message}`);
  }
}

// --- Start the app ---
// Ensure the DOM is fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init(); // DOMContentLoaded has already fired
}