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

chrome.storage.local.get(['cursorHiderEnabled'], (result) => {
    // always show and clear timeout just to reset it so we can at least see the mouse once
    clearTimeout(window.hideCursorTimeout);

    showCursor();

    if (result.cursorHiderEnabled) {
        document.addEventListener('mousemove', window.handleMouseMove);
    } else {
        document.removeEventListener('mousemove', window.handleMouseMove);
    }
});

// force update with poll

setInterval(() => {
    chrome.storage.local.get(['cursorHiderEnabled'], (result) => {

        // don't update if it's the same
        if (result.cursorHiderEnabled === window.cursorHiderEnabled) {
            return;
        }

        window.cursorHiderEnabled = result.cursorHiderEnabled;

        // always show and clear timeout just to reset it so we can at least see the mouse once

        clearTimeout(window.hideCursorTimeout);

        showCursor();


        if (result.cursorHiderEnabled) {
            document.addEventListener('mousemove', window.handleMouseMove);
        } else {
            document.removeEventListener('mousemove', window.handleMouseMove);
        }
    });
}
, 1000);

window.hideCursor = hideCursor;
window.showCursor = showCursor;
window.handleMouseMove = handleMouseMove;
