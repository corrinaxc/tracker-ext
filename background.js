let lastLoggedUrl = '';

function logUrl(details) {
    if (details.frameId === 0) { 
        const url = details.url;
        if (url !== lastLoggedUrl) { 
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] URL:`, url);
            lastLoggedUrl = url;

            fetch('http://localhost:3001/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    timestamp: timestamp
                })
            })
            .then(response => response.text())
            .then(data => console.log('Server response:', data))
            .catch(error => console.error('Error logging URL to server:', error));
        }
    }
}

chrome.webNavigation.onCompleted.addListener(logUrl);
chrome.webNavigation.onHistoryStateUpdated.addListener(logUrl);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url && changeInfo.url !== lastLoggedUrl) { 
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] URL:`, changeInfo.url);
        lastLoggedUrl = changeInfo.url;

        fetch('http://localhost:3001/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: changeInfo.url,
                timestamp: timestamp
            })
        })
        .then(response => response.text())
        .then(data => console.log('Server response:', data))
        .catch(error => console.error('Error logging URL to server:', error));
    }
});
