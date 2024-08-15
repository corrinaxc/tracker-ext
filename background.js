// import useLocalStorage from "use-local-storage";

let lastLoggedUrl = '';

function logUrl(details) {
    if (details.frameId === 0) { 
        const url = details.url;
        if (url !== lastLoggedUrl) {  // Check if URL is the same as the last logged URL
            const timestamp = new Date().toISOString(); 
            console.log(`[${timestamp}] URL:`, url);
            lastLoggedUrl = url;  // Update the last logged URL
        }
    }
}

chrome.webNavigation.onCompleted.addListener(logUrl);
chrome.webNavigation.onHistoryStateUpdated.addListener(logUrl);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url !== lastLoggedUrl) {  // Same check for tabs.onUpdated
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] URL:`, changeInfo.url);
        lastLoggedUrl = changeInfo.url;  // Update the last logged URL
    }
});



  