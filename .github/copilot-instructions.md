# Copilot Instructions for jekyll-theme-fluent-docs

This repository is a Jekyll theme packaged as a Ruby gem that provides a Microsoft Learn-style documentation layout with FluentUI design components.

## Project Architecture

- **\_layouts/**: Contains HTML templates following Microsoft Learn structure:
  - `default.html`: Main layout with topbar, left nav, content area, and right TOC sidebar
- **\_includes/**: Modular components for the Microsoft Learn layout:
  - `topbar.html`: Top navigation with logo, search, and main nav links
  - `left-nav.html`: Left sidebar navigation from `_data/navigation.yml`
  - `right-sidebar.html`: Table of contents and page metadata
- **\_sass/**: FluentUI-based stylesheets:
  - `main.scss`: Main import file
  - `_variables.scss`: FluentUI design tokens and CSS custom properties
  - `_typography.scss`: Text styles following FluentUI guidelines
  - `_layout.scss`: Microsoft Learn-style layout structure
  - `_components.scss`: Component-specific styles and icons
  - `_utilities.scss`: Utility classes for spacing, text, display
- **assets/**: Static assets and compiled styles:
  - `css/main.scss`: Jekyll-processed CSS entry point
  - `js/docs.js`: Interactive features (TOC generation, theme toggle, search)
- **\_data/**: Site configuration:
  - `navigation.yml`: Defines top and left navigation structure

## Developer Workflows

- **Local Development**: Run `bundle exec jekyll serve` to preview with live reload
- **Theme Development**: Edit Sass files in `_sass/` and includes in `_includes/`
- **Navigation**: Update `_data/navigation.yml` to modify site navigation structure
- **Styling**: Customize FluentUI variables in `_sass/_variables.scss`
- **Gem Packaging**: Update version in `.gemspec` before `gem build` and `gem push`

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
github_repo: "https://github.com/user/repo" # optional
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
description: "Optional tooltip text"
nav_exclude: true # Exclude from navigation
---
```

The left navigation automatically:
- **Ordered Pages**: Displays pages with `order` or `nav_order` first, sorted numerically
- **Unordered Pages**: Shows remaining pages alphabetically  
- **Recent Posts**: Adds a "Recent Posts" section with the 5 most recent blog posts
- **Date Display**: Shows post dates in "MMM DD" format for posts

## Key Integration Points

- **FluentUI Web Components**: Loaded via CDN for interactive elements
- **JavaScript Features**: TOC generation, theme toggle, search, smooth scrolling
- **Jekyll Plugins**: Compatible with standard Jekyll plugins for search, SEO, etc.
- **Responsive Layout**: Hides TOC sidebar on tablets, collapses to mobile nav on phones

---

Update this file when adding new FluentUI components or layout patterns.
