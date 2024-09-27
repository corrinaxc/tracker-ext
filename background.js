let lastLoggedUrl = '';
let sessionId = '';
let inactivityTimeout;
let pageVisitCounter = 1;

// Function to generate a random integer between a given range
function generateRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to assign a new session ID
function assignSessionId() {
    // Generate a random integer, for example, between 10000000 and 99999999
    sessionId = generateRandomInteger(10000000, 99999999);
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

function logUrl(details) {
    const url = details.url;

    // Only process the main frame (not iframes) and filter out unwanted URLs
    if (details.frameId === 0 && url !== lastLoggedUrl && !isIgnoredUrl(url)) {
        const timestamp = new Date().toISOString();
        const domain = getDomainFromUrl(url);  // Extract the domain from the URL
        const isSearchEngineDomain = isSearchEngine(domain);  // Check if the domain is a search engine

        console.log(`Session ID: [${sessionId}][${timestamp}] Page Count: [${pageVisitCounter}] URL: [${url}] Domain: [${domain}] Is Search Engine: [${isSearchEngineDomain}]`);

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
                domain: domain,  // Include the domain in the payload
                isSearchEngine: isSearchEngineDomain,  // Include the search engine check result
                timestamp: timestamp,
                sessionId: sessionId,
                pageCount: pageVisitCounter
            })
        })
        .then(response => response.text())
        .then(data => console.log('Server response:', data))
        .catch(error => console.error('Error logging URL to server:', error));

        resetInactivityTimeout();

        pageVisitCounter++;
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
        const domain = getDomainFromUrl(changeInfo.url);  // Corrected to use changeInfo.url
        const isSearchEngineDomain = isSearchEngine(domain);  // Check if the domain is a search engine

        console.log(`Session ID: [${sessionId}][${timestamp}] Page Count: [${pageVisitCounter}] URL: [${changeInfo.url}] Domain: [${domain}] Is Search Engine: [${isSearchEngineDomain}]`);
        
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
                domain: domain,
                isSearchEngine: isSearchEngineDomain,
                timestamp: timestamp,
                sessionId: sessionId,
                pageCount: pageVisitCounter
            })            
        })
        .then(response => response.text())
        .then(data => console.log('Server response:', data))
        .catch(error => console.error('Error logging URL to server:', error));

        resetInactivityTimeout();

        pageVisitCounter++;
    }
});
