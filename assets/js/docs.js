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

  // ...existing code...

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

// ...existing code...

  // Search functionality
  function initSearch() {
    const searchInput = document.getElementById("docs-search");

    if (!searchInput) return;

    // Placeholder for search implementation
    // This could be integrated with Jekyll search plugins or external search services
    searchInput.addEventListener("input", function (e) {
      const query = e.target.value;
      if (query.length > 2) {
        // Implement search logic here
        console.log("Searching for:", query);
      }
    });

    // Handle Enter key
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = e.target.value;
        if (query.trim()) {
          // Redirect to search results page or perform search
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
      }
    });
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
