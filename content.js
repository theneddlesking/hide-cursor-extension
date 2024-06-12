function hideCursor() {
    document.body.style.cursor = 'none';
}

function showCursor() {
    document.body.style.cursor = 'auto';
}

function handleMouseMove() {
    if (document.body.style.cursor === 'none') {
        showCursor();
    }

    clearTimeout(window.hideCursorTimeout);

    window.hideCursorTimeout = setTimeout(() => {
        hideCursor();
    }, 1000);
}

chrome.storage.sync.get(['cursorHiderEnabled'], (result) => {
    if (result.cursorHiderEnabled) {
        hideCursor();
        document.addEventListener('mousemove', handleMouseMove);
    } else {
        showCursor();
        document.removeEventListener('mousemove', handleMouseMove);
    }
});

window.hideCursor = hideCursor;
window.showCursor = showCursor;
window.handleMouseMove = handleMouseMove;
