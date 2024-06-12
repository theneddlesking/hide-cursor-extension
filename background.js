chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    injectScriptToAllTabs();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        injectScript(tabId);
    }
});

chrome.webNavigation.onCompleted.addListener((details) => {
    injectScript(details.tabId);
}, {url: [{schemes: ['http', 'https']}]});

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
