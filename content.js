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

    startCursorHideTimeout();
}

chrome.storage.local.get(['cursorHiderEnabled'], (result) => {
    setCursorHiderStatus(result.cursorHiderEnabled);
});

function startCursorHideTimeout() {
    window.hideCursorTimeout = setTimeout(() => {
        hideCursor();
    }, 1000);
}

function setCursorHiderStatus(enabled) {
    // always show and clear timeout just to reset it so we can at least see the mouse once
    clearTimeout(window.hideCursorTimeout);

    showCursor();

    if (enabled) {
        document.addEventListener('mousemove', window.handleMouseMove);

        // immediately hide the cursor timeout to hide the cursor if it doesn't move at all
        startCursorHideTimeout();
    } else {
        document.removeEventListener('mousemove', window.handleMouseMove);
    }
}

// force update with poll

setInterval(() => {
    chrome.storage.local.get(['cursorHiderEnabled'], (result) => {
        // don't do anything if the value hasn't changed

        if (result.cursorHiderEnabled === window.cursorHiderEnabled) {
            return;
        }

        window.cursorHiderEnabled = result.cursorHiderEnabled;

        setCursorHiderStatus(result.cursorHiderEnabled);
    });
}
, 1000);

window.hideCursor = hideCursor;
window.showCursor = showCursor;
window.handleMouseMove = handleMouseMove;
