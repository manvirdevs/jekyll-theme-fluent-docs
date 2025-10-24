# Copilot Instructions for jekyll-theme-fluent-docs

This repository is a Jekyll theme packaged as a Ruby gem that provides a Microsoft Learn-style documentation layout with FluentUI design components. The theme is designed for GitHub Pages compatibility with Jekyll 3.x+.

## Project Architecture

- **\_layouts/**: Contains HTML templates following Microsoft Learn structure:
  - `default.html`: Main layout with topbar, left nav, content area, and right TOC sidebar
- **\_includes/**: Modular components for the Microsoft Learn layout:
  - `topbar.html`: Top navigation with logo, search, and main nav links
  - `left-nav.html`: Left sidebar navigation with intelligent page ordering
  - `right-sidebar.html`: Table of contents and page metadata with edit links
  - `toc.html`: Static table of contents generator with configurable heading levels
- **\_sass/**: FluentUI-based stylesheets:
  - `main.scss`: Main import file
  - `_variables.scss`: FluentUI design tokens and CSS custom properties
  - `_typography.scss`: Text styles with responsive image handling
  - `_layout.scss`: Microsoft Learn-style layout structure with navigation enhancements
  - `_components.scss`: Component-specific styles, icons, and alerts
  - `_utilities.scss`: Utility classes for spacing, text, display, and image sizing
- **assets/**: Static assets and compiled styles:
  - `css/main.scss`: Jekyll-processed CSS entry point
  - `js/docs.js`: Interactive features (theme toggle, search, mobile navigation, smooth scrolling)
- **\_data/**: Site configuration:
  - `navigation.yml`: Defines top and left navigation structure

## Developer Workflows

- **Local Development**: Run `bundle exec jekyll serve` to preview with live reload
- **Theme Development**: Edit Sass files in `_sass/` and includes in `_includes/`
- **Navigation Management**: Update `_data/navigation.yml` for site structure, use front matter `order` for page ordering
- **TOC Configuration**: Set `toc_max_level` and `toc_min_level` in `_config.yml` or page front matter
- **Styling**: Customize FluentUI variables in `_sass/_variables.scss`
- **Gem Packaging**: Update version in `.gemspec` before `gem build` and `gem push`
- **GitHub Pages**: Theme is compatible with Jekyll 3.x+ and GitHub Pages constraints

## FluentUI Design Patterns

- **CSS Custom Properties**: All colors, spacing, and dimensions use CSS variables
- **Component Structure**: Follow BEM-like naming (`.docs-topbar`, `.nav-list`, `.toc-container`)
- **Responsive Design**: Mobile-first with breakpoints at 768px and 1200px
- **Theme Support**: Light/dark theme switching via `data-theme` attribute
- **Icon Integration**: Uses Fabric MDL2 Icons with `.ms-Icon` classes
- **Navigation Enhancement**: Special classes for ordering (`.nav-date`, `.nav-divider`, `.nav-item--post`)

## Site Configuration Requirements

Sites using this theme should define in `_config.yml`:

```yaml
title: "Site Title"
description: "Site description"
logo: "/assets/logo.png" # optional
github_repo: "https://github.com/user/repo" # optional for edit links
toc_max_level: 3 # optional, controls TOC heading depth
toc_min_level: 2 # optional, minimum heading level for TOC
```

## Navigation Data Structure

`_data/navigation.yml` supports nested navigation:

```yaml
main: # Top navigation
  - title: "Home"
    url: "/"
docs: # Left sidebar sections
  - title: "Section"
    items:
      - title: "Page"
        url: "/page/"
        children: # Sub-pages
          - title: "Sub-page"
            url: "/sub/"
```

### Page Front Matter for Navigation

Pages support navigation ordering and metadata:

```yaml
---
title: "Page Title"
order: 1          # Primary ordering attribute (takes precedence)
nav_order: 2      # Legacy ordering attribute (fallback)
nav_exclude: true # Exclude from navigation
toc_max_level: 4  # Override global TOC settings per page
toc_min_level: 2  # Override global TOC settings per page
---
```

The left navigation automatically:
- **Ordered Pages**: Displays pages with `order` or `nav_order` first, sorted numerically
- **Unordered Pages**: Shows remaining pages alphabetically  
- **Recent Posts**: Adds a "Recent Posts" section with the 5 most recent blog posts
- **Date Display**: Shows post dates in "MMM DD" format for posts

## Table of Contents Configuration

The theme includes a static TOC generator with configurable heading levels:

- **Global Settings**: Set `toc_max_level` and `toc_min_level` in `_config.yml`
- **Page Override**: Use front matter to override TOC settings per page
- **Static Generation**: TOC is generated server-side for better performance
- **Responsive**: TOC sidebar hides on mobile devices

Example TOC configuration:
```yaml
# _config.yml - applies to all pages
toc_max_level: 3  # Include H1, H2, H3
toc_min_level: 2  # Start from H2 (skip H1 page title)

# page front matter - overrides global settings
---
toc_max_level: 4  # Show deeper nesting for this page
---
```

## Key Integration Points

- **FluentUI Web Components**: Loaded via CDN for interactive elements
- **JavaScript Features**: Theme toggle, search, mobile navigation, smooth scrolling
- **Jekyll Plugins**: Compatible with standard Jekyll plugins for search, SEO, etc.
- **Responsive Layout**: Hides TOC sidebar on tablets, collapses to mobile nav on phones
- **GitHub Pages**: Full compatibility with Jekyll 3.x+ constraints and limitations
- **Edit Links**: Automatic edit page links when `github_repo` is configured

## Liquid Template Patterns

The theme uses optimized Liquid syntax compatible with Jekyll 3.x:

- **Filtering**: Uses explicit loops with `unless` conditions instead of complex `where_exp` filters
- **Extension Handling**: File extensions removed using `remove` filter chains
- **Array Building**: Uses `split` and `push` for dynamic array construction
- **Date Formatting**: Consistent date display with `date: "%b %d"` for posts

## Recent Enhancements

- **Navigation Ordering**: Smart page ordering with `order` and `nav_order` support
- **Static TOC**: Server-side table of contents generation with configurable levels
- **Clean URLs**: Proper extension handling for edit links and issue reporting
- **Responsive Images**: Utility classes for image sizing and responsive behavior
- **Icon Integration**: Embedded font fallbacks for reliable icon display

---

Update this file when adding new FluentUI components or layout patterns.
