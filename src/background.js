async function fetchDataFromAPI(apiKey, linkedInURL) {

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const payload = JSON.stringify({
        "api_key": apiKey,
        "person_linkedin_url": linkedInURL
    });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: payload,
        redirect: 'follow'
    };

    const endpoint = "http://pepavps.eu:9876/";  // truncated for brevity
    // const endpoint = "https://prod-51.northeurope.logic.azure.com:443/workflows/0a8ef88c62d14ff4a176b413fae055e0/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dni_l7z1kjYSl6hQg3PEbYCBP7vbR15MGi1pMk4oD40";  // truncated for brevity




    try {
        const response = await fetch(endpoint, requestOptions);
        if (response.status === 200) {
            return await response.json();  // Assuming the response data is in JSON format
        }
        return null;

    } catch (error) {
        console.error("Error during fetch:", error);
        return false;
    }
}


let currentFrame = 0;
const totalFrames = 3; // Number of frames you have. Adjust accordingly.
let animationInterval = 0;

function startIconAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);  // Clear existing interval if any
    }

    animationInterval = setInterval(() => {
        chrome.action.setIcon({
            path: `../media/animation_${currentFrame}.png`,
            // Assuming the frame names are like frame_0.png, frame_1.png, etc.
        });
        currentFrame = (currentFrame + 1) % totalFrames;  // Cycle through frames
    }, 500);  // Switch frame every 100ms. Adjust for your GIF's frame rate.
}

function stopIconAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
        currentFrame = 0;
        // Optionally set a default icon here if needed
    }
}

function setIconBasedOnLinkedInUrl(tabId, url) {
    startIconAnimation();
    chrome.storage.sync.get(['apiKey'], async function(data) {
        if (url.startsWith('https://www.linkedin.com/in/')) {
            if (!data.apiKey) {
                console.warn("API Key not set!");
                chrome.action.setBadgeBackgroundColor({color: "#FF0000"});
                chrome.action.setBadgeText({text: "no key"});
                // chrome.runtime.openOptionsPage();  // Open the options page for user to enter API key
                return false;
            }

            let mondayResponse = await fetchDataFromAPI(data.apiKey, url); 
            console.info("linkedIn detected");




            if (mondayResponse == null) { //null znamena chybu, respektiva ne 200, takze cervena
                chrome.action.setIcon({
                    path: '../media/128.png',
                    tabId: tabId
                });
            } else if (mondayResponse.light == "red") { //TODO fix according to code analyses
                chrome.action.setIcon({
                    path: '../media/red.png',
                    tabId: tabId
                });
            } else if (mondayResponse.light == "yellow") { //TODO fix according to code analyses
                chrome.action.setIcon({
                    path: '../media/yellow.png',
                    tabId: tabId
                });
            } else {
                // Setting the icon to red when there's no match
                chrome.action.setIcon({
                    path: '../media/error.png',
                    tabId: tabId
                });
            }

        } else {
            // Reset to default icon when navigating to non-LinkedIn pages or when history state is updated
            chrome.action.setIcon({
                path: '../media/128.png',
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
