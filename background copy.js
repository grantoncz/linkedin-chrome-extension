let urlList = [];

function fetchDataFromAPI(apiKey, linkedInURL) {
    if (!apiKey) {
        console.warn("API Key not set!");
        return;
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

    fetch(endpoint, requestOptions)
    .then(response => {
        if (response.status === 200) {
            return true;
        } else if (response.status === 404) {
           return false;
        }
        // Optionally handle other status codes if needed
    })
    .catch(error => {
        console.error("Error during fetch:", error);
    });
}

// chrome.storage.sync.get(['apiKey'], function(data) {
//     fetchDataFromAPI(data.apiKey, "");  // Here, initially you may not have a LinkedIn URL
// });

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//     if (changes.apiKey) {
//         fetchDataFromAPI(changes.apiKey.newValue, "");
//     }
// });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.action.setIcon({
        path: '128.png',
        tabId: tabId
    });
    console.info("extension executed");
    if (changeInfo.status === 'complete' && tab.url.startsWith('https://www.linkedin.com/')) {
        let mondayResponse = fetchDataFromAPI(data.apiKey, tab.url); // Fetch with the current LinkedIn URL
        console.info("linkedIn detected");
        if (mondayResponse) {
            chrome.action.setIcon({
                path: 'green.png',
                tabId: tabId
            });
            return;
        } else {
            chrome.action.setIcon({
                path: 'red.png',
                tabId: tabId
            });
            return;
        }
    }
});
