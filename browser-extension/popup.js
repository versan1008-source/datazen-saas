// DataZen Extension - Popup Script

const API_BASE_URL = 'http://localhost:8000/api';
let currentUser = null;
let currentResults = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});

// Check if user is authenticated
async function checkAuthentication() {
    const token = await getToken();
    
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                currentUser = await response.json();
                showScraperUI();
                updateQuotaStatus();
            } else {
                showAuthUI();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            showAuthUI();
        }
    } else {
        showAuthUI();
    }
}

// Show authentication UI
function showAuthUI() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('scraperSection').style.display = 'none';
    document.getElementById('status').textContent = '❌ Not authenticated';
    document.getElementById('status').className = 'status unauthenticated';
}

// Show scraper UI
function showScraperUI() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('scraperSection').style.display = 'block';
    document.getElementById('status').textContent = `✓ Logged in as ${currentUser.email}`;
    document.getElementById('status').className = 'status authenticated';
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showMessage('Please enter email and password', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            await saveToken(data.access_token);
            currentUser = data.user;
            showScraperUI();
            updateQuotaStatus();
            showMessage('Login successful!', 'success');
        } else {
            const error = await response.json();
            showMessage(error.detail || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Login error: ' + error.message, 'error');
    }
}

// Handle logout
async function handleLogout() {
    await removeToken();
    currentUser = null;
    currentResults = [];
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    showAuthUI();
    showMessage('Logged out successfully', 'success');
}

// Handle scraping
async function handleScrape() {
    const url = document.getElementById('scrapeUrl').value;
    const dataType = document.getElementById('dataType').value;
    
    if (!url) {
        showMessage('Please enter a URL', 'error');
        return;
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultsContainer').style.display = 'none';
    
    try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/scrape`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url: url,
                data_type: dataType,
                ai_mode: false
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentResults = data.data || [];
            displayResults(data);
            updateQuotaStatus();
            showMessage(`✓ Found ${data.count} items`, 'success');
        } else {
            const error = await response.json();
            showMessage(error.detail || 'Scraping failed', 'error');
        }
    } catch (error) {
        showMessage('Scraping error: ' + error.message, 'error');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Display results
function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    if (data.data && data.data.length > 0) {
        data.data.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.textContent = `${index + 1}. ${item}`;
            resultsDiv.appendChild(div);
        });
    } else {
        resultsDiv.innerHTML = '<p style="color: #999;">No results found</p>';
    }
    
    document.getElementById('resultsContainer').style.display = 'block';
}

// Update quota status
async function updateQuotaStatus() {
    try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/billing/quota-status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const quota = await response.json();
            const percentage = quota.quota_limit > 0 
                ? Math.round((quota.quota_used / quota.quota_limit) * 100)
                : 0;
            
            document.getElementById('quotaText').textContent = 
                `${quota.quota_used} / ${quota.quota_limit} pages used`;
            document.getElementById('quotaFill').style.width = percentage + '%';
            document.getElementById('quotaFill').textContent = percentage + '%';
            
            if (percentage >= 90) {
                showMessage('⚠️ Quota almost full. Consider upgrading.', 'warning');
            }
        }
    } catch (error) {
        console.error('Failed to update quota:', error);
    }
}

// Show stats
async function showStats() {
    try {
        const token = await getToken();
        const response = await fetch(`${API_BASE_URL}/billing/usage/stats?days=30`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const stats = await response.json();
            alert(`Usage Statistics (Last 30 days):\n\n` +
                `Total Pages: ${stats.total_pages_scraped}\n` +
                `Successful: ${stats.successful_scrapes}\n` +
                `Failed: ${stats.failed_scrapes}\n` +
                `Avg Time: ${stats.avg_processing_time_seconds}s`);
        }
    } catch (error) {
        showMessage('Failed to load stats', 'error');
    }
}

// Download results
function downloadResults() {
    if (currentResults.length === 0) {
        showMessage('No results to download', 'error');
        return;
    }
    
    const csv = currentResults.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datazen-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Show message
function showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.textContent = message;
    container.innerHTML = '';
    container.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, 5000);
}

// Token management
async function getToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get('token', (result) => {
            resolve(result.token || null);
        });
    });
}

async function saveToken(token) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ token }, resolve);
    });
}

async function removeToken() {
    return new Promise((resolve) => {
        chrome.storage.local.remove('token', resolve);
    });
}

// Show register form
function showRegister() {
    // This would show a registration form
    // For now, just show an alert
    alert('Registration coming soon! Please register at https://datazen.app');
}

