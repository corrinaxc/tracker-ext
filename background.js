// import useLocalStorage from "use-local-storage";

let listenerRegistered = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start' && !listenerRegistered) {
    chrome.webNavigation.onCompleted.addListener(logUrl);
    listenerRegistered = true;
  } else if (message.action === 'stop' && listenerRegistered) {
    chrome.webNavigation.onCompleted.removeListener(logUrl);
    listenerRegistered = false;
  }
});

function logUrl(details) {
  if (details.frameId === 0) {
    console.log('URL:', details.url);
  }
}

  
