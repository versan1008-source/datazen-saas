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
                    'text': text,
                    'type': 'heading',
                    'tag': heading.name,
                    'level': int(heading.name[1])
                })

        # Extract paragraphs
        for para in soup.find_all('p'):
            text = clean_text(para.get_text())
            if text and len(text) > 5:
                text_elements.append({
                    'text': text,
                    'type': 'paragraph'
                })

        # Extract list items
        for li in soup.find_all('li'):
            text = clean_text(li.get_text())
            if text:
                text_elements.append({
                    'text': text,
                    'type': 'list_item'
                })

        # Extract div content (main content areas)
        for div in soup.find_all('div'):
            # Skip divs that contain other block elements
            if not div.find(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'div']):
                text = clean_text(div.get_text())
                if text and len(text) > 10:
                    text_elements.append({
                        'text': text,
                        'type': 'content'
                    })

        # Extract article content
        for article in soup.find_all('article'):
            text = clean_text(article.get_text())
            if text and len(text) > 20:
                text_elements.append({
                    'text': text,
                    'type': 'article'
                })

        # Extract section content
        for section in soup.find_all('section'):
            text = clean_text(section.get_text())
            if text and len(text) > 15:
                text_elements.append({
                    'text': text,
                    'type': 'section'
                })

        # Extract table content
        for table in soup.find_all('table'):
            for row in table.find_all('tr'):
                row_text = clean_text(row.get_text())
                if row_text:
                    text_elements.append({
                        'text': row_text,
                        'type': 'table_row'
                    })

        # If we still don't have much content, extract all visible text
        if len(text_elements) < 5:
            all_text = clean_text(soup.get_text())
            if all_text and len(all_text) > 50:
                # Split into sentences for better structure
                sentences = [s.strip() for s in all_text.split('.') if s.strip() and len(s.strip()) > 10]
                for i, sentence in enumerate(sentences[:20]):
                    text_elements.append({
                        'text': sentence + '.',
                        'type': 'sentence',
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
    
    def extract_phone_numbers(self, html_content: str, resolve_owner: bool = False) -> List[Dict[str, Any]]:
        """
        Extract phone numbers from HTML content

        Args:
            html_content (str): HTML content to extract from
            resolve_owner (bool): Whether to attempt owner resolution

        Returns:
            List[Dict[str, Any]]: List of phone number records
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        phone_numbers = []

        # Phone number regex patterns
        patterns = [
            r'\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # US format
            r'\+?[1-9]\d{1,14}',  # International E.164 format
            r'\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # US without country code
        ]

        seen_numbers = set()

        # Extract from text content
        text_content = soup.get_text()
        for pattern in patterns:
            matches = re.finditer(pattern, text_content)
            for match in matches:
                phone = match.group(0).strip()
                # Normalize phone number
                normalized = re.sub(r'[^\d+]', '', phone)

                if normalized not in seen_numbers and len(normalized) >= 10:
                    seen_numbers.add(normalized)

                    # Get context around the phone number
                    start = max(0, match.start() - 50)
                    end = min(len(text_content), match.end() + 50)
                    context = text_content[start:end].strip()

                    # Extract owner from context if resolve_owner is True
                    owner = None
                    owner_type = 'Unknown'
                    confidence = 50

                    if resolve_owner:
                        owner, owner_type, confidence = self._resolve_phone_owner(phone, context, soup)
                    else:
                        # Try to extract owner from adjacent text
                        owner = self._extract_owner_from_context(context)

                    phone_numbers.append({
                        'phone': phone,
                        'normalized': normalized,
                        'owner': owner or 'Unknown',
                        'owner_type': owner_type,
                        'confidence': confidence,
                        'source': self._find_phone_selector(soup, phone),
                        'context_snippet': self._extract_context_snippet(context, phone),
                        'data_source': 'enriched_lookup' if resolve_owner else 'extracted_from_page'
                    })

        return phone_numbers

    def _resolve_phone_owner(self, phone: str, context: str, soup: BeautifulSoup) -> tuple:
        """Attempt to resolve phone owner information"""
        # This is a placeholder for actual phone lookup service integration
        # In production, this would call a service like Twilio Lookup API
        owner = self._extract_owner_from_context(context)

        # Simple heuristic: check if context contains business keywords
        business_keywords = ['company', 'business', 'corp', 'inc', 'llc', 'ltd', 'phone', 'call', 'contact']
        person_keywords = ['contact', 'reach', 'call me', 'my number', 'personal']

        owner_type = 'Unknown'
        confidence = 50

        context_lower = context.lower()
        if any(keyword in context_lower for keyword in business_keywords):
            owner_type = 'Business'
            confidence = 65
        elif any(keyword in context_lower for keyword in person_keywords):
            owner_type = 'Person'
            confidence = 60

        return owner, owner_type, confidence

    def _extract_owner_from_context(self, context: str) -> Optional[str]:
        """Extract owner name from context text"""
        # Look for common patterns like "Contact: John Doe" or "Company: ABC Corp"
        patterns = [
            r'(?:contact|call|reach|phone)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'(?:company|business|organization)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]

        for pattern in patterns:
            match = re.search(pattern, context, re.IGNORECASE)
            if match:
                return match.group(1)

        return None

    def _find_phone_selector(self, soup: BeautifulSoup, phone: str) -> str:
        """Find CSS selector for phone number element"""
        # Search for the phone number in the HTML
        for element in soup.find_all(string=re.compile(re.escape(phone))):
            parent = element.parent
            if parent:
                # Try to build a selector
                if parent.get('class'):
                    return f".{'.'.join(parent.get('class', []))}"
                elif parent.get('id'):
                    return f"#{parent.get('id')}"
                else:
                    return parent.name or 'unknown'

        return 'unknown'

    def _extract_context_snippet(self, context: str, phone: str) -> str:
        """Extract 3-6 word snippet around phone number"""
        words = context.split()
        phone_idx = None

        for i, word in enumerate(words):
            if phone in word or word in phone:
                phone_idx = i
                break

        if phone_idx is not None:
            start = max(0, phone_idx - 2)
            end = min(len(words), phone_idx + 3)
            return ' '.join(words[start:end])

        return ' '.join(words[:6])

    async def scrape(self, url: str, data_type: str, check_robots: bool = True, resolve_owner: bool = False) -> Dict[str, Any]:
        """
        Main scraping method

        Args:
            url (str): URL to scrape
            data_type (str): Type of data to extract (text, images, links, emails, phone_numbers)
            check_robots (bool): Whether to check robots.txt
            resolve_owner (bool): Whether to resolve phone owner information

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
            elif data_type == 'phone_numbers':
                data = self.extract_phone_numbers(html_content, resolve_owner)
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
