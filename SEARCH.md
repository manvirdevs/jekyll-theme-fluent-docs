# Search Functionality

This theme includes a fully client-side search implementation using Lunr.js.

## Features

- **Client-side search** - No server required, works on GitHub Pages
- **Real-time results** - Search as you type with debouncing
- **Keyboard navigation** - Arrow keys, Enter, and Escape support
- **Highlighted matches** - Search terms are highlighted in results
- **Responsive** - Works on mobile and desktop
- **Fast** - Indexed search with Lunr.js
- **Automatic generation** - Search index generated automatically on build

## How It Works

### 1. Search Index Generation

The theme automatically generates an `assets/search.json` file at build time containing all pages and posts:

```json
[
  {
    "id": "page-slug",
    "title": "Page Title",
    "url": "/page/",
    "content": "Full page content...",
    "excerpt": "Short excerpt..."
  }
]
```

### 2. Client-Side Indexing

When a user first searches, the browser:
1. Fetches `assets/search.json`
2. Builds a Lunr.js search index
3. Caches it for subsequent searches

### 3. Search Execution

As users type:
- Results appear after 2+ characters
- 300ms debounce prevents excessive searches
- Up to 10 results shown in dropdown
- Click or Enter to navigate to result

## Keyboard Shortcuts

- **Type** - Start searching (when focused)
- **↓/↑** - Navigate results
- **Enter** - Go to selected result
- **Escape** - Close search results

## Excluding Pages from Search

Add to page front matter:

```yaml
---
title: My Page
exclude_from_search: true
---
```

## Customization

### Search Field Placeholder

Edit `_includes/topbar.html`:

```html
<fluent-text-field
  placeholder="Your custom placeholder..."
  ...
>
```

### Maximum Results

Edit `assets/js/docs.js`:

```javascript
const maxResults = 10; // Change this number
```

### Search Boost Values

In `docs.js`, adjust field importance:

```javascript
searchIndex = lunr(function() {
  this.field('title', { boost: 10 });    // Title most important
  this.field('excerpt', { boost: 5 });   // Excerpt medium
  this.field('content');                  // Content standard
});
```

### Styling

Search results styles are in `_sass/_components.scss`:

```scss
.search-results {
  // Dropdown container
}

.search-result-item {
  // Individual result
}

.search-result-title {
  // Result title
}
```

## Browser Compatibility

- **Modern browsers** - Full support (Chrome, Firefox, Safari, Edge)
- **IE11** - Not supported (Lunr.js requires modern JS)

## Performance

- **Index size** - ~100KB for 100 pages
- **Index build** - ~500ms on first search
- **Search speed** - <50ms per query
- **Caching** - Index cached after first load

## Troubleshooting

### Search not working

1. Check browser console for errors
2. Verify `/search.json` is accessible
3. Ensure `lunr.min.js` is loaded before `docs.js`

### No results appearing

1. Check that pages have content
2. Verify pages don't have `exclude_from_search: true`
3. Try rebuilding the Jekyll site

### Search results cut off

The search results dropdown has a max-height. Adjust in `_components.scss`:

```scss
.search-results {
  max-height: 500px; // Increase this value
}
```

## Technical Details

- **Library**: Lunr.js v2.3.9
- **Index format**: Inverted index with stemming
- **Languages**: English (default), extensible to other languages
- **Tokenization**: Whitespace and punctuation-based
- **Stemming**: Porter stemmer algorithm
