"""
Gemini AI integration for DataZen
Provides AI-powered data extraction and structuring capabilities
"""

import os
import logging
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiAI:
    """Gemini AI integration for intelligent data extraction"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini AI client
        
        Args:
            api_key (Optional[str]): Gemini API key. If None, reads from environment
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("Gemini API key not provided. Set GEMINI_API_KEY environment variable.")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize model (using available Gemini model)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Generation config for consistent outputs
        self.generation_config = {
            'temperature': 0.1,
            'top_p': 0.8,
            'top_k': 40,
            'max_output_tokens': 8192,
        }
    
    def _create_extraction_prompt(self, html_content: str, data_type: str, custom_prompt: str = "") -> str:
        """
        Create a prompt for data extraction based on data type
        
        Args:
            html_content (str): HTML content to analyze
            data_type (str): Type of data to extract
            custom_prompt (str): Custom user prompt
            
        Returns:
            str: Formatted prompt for Gemini
        """
        base_prompt = f"""
You are an expert web scraper and data analyst. Analyze the following HTML content and extract structured data.

HTML Content:
{html_content[:10000]}  # Limit to first 10k characters to avoid token limits

Task: Extract {data_type} data from this HTML content.
"""
        
        if data_type == 'text':
            specific_prompt = """
Extract all meaningful text content and organize it into structured categories.
Return a JSON array where each object has:
- "text": the actual text content
- "category": type of content (heading, paragraph, list_item, etc.)
- "importance": score from 1-10 indicating content importance
- "length": character count

Focus on:
- Main content, headings, and important paragraphs
- Product descriptions, article content
- Navigation and menu items
- Contact information
- Skip boilerplate text like "Click here", "Read more"
"""
        
        elif data_type == 'images':
            specific_prompt = """
Extract all image information and organize it meaningfully.
Return a JSON array where each object has:
- "url": the image URL
- "alt": alt text description
- "context": surrounding text or context
- "type": image type (logo, product, banner, icon, etc.)
- "relevance": score from 1-10 for content relevance

Focus on:
- Product images, logos, banners
- Content-related images
- Skip decorative elements and icons unless significant
"""
        
        elif data_type == 'links':
            specific_prompt = """
Extract and categorize all links meaningfully.
Return a JSON array where each object has:
- "url": the link URL
- "text": link text or description
- "category": type of link (navigation, external, internal, social, etc.)
- "importance": score from 1-10 for link importance
- "section": which part of page (header, footer, content, sidebar)

Focus on:
- Navigation links, important external links
- Social media links, contact links
- Product or service links
- Skip repetitive or unimportant links
"""
        
        elif data_type == 'emails':
            specific_prompt = """
Extract all email addresses and related contact information.
Return a JSON array where each object has:
- "email": the email address
- "context": surrounding text or purpose
- "type": email type (contact, support, sales, info, etc.)
- "department": if identifiable (sales, support, general, etc.)

Focus on:
- Contact emails, support emails
- Business emails, department-specific emails
- Skip newsletter signup placeholders unless they're actual contacts
"""
        
        else:
            specific_prompt = f"""
Extract {data_type} data and structure it logically.
Return a JSON array with relevant fields for this data type.
"""
        
        # Add custom prompt if provided
        if custom_prompt:
            specific_prompt += f"\n\nAdditional instructions: {custom_prompt}"
        
        specific_prompt += """

