"""
Core scraping engine for DataZen
Uses Playwright for browser automation and BeautifulSoup for HTML parsing
"""

import asyncio
import logging
import sys
from typing import List, Dict, Any, Optional
from playwright.async_api import async_playwright, Browser, Page
from bs4 import BeautifulSoup
import re
from datetime import datetime

# Fix for Windows subprocess issue
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from .utils import (
    validate_url, check_robots_txt, extract_emails, 
    clean_text, normalize_url, is_valid_image_url,
    format_scrape_result, truncate_html
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebScraper:
    """Main web scraper class using Playwright and BeautifulSoup"""
    
    def __init__(self, timeout: int = 20000, max_html_size_mb: float = 2.0):
        """
        Initialize the web scraper
        
        Args:
            timeout (int): Timeout in milliseconds
            max_html_size_mb (float): Maximum HTML size in MB
        """
        self.timeout = timeout
        self.max_html_size_mb = max_html_size_mb
        self.browser: Optional[Browser] = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.browser:
            await self.browser.close()
        await self.playwright.stop()
    
    async def fetch_page_content(self, url: str) -> tuple[str, str]:
        """
        Fetch page content using Playwright
        
        Args:
            url (str): URL to fetch
            
        Returns:
            tuple[str, str]: (HTML content, final URL after redirects)
        """
        if not self.browser:
            raise RuntimeError("Browser not initialized. Use async context manager.")
        
        page = await self.browser.new_page()
        
        try:
            # Set comprehensive headers to bypass anti-bot detection
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'max-age=0',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
            })

            # Navigate to page
            response = await page.goto(
                url,
                wait_until='domcontentloaded',
                timeout=self.timeout
            )

            if not response or response.status >= 400:
                raise Exception(f"Failed to load page: HTTP {response.status if response else 'No response'}")

            # Wait for page to be fully loaded
            await page.wait_for_load_state('networkidle', timeout=self.timeout)
            
            # Get HTML content
            html_content = await page.content()
            final_url = page.url
            
            # Truncate if too large
            html_content = truncate_html(html_content, self.max_html_size_mb)
            
            return html_content, final_url
            
        finally:
            await page.close()
    
    def extract_text(self, html: str) -> List[Dict[str, Any]]:
        """
        Extract comprehensive visible text from HTML

        Args:
            html (str): HTML content

        Returns:
            List[Dict[str, Any]]: List of text elements with metadata
        """
        soup = BeautifulSoup(html, 'html.parser')

        # Remove script, style, and other non-content elements
        for element in soup(["script", "style", "meta", "link", "nav", "header", "footer", "aside", "noscript"]):
            element.decompose()

        text_elements = []

        # Extract headings with hierarchy
        for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            text = clean_text(heading.get_text())
            if text:
                text_elements.append({
                    'type': 'heading',
                    'tag': heading.name,
                    'text': text,
                    'length': len(text),
                    'level': int(heading.name[1])
                })

        # Extract paragraphs
        for para in soup.find_all('p'):
            text = clean_text(para.get_text())
            if text and len(text) > 5:
                text_elements.append({
                    'type': 'paragraph',
                    'text': text,
                    'length': len(text)
                })

        # Extract list items
        for li in soup.find_all('li'):
            text = clean_text(li.get_text())
            if text:
                text_elements.append({
                    'type': 'list_item',
                    'text': text,
                    'length': len(text)
                })

        # Extract div content (main content areas)
        for div in soup.find_all('div'):
            # Skip divs that contain other block elements
            if not div.find(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'div']):
                text = clean_text(div.get_text())
                if text and len(text) > 10:
                    text_elements.append({
                        'type': 'content',
                        'text': text,
                        'length': len(text)
                    })

        # Extract article content
        for article in soup.find_all('article'):
            text = clean_text(article.get_text())
            if text and len(text) > 20:
                text_elements.append({
                    'type': 'article',
                    'text': text,
                    'length': len(text)
                })

        # Extract section content
        for section in soup.find_all('section'):
            text = clean_text(section.get_text())
            if text and len(text) > 15:
                text_elements.append({
                    'type': 'section',
                    'text': text,
                    'length': len(text)
                })

        # Extract table content
        for table in soup.find_all('table'):
            for row in table.find_all('tr'):
                row_text = clean_text(row.get_text())
                if row_text:
                    text_elements.append({
                        'type': 'table_row',
                        'text': row_text,
                        'length': len(row_text)
                    })

        # If we still don't have much content, extract all visible text
        if len(text_elements) < 5:
            all_text = clean_text(soup.get_text())
            if all_text and len(all_text) > 50:
                # Split into sentences for better structure
                sentences = [s.strip() for s in all_text.split('.') if s.strip() and len(s.strip()) > 10]
                for i, sentence in enumerate(sentences[:20]):
                    text_elements.append({
                        'type': 'sentence',
                        'text': sentence + '.',
                        'length': len(sentence) + 1,
                        'order': i + 1
                    })

        # Remove duplicates while preserving order
        seen = set()
        unique_elements = []
        for element in text_elements:
            text_key = element['text'][:100]  # Use first 100 chars as key
            if text_key not in seen:
                seen.add(text_key)
                unique_elements.append(element)

        return unique_elements
    
    def extract_images(self, html: str, base_url: str) -> List[Dict[str, Any]]:
        """
        Extract image URLs from HTML
        
        Args:
            html (str): HTML content
            base_url (str): Base URL for resolving relative URLs
            
        Returns:
            List[Dict[str, Any]]: List of image data with metadata
        """
        soup = BeautifulSoup(html, 'html.parser')
        images = []
        
        # Find all img tags
        for img in soup.find_all('img'):
            src = img.get('src')
            if src:
                # Normalize URL
                full_url = normalize_url(src, base_url)
                
                # Validate image URL
                if is_valid_image_url(full_url):
                    images.append({
                        'url': full_url,
                        'alt': img.get('alt', ''),
                        'title': img.get('title', ''),
                        'width': img.get('width', ''),
                        'height': img.get('height', '')
                    })
        
        # Also check for background images in style attributes
        for element in soup.find_all(attrs={'style': True}):
            style = element.get('style', '')
            bg_match = re.search(r'background-image:\s*url\(["\']?([^"\']+)["\']?\)', style)
            if bg_match:
                bg_url = normalize_url(bg_match.group(1), base_url)
                if is_valid_image_url(bg_url):
                    images.append({
                        'url': bg_url,
                        'alt': 'Background image',
                        'title': '',
                        'width': '',
                        'height': ''
                    })
        
        # Remove duplicates
        seen_urls = set()
        unique_images = []
        for img in images:
            if img['url'] not in seen_urls:
                seen_urls.add(img['url'])
                unique_images.append(img)
        
        return unique_images
    
    def extract_links(self, html: str, base_url: str) -> List[Dict[str, Any]]:
        """
        Extract links from HTML
        
        Args:
            html (str): HTML content
            base_url (str): Base URL for resolving relative URLs
            
        Returns:
            List[Dict[str, Any]]: List of link data with metadata
        """
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            if href:
                # Normalize URL
                full_url = normalize_url(href, base_url)
                
                # Skip javascript: and mailto: links for regular links
                if not full_url.startswith(('javascript:', 'mailto:', 'tel:')):
                    links.append({
                        'url': full_url,
                        'text': clean_text(link.get_text(strip=True)),
                        'title': link.get('title', ''),
                        'target': link.get('target', '')
                    })
        
        # Remove duplicates
        seen_urls = set()
        unique_links = []
        for link in links:
            if link['url'] not in seen_urls:
                seen_urls.add(link['url'])
                unique_links.append(link)
        
        return unique_links
    
    def extract_emails_from_html(self, html: str) -> List[Dict[str, Any]]:
        """
        Extract email addresses from HTML
        
        Args:
            html (str): HTML content
            
        Returns:
            List[Dict[str, Any]]: List of email data
        """
        soup = BeautifulSoup(html, 'html.parser')
        
        # Get all text content
        text_content = soup.get_text()
        
        # Extract emails using regex
        emails = extract_emails(text_content)
        
        # Also check mailto links
        mailto_links = soup.find_all('a', href=re.compile(r'^mailto:'))
        for link in mailto_links:
            href = link.get('href', '')
            if href.startswith('mailto:'):
                email = href[7:]  # Remove 'mailto:' prefix
                if email and email not in emails:
                    emails.append(email)
        
        # Format as list of dictionaries
        email_data = []
        for email in emails:
            email_data.append({
                'email': email,
                'domain': email.split('@')[1] if '@' in email else ''
            })
        
        return email_data
    
    async def scrape(self, url: str, data_type: str, check_robots: bool = True) -> Dict[str, Any]:
        """
        Main scraping method
        
        Args:
            url (str): URL to scrape
            data_type (str): Type of data to extract (text, images, links, emails)
            check_robots (bool): Whether to check robots.txt
            
        Returns:
            Dict[str, Any]: Scraping results
        """
        try:
            # Validate URL
            if not validate_url(url):
                raise ValueError("Invalid URL format")
            
            # Check robots.txt if requested
            if check_robots and not check_robots_txt(url):
                raise ValueError("Scraping not allowed by robots.txt")
            
            # Fetch page content
            html_content, final_url = await self.fetch_page_content(url)
            
            # Extract data based on type
            if data_type == 'text':
                data = self.extract_text(html_content)
            elif data_type == 'images':
                data = self.extract_images(html_content, final_url)
            elif data_type == 'links':
                data = self.extract_links(html_content, final_url)
            elif data_type == 'emails':
                data = self.extract_emails_from_html(html_content)
            else:
                raise ValueError(f"Unsupported data type: {data_type}")
            
            # Format result
            result = format_scrape_result(data, data_type)
            result['timestamp'] = datetime.now().isoformat()
            result['url'] = final_url
            result['original_url'] = url
            
            logger.info(f"Successfully scraped {len(data)} {data_type} items from {url}")
            return result
            
        except Exception as e:
            logger.error(f"Scraping failed for {url}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "data_type": data_type,
                "url": url,
                "timestamp": datetime.now().isoformat()
            }
