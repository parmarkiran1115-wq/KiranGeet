/**
 * KGW Wedding - Script (Minimal Version)
 * Focus on data loading and essential functionality
 */

/* ─────────────────────────────────────
   Global Data — loaded from data.json
───────────────────────────────────── */
let EVENTS = [];
let A = {};
let CONFIG = {};
let MAP_URL = "";
let GALLERY_PHOTOS = [];
let GAL_FRAMES = {};

const PULL_THRESHOLD = Math.min(112, Math.max(84, Math.round(window.innerHeight * 0.11)));

console.log('Core globals initialized');

/* ─────────────────────────────────────
   Load data from JSON and init
───────────────────────────────────── */
async function loadDataAndInit() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Failed to load data.json');
    const data = await response.json();
    
    // Populate EVENTS with map URL
    EVENTS = (data.events || []).map(evt => ({
      ...evt,
      map: data.map?.url || ""
    }));
    
    // Populate asset paths
    if (data.assets?.hero) {
      A = {
        darkBg: data.assets.hero.darkBgMobile,
        litBg: data.assets.hero.litBgMobile,
        darkBgDesktop: data.assets.hero.darkBgDesktop,
        litBgDesktop: data.assets.hero.litBgDesktop,
        rope: data.assets.hero.rope,
        lotusClosed: data.assets.hero.lotusClosed,
        lotusOpen: data.assets.hero.lotusOpen,
        lotusGlow: data.assets.hero.lotusGlow,
        jhoomer: data.assets.hero.jhoomer,
        floralBush: data.assets.hero.floralBush,
        diya: data.assets.hero.diya
      };
    }
    
    // Populate gallery photos
    GALLERY_PHOTOS = data.gallery || [];
    
    // Populate gallery frames
    if (data.assets?.gallery?.frameAssets) {
      GAL_FRAMES = data.assets.gallery.frameAssets;
    }
    
    // Populate config and couple data
    CONFIG = data.config || {};
    MAP_URL = data.map?.url || "";
    
    console.log('✓ Data loaded:', {
      events: EVENTS.length,
      assets: Object.keys(A).length,
      photos: GALLERY_PHOTOS.length
    });
    
    return { success: true, eventsCount: EVENTS.length };
    
  } catch (error) {
    console.error('✗ Failed to load data.json:', error.message);
    return { success: false, error: error.message };
  }
}

// Load data on page ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDataAndInit);
} else {
  loadDataAndInit();
}

console.log('Script initialized and ready');
