let lastLoggedUrl = '';
let sessionId = '';
let inactivityTimeout;
let pageVisitCounter = 1;  // Initialize the page visit counter

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

// Assigns a new session ID after 15 minutes of inactivity and resets the counter
function resetInactivityTimeout() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
        assignSessionId(); 
        pageVisitCounter = 1;  // Reset the page visit counter
        console.log("Session ID refreshed and page visit counter reset.");
    }, 15 * 60 * 1000); 
}

// List of known search engine domains
const searchEngines = [
    'google.com',
    'bing.com',
    'yahoo.com',
    'duckduckgo.com',
    'baidu.com',
    'ask.com',
    'aol.com',
    'yandex.com'
];

// Function to extract domain from URL
function getDomainFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname;
    } catch (error) {
        console.error('Invalid URL:', url);
        return null;
    }
}

// Function to check if a domain is a search engine
function isSearchEngine(domain) {
    return searchEngines.some(searchEngine => domain.includes(searchEngine));
}

// Function to log exit data
function logExit(url) {
    const timestamp = new Date().toISOString();
    console.log(`Session ID: [${sessionId}] Page Visit: [${pageVisitCounter}] Exit URL: [${url}] Exit Timestamp: [${timestamp}]`);

    fetch('http://localhost:3001/logExit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId: sessionId,      // Current session ID
            pageVisitCounter: pageVisitCounter,  // Unique visit number
            exitUrl: url,
            exitTimestamp: timestamp
        })
    })
    .then(response => response.text())
    .then(data => console.log('Exit URL logged:', data))
    .catch(error => console.error('Error logging exit URL to server:', error));
}

// Function to log entry data
function logUrl(details) {
    const url = details.url;

    if (url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('chrome-extension://')) {
        console.log('Skipping restricted URL:', url);
        return; // Do not proceed with logging or script injection
    }

    // Only process the main frame (not iframes) and filter out unwanted URLs
    if (details.frameId === 0 && url !== lastLoggedUrl && !isIgnoredUrl(url)) {
        const timestamp = new Date().toISOString();
        const domain = getDomainFromUrl(url);  // Extract the domain
        const isSearchEngineDomain = isSearchEngine(domain); // Check if it's a search engine

        // Log exit data before navigating to the new URL
        if (lastLoggedUrl) {
            logExit(lastLoggedUrl);  // Log the exit URL before proceeding
        }

        // Log the new entry URL, domain, timestamp, and whether it's a search engine
        console.log(`Session ID: [${sessionId}] Page Visit: [${pageVisitCounter}] Entry URL: [${url}] Entry Domain: [${domain}] Entry Timestamp: [${timestamp}] Is Search Engine: ${isSearchEngineDomain}`);

        lastLoggedUrl = url;  // Update the last logged URL

        // Inject content script only for the main page
        chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            files: ['content.js']
        });

        // Send entry data to the server
        fetch('http://localhost:3001/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: sessionId,
                pageVisitCounter: pageVisitCounter,  // Unique visit number
                entryUrl: url,
                entryDomain: domain,  // Send the domain to the server
                entryTimestamp: timestamp,
                isSearchEngine: isSearchEngineDomain
            })
        })
        .then(response => response.text())
        .then(data => console.log('Server response:', data))
        .catch(error => console.error('Error logging URL to server:', error));

        resetInactivityTimeout();

        // Increment the page visit counter after logging the current entry
        pageVisitCounter++;
    }
}

// Example ignored URLs (unchanged)
function isIgnoredUrl(url) {
    const ignoredPatterns = [
        'securepubads.g.doubleclick.net',
        'googlesyndication.com',
        'recaptcha/api2/aframe',
        'about:blank',
        'static.criteo.net'
    ];
    
    return ignoredPatterns.some(pattern => url.includes(pattern));
}

// Initial session ID assignment (unchanged)
assignSessionId();

// Chrome event listeners for entry and exit logging
chrome.webNavigation.onBeforeNavigate.addListener(details => {
    if (details.frameId === 0 && lastLoggedUrl) {
        logExit(lastLoggedUrl);  // Log exit URL before navigating away
    }
});

chrome.webNavigation.onCompleted.addListener(logUrl);
chrome.webNavigation.onHistoryStateUpdated.addListener(logUrl);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url !== lastLoggedUrl && !isIgnoredUrl(changeInfo.url)) {
        const timestamp = new Date().toISOString();
        const domain = getDomainFromUrl(changeInfo.url);
        const isSearchEngineDomain = isSearchEngine(domain);

        console.log(`Session ID: [${sessionId}] Page Visit: [${pageVisitCounter}] Entry URL: [${changeInfo.url}] Entry Domain: [${domain}] Entry Timestamp: [${timestamp}] Is Search Engine: ${isSearchEngineDomain}`);
        lastLoggedUrl = changeInfo.url;

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
                sessionId: sessionId,
                pageVisitCounter: pageVisitCounter,
                entryUrl: changeInfo.url,
                entryDomain: domain,
                entryTimestamp: timestamp,
                isSearchEngine: isSearchEngineDomain
            })
        })
        .then(response => response.text())
        .then(data => console.log('Server response:', data))
        .catch(error => console.error('Error logging URL to server:', error));

        resetInactivityTimeout();

        // Increment the page visit counter after logging the current entry
        pageVisitCounter++;
    }
});
