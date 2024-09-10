let lastLoggedUrl = '';
let sessionId = '';
let inactivityTimeout;

// Stores the exit URL and timestamp when navigating away
let exitUrl = '';
let exitTimestamp = '';

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

// Assigns a new session ID after 15 minutes of inactivity
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

        // Log exit data before navigating to the new URL
        if (lastLoggedUrl) {
            exitTimestamp = timestamp;
            exitUrl = lastLoggedUrl;
            console.log(`Session ID: [${sessionId}] Exit URL: [${exitUrl}] Exit Timestamp: [${exitTimestamp}]`);
        }

        // Log the new entry URL and timestamp
        console.log(`Session ID: [${sessionId}] Entry URL: [${url}] Entry Timestamp: [${timestamp}]`);

        lastLoggedUrl = url;  // Update the last logged URL

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
                entryUrl: url,
                entryTimestamp: timestamp,
                exitUrl: exitUrl,
                exitTimestamp: exitTimestamp,
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

// Chrome event listeners for URL logging
chrome.webNavigation.onCompleted.addListener(logUrl);
chrome.webNavigation.onHistoryStateUpdated.addListener(logUrl);

// Listen for tab updates (URL change) to capture exit/entry URLs
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url !== lastLoggedUrl && !isIgnoredUrl(changeInfo.url)) {
        const timestamp = new Date().toISOString();

        // Log exit data before navigating to the new URL
        if (lastLoggedUrl) {
            exitTimestamp = timestamp;
            exitUrl = lastLoggedUrl;
            console.log(`Session ID: [${sessionId}] Exit URL: [${exitUrl}] Exit Timestamp: [${exitTimestamp}]`);
        }

        // Log the new entry URL and timestamp
        console.log(`Session ID: [${sessionId}] Entry URL: [${changeInfo.url}] Entry Timestamp: [${timestamp}]`);

        lastLoggedUrl = changeInfo.url;  // Update the last logged URL

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
                entryUrl: changeInfo.url,
                entryTimestamp: timestamp,
                exitUrl: exitUrl,
                exitTimestamp: exitTimestamp,
                sessionId: sessionId
            })
        })
        .then(response => response.text())
        .then(data => console.log('Server response:', data))
        .catch(error => console.error('Error logging URL to server:', error));

        resetInactivityTimeout();
    }
});
