// Content script - runs on every page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractData') {
        const data = extractPageData(request.options);
        sendResponse(data);
    }
});

function extractPageData(options) {
    const result = {
        url: window.location.href,
        title: document.title,
        text: [],
        links: [],
        images: [],
        emails: []
    };

    // Extract text
    if (options.text) {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        const texts = new Set();
        
        textElements.forEach(el => {
            const text = el.innerText?.trim();
            if (text && text.length > 10 && text.length < 500) {
                texts.add(text);
            }
        });
        
        result.text = Array.from(texts).slice(0, 100);
    }

    // Extract links
    if (options.links) {
        const linkElements = document.querySelectorAll('a[href]');
        const links = new Set();
        
        linkElements.forEach(el => {
            const href = el.getAttribute('href');
            if (href && (href.startsWith('http') || href.startsWith('/'))) {
                links.add(href);
            }
        });
        
        result.links = Array.from(links).slice(0, 100);
    }

    // Extract images
    if (options.images) {
        const imgElements = document.querySelectorAll('img[src]');
        const images = new Set();
        
        imgElements.forEach(el => {
            const src = el.getAttribute('src');
            if (src && (src.startsWith('http') || src.startsWith('/'))) {
                images.add(src);
            }
        });
        
        result.images = Array.from(images).slice(0, 50);
    }

    // Extract emails
    if (options.emails) {
        const pageText = document.body.innerText;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = new Set(pageText.match(emailRegex) || []);
        result.emails = Array.from(emails);
    }

    return result;
}

// Inject helper script
const script = document.createElement('script');
script.textContent = `
    window.datazenExtension = {
        extractData: function(options) {
            return ${extractPageData.toString()}(options);
        }
    };
`;
document.documentElement.appendChild(script);

