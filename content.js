// refs for created elements
const dialog = document.createElement('dialog');
const button = document.querySelector('button');

const cursor_str_map = {}

// helpers just for readability
function showCursor() {
    toggleCusor(false);
}

function hideCursor() {
    toggleCusor(true);
}

function getDefaultCursorOfElement(element) {
    const hash = element.tagName + element.id + element.className;
    return cursor_str_map[hash];
}

function getCursorStrForElement(element, hide) {
    if (hide) {
        return 'none';
    }
    return 'auto';

    // defaults as auto if it doesn't exist
    return getDefaultCursorOfElement(element) || 'auto';
}

function getAllElementsForCursorInteractions() {
    const allElements = [];

    // all elements
    allElements.concat(document.querySelectorAll('*'));

    // include iframes
    document.querySelectorAll('iframe').forEach(iframe => {
        try {
            allElements.concat(iframe.contentWindow.document.querySelectorAll('*'));
        } catch (e) {
            // security errors for if the iframe is from a different origin
            console.log(e);
        }
    });

    return allElements;
}

function toggleCusor(hide) {
    // sets the cursor styling string for the element
    const cursorFunc = (element) => element.style.cursor = getCursorStrForElement(element, hide);

    console.log("update", hide)


    // hide the dialog if we are showing the cursor
    if (!hide) {
        dialog.close();

        // release the pointer lock allowing the cursor to move freely and visibly
        document.exitPointerLock();
    }
    else {
        // init the elements if they don't exist yet 
        // we do this now to ensure they only get added if the user wants to hide the cursor for this page
        if (!document.getElementById('cursor-hider-dialog')) {
            init();
        }

        dialog.showModal();

        // show the button so that we can click it to hide the cursor using pointer lock
        button.style.display = 'block';
    }

    // set the cursor for all elements
    getAllElementsForCursorInteractions().forEach(cursorFunc);
}

function handleMouseMove(event) {
    // when we move the mouse show the cursor if it's hidden and clear the timeout
    if (document.body.style.cursor === 'none') {
        showCursor();
    }

    // move the button where the mouse is
    button.style.top = `${event.clientY}px`;
    button.style.left = `${event.clientX}px`;

    // restart the 1 second timeout
    clearTimeout(window.hideCursorTimeout);

    startCursorHideTimeout();
}

chrome.storage.local.get(['cursorHiderEnabled'], (result) => {

    // if enabled then don't do anything to override custom behavior
    if (result.cursorHiderEnabled) {
        return;
    }

    setCursorHiderStatus(result.cursorHiderEnabled);
});

// hides the cursor in 1 second and brings up the pointer lock screen
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

function init() {
    // get the default cursor for each element
    const allElements = getAllElementsForCursorInteractions();

    // save default cursor for each element
    allElements.forEach(element => {
        const hash = element.tagName + element.id + element.className;
        cursor_str_map[hash] = element.style.cursor;
    });

    // create the div and dialog so that the pointer lock button appears at the top of the page always
    dialog.style.position = 'fixed';
    dialog.style.top = '0';
    dialog.style.left = '0';
    dialog.style.width = '100%';
    dialog.style.height = '100%';
    dialog.style.zIndex = '2147483647'; // max z-index

    // set an id so we can check if the element exists
    dialog.id = 'cursor-hider-dialog';

    const cursorHiderDiv = document.createElement('div');

    cursorHiderDiv.style.position = 'fixed';
    cursorHiderDiv.style.top = '0';
    cursorHiderDiv.style.left = '0';
    cursorHiderDiv.style.width = '100%';
    cursorHiderDiv.style.height = '100%';
    cursorHiderDiv.style.zIndex = '2147483647'; // max z-index

    // add the div to the dialog
    dialog.appendChild(cursorHiderDiv);

    // add the dialog to the body
    document.body.appendChild(dialog);

    // make dialog red
    dialog.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'

    // add a button to the div to check if its clickable
    button.style.position = 'absolute';
    button.style.transform = 'translate(-50%, -50%)';

    button.textContent = 'Hide Cursor';

    cursorHiderDiv.appendChild(button);

    // add a click event to the button
    button.addEventListener('click', (event) => {
        // hide the button
        button.style.display = 'none';

        // lock the cursor to the element
        button.requestPointerLock();

        // hide the dialog
        dialog.close();

        // clear the timeout so we can see the cursor
        clearTimeout(window.hideCursorTimeout);
    });

    // open the dialog
    dialog.showModal();
}

window.hideCursor = hideCursor;
window.showCursor = showCursor;
window.handleMouseMove = handleMouseMove;
