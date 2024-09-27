// Main Session Worker

import { assignSessionId, resetInactivityTimeout, getSessionId, incrementPageVisitCounter } from './session.js';
import { getDomainFromUrl, isSearchEngine, isIgnoredUrl } from './urlUtils.js';
import { logUrlToServer } from './logging.js';
import { SEARCH_ENGINES, IGNORED_PATTERNS, INACTIVITY_TIMEOUT_DURATION } from './config.js';

let lastLoggedUrl = '';

// Initial session ID assignment
assignSessionId();

// Chrome event listeners
const handleUrlLogging = (url, tabId) => {
    if (url !== lastLoggedUrl && !isIgnoredUrl(url, IGNORED_PATTERNS)) {
        const timestamp = new Date().toISOString();
        const domain = getDomainFromUrl(url);
        const isSearchEngineDomain = isSearchEngine(domain, SEARCH_ENGINES);

        logUrlToServer(url, domain, isSearchEngineDomain, timestamp, getSessionId(), incrementPageVisitCounter());

        lastLoggedUrl = url;

        // Inject content script only for the main page
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });

        resetInactivityTimeout(assignSessionId);
    }
};

chrome.webNavigation.onCompleted.addListener(details => handleUrlLogging(details.url, details.tabId));
chrome.webNavigation.onHistoryStateUpdated.addListener(details => handleUrlLogging(details.url, details.tabId));

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url) {
        handleUrlLogging(changeInfo.url, tabId);
    }
});
