function escapeCzechCharacters(str) {
    // Object mapping of Czech characters to their URL-safe encoding
    const charMap = {
        'ě': '%C4%9B',
        'š': '%C5%A1',
        'č': '%C4%8D',
        'ř': '%C5%99',
        'ž': '%C5%BE',
        'ý': '%C3%BD',
        'á': '%C3%A1',
        'í': '%C3%AD',
        'é': '%C3%A9',
        'ó': '%C3%B3',
        'ň': '%C5%88',
        'ť': '%C5%A5',
        'ď': '%C4%8F',
        'ú': '%C3%BA',
        'ů': '%C5%AF'
    };

    // Replace each character with its encoded counterpart
    let escapedStr = str.split('').map(char => charMap[char] || char).join('');

    return escapedStr;
}

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

    // const endpoint = "http://127.0.0.1:8000/";  // truncated for brevity
    // const endpoint = "http://pepavps.eu:9876/";  // truncated for brevity
    const endpoint = "http://api-semafor.bnhyc9gzbhf0frcf.northeurope.azurecontainer.io";

    console.log("outbound request [endpoint]:", endpoint);
    console.log("outbound request [data]:", requestOptions);


    try {
        const response =  await fetch(endpoint, requestOptions);

        if (response.status === 200) {
            return response.json();  // Assuming the response data is in JSON format
        } else if (response.status === 404) {
            return {"light": "green"};
        }
        console.error("neither status 200 or 404:", response);
        return null;

    } catch (error) {
        console.error("Error during fetch", error);
        console.error("Failed to fetch:", response.statusText);
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
 // Declare a variable to keep track of the last processed URL
 let lastProcessedUrl = '';

 function setIconBasedOnLinkedInUrl(tabId, url) {
     // If the URL hasn't changed since the last time you processed, just return
     if (url === lastProcessedUrl) {
         return;
     }
     lastProcessedUrl = url; // Update the last processed URL



    startIconAnimation();
    chrome.storage.sync.get(['apiKey'], async function (data) {
        if (!url.includes("miniProfileUrn") && url.startsWith('https://www.linkedin.com/in/')) {

            if (!data.apiKey) {
                console.warn("API Key not set!");
                chrome.action.setBadgeBackgroundColor({color: "#FF0000"});
                chrome.action.setBadgeText({text: "no key"});
                // chrome.runtime.openOptionsPage();  // Open the options page for user to enter API key
                return false;
            }

            let mondayResponse = await fetchDataFromAPI(data.apiKey, url);
            // console.info("linkedIn detected");
            console.info("mondayresponse: ", mondayResponse);


            if (mondayResponse == null) { //null znamena chybu, respektiva ne 200, takze cervena
                console.warn("setting ERROR icon");
                chrome.action.setIcon({
                    path: '../media/error.png',
                    tabId: tabId
                });
            } else if (mondayResponse.light === "green") {
                console.info("setting GREEN icon");
                chrome.action.setIcon({
                    path: '../media/green.png',
                    tabId: tabId
                });
            } else if (mondayResponse.light === "red") {
                console.info("setting RED icon");
                chrome.action.setIcon({
                    path: '../media/red.png',
                    tabId: tabId
                });
            } else if (mondayResponse.light === "yellow") {
                console.info("setting YELLOW icon");
                chrome.action.setIcon({
                    path: '../media/yellow.png',
                    tabId: tabId
                });
            } else {
                // Setting the icon to red when there's no match
                console.error("setting ERROR icon in ELSE clause");
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
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
    chrome.tabs.get(details.tabId, function (tab) {
        setIconBasedOnLinkedInUrl(details.tabId, tab.url);
    });
});
