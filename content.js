function hideCursor() {
    toggleCusor(true);
}

function toggleCusor(hide) {
    cursor_str = hide ? 'none' : 'auto';

    // hide the dialog if we are showing the cursor
    if (!hide) {
        dialog.close();
    }
    else {
        dialog.showModal();
    }

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

// new idea for cursor hider
// we overlay a div over the entire screen to intercept mouse events
// use a dialog because it renders on the top layer

// create the div and dialog

const dialog = document.createElement('dialog');

dialog.style.position = 'fixed';
dialog.style.top = '0';
dialog.style.left = '0';
dialog.style.width = '100%';
dialog.style.height = '100%';
dialog.style.zIndex = '2147483647'; // max z-index

const cursorHiderDiv = document.createElement('div');

cursorHiderDiv.style.position = 'fixed';
cursorHiderDiv.style.top = '0';
cursorHiderDiv.style.left = '0';
cursorHiderDiv.style.width = '100%';
cursorHiderDiv.style.height = '100%';
cursorHiderDiv.style.zIndex = '2147483647'; // max z-index

// for debugging make it red
cursorHiderDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';

// add the div to the dialog
dialog.appendChild(cursorHiderDiv);

// add the dialog to the body
document.body.appendChild(dialog);

// make dialog low opacity
dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';

// add a button to the div to check if its clickable
const button = document.createElement('button');

button.style.position = 'absolute';
button.style.top = '50%';
button.style.left = '50%';
button.style.transform = 'translate(-50%, -50%)';

button.textContent = 'Click me';

cursorHiderDiv.appendChild(button);

// add a click event to the button
button.addEventListener('click', () => {
    // set content to random number
    button.textContent = Math.random();
});

// open the dialog
dialog.showModal();

window.hideCursor = hideCursor;
window.showCursor = showCursor;
window.handleMouseMove = handleMouseMove;
