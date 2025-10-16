// Configuration
const API_URL = 'https://api.versan.in'; // Update this when backend is deployed
const CURRENT_DOMAIN = 'https://versan.in';

// DOM Elements
const urlInput = document.getElementById('url');
const scrapeBtn = document.getElementById('scrape-btn');
const scrapeUrlBtn = document.getElementById('scrape-url-btn');
const resultDiv = document.getElementById('result');
const resultContent = document.getElementById('result-content');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const closeResultBtn = document.getElementById('close-result');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const sendBtn = document.getElementById('send-btn');

// Checkboxes
const extractText = document.getElementById('extract-text');
const extractLinks = document.getElementById('extract-links');
const extractImages = document.getElementById('extract-images');
const extractEmails = document.getElementById('extract-emails');
const aiMode = document.getElementById('ai-mode');

let lastScrapedData = null;

// Get current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
        urlInput.value = tabs[0].url;
    }
});

// Scrape current page
scrapeBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
        showError('Please enter a valid URL');
        return;
    }
    await scrapeData(url, true);
});

// Scrape URL
scrapeUrlBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) {
        showError('Please enter a valid URL');
        return;
    }
    await scrapeData(url, false);
});

// Scrape data function
async function scrapeData(url, useCurrentTab = false) {
    hideError();
    showLoading();
    hideResult();

    try {
        const extractOptions = {
            text: extractText.checked,
            links: extractLinks.checked,
            images: extractImages.checked,
            emails: extractEmails.checked
        };

        let data;

        if (useCurrentTab) {
            // Use content script to extract from current page
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            data = await chrome.tabs.sendMessage(tab.id, {
                action: 'extractData',
                options: extractOptions
            });
        } else {
            // Send to backend API
            const response = await fetch(`${API_URL}/api/scrape`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    extract_type: Object.keys(extractOptions).filter(k => extractOptions[k]).join(','),
                    use_ai: aiMode.checked
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            data = await response.json();
        }

        lastScrapedData = data;
        displayResults(data);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to scrape data');
    }
}

// Display results
function displayResults(data) {
    let content = '';

    if (data.text && data.text.length > 0) {
        content += `📝 TEXT (${data.text.length} items):\n`;
        content += data.text.slice(0, 5).join('\n') + '\n\n';
    }

    if (data.links && data.links.length > 0) {
        content += `🔗 LINKS (${data.links.length} items):\n`;
        content += data.links.slice(0, 5).join('\n') + '\n\n';
    }

    if (data.images && data.images.length > 0) {
        content += `🖼️ IMAGES (${data.images.length} items):\n`;
        content += data.images.slice(0, 5).join('\n') + '\n\n';
    }

    if (data.emails && data.emails.length > 0) {
        content += `📧 EMAILS (${data.emails.length} items):\n`;
        content += data.emails.join('\n') + '\n\n';
    }

    resultContent.textContent = content || 'No data extracted';
    showResult();
}

// Show/Hide functions
function showLoading() {
    loadingDiv.classList.remove('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

function showResult() {
    resultDiv.classList.remove('hidden');
}

function hideResult() {
    resultDiv.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

// Result actions
closeResultBtn.addEventListener('click', hideResult);

copyBtn.addEventListener('click', () => {
    const text = resultContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
        }, 2000);
    });
});

downloadBtn.addEventListener('click', () => {
    const text = resultContent.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-data-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

sendBtn.addEventListener('click', () => {
    if (!lastScrapedData) return;
    
    // Open DataZen dashboard with data
    chrome.tabs.create({
        url: `${CURRENT_DOMAIN}?data=${encodeURIComponent(JSON.stringify(lastScrapedData))}`
    });
});

