# AI News Feed - Project TODO

## Core Features

### Backend - Data Aggregation
- [x] Set up RSS feed fetching and parsing system
- [x] Implement database schema for storing feed items (articles, tweets, GitHub repos, AI tools)
- [x] Create periodic refresh/cron job for fetching new content
- [x] Add caching layer to avoid repeated fetches
- [x] Implement Twitter/X content fetching (via Nitter proxy or similar)
- [x] Implement GitHub Trending scraping
- [x] Implement AI Tools directory scraping (theresanaiforthat.com)

### Frontend - UI/UX
- [x] Design dark-themed, responsive layout
- [x] Create main feed view with unified item display
- [x] Implement filtering tabs (All, News Articles, Twitter/X, GitHub, AI Tools)
- [x] Implement per-source filtering dropdown
- [x] Add search/keyword filter bar
- [x] Display relative timestamps (e.g., "2 hours ago")
- [x] Optimize for mobile and desktop responsiveness

### Feed Sources
- [x] Towards Data Science (RSS: towardsdatascience.com/feed)
- [x] TechXplore ML/AI (scrape fallback)
- [x] arXiv cs.AI (RSS: rss.arxiv.org/rss/cs.AI)
- [x] DeepLearning.AI The Batch (RSS)
- [x] Emergent Mind (scrape)
- [x] Papers With Code alternatives (scrape)
- [x] GitHub Trending (scrape: github.com/trending)
- [x] There's An AI For That (scrape: theresanaiforthat.com)

### Twitter/X Accounts to Include
- [x] @karpathy
- [x] @ylecun
- [x] @jeremyphoward
- [x] @hardmaru
- [x] @omarsar0
- [x] @seb_ruder
- [x] @goodside
- [x] @emollick
- [x] @_akhaliq
- [x] @mreflow
- [x] @heyBarsee
- [x] @bilawalsidhu

### Testing & Deployment
- [x] Write unit tests for data fetching and parsing
- [x] Test feed display and filtering functionality
- [x] Responsive design testing (mobile/tablet/desktop)
- [x] Deploy to public URL
- [x] Set up monitoring for feed refresh health

## Implementation Notes
- Backend services use RSS parser, Cheerio for web scraping, and Nitter proxy for Twitter
- Feed items cached in database with periodic refresh every 30 minutes
- Frontend uses React with tRPC for type-safe API calls
- Dark theme with blue accent colors for comfortable reading
- Responsive design optimized for mobile and desktop
