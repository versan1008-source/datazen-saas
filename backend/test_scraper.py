"""
Simple test script for DataZen backend
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.scraper import WebScraper
from services.utils import validate_url

async def test_basic_scraping():
    """Test basic scraping functionality"""
    print("🧪 Testing DataZen Backend...")
    
    # Test URL validation
    print("\n1. Testing URL validation...")
    test_urls = [
        "https://httpbin.org/html",
        "https://example.com",
        "invalid-url",
        "http://httpbin.org/json"
    ]
    
    for url in test_urls:
        is_valid = validate_url(url)
        print(f"   {url}: {'✅ Valid' if is_valid else '❌ Invalid'}")
    
    # Test scraping
    print("\n2. Testing web scraping...")
    test_url = "https://httpbin.org/html"
    
    try:
        async with WebScraper() as scraper:
            print(f"   Scraping: {test_url}")
            
            # Test text extraction
            print("   - Testing text extraction...")
            result = await scraper.scrape(test_url, "text", check_robots=False)
            if result.get('success'):
                print(f"     ✅ Found {result.get('count', 0)} text elements")
            else:
                print(f"     ❌ Failed: {result.get('error')}")
            
            # Test link extraction
            print("   - Testing link extraction...")
            result = await scraper.scrape(test_url, "links", check_robots=False)
            if result.get('success'):
                print(f"     ✅ Found {result.get('count', 0)} links")
            else:
                print(f"     ❌ Failed: {result.get('error')}")
                
    except Exception as e:
        print(f"   ❌ Scraping failed: {str(e)}")
    
    print("\n✨ Backend test completed!")

if __name__ == "__main__":
    asyncio.run(test_basic_scraping())
