"""
Utility functions for DataZen web scraper
"""

import re
import requests
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser
import logging
from typing import List, Optional, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_url(url: str) -> bool:
    """
    Validate if the URL is properly formatted
    
    Args:
        url (str): URL to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False

def check_robots_txt(url: str, user_agent: str = "*") -> bool:
    """
    Check if scraping is allowed according to robots.txt
    
    Args:
        url (str): URL to check
        user_agent (str): User agent string
        
    Returns:
        bool: True if allowed, False if disallowed
    """
    try:
        parsed_url = urlparse(url)
        robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
        
        rp = RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        
        return rp.can_fetch(user_agent, url)
    except Exception as e:
        logger.warning(f"Could not check robots.txt for {url}: {e}")
        # If we can't check robots.txt, allow scraping
        return True

def extract_emails(text: str) -> List[str]:
    """
    Extract email addresses from text using regex
    
    Args:
        text (str): Text to search for emails
        
    Returns:
        List[str]: List of unique email addresses found
    """
    email_pattern = r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return list(set(emails))  # Remove duplicates

def clean_text(text: str) -> str:
    """
    Clean and normalize text content
    
    Args:
        text (str): Raw text to clean
        
    Returns:
        str: Cleaned text
    """
    if not text:
        return ""
    
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove common unwanted characters
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', text)
    
    return text

def normalize_url(url: str, base_url: str) -> str:
    """
    Normalize and resolve relative URLs
    
    Args:
        url (str): URL to normalize
        base_url (str): Base URL for resolving relative URLs
        
    Returns:
        str: Normalized absolute URL
    """
    try:
        return urljoin(base_url, url)
    except Exception:
        return url

def is_valid_image_url(url: str) -> bool:
    """
    Check if URL points to a valid image
    
    Args:
        url (str): URL to check
        
    Returns:
        bool: True if likely an image URL
    """
    if not url:
        return False
    
    # Check file extension
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'}
    parsed = urlparse(url.lower())
    path = parsed.path
    
    # Check if path ends with image extension
    for ext in image_extensions:
        if path.endswith(ext):
            return True
    
    return False

def format_scrape_result(data: List[Any], data_type: str) -> Dict[str, Any]:
    """
    Format scraping results into a standardized structure
    
    Args:
        data (List[Any]): Raw scraped data
        data_type (str): Type of data (text, images, links, emails)
        
    Returns:
        Dict[str, Any]: Formatted result
    """
    return {
        "success": True,
        "data_type": data_type,
        "count": len(data),
        "data": data,
        "timestamp": None  # Will be set by the calling function
    }

def get_domain_from_url(url: str) -> Optional[str]:
    """
    Extract domain from URL
    
    Args:
        url (str): URL to extract domain from
        
    Returns:
        Optional[str]: Domain name or None if invalid
    """
    try:
        parsed = urlparse(url)
        return parsed.netloc
    except Exception:
        return None

def truncate_html(html: str, max_size_mb: float = 2.0) -> str:
    """
    Truncate HTML content if it exceeds size limit
    
    Args:
        html (str): HTML content
        max_size_mb (float): Maximum size in MB
        
    Returns:
        str: Truncated HTML if necessary
    """
    max_size_bytes = int(max_size_mb * 1024 * 1024)
    html_bytes = html.encode('utf-8')
    
    if len(html_bytes) > max_size_bytes:
        # Truncate to max size
        truncated_bytes = html_bytes[:max_size_bytes]
        # Try to decode, handling potential encoding issues
        try:
            return truncated_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If truncation breaks encoding, find last complete character
            for i in range(len(truncated_bytes) - 1, -1, -1):
                try:
                    return truncated_bytes[:i].decode('utf-8')
                except UnicodeDecodeError:
                    continue
            return ""  # Fallback if all fails
    
    return html
