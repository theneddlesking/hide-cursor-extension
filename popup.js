document.getElementById('toggle-cursor-hider').addEventListener('click', () => {
    chrome.storage.sync.get(['cursorHiderEnabled'], (result) => {
        const newStatus = !result.cursorHiderEnabled;
        chrome.storage.sync.set({ cursorHiderEnabled: newStatus }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: setCursorHiderStatus,
                    args: [newStatus]
                });
            });
        });
    });
});

function setCursorHiderStatus(enabled) {
    showCursor();
    clearTimeout(window.hideCursorTimeout);

    if (enabled) {
        document.addEventListener('mousemove', handleMouseMove);
    } else {
        document.removeEventListener('mousemove', handleMouseMove);
    }
}
