# 🧠 DataZen — Real-Time AI Web Scraper

DataZen is a powerful, real-time web scraper that allows users to instantly extract text, images, links, or emails from any public website. With optional AI-powered data structuring using Gemini API.

## 🚀 Features

- **Real-time scraping** of any public website
- **Multiple data types**: Text, Images, Links, Emails
- **AI-powered extraction** (optional) using Gemini API
- **Instant downloads** in CSV or JSON format
- **No authentication required**
- **Respects robots.txt**
- **Clean, modern UI** with Tailwind CSS
- **Error handling** and loading states
- **Responsive design** for all devices

## 🧱 Tech Stack

### Frontend
- **Next.js 15** with React 18
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **FastAPI** (Python)
- **Playwright** for browser automation
- **BeautifulSoup** for HTML parsing
- **Gemini API** for AI-powered extraction
- **Pydantic** for data validation

## 📁 Project Structure

```
DataZen/
├── frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── page.tsx        # Main page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── loading.tsx     # Loading page
│   │   │   └── not-found.tsx   # 404 page
│   │   ├── components/         # React components
│   │   │   ├── ScrapeForm.tsx  # Main form component
│   │   │   ├── ResultTable.tsx # Results display
│   │   │   ├── Loader.tsx      # Loading components
│   │   │   └── ErrorBoundary.tsx # Error handling
│   │   └── lib/
│   │       └── api.ts          # API utilities
│   ├── package.json
│   └── .env.local
├── backend/                     # FastAPI backend
│   ├── routes/
│   │   └── scrape.py           # API endpoints
│   ├── services/
│   │   ├── scraper.py          # Core scraping logic
│   │   ├── gemini_api.py       # AI integration
│   │   └── utils.py            # Utility functions
│   ├── main.py                 # FastAPI app
│   ├── simple_server.py        # Demo server
│   ├── test_scraper.py         # Test script
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🚀 Quick Start

### Option 1: Demo Mode (No Dependencies)

For a quick demo with mock data:

1. **Start the demo backend:**
   ```bash
   cd backend
   python simple_server.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Option 2: Full Installation

For real web scraping capabilities:

1. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   playwright install  # Install browser binaries
   cp .env.example .env
   # Edit .env and add your Gemini API key
   uvicorn main:app --reload
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔧 Environment Variables

### Backend (.env)
```bash
# Required for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Optional settings
DEBUG=True
LOG_LEVEL=info
MAX_HTML_SIZE_MB=2
SCRAPE_TIMEOUT_SECONDS=20
MAX_CONCURRENT_SCRAPES=5
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📝 Usage

1. **Enter a website URL** (e.g., https://example.com)
2. **Select data type:**
   - **Text**: Extract visible text content, headings, paragraphs
   - **Images**: Extract image URLs and metadata
   - **Links**: Extract all links and their information
   - **Emails**: Find email addresses and contact info
3. **Optional AI mode**: Enable for intelligent data structuring
4. **Custom prompts**: Add specific instructions for AI processing
5. **Start scraping** and view real-time progress
6. **Download results** as CSV or JSON

## 🎯 API Endpoints

### Core Endpoints
- `GET /` - API information
- `GET /health` - Health check
- `POST /api/scrape` - Main scraping endpoint
- `GET /api/test-ai` - Test AI connection
- `GET /api/supported-types` - Get supported data types

### Scrape Request Format
```json
{
  "url": "https://example.com",
  "data_type": "text|images|links|emails",
  "ai_mode": false,
  "custom_prompt": "Optional AI instructions",
  "check_robots": true
}
```

## 🧪 Testing

### Test the backend:
```bash
cd backend
python test_scraper.py
```

### Test API endpoints:
```bash
# Health check
curl http://localhost:8000/health

# Test scraping (demo mode)
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "data_type": "text"}'
```

## 🔒 Security & Ethics

- **Respects robots.txt** by default
- **Rate limiting** to prevent abuse
- **No data storage** - everything processed in memory
- **CORS enabled** for frontend integration
- **Input validation** and sanitization
- **Error handling** for failed requests

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Backend (Railway/Render)
1. Create account on Railway or Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy

## 🛠️ Development

### Adding new data types:
1. Update `scraper.py` with extraction logic
2. Add validation in `routes/scrape.py`
3. Update frontend types in `lib/api.ts`
4. Add UI options in `ScrapeForm.tsx`

### Extending AI capabilities:
1. Modify prompts in `gemini_api.py`
2. Add new processing functions
3. Update response handling

## 📊 Performance

- **Scraping speed**: 10-20 seconds per website
- **Concurrent requests**: Up to 5 (configurable)
- **Memory usage**: ~2MB HTML limit per request
- **Browser automation**: Headless Chromium via Playwright

## 🐛 Troubleshooting

### Common Issues:

1. **"Cannot connect to API"**
   - Ensure backend is running on port 8000
   - Check CORS settings

2. **"Playwright browser not found"**
   - Run `playwright install`

3. **"AI not available"**
   - Check Gemini API key in .env
   - Verify API key permissions

4. **"Scraping failed"**
   - Check if website allows scraping (robots.txt)
   - Try with `check_robots: false` for testing

## 📈 Future Enhancements

- [ ] Bulk URL processing
- [ ] Scheduled scraping
- [ ] Data export to databases
- [ ] Custom extraction rules
- [ ] Proxy support
- [ ] Advanced AI prompts
- [ ] Real-time collaboration
- [ ] API rate limiting dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## ⚠️ Disclaimer

DataZen scrapes only publicly available data and respects robots.txt. Use responsibly and in accordance with website terms of service. The developers are not responsible for misuse of this tool.

## 📄 License

MIT License - feel free to use and modify as needed.

---

**Built with ❤️ by the DataZen Team**
