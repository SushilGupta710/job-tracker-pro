// Listen for messages from the Content Script (the slider)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // const localBackendUrl ='http://localhost:3000/api/jobs/create'
    const backendUrl = 'https://smart-job-tracker-api-w44d.onrender.com/api';
    const frontendUrl = 'https://job-tracker-app-kohl-six.vercel.app/';
    if (request.action === "saveJob") {
        const { token, jobData } = request;

        fetch(backendUrl+'/jobs/create', {
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

        chrome.tabs.query({ url: [frontendUrl+'/*'] }, (tabs) => {
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