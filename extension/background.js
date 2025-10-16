// Background service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('DataZen extension installed');
    
    // Set default storage values
    chrome.storage.sync.set({
        apiUrl: 'https://api.versan.in',
        theme: 'light',
        autoExtract: false
    });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        chrome.storage.sync.get(['apiUrl', 'theme', 'autoExtract'], (items) => {
            sendResponse(items);
        });
        return true; // Will respond asynchronously
    }
    
    if (request.action === 'saveSettings') {
        chrome.storage.sync.set(request.settings, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

// Context menu for quick scraping
chrome.contextMenus.create({
    id: 'scrape-selection',
    title: 'Scrape with DataZen',
    contexts: ['selection', 'page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'scrape-selection') {
        chrome.tabs.sendMessage(tab.id, {
            action: 'extractData',
            options: {
                text: true,
                links: true,
                images: false,
                emails: false
            }
        });
    }
});

