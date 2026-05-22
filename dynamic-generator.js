/**
 * Dynamic Element Generator
 * Creates HTML elements from JSON configuration
 * Checks if CSS classes exist, creates missing ones dynamically
 */

class DynamicElementGenerator {
  constructor(data) {
    this.data = data;
    this.createdClasses = new Set();
    this.stylesToAdd = [];
  }

  /**
   * Resolve template variables like {assets.hero.rope}
   */
  resolveTemplate(str) {
    if (!str || typeof str !== 'string') return str;
    return str.replace(/{([^}]+)}/g, (match, path) => {
      const keys = path.split('.');
      let value = this.data;
      for (const key of keys) {
        value = value?.[key];
      }
      return value || match;
    });
  }

  /**
   * Check if a CSS class exists in the stylesheet
   */
  classExists(className) {
    if (!className) return false;
    const stylesheets = document.styleSheets;
    try {
      for (const sheet of stylesheets) {
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (const rule of rules) {
            if (rule.selectorText && rule.selectorText.includes('.' + className)) {
              return true;
            }
          }
        } catch (e) {
          // Skip sheets we can't access
        }
      }
    } catch (e) {
      console.warn('Could not check stylesheets:', e);
    }
    return false;
  }

  /**
   * Add a missing CSS class dynamically
   */
  addCSSClass(className, styles = {}) {
    if (this.createdClasses.has(className)) return;
    
    const cssText = Object.entries(styles)
      .map(([key, value]) => {
        const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${kebab}: ${value};`;
      })
      .join(' ');
    
    this.stylesToAdd.push(`.${className} { ${cssText} }`);
    this.createdClasses.add(className);
  }

  /**
   * Ensure CSS classes from config exist
   */
  ensureClasses(config) {
    if (typeof config !== 'object') return;

    // Check main class
    if (config.class) {
      const classes = config.class.split(' ');
      for (const cls of classes) {
        if (cls && !this.classExists(cls)) {
          console.warn(`CSS class ".${cls}" not found. Adding to dynamic styles.`);
          this.addCSSClass(cls, {
            display: 'block'
          });
        }
      }
    }

    // Recursively check children
    if (config.children && Array.isArray(config.children)) {
      for (const child of config.children) {
        this.ensureClasses(child);
      }
    }
  }

  /**
   * Create an element from config
   */
  createElement(config) {
    if (!config) return null;

    // Ensure classes exist
    this.ensureClasses(config);

    const tag = config.tag || (config.type ? 'button' : 'div');
    const element = document.createElement(tag);

    // Set attributes
    for (const [key, value] of Object.entries(config)) {
      if (['tag', 'children', 'innerHTML', 'textContent'].includes(key)) continue;

      let attrValue = this.resolveTemplate(value);

      if (key === 'class' && attrValue) {
        element.className = attrValue;
      } else if (key === 'id' && attrValue) {
        element.id = attrValue;
      } else if (key === 'type' && attrValue) {
        element.type = attrValue;
      } else if (key === 'src' && attrValue) {
        element.src = attrValue;
      } else if (key === 'alt' && attrValue !== undefined) {
        element.alt = attrValue;
      } else if (key === 'ariaLabel' && attrValue) {
        element.setAttribute('aria-label', attrValue);
      } else if (key === 'ariaHidden' && attrValue === true) {
        element.setAttribute('aria-hidden', 'true');
      } else if (key === 'ariaLive' && attrValue) {
        element.setAttribute('aria-live', attrValue);
      } else if (key === 'role' && attrValue) {
        element.setAttribute('role', attrValue);
      } else if (key.startsWith('data') && attrValue) {
        const dataKey = key.replace('data', '').replace(/([A-Z])/g, '-$1').toLowerCase();
        element.setAttribute(`data-${dataKey}`, attrValue);
      } else if (key === 'draggable' && attrValue === false) {
        element.draggable = false;
      } else if (typeof attrValue !== 'object' && attrValue !== undefined && attrValue !== false) {
        element.setAttribute(key, attrValue);
      }
    }

    // Add children
    if (config.children && Array.isArray(config.children)) {
      for (const childConfig of config.children) {
        const child = this.createElement(childConfig);
        if (child) element.appendChild(child);
      }
    }

    // Add text content or innerHTML
    if (config.textContent) {
      element.textContent = this.resolveTemplate(config.textContent);
    }
    if (config.innerHTML) {
      element.innerHTML = this.resolveTemplate(config.innerHTML);
    }

    return element;
  }

  /**
   * Inject dynamically created CSS styles into the page
   */
  injectStyles() {
    if (this.stylesToAdd.length === 0) return;

    const style = document.createElement('style');
    style.id = 'dynamic-generated-styles';
    style.textContent = this.stylesToAdd.join('\n');
    document.head.appendChild(style);

    console.log(`✓ Injected ${this.stylesToAdd.length} dynamic CSS styles`);
  }

  /**
   * Create multiple elements and attach to containers
   */
  createAndAttach(configMap) {
    for (const [selector, config] of Object.entries(configMap)) {
      const container = document.querySelector(selector);
      if (!container) {
        console.warn(`Container not found: ${selector}`);
        continue;
      }

      const element = this.createElement(config);
      if (element) {
        container.appendChild(element);
      }
    }

    // Inject all collected styles
    this.injectStyles();
  }

  /**
   * Replace inline styles in existing elements with CSS classes
   */
  migrateInlineStylesToClasses(elementSelector, classMap) {
    const elements = document.querySelectorAll(elementSelector);
    for (const element of elements) {
      if (element.style.length > 0) {
        // Get inline styles
        const inlineStyles = element.getAttribute('style');
        console.log(`Migrating inline styles from ${elementSelector}:`, inlineStyles);
        
        // Parse and map to appropriate classes
        for (const [className, stylePattern] of Object.entries(classMap)) {
          if (inlineStyles.includes(stylePattern)) {
            element.classList.add(className);
          }
        }
      }
    }
  }
}

// Export for use
window.DynamicElementGenerator = DynamicElementGenerator;
