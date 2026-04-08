// Listen for messages from the Content Script (the slider)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveJob") {
        const { token, jobData } = request;

        fetch('http://localhost:3000/api/jobs/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ...jobData,
                source_id: 2 // Source: Extension
            })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.error) {
                sendResponse({ success: false, error: data.error });
            } else {
                sendResponse({ success: true, data });
            }
        })
        .catch(error => {
            sendResponse({ success: false, error: error.message });
        });

        return true; // Keep channel open for async response
    }
});