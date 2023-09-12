

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

    return fetch(endpoint, requestOptions)
    .then(response => {
        if (response.status === 200) {
            return true;
        } else if (response.status === 404) {
           return false;
        } else {
           // Handle other status codes if needed
           return false; // Return false for all other cases
        }
    })
    .catch(error => {
        console.error("Error during fetch:", error);
        return false; // Return false in case of error
    });
}

// It appears that you have some Chrome extension code here, but 'data' is not initialized.
// You might need to use chrome.storage.sync or chrome.storage.local to store and retrieve the 'apiKey'.
// The commented-out code below is a starting point for using chrome.storage.sync.
//
// chrome.storage.sync.get(['apiKey'], function(data) {
//     // fetchDataFromAPI(data.apiKey, "");  // Here, initially you may not have a LinkedIn URL
// });

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//     if (changes.apiKey) {
//         fetchDataFromAPI(changes.apiKey.newValue, "");
//     }
// });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // chrome.action.setIcon({
    //     path: '128.png',
    //     tabId: tabId
    // });
    console.info("extension executed");
    console.log("this sucks");
    
    if (changeInfo.status === 'complete' && tab.url.startsWith('https://www.linkedin.com/in/')) {
        
        chrome.storage.sync.get(['apiKey'], function(data) {
            let mondayResponse = fetchDataFromAPI(data.apiKey, tab.url); 
            console.info("linkedIn detected");

            // Note: fetchDataFromAPI doesn't actually return a value, so mondayResponse will always be undefined.
            if (mondayResponse) {
                chrome.action.setIcon({
                    path: 'green.png',
                    tabId: tabId
                });
            } else {
                chrome.action.setIcon({
                    path: 'red.png',
                    tabId: tabId
                });
            }
        });
    }
});

