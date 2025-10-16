# Extension Examples - Using the Enhanced Scraper

## Frontend Examples

### Example 1: Scrape University Website

```typescript
// frontend/src/components/ScrapeForm.tsx
import { apiService } from '@/lib/api';
import { useState } from 'react';

export default function ScrapeForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScrapeUniversity = async () => {
    setLoading(true);
    try {
      const result = await apiService.scrapeWebsiteEnhanced({
        url: 'https://www.mit.edu',
        data_type: 'text',
        ai_mode: false,
        check_robots: true,
        extract_structured_data: true
      });
      
      setResult(result);
      console.log(`✅ Scraped ${result.count} items from ${result.website_type}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleScrapeUniversity} disabled={loading}>
        {loading ? 'Scraping...' : 'Scrape MIT'}
      </button>
      
      {result && (
        <div>
          <p>Website Type: {result.website_type}</p>
          <p>Items Found: {result.count}</p>
          <p>Time: {result.processing_time_seconds}s</p>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Display University Data

```typescript
// frontend/src/components/ResultTable.tsx
import { ScrapeResponse } from '@/lib/api';

interface Props {
  result: ScrapeResponse;
}

export default function ResultTable({ result }: Props) {
  const isUniversity = result.website_type === 'university';

  return (
    <div className="results">
      <div className="header">
        <h2>Scraping Results</h2>
        <div className="metadata">
          <span>Type: {result.website_type || 'general'}</span>
          <span>Items: {result.count}</span>
          <span>Time: {result.processing_time_seconds}s</span>
        </div>
      </div>

      {isUniversity && (
        <div className="university-info">
          <h3>University Information</h3>
          {/* Extract and display university-specific data */}
          {result.data.map((item, idx) => (
            <div key={idx} className="item">
              {item.text}
            </div>
          ))}
        </div>
      )}

      {!isUniversity && (
        <table>
          <thead>
            <tr>
              <th>Content</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.text || item}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### Example 3: Handle Errors Gracefully

```typescript
// frontend/src/components/ScrapeForm.tsx
import { apiService } from '@/lib/api';
import { useState } from 'react';

export default function ScrapeForm() {
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);

  const handleScrape = async (url: string) => {
    setError('');
    setRetrying(false);

    try {
      const result = await apiService.scrapeWebsite({
        url,
        data_type: 'text',
        ai_mode: false
      });
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message;

      // Handle specific errors
      if (errorMsg.includes('Rate limited')) {
        setError('Website is rate limiting. Retrying automatically...');
        setRetrying(true);
        // Retry logic is automatic in the scraper
      } else if (errorMsg.includes('Access forbidden')) {
        setError('Website blocked the scraper. Try a different website.');
      } else if (errorMsg.includes('timeout')) {
        setError('Request took too long. Try disabling AI mode.');
      } else if (errorMsg.includes('Cannot connect')) {
        setError('Backend server is not running. Start it with: python main.py');
      } else {
        setError(`Error: ${errorMsg}`);
      }

      throw err;
    }
  };

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      {retrying && <div className="info-message">Retrying...</div>}
    </div>
  );
}
```

## Backend Examples

### Example 1: Use Enhanced Scraper Directly

```python
# backend/services/custom_scraper.py
from services.enhanced_scraper import EnhancedScraper

def scrape_university(url: str):
    """Scrape a university website"""
    scraper = EnhancedScraper(timeout=120, max_html_size_mb=2)
    
    result = scraper.scrape(
        url=url,
        data_type='text'
    )
    
    if result['success']:
        print(f"✅ Website type: {result.get('website_type')}")
        print(f"✅ Items extracted: {result['count']}")
        return result
    else:
        print(f"❌ Error: {result.get('error')}")
        return None

# Usage
result = scrape_university('https://www.mit.edu')
```

### Example 2: Handle Retry Logic

```python
# backend/services/custom_scraper.py
from services.enhanced_scraper import EnhancedScraper
import logging

logger = logging.getLogger(__name__)

def scrape_with_retry(url: str, max_attempts: int = 3):
    """Scrape with custom retry logic"""
    scraper = EnhancedScraper()
    
    for attempt in range(max_attempts):
        try:
            logger.info(f"Attempt {attempt + 1}/{max_attempts}")
            result = scraper.scrape(url, data_type='text')
            
            if result['success']:
                logger.info(f"✅ Success on attempt {attempt + 1}")
                return result
            else:
                logger.warning(f"Failed: {result.get('error')}")
        except Exception as e:
            logger.error(f"Error on attempt {attempt + 1}: {str(e)}")
    
    logger.error("All attempts failed")
    return None

