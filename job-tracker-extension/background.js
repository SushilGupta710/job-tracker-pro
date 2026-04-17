// Listen for messages from the Content Script (the slider)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveJob") {
        const { token, jobData } = request;

        fetch('https://smart-job-tracker-api-w44d.onrender.com/api/jobs/create', {
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

    if (request.action === "logoutFromContent") {
        if (!chrome?.tabs?.query) {
            sendResponse({ success: false, error: 'tabs API unavailable' });
            return;
        }

        chrome.tabs.query({ url: ['http://localhost:4200/*'] }, (tabs) => {
            if (!tabs || !tabs.length) {
                sendResponse({ success: false, error: 'No app tabs found' });
                return;
            }

            let sent = 0;
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, { action: 'logoutFromExtension' }, (response) => {
                    sent += 1;
                    if (sent === tabs.length) {
                        sendResponse({ success: true });
                    }
                });
            });
        });

        return true;
    }
});