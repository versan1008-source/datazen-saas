"""
Fallback scraper using requests instead of Playwright
For Windows compatibility when Playwright has subprocess issues
"""

import requests
from bs4 import BeautifulSoup
import logging
from typing import List, Dict, Any, Optional
import re
from datetime import datetime
import os

from .utils import (
    validate_url, check_robots_txt, extract_emails, 
    clean_text, normalize_url, is_valid_image_url,
    format_scrape_result, truncate_html
)

logger = logging.getLogger(__name__)

class FallbackScraper:
    """Simple scraper using requests and BeautifulSoup"""

    def __init__(self, timeout: int = None, max_html_size_mb: int = None):
        self.timeout = timeout or int(os.getenv('SCRAPE_TIMEOUT_SECONDS', 120))
        self.max_html_size_mb = max_html_size_mb or int(os.getenv('MAX_HTML_SIZE_MB', 2))
        self.session = requests.Session()
        self.max_retries = 3
        self.retry_delay = 2

        # Comprehensive headers to bypass anti-bot detection
        self.session.headers.update({
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
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
        })
    
    def fetch_page_content(self, url: str) -> tuple[str, str]:
        """Fetch page content using requests with retry logic"""
        import time
        last_error = None

        for attempt in range(self.max_retries):
            try:
                logger.info(f"Fetching {url} (attempt {attempt + 1}/{self.max_retries})")

                # Add referer header for better compatibility
                headers = self.session.headers.copy()
                headers['Referer'] = url

                response = self.session.get(
                    url,
                    timeout=self.timeout,
                    headers=headers,
                    allow_redirects=True
                )

                # Check for common anti-bot responses
                if response.status_code == 429:  # Too Many Requests
                    logger.warning(f"Rate limited (429) on attempt {attempt + 1}")
                    if attempt < self.max_retries - 1:
                        time.sleep(self.retry_delay * (attempt + 1))
                        continue
                    raise Exception("Rate limited after retries")

                if response.status_code == 403:  # Forbidden
                    logger.warning(f"Access forbidden (403) - may be blocked by anti-bot")
                    if attempt < self.max_retries - 1:
                        time.sleep(self.retry_delay)
                        continue
                    raise Exception("Access forbidden - website may block scrapers")

                response.raise_for_status()

                # Check content size
                content_length = len(response.content)
                max_size_bytes = self.max_html_size_mb * 1024 * 1024

                if content_length > max_size_bytes:
                    logger.warning(f"Content size ({content_length} bytes) exceeds limit ({max_size_bytes} bytes)")
                    html_content = response.text[:max_size_bytes]
                else:
                    html_content = response.text

                logger.info(f"Successfully fetched {url}")
                return html_content, response.url

            except requests.exceptions.Timeout:
                last_error = "Request timeout"
                logger.warning(f"Timeout on attempt {attempt + 1}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
            except requests.exceptions.ConnectionError:
                last_error = "Connection error"
                logger.warning(f"Connection error on attempt {attempt + 1}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
            except Exception as e:
                last_error = str(e)
                logger.error(f"Error fetching {url} on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue

        raise Exception(f"Failed to fetch {url} after {self.max_retries} attempts. Last error: {last_error}")
    
    def extract_text(self, url: str) -> Dict[str, Any]:
        """Extract comprehensive text content from webpage"""
        try:
            html_content, final_url = self.fetch_page_content(url)
            soup = BeautifulSoup(html_content, 'html.parser')

            # Remove script, style, and other non-content elements
            for element in soup(["script", "style", "noscript"]):
                element.decompose()

            text_elements = []
            processed_texts = set()  # Track processed text to avoid duplicates

            # Strategy 1: Extract all text-containing elements in order
            all_text_elements = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'article', 'section', 'li', 'td', 'th', 'blockquote', 'pre', 'code'])

            for element in all_text_elements:
                # Skip if this element is inside another element we'll process
                if element.find_parent(['script', 'style', 'nav', 'header', 'footer']):
                    continue

                # Get text content from element
                try:
                    text = clean_text(element.get_text())
                    if text:
                        direct_text = [text]
                    else:
                        direct_text = []
                except Exception:
                    direct_text = []

                # Process the text
                for text in direct_text:
                    if text and len(text) > 3 and text not in processed_texts:
                        processed_texts.add(text)

                        # Determine element type
                        element_type = 'text'
                        element_name = getattr(element, 'name', 'unknown')

                        if element_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                            element_type = 'heading'
                        elif element_name == 'p':
                            element_type = 'paragraph'
                        elif element_name == 'li':
                            element_type = 'list_item'
                        elif element_name in ['td', 'th']:
                            element_type = 'table_cell'
                        elif element_name == 'blockquote':
                            element_type = 'quote'
                        elif element_name in ['pre', 'code']:
                            element_type = 'code'
                        elif element_name == 'article':
                            element_type = 'article'
                        elif element_name == 'section':
                            element_type = 'section'

                        text_data = {
                            'type': element_type,
                            'tag': element_name,
                            'text': text,
                            'length': len(text)
                        }

                        # Add level for headings
                        if element_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                            try:
                                text_data['level'] = int(element_name[1])
                            except (ValueError, IndexError):
                                text_data['level'] = 1

                        text_elements.append(text_data)

            # Strategy 2: If we still don't have much content, extract ALL visible text
            if len(text_elements) < 10:
                logger.info(f"Limited content found ({len(text_elements)} elements), extracting all visible text")

                # Get all text and split into meaningful chunks
                all_text = clean_text(soup.get_text(separator=' '))
                if all_text and len(all_text) > 100:
                    # Split by common delimiters
                    chunks = []

                    # Split by double newlines (paragraphs)
                    paragraphs = [p.strip() for p in all_text.split('\n\n') if p.strip()]
                    for para in paragraphs:
                        if len(para) > 20:
                            chunks.append(para)

                    # If no paragraphs, split by single newlines
                    if not chunks:
                        lines = [l.strip() for l in all_text.split('\n') if l.strip()]
                        for line in lines:
                            if len(line) > 10:
                                chunks.append(line)

                    # If still no chunks, split by sentences
                    if not chunks:
                        sentences = [s.strip() for s in all_text.split('.') if s.strip()]
                        for sentence in sentences:
                            if len(sentence) > 15:
                                chunks.append(sentence + '.')

                    # Add chunks as text elements
                    for i, chunk in enumerate(chunks[:50]):  # Limit to 50 chunks
                        if chunk not in processed_texts:
                            text_elements.append({
                                'type': 'content',
                                'text': chunk,
                                'length': len(chunk),
                                'order': i + 1
                            })

            logger.info(f"Successfully scraped {len(text_elements)} text items from {url}")
            result = format_scrape_result(text_elements, 'text')
            result['url'] = url
            result['timestamp'] = datetime.now().isoformat()
            return result

        except Exception as e:
            logger.error(f"Error extracting text from {url}: {e}")
            # Return a proper error result instead of None
            return {
                'success': False,
                'data_type': 'text',
                'count': 0,
                'data': [],
                'error': str(e),
                'url': url,
                'timestamp': datetime.now().isoformat()
            }
    
    def extract_images(self, url: str) -> Dict[str, Any]:
        """Extract image information from webpage"""
        try:
            html_content, final_url = self.fetch_page_content(url)
            soup = BeautifulSoup(html_content, 'html.parser')
            
            images = []
            
            for img in soup.find_all('img'):
                src = img.get('src')
                if not src:
                    continue
                
                # Convert relative URLs to absolute
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    from urllib.parse import urljoin
                    src = urljoin(final_url, src)
                elif not src.startswith(('http://', 'https://')):
                    from urllib.parse import urljoin
                    src = urljoin(final_url, src)
                
                if is_valid_image_url(src):
                    images.append({
                        'src': src,
                        'alt': img.get('alt', ''),
                        'title': img.get('title', ''),
                        'width': img.get('width', ''),
                        'height': img.get('height', ''),
                        'class': ' '.join(img.get('class', [])),
                        'loading': img.get('loading', '')
                    })
            
            logger.info(f"Successfully scraped {len(images)} images from {url}")
            result = format_scrape_result(images, 'images')
            result['url'] = url
            result['timestamp'] = datetime.now().isoformat()
            return result
            
        except Exception as e:
            logger.error(f"Error extracting images from {url}: {e}")
            # Return a proper error result instead of raising
            return {
                'success': False,
                'data_type': 'images',
                'count': 0,
                'data': [],
                'error': str(e),
                'url': url,
                'timestamp': datetime.now().isoformat()
            }
    
    def extract_links(self, url: str) -> Dict[str, Any]:
        """Extract links from webpage"""
        try:
            html_content, final_url = self.fetch_page_content(url)
            soup = BeautifulSoup(html_content, 'html.parser')
            
            links = []
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = clean_text(link.get_text())
                
                # Convert relative URLs to absolute
                if href.startswith('//'):
                    href = 'https:' + href
                elif href.startswith('/'):
                    from urllib.parse import urljoin
                    href = urljoin(final_url, href)
                elif not href.startswith(('http://', 'https://', 'mailto:', 'tel:')):
                    from urllib.parse import urljoin
                    href = urljoin(final_url, href)
                
                # Skip empty links and anchors
                if href.startswith('#') or not href.strip():
                    continue
                
                links.append({
                    'url': href,
                    'text': text,
                    'title': link.get('title', ''),
                    'target': link.get('target', ''),
                    'rel': ' '.join(link.get('rel', [])),
                    'type': 'external' if href.startswith(('http://', 'https://')) else 'internal'
                })
            
            logger.info(f"Successfully scraped {len(links)} links from {url}")
            result = format_scrape_result(links, 'links')
            result['url'] = url
            result['timestamp'] = datetime.now().isoformat()
            return result
            
        except Exception as e:
            logger.error(f"Error extracting links from {url}: {e}")
            # Return a proper error result instead of raising
            return {
                'success': False,
                'data_type': 'links',
                'count': 0,
                'data': [],
                'error': str(e),
                'url': url,
                'timestamp': datetime.now().isoformat()
            }
    
    def extract_emails(self, url: str) -> Dict[str, Any]:
        """Extract email addresses from webpage"""
        try:
            html_content, final_url = self.fetch_page_content(url)
            
            # Extract emails from HTML content
            emails = extract_emails(html_content)
            
            # Also parse with BeautifulSoup to get context
            soup = BeautifulSoup(html_content, 'html.parser')
            email_data = []
            
            for email in emails:
                # Find context for each email
                context = ""
                for element in soup.find_all(text=re.compile(re.escape(email))):
                    parent = element.parent
                    if parent:
                        context = clean_text(parent.get_text())[:200]
                        break
                
                email_data.append({
                    'email': email,
                    'context': context,
                    'domain': email.split('@')[1] if '@' in email else '',
                    'type': 'contact'
                })
            
            logger.info(f"Successfully scraped {len(email_data)} emails from {url}")
            result = format_scrape_result(email_data, 'emails')
            result['url'] = url
            result['timestamp'] = datetime.now().isoformat()
            return result
            
        except Exception as e:
            logger.error(f"Error extracting emails from {url}: {e}")
            # Return a proper error result instead of raising
            return {
                'success': False,
                'data_type': 'emails',
                'count': 0,
                'data': [],
                'error': str(e),
                'url': url,
                'timestamp': datetime.now().isoformat()
            }
    
    def scrape(self, url: str, data_type: str) -> Dict[str, Any]:
        """Main scraping method"""
        # Validate URL
        if not validate_url(url):
            raise ValueError(f"Invalid URL: {url}")
        
        # Normalize URL (just ensure it has a scheme)
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Check robots.txt (optional, can be disabled)
        try:
            if not check_robots_txt(url):
                logger.warning(f"Robots.txt disallows scraping {url}")
        except Exception as e:
            logger.warning(f"Could not check robots.txt for {url}: {e}")
        
        # Route to appropriate extraction method
        if data_type == 'text':
            return self.extract_text(url)
        elif data_type == 'images':
            return self.extract_images(url)
        elif data_type == 'links':
            return self.extract_links(url)
        elif data_type == 'emails':
            return self.extract_emails(url)
        else:
            raise ValueError(f"Unsupported data type: {data_type}")
