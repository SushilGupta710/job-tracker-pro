// Keyword array for detecting job listing pages - easily extensible
const JOB_KEYWORDS = [
    'job', 'position', 'career', 'hiring', 'vacancy', 'apply',
    'employment', 'opportunity', 'role', 'opening', 'recruitment',
    'salary', 'experience', 'qualifications', 'responsibilities'
];

const JOB_SITES = [
    'linkedin.com',
    'indeed.com',
    'lever.co',
    'greenhouse.com',
    'glassdoor.com',
    'builtin.com',
    'angel.co',
    'monster.com',
    'dice.com'
];

function init() {
    // Prevent infinite loop: Don't run if we are inside our own extension frame
    if (window.location.href.includes('chrome-extension://')) return;

    const currentUrl = window.location.hostname.toLowerCase();
    const isKnownJobSite = JOB_SITES.some(site => currentUrl.includes(site));
    
    const pageText = document.body.innerText.toLowerCase();
    const isJobPage = isKnownJobSite || JOB_KEYWORDS.some(keyword => pageText.includes(keyword));

    // Only inject if it's a job page AND hasn't been injected yet
    if (isJobPage && !document.getElementById('jt-extension-root')) {
        injectSlider();
    }
}

function injectSlider() {
    const host = document.createElement('div');
    host.id = 'jt-extension-root';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    
    const logoUrl = chrome.runtime.getURL('icons/main-logo.png');

    const jobInfo = extractJobInfo();

    function extractJobInfo() {
        // Common selectors for job information across different sites
        const selectors = {
            title: [
                'h1',
                '.job-title',
                '.jobTitle',
                '[data-testid="job-title"]',
                '.jobsearch-JobMetadataHeader-title',
                '.job-detail-title',
                '[class*="job-title"]',
                '[class*="JobTitle"]'
            ],
            company: [
                '.job-company',
                '.company-name',
                '.employer-name',
                '[data-testid="company-name"]',
                '.jobsearch-JobMetadataHeader-company',
                '.job-company-name',
                '[class*="company"]',
                '[class*="Company"]',
                '.job-details-company'
            ],
            location: [
                '.job-location',
                '.location',
                '[data-testid="job-location"]',
                '.jobsearch-JobMetadataHeader-location',
                '[class*="location"]',
                '[class*="Location"]'
            ],
            salary: [
                '.job-salary',
                '.salary',
                '[data-testid="salary"]',
                '.jobsearch-JobMetadataHeader-salary',
                '[class*="salary"]',
                '[class*="Salary"]',
                '.compensation'
            ],
            description: [
                '.job-description',
                '.jobDescription',
                '[data-testid="job-description"]',
                '.jobsearch-JobMetadataHeader-description',
                '[class*="description"]',
                '[class*="Description"]',
                '.job-detail-description'
            ]
        };

        const extractText = (selectors) => {
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    return element.textContent.trim();
                }
            }
            return '';
        };

        // Extract salary from text content if not found in specific elements
        const extractSalaryFromText = () => {
            const bodyText = document.body.textContent;
            const salaryPatterns = [
                /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*-\s*\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g, // $100k - $150k
                /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*to\s*\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/gi, // $100k to $150k
                /salary:\s*[\$£€]\d{1,3}(?:,\d{3})*(?:\.\d{2})?/gi, // salary: $100k
                /compensation:\s*[\$£€]\d{1,3}(?:,\d{3})*(?:\.\d{2})?/gi // compensation: $100k
            ];

            for (const pattern of salaryPatterns) {
                const match = bodyText.match(pattern);
                if (match) return match[0];
            }
            return '';
        };

        return {
            title: extractText(selectors.title),
            company: extractText(selectors.company),
            location: extractText(selectors.location),
            salary: extractText(selectors.salary) || extractSalaryFromText(),
            description: extractText(selectors.description),
            url: window.location.href
        };
    }

    const container = document.createElement('div');
    container.innerHTML = `
    <style>
        .jt-wrapper * { box-sizing: border-box !important; margin: 0; padding: 0; }
        .jt-wrapper { font-family: system-ui, -apple-system, sans-serif !important; }
        input, textarea, button { font-family: system-ui, -apple-system, sans-serif !important; }
        .hidden { display: none !important; }
    </style>
    <div class="jt-wrapper" id="jt-btn-trigger" style="position: fixed; right: 0; top: 50%; transform: translateY(-50%); background: #2563eb; color: white; padding: 12px; cursor: pointer; border-radius: 8px 0 0 8px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); z-index: 9999999; display: flex; align-items: center; gap: 8px; font-weight: bold; user-select: none; border: none; transition: background 0.2s;">
        <img src="${logoUrl}" style="width: 24px; height: 24px; display: block;" />
        <span id="jt-btn-text">Save Job</span>
    </div>

    <div class="jt-wrapper" id="jt-slider" style="position: fixed; top: 0; right: -400px; width: 400px; height: 100vh; background: #f8fafc; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); z-index: 9999998; transition: right 0.3s ease; display: flex; flex-direction: column; overflow: hidden;">
        <div style="background: white; border-bottom: 1px solid #e2e8f0; padding: 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${logoUrl}" style="width: 32px; height: 32px; display: block;" />
                <span style="color: #2563eb; font-weight: bold; font-size: 18px;">Job Tracker</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <button id="jt-logout" class="hidden" style="font-size: 12px; color: #6b7280; background: white; border: 1px solid #e5e7eb; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#6b7280'">Logout</button>
                <button id="jt-close-slider" style="font-size: 16px; color: #6b7280; background: white; border: 1px solid #e5e7eb; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#6b7280'">✕</button>
            </div>
        </div>

        <div style="padding: 24px; overflow-y: auto; flex: 1;">
            <div id="main-actions" style="display: flex; flex-direction: column; gap: 12px;">
                <button id="jt-save-job-btn" style="background: #10b981; color: white; font-weight: bold; padding: 16px; border-radius: 8px; width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer; border: none; font-size: 16px; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">💾 Save Job</button>
                <button id="jt-open-tracker-btn" style="background: #2563eb; color: white; font-weight: bold; padding: 16px; border-radius: 8px; width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer; border: none; font-size: 16px; transition: background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">📊 Open Job Tracker</button>
            </div>

            <div id="form-section" class="hidden">
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Company Name <span style="color: red;">*</span></label>
                        <input type="text" id="jt-company" value="${jobInfo.company}" style="width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; font-size: 14px; background: white;" placeholder="Company name">
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Job Title <span style="color: red;">*</span></label>
                        <input type="text" id="jt-title" value="${jobInfo.title}" style="width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; font-size: 14px; background: white;" placeholder="Job title">
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Location</label>
                        <input type="text" id="jt-location" value="${jobInfo.location}" style="width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; font-size: 14px; background: white;" placeholder="City, Country">
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Salary</label>
                        <input type="text" id="jt-salary" style="width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; font-size: 14px; background: white;" placeholder="e.g. $100k-$150k">
                    </div>
                    <div style="margin-bottom: 16px;">
                        <label style="display: block; font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Job Description</label>
                        <textarea id="jt-desc" style="width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; font-size: 13px; background: white; resize: none;" rows="5" placeholder="Paste job description here..."></textarea>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="jt-save" style="background: #10b981; color: white; font-weight: bold; padding: 12px; border-radius: 6px; flex: 1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); cursor: pointer; border: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">Save to Tracker</button>
                        <button id="jt-cancel" style="background: #6b7280; color: white; font-weight: bold; padding: 12px; border-radius: 6px; flex: 1; cursor: pointer; border: none; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#6b7280'">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="padding: 16px; background: white; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #9ca3af;">
            Powered by Job Tracker Pro &bull; Source ID: 2
        </div>
    </div>
    `;

    shadow.appendChild(container);

    const slider = shadow.querySelector('#jt-slider');
    const trigger = shadow.querySelector('#jt-btn-trigger');
    const btnText = shadow.querySelector('#jt-btn-text');

    trigger.onclick = () => {
        const isOpen = slider.style.right === '0px';
        slider.style.right = isOpen ? '-400px' : '0';
        btnText.textContent = isOpen ? 'Save Job' : '✕ Close';
        trigger.style.display = isOpen ? 'flex' : 'none';
        checkAuthStatus(shadow);
    };

    shadow.querySelector('#jt-logout').onclick = () => {
        chrome.storage.local.remove(['token', 'user'], () => checkAuthStatus(shadow));
    };

    shadow.querySelector('#jt-close-slider').onclick = () => {
        slider.style.right = '-400px';
        btnText.textContent = 'Save Job';
        trigger.style.display = 'flex';
    };

    shadow.querySelector('#jt-save-job-btn').onclick = () => {
        chrome.storage.local.get(['token'], (result) => {
            if (result.token) {
                // Show form for logged in users
                shadow.querySelector('#main-actions').classList.add('hidden');
                shadow.querySelector('#form-section').classList.remove('hidden');
            } else {
                // Prompt to login for non-logged in users
                alert('Please login to the extension first by clicking the Job Tracker icon in your browser toolbar.');
            }
        });
    };

    shadow.querySelector('#jt-open-tracker-btn').onclick = () => window.open('http://localhost:4200/dashboard', '_blank');
    
    shadow.querySelector('#jt-save').onclick = () => saveJob(shadow);
    
    shadow.querySelector('#jt-cancel').onclick = () => {
        shadow.querySelector('#main-actions').classList.remove('hidden');
        shadow.querySelector('#form-section').classList.add('hidden');
    };
}

