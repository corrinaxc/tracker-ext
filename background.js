let lastLoggedUrl = '';
let sessionId = '';
let inactivityTimeout;

function generateRandomNumberString(length) {
    let randomNumberString = '';
    const digits = '0123456789';
    for (let i = 0; i < length; i++) {
        randomNumberString += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return randomNumberString;
}

function assignSessionId() {
    sessionId = generateRandomNumberString(8);
    console.log("New Session ID assigned:", sessionId);
    return sessionId;
}

// Assign a new session ID after 15 minutes of inactivity
function resetInactivityTimeout() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
        assignSessionId(); 
    }, 15 * 60 * 1000); 
}

function logUrl(details) {
    const url = details.url;

    // Only process the main frame (not iframes) and filter out unwanted URLs
    if (details.frameId === 0 && url !== lastLoggedUrl && !isIgnoredUrl(url)) {
        const timestamp = new Date().toISOString();
        console.log(`Session ID: [${sessionId}][${timestamp}] URL:`, url);
        lastLoggedUrl = url;

        // Inject content script only for the main page
        chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            files: ['content.js']
        });

        fetch('http://localhost:3001/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                timestamp: timestamp,
                sessionId: sessionId
            })
        })
        .then(response => response.text())
        .then(data => console.log('Server response:', data))
        .catch(error => console.error('Error logging URL to server:', error));

        resetInactivityTimeout();
    }
}

function isIgnoredUrl(url) {
    // List of unwanted domains or URL patterns
    const ignoredPatterns = [
        'securepubads.g.doubleclick.net',
        'googlesyndication.com',
        'recaptcha/api2/aframe',
        'about:blank',
        'static.criteo.net'
    ];
    
    return ignoredPatterns.some(pattern => url.includes(pattern));
}

// Initial session ID assignment
assignSessionId();

// Chrome event listeners
chrome.webNavigation.onCompleted.addListener(logUrl);
chrome.webNavigation.onHistoryStateUpdated.addListener(logUrl);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url !== lastLoggedUrl && !isIgnoredUrl(changeInfo.url)) {
        const timestamp = new Date().toISOString();
        console.log(`Session ID: [${sessionId}][${timestamp}] URL:`, changeInfo.url);
        lastLoggedUrl = changeInfo.url;

        // Inject content script only for the main page
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });

        fetch('http://localhost:3001/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: changeInfo.url,
                timestamp: timestamp,
                sessionId: sessionId
            })
        })
        .then(response => response.text())
        .then(data => console.log('Server response:', data))
        .catch(error => console.error('Error logging URL to server:', error));

        resetInactivityTimeout();
    }
});
