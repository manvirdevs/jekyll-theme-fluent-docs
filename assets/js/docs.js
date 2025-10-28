// Documentation site JavaScript functionality

(function () {
  "use strict";

  // Theme management
  function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme") || "light";

    // Set initial theme
    document.documentElement.setAttribute("data-theme", currentTheme);
    updateThemeIcon(currentTheme);

    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        const newTheme =
          document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcon(newTheme);
      });
    }
  }

  function updateThemeIcon(theme) {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      const icon = themeToggle.querySelector(".ms-Icon");
      if (icon) {
        icon.className =
          theme === "dark" ? "ms-Icon ms-Icon--Sunny" : "ms-Icon ms-Icon--ClearNight";
      }
    }
  }

  // // TOC is now generated statically by Jekyll
  // // Only handle scroll highlighting for existing TOC using Intersection Observer
  // function initTOCScrollHighlight() {
  //   const tocLinks = document.querySelectorAll(".toc-link");

  //   if (tocLinks.length === 0) return;

  //   const headings = document.querySelectorAll(
  //     ".docs-body h2, .docs-body h3, .docs-body h4, .docs-body h5, .docs-body h6"
  //   );

  //   if (headings.length === 0) return;

  //   const observerOptions = {
  //     rootMargin: "-80px 0px 0px 0px", // Offset for fixed header and trigger when in top third
  //     // threshold: [0, 0.5, 1]
  //   };

  //   let activeHeading = null;

  //   const observer = new IntersectionObserver(function (entries) {
  //     entries.forEach(function (entry) {
  //       if (entry.isIntersecting) {
  //         activeHeading = entry.target;
  //         updateActiveTOCLink(activeHeading.id);
  //       }
  //     });
  //   }, observerOptions);

  //   function updateActiveTOCLink(headingId) {
  //     // Remove active class from all TOC links
  //     tocLinks.forEach(function (link) {
  //       link.classList.remove("active");
  //     });

  //     // Add active class to current section
  //     const activeLink = document.querySelector(`.toc-link[href="#${headingId}"]`);
  //     if (activeLink) {
  //       activeLink.classList.add("active");
  //     }
  //   }

  //   // Observe all headings
  //   headings.forEach(function (heading) {
  //     observer.observe(heading);
  //   });
  // }

  // TOC is now generated statically by Jekyll
  // Only handle scroll highlighting for existing TOC using Intersection Observer
  function initTOCScrollHighlight() {
    const tocLinks = document.querySelectorAll(".toc-link");

    if (tocLinks.length === 0) return;

    const headings = document.querySelectorAll(
      ".docs-body h2, .docs-body h3, .docs-body h4, .docs-body h5, .docs-body h6"
    );

    if (headings.length === 0) return;

    // Build hierarchical structure of sections
    const sections = buildSectionHierarchy(headings);
    
    if (sections.length === 0) return;

    const observerOptions = {
      rootMargin: "-80px 0px -40% 0px", // Trigger in top third of viewport
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
    };

    const visibleSections = new Map(); // headingId -> intersectionRatio

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const section = entry.target;
        const headingId = section.dataset.headingId;
        
        if (entry.isIntersecting) {
          visibleSections.set(headingId, entry.intersectionRatio);
        } else {
          visibleSections.delete(headingId);
        }
      });

      updateActiveSection();
    }, observerOptions);

    function buildSectionHierarchy(headings) {
      const sections = [];
      const stack = []; // Track parent sections by level
      
      Array.from(headings).forEach(function(heading) {
        const level = parseInt(heading.tagName.substring(1)); // h2 -> 2, h3 -> 3, etc.
        
        // Pop stack until we find the parent level
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }
        
        const section = {
          id: heading.id,
          level: level,
          heading: heading,
          parent: stack.length > 0 ? stack[stack.length - 1] : null,
          children: [],
          elements: [heading]
        };
        
        // Add as child to parent if exists
        if (section.parent) {
          section.parent.children.push(section);
        } else {
          sections.push(section); // Top-level section
        }
        
        stack.push(section);
      });
      
      // Collect content elements for each section
      sections.forEach(function(topSection) {
        collectSectionContent(topSection, headings);
      });
      
      return sections;
    }

    function collectSectionContent(section, allHeadings) {
      const headingArray = Array.from(allHeadings);
      const currentIndex = headingArray.indexOf(section.heading);
      
      // Find the next heading at the same or higher level (lower number)
      let nextSiblingIndex = headingArray.length;
      for (let i = currentIndex + 1; i < headingArray.length; i++) {
        const nextLevel = parseInt(headingArray[i].tagName.substring(1));
        if (nextLevel <= section.level) {
          nextSiblingIndex = i;
          break;
        }
      }
      
      // Collect all elements between this heading and the next sibling
      let currentElement = section.heading.nextElementSibling;
      const endElement = nextSiblingIndex < headingArray.length ? 
        headingArray[nextSiblingIndex] : null;
      
      while (currentElement && currentElement !== endElement) {
        // Only add non-heading elements (headings are their own sections)
        if (!currentElement.matches('h2, h3, h4, h5, h6')) {
          section.elements.push(currentElement);
        }
        currentElement = currentElement.nextElementSibling;
      }
      
      // Recursively collect content for children
      section.children.forEach(function(child) {
        collectSectionContent(child, allHeadings);
      });
    }

    function updateActiveSection() {
      // Find the most visible section
      let mostVisibleId = null;
      let highestRatio = 0;
      
      visibleSections.forEach(function(ratio, headingId) {
        if (ratio > highestRatio) {
          highestRatio = ratio;
          mostVisibleId = headingId;
        }
      });
      
      if (mostVisibleId) {
        // Find the section object
        const activeSection = findSectionById(sections, mostVisibleId);
        
        if (activeSection) {
          // Collect all ancestor sections that should be highlighted
          const sectionsToHighlight = [];
          let current = activeSection;
          
          while (current) {
            // Only highlight sections that exist in the TOC (H2 and H3)
            // Check if a TOC link exists for this heading
            const tocLink = document.querySelector(`.toc-link[href="#${current.id}"]`);
            if (tocLink) {
              sectionsToHighlight.push(current.id);
            }
            current = current.parent;
          }
          
          updateActiveTOCLinks(sectionsToHighlight);
        }
      }
    }

    function findSectionById(sections, id) {
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].id === id) {
          return sections[i];
        }
        const found = findSectionById(sections[i].children, id);
        if (found) return found;
      }
      return null;
    }

    function updateActiveTOCLinks(headingIds) {
      // Remove active class from all TOC links
      tocLinks.forEach(function (link) {
        link.classList.remove("active");
      });

      // Add active class to all sections in the hierarchy that are in the TOC
      headingIds.forEach(function(headingId) {
        const activeLink = document.querySelector(`.toc-link[href="#${headingId}"]`);
        if (activeLink) {
          activeLink.classList.add("active");
        }
      });
    }

    function wrapSection(section) {
      if (section.elements.length === 0) return;
      
      const container = document.createElement('div');
      container.className = 'toc-section-observer';
      container.dataset.headingId = section.id;
      container.dataset.level = section.level;
      
      const parent = section.heading.parentNode;
      parent.insertBefore(container, section.heading);
      
      // Move only the direct content of this section (not child sections)
      section.elements.forEach(function(element) {
        container.appendChild(element);
      });
      
      observer.observe(container);
      
      // Wrap child sections
      section.children.forEach(function(child) {
        wrapSection(child);
      });
    }

    // Wrap all top-level sections and their children
    sections.forEach(function(section) {
      wrapSection(section);
    });
  }

  // Search functionality
  let searchIndex = null;
  let searchDocuments = null;
  let searchIndexLoading = false;
  let searchIndexLoadError = false;

  function initSearch() {
    const searchInput = document.getElementById("docs-search");
    if (!searchInput) return;

    // Load search index
    loadSearchIndex();

    // Create search results container
    const searchContainer = searchInput.closest('.search-container');
    if (!searchContainer) return;

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    resultsContainer.style.display = 'none';
    searchContainer.appendChild(resultsContainer);

    let searchTimeout = null;

    // Handle input with debouncing
    searchInput.addEventListener("input", function (e) {
      const query = e.target.value.trim();
      
      clearTimeout(searchTimeout);
      
      if (query.length === 0) {
        hideSearchResults(resultsContainer);
        return;
      }
      
      if (query.length < 2) {
        return; // Wait for at least 2 characters
      }

      // Debounce search
      searchTimeout = setTimeout(function() {
        performSearch(query, resultsContainer);
      }, 300);
    });

    // Handle keyboard interactions
    searchInput.addEventListener("keydown", function (e) {
      // Handle Enter key
      if (e.key === "Enter") {
        e.preventDefault();
        
        // If a result is focused, navigate to it
        const focusedResult = resultsContainer.querySelector('.search-result-item.focused');
        if (focusedResult) {
          window.location.href = focusedResult.href;
          return;
        }
        
        // Otherwise, trigger immediate search (bypass debounce)
        const query = e.target.value.trim();
        if (query) {
          clearTimeout(searchTimeout);
          performSearch(query, resultsContainer);
        }
      }

      // Handle arrow keys for navigation
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        navigateResults(resultsContainer, e.key === "ArrowDown" ? 1 : -1);
      }

      // Handle Escape to close results
      if (e.key === "Escape") {
        hideSearchResults(resultsContainer);
        searchInput.blur();
      }
    });

    // Hide results when clicking outside
    document.addEventListener("click", function(e) {
      if (!searchContainer.contains(e.target)) {
        hideSearchResults(resultsContainer);
      }
    });

    // Prevent results from closing when clicking inside
    resultsContainer.addEventListener("click", function(e) {
      e.stopPropagation();
    });
  }

  function loadSearchIndex() {
    if (searchIndex) return Promise.resolve();
    if (searchIndexLoading) return Promise.reject(new Error('Already loading'));
    if (searchIndexLoadError) return Promise.reject(new Error('Previous load failed'));

    searchIndexLoading = true;

    return fetch('/assets/search.json')
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Search index not found: ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        searchDocuments = data;
        
        // Build lunr index
        searchIndex = lunr(function() {
          this.ref('id');
          this.field('title', { boost: 10 });
          this.field('excerpt', { boost: 5 });
          this.field('content');

          data.forEach(function(doc) {
            this.add(doc);
          }, this);
        });
        
        searchIndexLoading = false;
        return searchIndex;
      })
      .catch(function(error) {
        console.error('Failed to load search index:', error);
        searchIndexLoading = false;
        searchIndexLoadError = true;
        throw error; // Re-throw to propagate the error
      });
  }

  function performSearch(query, resultsContainer) {
    if (!searchIndex || !searchDocuments) {
      if (searchIndexLoadError) {
        resultsContainer.innerHTML = '<div class="search-no-results"><span class="ms-Icon ms-Icon--SearchIssue"></span><p>Failed to load search index. Please refresh the page.</p></div>';
        resultsContainer.style.display = 'block';
        return;
      }
      
      if (searchIndexLoading) {
        return; // Already loading, don't trigger again
      }
      
      resultsContainer.innerHTML = '<div class="search-loading">Loading search index...</div>';
      resultsContainer.style.display = 'block';
      
      loadSearchIndex()
        .then(function() {
          performSearch(query, resultsContainer);
        })
        .catch(function(error) {
          resultsContainer.innerHTML = '<div class="search-no-results"><span class="ms-Icon ms-Icon--SearchIssue"></span><p>Failed to load search index: ' + error.message + '</p></div>';
          resultsContainer.style.display = 'block';
        });
      return;
    }

    try {
      const results = searchIndex.search(query);
      displayResults(results, query, resultsContainer);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to simple search
      const results = searchIndex.search(query + '*');
      displayResults(results, query, resultsContainer);
    }
  }

  function displayResults(results, query, container) {
    if (results.length === 0) {
      container.innerHTML = `
        <div class="search-no-results">
          <span class="ms-Icon ms-Icon--SearchIssue"></span>
          <p>No results found for "${escapeHtml(query)}"</p>
        </div>
      `;
      container.style.display = 'block';
      return;
    }

    const maxResults = 10;
    const displayResults = results.slice(0, maxResults);
    
    let html = '<div class="search-results-list">';
    
    displayResults.forEach(function(result) {
      const doc = searchDocuments.find(function(d) {
        return d.id === result.ref;
      });
      
      if (doc) {
        // Create contextual excerpt that includes the search term
        const excerpt = getContextualExcerpt(doc, query);
        html += `
          <a href="${doc.url}" class="search-result-item">
            <div class="search-result-title">${highlightText(doc.title, query)}</div>
            <div class="search-result-excerpt">${excerpt}</div>
            ${doc.date ? `<div class="search-result-date">${doc.date}</div>` : ''}
          </a>
        `;
      }
    });
    
    if (results.length > maxResults) {
      html += `<div class="search-results-more">+ ${results.length - maxResults} more results</div>`;
    }
    
    html += '</div>';
    
    container.innerHTML = html;
    container.style.display = 'block';
  }

  function getContextualExcerpt(doc, query) {
    const contextLength = 150; // Characters to show around the match
    const terms = query.toLowerCase().split(/\s+/).filter(function(term) {
      return term.length >= 2;
    });
    
    // Try to find the query terms in title, excerpt, or content
    let text = doc.content || doc.excerpt || '';
    let matchPosition = -1;
    let matchedTerm = '';
    
    // Find the first occurrence of any search term
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      const pos = text.toLowerCase().indexOf(term);
      if (pos !== -1) {
        matchPosition = pos;
        matchedTerm = term;
        break;
      }
    }
    
    // If no match found in content, fall back to excerpt or beginning
    if (matchPosition === -1) {
      text = doc.excerpt || text;
      const excerpt = text.substring(0, 200);
      return highlightText(excerpt + (text.length > 200 ? '...' : ''), query);
    }
    
    // Calculate excerpt boundaries around the match
    const start = Math.max(0, matchPosition - contextLength / 2);
    const end = Math.min(text.length, matchPosition + matchedTerm.length + contextLength / 2);
    
    let excerpt = text.substring(start, end);
    
    // Add ellipsis if not at the beginning/end
    if (start > 0) {
      excerpt = '...' + excerpt;
    }
    if (end < text.length) {
      excerpt = excerpt + '...';
    }
    
    // Clean up excerpt (remove extra whitespace)
    excerpt = excerpt.replace(/\s+/g, ' ').trim();
    
    return highlightText(excerpt, query);
  }

  function highlightText(text, query) {
    if (!text) return '';
    
    // Text is already HTML-escaped from JSON, so don't escape again
    const terms = query.toLowerCase().split(/\s+/);
    let highlighted = text;
    
    terms.forEach(function(term) {
      if (term.length < 2) return;
      const regex = new RegExp('(' + escapeRegex(term) + ')', 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    
    return highlighted;
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function hideSearchResults(container) {
    container.style.display = 'none';
    container.innerHTML = '';
  }

  function navigateResults(container, direction) {
    const items = container.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    const currentIndex = Array.from(items).findIndex(function(item) {
      return item.classList.contains('focused');
    });

    // Remove current focus
    items.forEach(function(item) {
      item.classList.remove('focused');
    });

    let newIndex;
    if (currentIndex === -1) {
      newIndex = direction > 0 ? 0 : items.length - 1;
    } else {
      newIndex = currentIndex + direction;
      if (newIndex < 0) newIndex = items.length - 1;
      if (newIndex >= items.length) newIndex = 0;
    }

    items[newIndex].classList.add('focused');
    items[newIndex].scrollIntoView({ block: 'nearest' });
  }

  // Smooth scrolling for anchor links
  function initSmoothScrolling() {
    document.addEventListener("click", function (e) {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          const headerOffset = 80; // Account for fixed header
          const elementPosition = targetElement.offsetTop;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  }

  // Copy code blocks
  function initCodeCopy() {
    const codeBlocks = document.querySelectorAll("pre code");

    codeBlocks.forEach(function (block) {
      const pre = block.parentElement;
      const button = document.createElement("button");
      button.className = "copy-button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code to clipboard");

      button.addEventListener("click", function () {
        navigator.clipboard.writeText(block.textContent).then(function () {
          button.textContent = "Copied!";
          setTimeout(function () {
            button.textContent = "Copy";
          }, 2000);
        });
      });

      pre.style.position = "relative";
      pre.appendChild(button);
    });
  }

  // Mobile navigation toggle
  function initMobileNav() {
    const sidebar = document.querySelector(".docs-sidebar");
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "mobile-nav-toggle";

    // hide the button if we width is larger
    if (window.innerWidth > 768) {
      const existingBtn = document.getElementById("mobile-nav-toggle");
      if (existingBtn) {
        existingBtn.remove();
      }
    }

    // only add if button doesn't exist
    if (window.innerWidth <= 768 && !document.getElementById("mobile-nav-toggle")) {
      toggleBtn.className = "mobile-nav-toggle";
      toggleBtn.innerHTML = '<span class="ms-Icon ms-Icon--CollapseMenu"></span>';
      toggleBtn.setAttribute("aria-label", "Toggle navigation");

      const topbar = document.querySelector(".docs-topbar .topbar-container");
      if (topbar) {
        topbar.appendChild(toggleBtn);
      }

      toggleBtn.addEventListener("click", function () {
        sidebar.classList.toggle("mobile-open");
      });
    }
  }

  // Initialize everything when DOM is loaded
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initTOCScrollHighlight();
    initSearch();
    initSmoothScrolling();
    initCodeCopy();
    initMobileNav();
  });

  // Handle window resize
  window.addEventListener("resize", function () {
    initMobileNav();
  });
})();