function checkAuthStatus(shadow) {
    chrome.storage.local.get(['token'], (result) => {
        const logoutBtn = shadow.querySelector('#jt-logout');
        const saveBtn = shadow.querySelector('#jt-save-job-btn');
        
        if (result.token) {
            logoutBtn.classList.remove('hidden');
            saveBtn.innerHTML = '💾 Save Job';
        } else {
            logoutBtn.classList.add('hidden');
            saveBtn.innerHTML = '🔐 Login Required';
        }
    });
}

function saveJob(shadow) {
    const companyInput = shadow.querySelector('#jt-company');
    const titleInput = shadow.querySelector('#jt-title');
    
    // Validation
    if (!companyInput.value.trim()) {
        alert('Company Name is required');
        companyInput.focus();
        return;
    }
    if (!titleInput.value.trim()) {
        alert('Job Title is required');
        titleInput.focus();
        return;
    }
    
    chrome.storage.local.get(['token'], (result) => {
        if (!result.token) {
            alert('Please login to save jobs');
            return;
        }
        
        const btn = shadow.querySelector('#jt-save');
        btn.innerText = "Saving...";
        btn.disabled = true;

        const payload = {
            title: titleInput.value,
            company: companyInput.value,
            location: shadow.querySelector('#jt-location').value,
            salary: shadow.querySelector('#jt-salary').value,
            description: shadow.querySelector('#jt-desc').value,
            url: window.location.href,
            status_id: 2,
            source_id: 2
        };

        chrome.runtime.sendMessage({
            action: "saveJob",
            token: result.token,
            jobData: payload
        }, (response) => {
            console.log('Content: Received response:', response);
            btn.innerText = "Save to Tracker";
            btn.disabled = false;
            if (response?.success) {
                alert("✨ Job Saved Successfully!");
                // Go back to main actions
                shadow.querySelector('#main-actions').classList.remove('hidden');
                shadow.querySelector('#form-section').classList.add('hidden');
                // Clear form
                companyInput.value = '';
                titleInput.value = '';
                shadow.querySelector('#jt-location').value = '';
                shadow.querySelector('#jt-salary').value = '';
                shadow.querySelector('#jt-desc').value = '';
            } else {
                alert("❌ Save Failed: " + (response?.error || 'Unknown error'));
            }
        });
    });
}

// Initial Run
init();