"""
Simple test server for DataZen backend
This is a minimal version that can run without all dependencies
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
import re
from datetime import datetime

class DataZenHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/':
            response = {
                "message": "Welcome to DataZen API",
                "description": "Real-time web scraper with AI-powered data extraction",
                "version": "1.0.0",
                "status": "Demo Mode - Install full dependencies for complete functionality",
                "docs": "/docs",
                "endpoints": {
                    "scrape": "/api/scrape",
                    "health": "/health"
                }
            }
        elif self.path == '/health' or self.path == '/api/health':
            response = {
                "status": "demo",
                "timestamp": datetime.now().isoformat(),
                "services": {
                    "scraper": "demo mode",
                    "ai": "not configured"
                },
                "version": "1.0.0",
                "note": "This is a demo server. Install full dependencies for complete functionality."
            }
        elif self.path == '/api/test-ai':
            response = {
                "success": False,
                "available": False,
                "error": "Demo mode - AI not available"
            }
        elif self.path == '/api/supported-types':
            response = {
                "supported_types": {
                    "text": {
                        "description": "Extract visible text content from web pages",
                        "examples": ["paragraphs", "headings", "articles", "product descriptions"]
                    },
                    "images": {
                        "description": "Extract image URLs and metadata",
                        "examples": ["product images", "logos", "banners", "gallery images"]
                    },
                    "links": {
                        "description": "Extract all links and their metadata",
                        "examples": ["navigation links", "external links", "social media links"]
                    },
                    "emails": {
                        "description": "Extract email addresses and contact information",
                        "examples": ["contact emails", "support emails", "business emails"]
                    }
                },
                "ai_mode": {
                    "description": "Enable AI-powered data structuring and analysis",
                    "benefits": ["Better categorization", "Relevance scoring", "Context analysis"]
                }
            }
        else:
            self.send_response(404)
            response = {"error": "Not found"}
        
        self.wfile.write(json.dumps(response, indent=2).encode())

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/scrape':
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                request_data = json.loads(post_data.decode('utf-8'))
                
                # Simulate scraping with demo data
                url = request_data.get('url', '')
                data_type = request_data.get('data_type', 'text')
                ai_mode = request_data.get('ai_mode', False)
                
                # Generate demo data based on type
                if data_type == 'text':
                    demo_data = [
                        {"text": "Welcome to Example.com", "tag": "h1", "length": 21},
                        {"text": "This is a demo response from DataZen backend", "tag": "p", "length": 45},
                        {"text": "Install full dependencies for real web scraping", "tag": "p", "length": 48}
                    ]
                elif data_type == 'images':
                    demo_data = [
                        {"url": "https://example.com/logo.png", "alt": "Company Logo", "title": "", "width": "200", "height": "100"},
                        {"url": "https://example.com/banner.jpg", "alt": "Main Banner", "title": "Welcome Banner", "width": "800", "height": "400"}
                    ]
                elif data_type == 'links':
                    demo_data = [
                        {"url": "https://example.com/about", "text": "About Us", "title": "Learn more about us", "target": ""},
                        {"url": "https://example.com/contact", "text": "Contact", "title": "Get in touch", "target": ""},
                        {"url": "https://github.com", "text": "GitHub", "title": "Visit our GitHub", "target": "_blank"}
                    ]
                elif data_type == 'emails':
                    demo_data = [
                        {"email": "info@example.com", "domain": "example.com"},
                        {"email": "support@example.com", "domain": "example.com"}
                    ]
                else:
                    demo_data = []
                
                response = {
                    "success": True,
                    "data_type": data_type,
                    "count": len(demo_data),
                    "data": demo_data,
                    "timestamp": datetime.now().isoformat(),
                    "url": url,
                    "original_url": url,
                    "ai_processed": ai_mode,
                    "processing_time_seconds": 1.5,
                    "note": "This is demo data. Install full dependencies for real web scraping."
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response, indent=2).encode())
                
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {
                    "success": False,
                    "error": f"Demo server error: {str(e)}",
                    "timestamp": datetime.now().isoformat()
                }
                self.wfile.write(json.dumps(error_response, indent=2).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {"error": "Not found"}
            self.wfile.write(json.dumps(error_response, indent=2).encode())

def run_server(port=8000):
    """Run the demo server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, DataZenHandler)
    print(f"🚀 DataZen Demo Server running on http://localhost:{port}")
    print("📝 Note: This is a demo server with mock data.")
    print("💡 Install full dependencies (FastAPI, Playwright, etc.) for real web scraping.")
    print("🛑 Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