IMPORTANT:
- Return ONLY valid JSON, no additional text or explanations
- Ensure all strings are properly escaped
- Limit results to the most relevant and important items (max 100 items)
- If no relevant data is found, return an empty array []
"""
        
        return base_prompt + specific_prompt
    
    async def extract_structured_data(
        self, 
        html_content: str, 
        data_type: str, 
        custom_prompt: str = ""
    ) -> Dict[str, Any]:
        """
        Use Gemini AI to extract and structure data from HTML
        
        Args:
            html_content (str): HTML content to analyze
            data_type (str): Type of data to extract
            custom_prompt (str): Additional custom instructions
            
        Returns:
            Dict[str, Any]: Structured extraction results
        """
        try:
            # Create extraction prompt
            prompt = self._create_extraction_prompt(html_content, data_type, custom_prompt)
            
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config=self.generation_config
            )
            
            # Parse response
            if response.text:
                try:
                    # Try to parse as JSON
                    structured_data = json.loads(response.text.strip())
                    
                    # Validate that it's a list
                    if not isinstance(structured_data, list):
                        structured_data = [structured_data] if structured_data else []
                    
                    return {
                        "success": True,
                        "data_type": data_type,
                        "count": len(structured_data),
                        "data": structured_data,
                        "ai_processed": True,
                        "timestamp": datetime.now().isoformat(),
                        "model": "gemini-pro"
                    }
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse Gemini response as JSON: {e}")
                    logger.error(f"Response text: {response.text[:500]}...")
                    
                    # Fallback: try to extract JSON from response
                    json_match = self._extract_json_from_text(response.text)
                    if json_match:
                        return {
                            "success": True,
                            "data_type": data_type,
                            "count": len(json_match),
                            "data": json_match,
                            "ai_processed": True,
                            "timestamp": datetime.now().isoformat(),
                            "model": "gemini-pro",
                            "note": "JSON extracted from mixed response"
                        }
                    
                    return {
                        "success": False,
                        "error": f"Invalid JSON response from AI: {str(e)}",
                        "data_type": data_type,
                        "ai_processed": True,
                        "timestamp": datetime.now().isoformat()
                    }
            else:
                return {
                    "success": False,
                    "error": "Empty response from Gemini AI",
                    "data_type": data_type,
                    "ai_processed": True,
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Gemini AI extraction failed: {str(e)}")
            return {
                "success": False,
                "error": f"AI processing failed: {str(e)}",
                "data_type": data_type,
                "ai_processed": True,
                "timestamp": datetime.now().isoformat()
            }
    
    def _extract_json_from_text(self, text: str) -> Optional[List[Dict[str, Any]]]:
        """
        Try to extract JSON array from mixed text response
        
        Args:
            text (str): Text that might contain JSON
            
        Returns:
            Optional[List[Dict[str, Any]]]: Extracted JSON data or None
        """
        try:
            # Look for JSON array patterns
            import re
            
            # Try to find JSON array in the text
            json_pattern = r'\[.*?\]'
            matches = re.findall(json_pattern, text, re.DOTALL)
            
            for match in matches:
                try:
                    parsed = json.loads(match)
                    if isinstance(parsed, list):
                        return parsed
                except json.JSONDecodeError:
                    continue
            
            # Try to find JSON object and wrap in array
            json_pattern = r'\{.*?\}'
            matches = re.findall(json_pattern, text, re.DOTALL)
            
            for match in matches:
                try:
                    parsed = json.loads(match)
                    if isinstance(parsed, dict):
                        return [parsed]
                except json.JSONDecodeError:
                    continue
                    
        except Exception as e:
            logger.error(f"Failed to extract JSON from text: {e}")
        
        return None
    
    def is_available(self) -> bool:
        """
        Check if Gemini AI is available and configured
        
        Returns:
            bool: True if available, False otherwise
        """
        return bool(self.api_key)
    
    async def test_connection(self) -> Dict[str, Any]:
        """
        Test the Gemini AI connection
        
        Returns:
            Dict[str, Any]: Test result
        """
        try:
            response = self.model.generate_content(
                "Respond with exactly this JSON: {\"status\": \"connected\", \"model\": \"gemini-pro\"}",
                generation_config=self.generation_config
            )
            
            if response.text:
                return {
                    "success": True,
                    "message": "Gemini AI connection successful",
                    "model": "gemini-pro"
                }
            else:
                return {
                    "success": False,
                    "error": "No response from Gemini AI"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Connection test failed: {str(e)}"
            }
