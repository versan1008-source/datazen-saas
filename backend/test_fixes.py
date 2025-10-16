"""
Test script to verify the scraper fixes for LinkedIn and university websites
"""

import asyncio
import sys
import os

# Fix encoding issues on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.enhanced_scraper import EnhancedScraper
from services.fallback_scraper import FallbackScraper
from services.scraper import WebScraper

async def test_enhanced_scraper():
    """Test the enhanced scraper with various websites"""
    print("🧪 Testing Enhanced Scraper with Fixes...\n")
    
    scraper = EnhancedScraper()
    
    # Test cases
    test_cases = [
        {
            'url': 'https://www.mit.edu',
            'name': 'MIT (University)',
            'expected_type': 'university'
        },
        {
            'url': 'https://www.stanford.edu',
            'name': 'Stanford (University)',
            'expected_type': 'university'
        },
        {
            'url': 'https://httpbin.org/html',
            'name': 'HTTPBin (General)',
            'expected_type': 'general'
        },
        {
            'url': 'https://example.com',
            'name': 'Example.com (General)',
            'expected_type': 'general'
        }
    ]
    
    for test_case in test_cases:
        print(f"Testing: {test_case['name']}")
        print(f"URL: {test_case['url']}")
        
        try:
            result = scraper.scrape(test_case['url'], data_type='text')
            
            if result.get('success'):
                print(f"✅ Success!")
                print(f"   Website Type: {result.get('website_type')}")
                print(f"   Items Found: {result.get('count')}")
                print(f"   Data Type: {result.get('data_type')}")
                
                # Show first few items
                if result.get('data'):
                    print(f"   Sample Data:")
                    for item in result.get('data', [])[:2]:
                        text = item.get('text', '')[:100]
                        print(f"     - {text}...")
            else:
                print(f"❌ Failed: {result.get('error')}")
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
        
        print()

async def test_fallback_scraper():
    """Test the fallback scraper with retry logic"""
    print("\n🧪 Testing Fallback Scraper with Retry Logic...\n")
    
    scraper = FallbackScraper()
    
    test_urls = [
        'https://httpbin.org/html',
        'https://example.com',
    ]
    
    for url in test_urls:
        print(f"Testing: {url}")
        
        try:
            result = scraper.extract_text(url)
            
            if result.get('success'):
                print(f"✅ Success!")
                print(f"   Items Found: {result.get('count')}")
                
                if result.get('data'):
                    print(f"   Sample Data:")
                    for item in result.get('data', [])[:2]:
                        text = item.get('text', '')[:100]
                        print(f"     - {text}...")
            else:
                print(f"❌ Failed: {result.get('error')}")
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
        
        print()

async def test_playwright_scraper():
    """Test the Playwright scraper with enhanced headers"""
    print("\n🧪 Testing Playwright Scraper with Enhanced Headers...\n")
    
    try:
        async with WebScraper() as scraper:
            url = 'https://httpbin.org/html'
            print(f"Testing: {url}")
            
            result = await scraper.scrape(url, 'text', check_robots=False)
            
            if result.get('success'):
                print(f"✅ Success!")
                print(f"   Items Found: {result.get('count')}")
                
                if result.get('data'):
                    print(f"   Sample Data:")
                    for item in result.get('data', [])[:2]:
                        text = item.get('text', '')[:100]
                        print(f"     - {text}...")
            else:
                print(f"❌ Failed: {result.get('error')}")
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

async def main():
    """Run all tests"""
    print("=" * 60)
    print("Web Scraper Fixes Verification")
    print("=" * 60)
    print()
    
    # Test enhanced scraper
    await test_enhanced_scraper()
    
    # Test fallback scraper
    await test_fallback_scraper()
    
    # Test Playwright scraper
    await test_playwright_scraper()
    
    print("\n" + "=" * 60)
    print("✨ Testing completed!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())

