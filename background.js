async function fetchDataFromAPI(apiKey, linkedInURL) {
    if (!apiKey) {
        console.warn("API Key not set!");
        return false;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const payload = JSON.stringify({
        "apiKey": apiKey,
        "columnValue": linkedInURL
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: payload,
        redirect: 'follow'
    };

    const endpoint = "https://prod-51.northeurope.logic.azure.com:443/workflows/0a8ef88c62d14ff4a176b413fae055e0/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dni_l7z1kjYSl6hQg3PEbYCBP7vbR15MGi1pMk4oD40";  // truncated for brevity

    try {
        const response = await fetch(endpoint, requestOptions);
        if (response.status === 200) {
            return true;
        } 
        return false;
    } catch (error) {
        console.error("Error during fetch:", error);
        return false;
    }
}

function setIconBasedOnLinkedInUrl(tabId, url) {
    chrome.storage.sync.get(['apiKey'], async function(data) {
        if (url.startsWith('https://www.linkedin.com/in/')) {
            let mondayResponse = await fetchDataFromAPI(data.apiKey, url); 
            console.info("linkedIn detected");

            if (mondayResponse) {
                chrome.action.setIcon({
                    path: 'green.png',
                    tabId: tabId
                });
            } else {
                // Setting the icon to red when there's no match
                chrome.action.setIcon({
                    path: 'red.png',
                    tabId: tabId
                });
            }
        } else {
            // Reset to default icon when navigating to non-LinkedIn pages or when history state is updated
            chrome.action.setIcon({
                path: '128.png',
                tabId: tabId
            });
        }
    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        setIconBasedOnLinkedInUrl(tabId, tab.url);
    }
});

// Listen to onHistoryStateUpdated for back and forward navigation in the browser
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    chrome.tabs.get(details.tabId, function(tab) {
        setIconBasedOnLinkedInUrl(details.tabId, tab.url);
    });
});
