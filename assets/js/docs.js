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

  // TOC is now generated statically by Jekyll
  // Only handle scroll highlighting for existing TOC
  function initTOCScrollHighlight() {
    const tocLinks = document.querySelectorAll(".toc-link");

    if (tocLinks.length === 0) return;

    function highlightCurrentSection() {
      const headings = document.querySelectorAll(
        ".docs-body h2, .docs-body h3, .docs-body h4, .docs-body h5, .docs-body h6"
      );

      let currentHeading = null;
      const scrollPosition = window.scrollY + 100; // Offset for fixed header

      headings.forEach(function (heading) {
        if (heading.offsetTop <= scrollPosition) {
          currentHeading = heading;
        }
      });

      // Remove active class from all TOC links
      tocLinks.forEach(function (link) {
        link.classList.remove("active");
      });

      // Add active class to current section
      if (currentHeading) {
        const activeLink = document.querySelector(`.toc-link[href="#${currentHeading.id}"]`);
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    }

    // Initial highlight
    highlightCurrentSection();

    // Update on scroll
    window.addEventListener("scroll", highlightCurrentSection);
  }

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

  // Initialize all functionality when DOM is loaded
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
