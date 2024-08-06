// import useLocalStorage from "use-local-storage";

chrome.webNavigation.onCompleted.addListener(function(details) {
    if (details.frameId === 0) { // Only track the main frame
        console.log('URL:', details.url);
    }
});

  