function hideCursor() {
    toggleCusor(true);
}

function toggleCusor(hide) {
    cursor_str = hide ? 'none' : 'auto';


    document.body.style.cursor = cursor_str;
    document.querySelectorAll('*').forEach(element => {
        element.style.cursor = cursor_str;
    });

     // include iframes
     document.querySelectorAll('iframe').forEach(iframe => {
        try {
            iframe.contentWindow.document.body.style.cursor = cursor_str;
            iframe.contentWindow.document.querySelectorAll('*').forEach(element => {
                element.style.cursor = cursor_str;
            });
        } catch (e) {
            // security errors
            console.log(e);
        }
    });
}

function showCursor() {
    toggleCusor(false);
}

function handleMouseMove() {
    // when we move the mouse show the cursor if it's hidden and clear the timeout
    if (document.body.style.cursor === 'none') {
        showCursor();
    }

    // restart the 1 second timeout
    clearTimeout(window.hideCursorTimeout);

    startCursorHideTimeout();
}

chrome.storage.local.get(['cursorHiderEnabled'], (result) => {
    setCursorHiderStatus(result.cursorHiderEnabled);
});

// hides the cursor in 1 second
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

        // binds the result to window so we can compare it later
        window.cursorHiderEnabled = result.cursorHiderEnabled;

        setCursorHiderStatus(result.cursorHiderEnabled);
    });
}
, 1000);

window.hideCursor = hideCursor;
window.showCursor = showCursor;
window.handleMouseMove = handleMouseMove;
