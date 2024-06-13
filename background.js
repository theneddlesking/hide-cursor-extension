// initialize the extension by injecting the script to all tabs
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    injectScriptToAllTabs();
});

// when the tab is updated, inject the script to the tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        injectScript(tabId);
    }
});

// when the tab is navigated to, inject the script to the tab
chrome.webNavigation.onCompleted.addListener((details) => {
    injectScript(details.tabId);
}, {url: [{schemes: ['http', 'https']}]});

// listen for changes in the cursorHiderEnabled setting and then re-inject the script to all tabs
// this doesn't always work so we use polling later
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.cursorHiderEnabled) {
        injectScriptToAllTabs();
    }
});

function injectScript(tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        files: ['content.js']
    }, () => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        }
    });
}

function injectScriptToAllTabs() {
    chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
            injectScript(tab.id);
        }
    });
}
