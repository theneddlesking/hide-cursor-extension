document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['cursorHiderEnabled'], (result) => {
        const isEnabled = result.cursorHiderEnabled;
        document.getElementById('toggle-cursor-hider').checked = isEnabled;
    });
});

document.getElementById('toggle-cursor-hider').addEventListener('change', (event) => {
    const newStatus = event.target.checked;
    chrome.storage.local.set({ cursorHiderEnabled: newStatus }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: setCursorHiderStatus,
                args: [newStatus]
            });
        });
    });
});

function setCursorHiderStatus(enabled) {
     // always show and clear timeout just to reset it so we can at least see the mouse once
     clearTimeout(window.hideCursorTimeout);

     showCursor();
 
    if (enabled) {
        document.addEventListener('mousemove', window.handleMouseMove);
    } else {
        document.removeEventListener('mousemove', window.handleMouseMove);
    }
}
