// import useLocalStorage from "use-local-storage";

chrome.webNavigation.onCompleted.addListener(function(details) {
    if (details.frameId === 0) { 
        const timestamp = new Date().toISOString(); 
        console.log(`[${timestamp}] URL:`, details.url);
    }
});


  