# Usage
result = scrape_with_retry('https://www.mit.edu')
```

### Example 3: Extract University Data

```python
# backend/services/custom_scraper.py
from services.enhanced_scraper import EnhancedScraper

def extract_university_info(url: str):
    """Extract specific university information"""
    scraper = EnhancedScraper()
    result = scraper.scrape(url, data_type='text')
    
    if not result['success']:
        return None
    
    # Extract university-specific data
    university_data = {
        'url': url,
        'website_type': result.get('website_type'),
        'total_items': result['count'],
        'items': result['data'],
        'processing_time': result.get('processing_time_seconds')
    }
    
    # Filter for specific content
    programs = [item for item in result['data'] 
                if 'program' in str(item).lower()]
    contact = [item for item in result['data'] 
               if '@' in str(item) or 'phone' in str(item).lower()]
    
    university_data['programs'] = programs
    university_data['contact_info'] = contact
    
    return university_data

# Usage
info = extract_university_info('https://www.mit.edu')
print(f"Programs: {info['programs']}")
print(f"Contact: {info['contact_info']}")
```

## API Usage Examples

### Example 1: cURL - Scrape University

```bash
curl -X POST http://localhost:8000/api/scrape-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.mit.edu",
    "data_type": "text",
    "ai_mode": false,
    "check_robots": true,
    "extract_structured_data": true
  }'
```

**Response:**
```json
{
  "success": true,
  "website_type": "university",
  "data_type": "text",
  "count": 26,
  "data": [
    {"text": "MIT - Massachusetts Institute of Technology"},
    {"text": "Spotlight: Oct 16, 2025..."},
    ...
  ],
  "timestamp": "2025-10-16T12:34:56",
  "processing_time_seconds": 3.45
}
```

### Example 2: Python - Scrape with Requests

```python
import requests
import json

url = "http://localhost:8000/api/scrape-enhanced"
payload = {
    "url": "https://www.mit.edu",
    "data_type": "text",
    "ai_mode": False,
    "check_robots": True,
    "extract_structured_data": True
}

response = requests.post(url, json=payload)
result = response.json()

print(f"Website Type: {result['website_type']}")
print(f"Items: {result['count']}")
print(f"Time: {result['processing_time_seconds']}s")

# Save results
with open('results.json', 'w') as f:
    json.dump(result, f, indent=2)
```

### Example 3: JavaScript - Fetch API

```javascript
const scrapeUniversity = async (url) => {
  const response = await fetch('http://localhost:8000/api/scrape-enhanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      data_type: 'text',
      ai_mode: false,
      check_robots: true,
      extract_structured_data: true
    })
  });

  const result = await response.json();
  
  console.log(`Website Type: ${result.website_type}`);
  console.log(`Items: ${result.count}`);
  console.log(`Time: ${result.processing_time_seconds}s`);
  
  return result;
};

// Usage
scrapeUniversity('https://www.mit.edu').then(result => {
  console.log(result);
});
```

## Testing Examples

### Example 1: Test University Detection

```python
# backend/test_university.py
from services.enhanced_scraper import EnhancedScraper

def test_university_detection():
    scraper = EnhancedScraper()
    
    # Test MIT
    result = scraper.scrape('https://www.mit.edu', data_type='text')
    assert result['success'] == True
    assert result['website_type'] == 'university'
    assert result['count'] > 0
    print(f"✅ MIT: {result['count']} items")
    
    # Test Stanford
    result = scraper.scrape('https://www.stanford.edu', data_type='text')
    assert result['success'] == True
    assert result['website_type'] == 'university'
    assert result['count'] > 0
    print(f"✅ Stanford: {result['count']} items")

if __name__ == "__main__":
    test_university_detection()
```

### Example 2: Test Retry Logic

```python
# backend/test_retry.py
from services.fallback_scraper import FallbackScraper
import time

def test_retry_logic():
    scraper = FallbackScraper()
    
    start = time.time()
    result = scraper.scrape('https://httpbin.org/status/429', data_type='text')
    elapsed = time.time() - start
    
    # Should retry 3 times with delays
    # Total time should be > 6 seconds (2s + 4s delays)
    print(f"⏱️ Elapsed time: {elapsed:.1f}s")
    print(f"✅ Retry logic working" if elapsed > 6 else "❌ Retry logic not working")

if __name__ == "__main__":
    test_retry_logic()
```

## Summary

Your extension can now:
- ✅ Detect and scrape university websites
- ✅ Automatically retry with exponential backoff
- ✅ Handle errors gracefully
- ✅ Extract structured data
- ✅ Display results in the UI

All examples are ready to use in your extension!

