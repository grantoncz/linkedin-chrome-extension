// Save the API key to Chrome storage
function saveOptions() {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({ apiKey: apiKey }, function() {
        // Update the status to inform the user the save was successful
        const status = document.getElementById('status');
        status.textContent = 'API Key saved!';
        setTimeout(function() {
            status.textContent = '';
        }, 2000);
        chrome.action.setBadgeText({text: ""});
    });
}

// Load the saved API key from Chrome storage and populate the input field
function restoreOptions() {
    chrome.storage.sync.get('apiKey', function(data) {
        if (data.apiKey) {
            document.getElementById('apiKey').value = data.apiKey;
        }
    });
}



// Add event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveButton').addEventListener('click', saveOptions);
