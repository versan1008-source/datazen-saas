"""
Enhanced scraper for LinkedIn and other complex websites
Includes specialized extractors for different website types
"""

import requests
from bs4 import BeautifulSoup
import logging
from typing import List, Dict, Any, Optional, Tuple
import re
from datetime import datetime
import os
import json
import time
from urllib.parse import urljoin, urlparse

from .utils import (
    validate_url, check_robots_txt, extract_emails, 
    clean_text, normalize_url, is_valid_image_url,
    format_scrape_result, truncate_html
)

logger = logging.getLogger(__name__)

class EnhancedScraper:
    """Enhanced scraper with specialized extractors for different website types"""
    
    def __init__(self, timeout: int = None, max_html_size_mb: int = None):
        self.timeout = timeout or int(os.getenv('SCRAPE_TIMEOUT_SECONDS', 120))
        self.max_html_size_mb = max_html_size_mb or int(os.getenv('MAX_HTML_SIZE_MB', 2))
        self.session = requests.Session()
        self.max_retries = 3
        self.retry_delay = 2  # seconds

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
        """Fetch page content with retry logic and anti-bot handling"""
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

    def detect_website_type(self, url: str, soup: BeautifulSoup) -> str:
        """Detect the type of website for specialized extraction"""
        domain = urlparse(url).netloc.lower()

        # LinkedIn detection
        if 'linkedin.com' in domain:
            return 'linkedin'

        # University/Educational websites
        if any(edu in domain for edu in ['.edu', 'university', 'college', 'school', 'academic']):
            return 'university'

        # Social media platforms
        if any(platform in domain for platform in ['twitter.com', 'x.com', 'facebook.com', 'instagram.com']):
            return 'social_media'

        # E-commerce sites
        if any(ecom in domain for ecom in ['amazon.com', 'ebay.com', 'shopify', 'etsy.com']):
            return 'ecommerce'

        # News sites
        if any(news in domain for news in ['cnn.com', 'bbc.com', 'reuters.com', 'news']):
            return 'news'

        # Job sites
        if any(job in domain for job in ['indeed.com', 'glassdoor.com', 'monster.com', 'jobs']):
            return 'job_site'

        # Check for common patterns in HTML
        if soup.find('script', {'type': 'application/ld+json'}):
            return 'structured_data'

        return 'general'
    
    def extract_linkedin_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Extract LinkedIn-specific data"""
        data = []
        
        try:
            # Profile information
            profile_data = self._extract_linkedin_profile(soup)
            if profile_data:
                data.extend(profile_data)
            
            # Company information
            company_data = self._extract_linkedin_company(soup)
            if company_data:
                data.extend(company_data)
            
            # Job postings
            job_data = self._extract_linkedin_jobs(soup)
            if job_data:
                data.extend(job_data)
            
            # Posts and articles
            post_data = self._extract_linkedin_posts(soup)
            if post_data:
                data.extend(post_data)
            
            # If no specific LinkedIn data found, fall back to general extraction
            if not data:
                data = self._extract_general_content(soup)
                
        except Exception as e:
            logger.error(f"Error extracting LinkedIn data: {e}")
            data = self._extract_general_content(soup)
        
        return data
    
    def _extract_linkedin_profile(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract LinkedIn profile information"""
        profile_data = []
        
        # Profile name
        name_selectors = [
            'h1.text-heading-xlarge',
            'h1[data-anonymize="person-name"]',
            '.pv-text-details__left-panel h1',
            '.ph5 h1'
        ]
        
        for selector in name_selectors:
            name_elem = soup.select_one(selector)
            if name_elem:
                profile_data.append({
                    'type': 'profile_name',
                    'category': 'personal_info',
                    'text': clean_text(name_elem.get_text()),
                    'selector': selector
                })
                break
        
        # Profile headline
        headline_selectors = [
            '.text-body-medium.break-words',
            '.pv-text-details__left-panel .text-body-medium',
            '[data-anonymize="headline"]'
        ]
        
        for selector in headline_selectors:
            headline_elem = soup.select_one(selector)
            if headline_elem:
                profile_data.append({
                    'type': 'profile_headline',
                    'category': 'personal_info',
                    'text': clean_text(headline_elem.get_text()),
                    'selector': selector
                })
                break
        
        # Experience section
        experience_items = soup.select('.pvs-list__paged-list-item, .pv-profile-section__card-item')
        for item in experience_items:
            exp_text = clean_text(item.get_text())
            if exp_text and len(exp_text) > 10:
                profile_data.append({
                    'type': 'experience',
                    'category': 'professional_info',
                    'text': exp_text,
                    'length': len(exp_text)
                })
        
        return profile_data
    
    def _extract_linkedin_company(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract LinkedIn company information"""
        company_data = []
        
        # Company name
        company_name = soup.select_one('h1.org-top-card-summary__title, .org-top-card-summary__title')
        if company_name:
            company_data.append({
                'type': 'company_name',
                'category': 'company_info',
                'text': clean_text(company_name.get_text())
            })
        
        # Company description
        about_section = soup.select_one('.org-about-us-organization-description__text')
        if about_section:
            company_data.append({
                'type': 'company_description',
                'category': 'company_info',
                'text': clean_text(about_section.get_text())
            })
        
        # Company details
        details = soup.select('.org-about-company-module__company-details dt, .org-about-company-module__company-details dd')
        for detail in details:
            text = clean_text(detail.get_text())
            if text:
                company_data.append({
                    'type': 'company_detail',
                    'category': 'company_info',
                    'text': text
                })
        
        return company_data
    
    def _extract_linkedin_jobs(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract LinkedIn job postings"""
        job_data = []
        
        # Job cards
        job_cards = soup.select('.job-search-card, .jobs-search__results-list li')
        for card in job_cards:
            job_title = card.select_one('.base-search-card__title, .job-search-card__title')
            company = card.select_one('.base-search-card__subtitle, .job-search-card__subtitle')
            location = card.select_one('.job-search-card__location')
            
            if job_title:
                job_info = {
                    'type': 'job_posting',
                    'category': 'job_info',
                    'title': clean_text(job_title.get_text()),
                    'company': clean_text(company.get_text()) if company else '',
                    'location': clean_text(location.get_text()) if location else '',
                    'text': f"{clean_text(job_title.get_text())} at {clean_text(company.get_text()) if company else 'Unknown Company'}"
                }
                job_data.append(job_info)
        
        return job_data
    
    def _extract_linkedin_posts(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract LinkedIn posts and articles"""
        post_data = []
        
        # Feed posts
        posts = soup.select('.feed-shared-update-v2, .occludable-update')
        for post in posts:
            post_text = post.select_one('.feed-shared-text, .feed-shared-inline-show-more-text')
            if post_text:
                text = clean_text(post_text.get_text())
                if text and len(text) > 20:
                    post_data.append({
                        'type': 'social_post',
                        'category': 'content',
                        'text': text,
                        'length': len(text)
                    })
        
        return post_data
    
    def _extract_general_content(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract general content when specific extractors don't apply"""
        data = []
        processed_texts = set()
        
        # Priority elements for extraction
        priority_selectors = [
            'h1, h2, h3, h4, h5, h6',  # Headings
            'p',  # Paragraphs
            'article',  # Articles
            'section',  # Sections
            '.content, .main-content, #content',  # Common content containers
            'li',  # List items
            'blockquote',  # Quotes
            'div[class*="text"], div[class*="content"]'  # Text containers
        ]
        
        for selector in priority_selectors:
            elements = soup.select(selector)
            for element in elements:
                text = clean_text(element.get_text())
                if text and len(text) > 10 and text not in processed_texts:
                    processed_texts.add(text)
                    
                    element_type = self._determine_element_type(element)
                    data.append({
                        'type': element_type,
                        'tag': element.name,
                        'text': text,
                        'length': len(text),
                        'selector': selector
                    })
        
        return data
    
    def _determine_element_type(self, element) -> str:
        """Determine the type of HTML element"""
        tag = element.name.lower()
        
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            return 'heading'
        elif tag == 'p':
            return 'paragraph'
        elif tag == 'li':
            return 'list_item'
        elif tag == 'article':
            return 'article'
        elif tag == 'section':
            return 'section'
        elif tag == 'blockquote':
            return 'quote'
        elif 'class' in element.attrs:
            classes = ' '.join(element.attrs['class']).lower()
            if any(keyword in classes for keyword in ['title', 'heading']):
                return 'heading'
            elif any(keyword in classes for keyword in ['description', 'summary']):
                return 'description'
            elif any(keyword in classes for keyword in ['content', 'text']):
                return 'content'
        
        return 'text'

    def fetch_page_content(self, url: str) -> Tuple[str, str]:
        """Fetch page content with enhanced headers and error handling"""
        try:
            # Add random delay to avoid rate limiting
            time.sleep(0.5)

            response = self.session.get(url, timeout=self.timeout, allow_redirects=True)
            response.raise_for_status()

            # Check content size
            content_length = len(response.content)
            max_size_bytes = self.max_html_size_mb * 1024 * 1024

            if content_length > max_size_bytes:
                logger.warning(f"Content size ({content_length} bytes) exceeds limit ({max_size_bytes} bytes)")
                # Truncate content
                response._content = response.content[:max_size_bytes]

            return response.text, response.url

        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            raise

    def extract_structured_data(self, soup: BeautifulSoup) -> List[Dict[str, Any]]:
        """Extract structured data (JSON-LD, microdata, etc.)"""
        structured_data = []

        # JSON-LD structured data
        json_ld_scripts = soup.find_all('script', {'type': 'application/ld+json'})
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    structured_data.append({
                        'type': 'structured_data',
                        'category': 'metadata',
                        'data_type': data.get('@type', 'Unknown'),
                        'text': json.dumps(data, indent=2),
                        'raw_data': data
                    })
            except json.JSONDecodeError:
                continue

        # Meta tags
        meta_tags = soup.find_all('meta')
        for meta in meta_tags:
            if meta.get('property') or meta.get('name'):
                content = meta.get('content', '')
                if content:
                    structured_data.append({
                        'type': 'meta_tag',
                        'category': 'metadata',
                        'property': meta.get('property') or meta.get('name'),
                        'text': content
                    })

        return structured_data

    def extract_social_media_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Extract data from social media platforms"""
        data = []
        domain = urlparse(url).netloc.lower()

        if 'twitter.com' in domain or 'x.com' in domain:
            # Twitter/X posts
            tweets = soup.select('[data-testid="tweet"]')
            for tweet in tweets:
                text_elem = tweet.select_one('[data-testid="tweetText"]')
                if text_elem:
                    data.append({
                        'type': 'tweet',
                        'category': 'social_content',
                        'text': clean_text(text_elem.get_text()),
                        'platform': 'twitter'
                    })

        elif 'facebook.com' in domain:
            # Facebook posts
            posts = soup.select('[data-pagelet="FeedUnit"]')
            for post in posts:
                text_elem = post.select_one('[data-ad-preview="message"]')
                if text_elem:
                    data.append({
                        'type': 'facebook_post',
                        'category': 'social_content',
                        'text': clean_text(text_elem.get_text()),
                        'platform': 'facebook'
                    })

        # If no specific social media data found, use general extraction
        if not data:
            data = self._extract_general_content(soup)

        return data

    def extract_university_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Extract university/educational website data"""
        data = []

        try:
            # University name/title
            title_selectors = [
                'h1', '.university-name', '.institution-name',
                '[data-testid="university-name"]', '.site-title'
            ]

            for selector in title_selectors:
                title_elem = soup.select_one(selector)
                if title_elem:
                    title_text = clean_text(title_elem.get_text())
                    if title_text and len(title_text) > 3:
                        data.append({
                            'type': 'institution_name',
                            'category': 'university_info',
                            'text': title_text,
                            'selector': selector
                        })
                        break

            # Programs/Departments
            program_selectors = [
                '.program', '.department', '.course', '.degree',
                '[class*="program"]', '[class*="department"]'
            ]

            for selector in program_selectors:
                elements = soup.select(selector)
                for elem in elements[:10]:  # Limit to 10 items
                    text = clean_text(elem.get_text())
                    if text and len(text) > 5:
                        data.append({
                            'type': 'program',
                            'category': 'academic_info',
                            'text': text,
                            'selector': selector
                        })

            # Contact information
            contact_selectors = [
                '.contact-info', '.phone', '.email', '.address',
                '[class*="contact"]', '[class*="phone"]'
            ]

            for selector in contact_selectors:
                elements = soup.select(selector)
                for elem in elements[:5]:
                    text = clean_text(elem.get_text())
                    if text and len(text) > 3:
                        data.append({
                            'type': 'contact_info',
                            'category': 'university_info',
                            'text': text,
                            'selector': selector
                        })

            # News/Events
            news_selectors = [
                '.news', '.event', '.announcement', '.post',
                '[class*="news"]', '[class*="event"]'
            ]

            for selector in news_selectors:
                elements = soup.select(selector)
                for elem in elements[:10]:
                    text = clean_text(elem.get_text())
                    if text and len(text) > 10:
                        data.append({
                            'type': 'news_event',
                            'category': 'university_content',
                            'text': text,
                            'selector': selector
                        })

            # If no specific data found, fall back to general extraction
            if not data:
                data = self._extract_general_content(soup)

        except Exception as e:
            logger.error(f"Error extracting university data: {e}")
            data = self._extract_general_content(soup)

        return data

    def extract_ecommerce_data(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Extract e-commerce specific data"""
        data = []

        # Product information
        product_selectors = {
            'title': ['h1', '.product-title', '#product-title', '[data-automation-id="product-title"]'],
            'price': ['.price', '.product-price', '[data-automation-id="product-price"]', '.a-price'],
            'description': ['.product-description', '.product-details', '.feature-bullets'],
            'rating': ['.rating', '.stars', '.review-rating'],
            'reviews': ['.review', '.customer-review']
        }

        for data_type, selectors in product_selectors.items():
            for selector in selectors:
                elements = soup.select(selector)
                for element in elements:
                    text = clean_text(element.get_text())
                    if text:
                        data.append({
                            'type': f'product_{data_type}',
                            'category': 'ecommerce',
                            'text': text,
                            'selector': selector
                        })
                        break

        return data

    def scrape(self, url: str, data_type: str = 'text') -> Dict[str, Any]:
        """Main scraping method with enhanced capabilities"""
        try:
            # Validate URL
            if not validate_url(url):
                return {
                    'success': False,
                    'data_type': data_type,
                    'count': 0,
                    'data': [],
                    'error': f'Invalid URL: {url}',
                    'url': url,
                    'timestamp': datetime.now().isoformat()
                }

            # Normalize URL
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url

            # Fetch content
            html_content, final_url = self.fetch_page_content(url)
            soup = BeautifulSoup(html_content, 'html.parser')

            # Remove unwanted elements
            for element in soup(['script', 'style', 'noscript', 'nav', 'footer']):
                element.decompose()

            # Detect website type and use appropriate extractor
            website_type = self.detect_website_type(url, soup)
            logger.info(f"Detected website type: {website_type} for {url}")

            extracted_data = []

            if website_type == 'linkedin':
                extracted_data = self.extract_linkedin_data(soup, url)
            elif website_type == 'university':
                extracted_data = self.extract_university_data(soup, url)
            elif website_type == 'social_media':
                extracted_data = self.extract_social_media_data(soup, url)
            elif website_type == 'ecommerce':
                extracted_data = self.extract_ecommerce_data(soup, url)
            elif website_type == 'structured_data':
                extracted_data = self.extract_structured_data(soup)
                # Also add general content
                extracted_data.extend(self._extract_general_content(soup))
            else:
                extracted_data = self._extract_general_content(soup)

            # Filter by data type if not 'text'
            if data_type not in ['text', 'linkedin_profile', 'linkedin_company', 'linkedin_jobs', 'social_posts', 'ecommerce_products']:
                if data_type == 'images':
                    extracted_data = self._extract_images(soup, final_url)
                elif data_type == 'links':
                    extracted_data = self._extract_links(soup, final_url)
                elif data_type == 'emails':
                    extracted_data = self._extract_emails(html_content)

            logger.info(f"Successfully scraped {len(extracted_data)} items from {url} (type: {website_type})")

            result = format_scrape_result(extracted_data, data_type)
            result.update({
                'url': final_url,
                'original_url': url,
                'website_type': website_type,
                'timestamp': datetime.now().isoformat()
            })

            return result

        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return {
                'success': False,
                'data_type': data_type,
                'count': 0,
                'data': [],
                'error': str(e),
                'url': url,
                'timestamp': datetime.now().isoformat()
            }

    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        """Extract images from the webpage"""
        images = []

        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if not src:
                continue

            # Convert relative URLs to absolute
            if src.startswith('//'):
                src = 'https:' + src
            elif src.startswith('/'):
                src = urljoin(base_url, src)
            elif not src.startswith(('http://', 'https://')):
                src = urljoin(base_url, src)

            # Skip data URLs and invalid images
            if src.startswith('data:') or not is_valid_image_url(src):
                continue

            images.append({
                'type': 'image',
                'url': src,
                'alt': img.get('alt', ''),
                'title': img.get('title', ''),
                'width': img.get('width', ''),
                'height': img.get('height', ''),
                'class': ' '.join(img.get('class', [])),
                'text': f"Image: {img.get('alt', 'No alt text')} ({src})"
            })

        return images

    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, Any]]:
        """Extract links from the webpage"""
        links = []

        for link in soup.find_all('a', href=True):
            href = link['href']
            text = clean_text(link.get_text())

            # Convert relative URLs to absolute
            if href.startswith('//'):
                href = 'https:' + href
            elif href.startswith('/'):
                href = urljoin(base_url, href)
            elif not href.startswith(('http://', 'https://', 'mailto:', 'tel:')):
                href = urljoin(base_url, href)

            # Skip empty links and anchors
            if href.startswith('#') or not href.strip():
                continue

            link_type = 'external' if href.startswith(('http://', 'https://')) else 'internal'
            if href.startswith('mailto:'):
                link_type = 'email'
            elif href.startswith('tel:'):
                link_type = 'phone'

            links.append({
                'type': 'link',
                'url': href,
                'text': text,
                'title': link.get('title', ''),
                'target': link.get('target', ''),
                'rel': ' '.join(link.get('rel', [])),
                'link_type': link_type,
                'domain': urlparse(href).netloc if href.startswith(('http://', 'https://')) else ''
            })

        return links

    def _extract_emails(self, html_content: str) -> List[Dict[str, Any]]:
        """Extract email addresses from HTML content"""
        emails = extract_emails(html_content)
        email_data = []

        for email in emails:
            email_data.append({
                'type': 'email',
                'email': email,
                'domain': email.split('@')[1] if '@' in email else '',
                'text': f"Email: {email}"
            })

        return email_data
