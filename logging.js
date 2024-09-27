// Logging functions

export const logUrlToServer = (url, domain, isSearchEngineDomain, timestamp, sessionId, pageVisitCounter) => {
    console.log(`Session ID: [${sessionId}][${timestamp}] Page Count: [${pageVisitCounter}] URL: [${url}] Domain: [${domain}] Is Search Engine: [${isSearchEngineDomain}]`);

    fetch('http://localhost:3001/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url,
            domain,
            isSearchEngine: isSearchEngineDomain,
            timestamp,
            sessionId,
            pageCount: pageVisitCounter
        })
    })
    .then(response => response.text())
    .then(data => console.log('Server response:', data))
    .catch(error => console.error('Error logging URL to server:', error));
};
