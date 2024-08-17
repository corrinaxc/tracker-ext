let lastLoggedUrl = '';

function logUrl(details) {
    if (details.frameId === 0) { 
        const url = details.url;
        if (url !== lastLoggedUrl) { 
            const timestamp = new Date().toISOString(); 
            console.log(`[${timestamp}] URL:`, url);
            lastLoggedUrl = url;
        }
    }
}

chrome.webNavigation.onCompleted.addListener(logUrl);
chrome.webNavigation.onHistoryStateUpdated.addListener(logUrl);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url !== lastLoggedUrl) { 
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] URL:`, changeInfo.url);
        lastLoggedUrl = changeInfo.url;
    }
});



  