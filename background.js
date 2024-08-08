// import useLocalStorage from "use-local-storage";

function logUrl(details) {
    if (details.frameId === 0) { 
        const timestamp = new Date().toISOString(); 
        console.log(`[${timestamp}] URL:`, details.url);
    }
}

chrome.webNavigation.onCompleted.addListener(logUrl);

chrome.webNavigation.onHistoryStateUpdated.addListener(logUrl);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] URL:`, changeInfo.url);
    }
});


  