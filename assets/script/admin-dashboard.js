/* ================================================================
   JDEVS. — Admin Dashboard JavaScript (admin-dashboard.js)
   Admin-only logic — does NOT modify or depend on script.js internals.
   Loads AFTER script.js so shared utilities (navbar, scroll, toast)
   are already running.
================================================================ */

/* ──────────────────────────────────────────────────────────────
   A1. ADMIN VIEW SWITCHER
   Mirrors the user dashboard's switchView() but scoped to
   admin views (prefixed adm-view-*).
────────────────────────────────────────────────────────────── */
function adminSwitchView(viewId) {
  // Hide all views
  document.querySelectorAll('.db-view').forEach(v => v.classList.remove('active'));

  // Show target
  const target = document.getElementById('adm-view-' + viewId);
  if (target) target.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.db-nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewId) btn.classList.add('active');
  });

  // Update topbar title/subtitle
  const titles = {
    // 'overview'      : ['Overview', 'Admin panel — here's what needs your attention.'],
    'free-quotes': ['Free Quotes', 'Quote requests submitted via the public form.'],
    'user-quotes': ['User Quotes', 'Quote requests from registered logged-in users.'],
    'active-works': ['Active Works', 'Manage all ongoing and pending project works.'],
    'portfolio': ['Portfolio Manager', 'Upload and organise portfolio images.'],
    'settings': ['Settings', 'Admin account and platform settings.'],
    'billing': ['Invoices & Billing', 'Create, track, and manage all client invoices.'],
    'clients': ['Client Management', 'View and manage all registered and contact clients.'],
    'completed-projects': ['Completed Projects', 'All delivered projects and their records.'],
    'revisions': ['Revisions', 'Client revision requests and your posted updates.'],
    'finished-projects': ['Finished Projects', 'Completed and delivered work gallery with image previews.'],
  };

  const [title, subtitle] = titles[viewId] || ['Admin Dashboard', ''];
  const titleEl = document.getElementById('viewTitle');
  const subtitleEl = document.getElementById('viewSubtitle');
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;

  // Close sidebar on mobile — use .open to match script.js behaviour
  const sidebar = document.getElementById('dbSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar && window.innerWidth < 860) {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }
}


/* ──────────────────────────────────────────────────────────────
   A2. ACCORDION — QUOTE CARDS (expand / collapse)
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const head = e.target.closest('.adm-quote-head');
  if (!head) return;

  const card = head.closest('.adm-quote-card');
  if (!card) return;

  // Close siblings in same list
  const list = card.closest('.adm-quote-list');
  if (list) {
    list.querySelectorAll('.adm-quote-card.open').forEach(open => {
      if (open !== card) open.classList.remove('open');
    });
  }

  card.classList.toggle('open');
});


/* ──────────────────────────────────────────────────────────────
   A3. FILTER BUTTONS (Free / User quotes tabs)
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-filter-btn[data-filter]');
  if (!btn) return;

  const group = btn.dataset.group;
  if (!group) return;

  // Toggle active in group
  document.querySelectorAll(`.adm-filter-btn[data-group="${group}"]`).forEach(b => {
    b.classList.remove('active', 'active-red', 'active-blue');
  });

  const colorClass = btn.dataset.color ? 'active-' + btn.dataset.color : 'active';
  btn.classList.add(colorClass);

  // Filter quote cards
  const filterValue = btn.dataset.filter;
  const targetList = document.querySelector(btn.dataset.target);
  if (!targetList) return;

  targetList.querySelectorAll('.adm-quote-card').forEach(card => {
    if (filterValue === 'all' || card.dataset.status === filterValue) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
});


/* ──────────────────────────────────────────────────────────────
   A4. INLINE SEARCH — filter quote list by name / service
────────────────────────────────────────────────────────────── */
document.addEventListener('input', function (e) {
  const input = e.target.closest('.adm-search-inline input');
  if (!input) return;

  const container = document.querySelector(input.dataset.target);
  if (!container) return;

  const query = input.value.trim().toLowerCase();
  container.querySelectorAll('.adm-quote-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? '' : 'none';
  });
});


/* ──────────────────────────────────────────────────────────────
   A5. ACCEPT / DECLINE quote actions (demo UI feedback)
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  // Accept
  if (e.target.closest('.adm-btn-accept')) {
    const btn = e.target.closest('.adm-btn-accept');
    const card = btn.closest('.adm-quote-card');
    if (!card) return;

    // Update status badge in head
    const oldStatus = card.querySelector('.db-status');
    if (oldStatus) {
      oldStatus.className = 'db-status progress';
      oldStatus.textContent = 'Accepted';
    }
    card.dataset.status = 'accepted';
    card.classList.remove('open');

    showAdminToast('Quote Accepted', 'The quote has been accepted and marked as In Progress.', 'green');
  }

  // Decline
  if (e.target.closest('.adm-btn-decline')) {
    const btn = e.target.closest('.adm-btn-decline');
    const card = btn.closest('.adm-quote-card');
    if (!card) return;

    const oldStatus = card.querySelector('.db-status');
    if (oldStatus) {
      oldStatus.className = 'db-status';
      oldStatus.style.background = 'rgba(255,77,77,0.1)';
      oldStatus.style.color = '#FF4D4D';
      oldStatus.textContent = 'Declined';
    }
    card.dataset.status = 'declined';
    card.classList.remove('open');

    showAdminToast('Quote Declined', 'The quote request has been declined.', 'red');
  }
});


/* ──────────────────────────────────────────────────────────────
   A6. WORKS — STATUS UPDATER (quick status change)
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-work-btn[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const card = btn.closest('.adm-work-card');
  if (!card) return;

  if (action === 'complete') {
    card.className = card.className.replace(/wk-\w+/, 'wk-done');
    const statusBadge = card.querySelector('.db-status');
    if (statusBadge) { statusBadge.className = 'db-status completed'; statusBadge.textContent = 'Completed'; }
    const fill = card.querySelector('.db-progress-fill');
    if (fill) fill.style.width = '100%';
    const pct = card.querySelector('.adm-work-progress-label span:last-child');
    if (pct) pct.textContent = '100%';
    showAdminToast('Work Completed', 'Project marked as completed.', 'green');
  }

  if (action === 'delete') {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    card.style.transition = 'all 0.3s ease';
    setTimeout(() => card.remove(), 300);
    showAdminToast('Work Removed', 'Project removed from active works.', 'red');
  }
});


/* ──────────────────────────────────────────────────────────────
   A7. PORTFOLIO — STORAGE HELPERS
   All admin-managed items are saved to localStorage under
   'jdevs_portfolio'. The full data shape matches what
   project-detail.html needs — ready for a backend swap.
────────────────────────────────────────────────────────────── */

// Category slug → display label map (shared across functions)
const PORTFOLIO_CAT_LABELS = {
  logo: 'Logo Design',
  branding: 'Branding',
  print: 'Print Design',
  web: 'Web Design',
  social: 'Social Media',
};

// Slug-safe project ID from a title string
function _slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Read saved items from localStorage
function portfolioLoad() {
  try { return JSON.parse(localStorage.getItem('jdevs_portfolio') || '[]'); }
  catch { return []; }
}

// Save current admin grid items to localStorage
// Each tile stores its full detail payload in data-detail (JSON string)
function portfolioSave() {
  const grid = document.getElementById('admPortfolioGrid');
  if (!grid) return 0;
  const items = [];
  grid.querySelectorAll('.adm-portfolio-item[data-cat]').forEach(el => {
    const img = el.querySelector('img.adm-portfolio-img');
    const title = el.querySelector('.adm-portfolio-overlay-title')?.textContent?.trim() || 'Untitled';
    let detail = {};
    try { detail = JSON.parse(el.dataset.detail || '{}'); } catch { }
    if (img) {
      items.push({
        src: img.src,
        title: title,
        cat: el.dataset.cat || '',
        id: el.dataset.id || _slugify(title),
        shortDesc: detail.shortDesc || '',
        overview: detail.overview || '',
        tags: detail.tags || '',
        tools: detail.tools || '',
        deliverables: detail.deliverables || '',
        client: detail.client || '',
        year: detail.year || '',
      });
    }
  });
  localStorage.setItem('jdevs_portfolio', JSON.stringify(items));
  return items.length;
}

// Build one admin grid tile — extra{} carries all detail-page fields
function portfolioBuildTile(src, title, cat, id, extra = {}) {
  const item = document.createElement('div');
  item.className = 'adm-portfolio-item';
  item.dataset.cat = cat || '';
  item.dataset.id = id || _slugify(title);
  item.dataset.detail = JSON.stringify({
    shortDesc: extra.shortDesc || '',
    overview: extra.overview || '',
    tags: extra.tags || '',
    tools: extra.tools || '',
    deliverables: extra.deliverables || '',
    client: extra.client || '',
    year: extra.year || '',
  });
  item.innerHTML = `
    <img src="${src}" class="adm-portfolio-img" alt="${title}" />
    <div class="adm-portfolio-overlay">
      <div class="adm-portfolio-overlay-title">${title}</div>
      <div class="adm-portfolio-overlay-sub">
        ${PORTFOLIO_CAT_LABELS[cat] || cat}
        ${extra.year ? ' · ' + extra.year : ''}
      </div>
      <div class="adm-portfolio-overlay-btns">
        <button class="adm-port-btn adm-port-edit" title="Edit project"><i class="ri-pencil-line"></i></button>
        <button class="adm-port-btn danger adm-port-delete" title="Delete"><i class="ri-delete-bin-line"></i></button>
      </div>
    </div>
  `;
  return item;
}

// Recount items and update the counter span
function portfolioUpdateCount() {
  const grid = document.getElementById('admPortfolioGrid');
  const countEl = document.getElementById('admPortfolioCount');
  if (!grid || !countEl) return;
  const items = grid.querySelectorAll('.adm-portfolio-item[data-cat]');
  const cats = new Set(Array.from(items).map(i => i.dataset.cat).filter(Boolean));
  countEl.textContent = `${items.length} project${items.length !== 1 ? 's' : ''} · ${cats.size} categor${cats.size !== 1 ? 'ies' : 'y'}`;
}

// Helper — clear every upload form field
function _clearUploadForm() {
  const ids = ['admUploadTitle', 'admUploadCategory', 'admUploadClient', 'admUploadYear',
    'admUploadShortDesc', 'admUploadOverview', 'admUploadTags',
    'admUploadTools', 'admUploadDeliverables'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.tagName === 'SELECT' ? (el.value = '') : (el.value = id === 'admUploadYear' ? '2026' : '');
  });
  const preview = document.getElementById('admPreviewStrip');
  const fileIn = document.getElementById('admFileInput');
  if (preview) preview.innerHTML = '';
  if (fileIn) fileIn.value = '';
}

// Restore admin grid from localStorage on page load
(function portfolioRestore() {
  const grid = document.getElementById('admPortfolioGrid');
  if (!grid) return;
  const saved = portfolioLoad();
  if (!saved.length) return;
  grid.querySelectorAll('.adm-portfolio-item').forEach(el => el.remove());
  const addCard = grid.querySelector('.adm-portfolio-add-card');
  saved.forEach(entry => {
    const tile = portfolioBuildTile(entry.src, entry.title, entry.cat, entry.id, entry);
    if (addCard) grid.insertBefore(tile, addCard);
    else grid.appendChild(tile);
  });
  portfolioUpdateCount();
})();


/* ──────────────────────────────────────────────────────────────
   A7b. PORTFOLIO IMAGE UPLOAD
────────────────────────────────────────────────────────────── */
(function initPortfolioUpload() {

  const zone = document.getElementById('admUploadZone');
  const fileIn = document.getElementById('admFileInput');
  const preview = document.getElementById('admPreviewStrip');
  const addBtn = document.getElementById('admAddToPortfolio');
  const clearBtn = document.getElementById('admClearUpload');

  if (!zone) return;

  // Click zone → trigger input
  zone.addEventListener('click', () => fileIn && fileIn.click());

  // Drag & drop
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  if (fileIn) fileIn.addEventListener('change', () => handleFiles(fileIn.files));

  function handleFiles(files) {
    if (!preview) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const thumb = document.createElement('div');
        thumb.className = 'adm-preview-thumb';
        thumb.innerHTML = `
          <img src="${ev.target.result}" alt="preview" />
          <button class="adm-preview-remove" title="Remove"><i class="ri-close-line"></i></button>
        `;
        thumb.querySelector('.adm-preview-remove').addEventListener('click', () => thumb.remove());
        preview.appendChild(thumb);
      };
      reader.readAsDataURL(file);
    });
  }

  // Clear button
  if (clearBtn) clearBtn.addEventListener('click', () => {
    _clearUploadForm();
    // If we were in edit mode, reset the button label
    if (addBtn) {
      addBtn.innerHTML = '<i class="ri-image-add-line"></i> Add to Portfolio';
      delete addBtn.dataset.editingId;
    }
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const title = (document.getElementById('admUploadTitle')?.value || '').trim();
      const catEl = document.getElementById('admUploadCategory');
      const cat = catEl?.value || '';

      if (!title) {
        showAdminToast('Missing Title', 'Please enter a project title.', 'red');
        return;
      }
      if (!cat) {
        showAdminToast('Missing Category', 'Please select a category.', 'red');
        return;
      }

      // Collect all detail fields
      const extra = {
        shortDesc: (document.getElementById('admUploadShortDesc')?.value || '').trim(),
        overview: (document.getElementById('admUploadOverview')?.value || '').trim(),
        tags: (document.getElementById('admUploadTags')?.value || '').trim(),
        tools: (document.getElementById('admUploadTools')?.value || '').trim(),
        deliverables: (document.getElementById('admUploadDeliverables')?.value || '').trim(),
        client: (document.getElementById('admUploadClient')?.value || '').trim(),
        year: (document.getElementById('admUploadYear')?.value || '').trim(),
      };

      const editingId = addBtn.dataset.editingId || null;
      const grid = document.getElementById('admPortfolioGrid');

      // ── UPDATE MODE (edit button was clicked) ──────────────
      if (editingId && grid) {
        const existing = grid.querySelector(`.adm-portfolio-item[data-id="${editingId}"]`);
        if (existing) {
          const newId = _slugify(title);
          existing.dataset.cat = cat;
          existing.dataset.id = newId;
          existing.dataset.detail = JSON.stringify(extra);
          existing.querySelector('.adm-portfolio-overlay-title').textContent = title;
          const sub = existing.querySelector('.adm-portfolio-overlay-sub');
          if (sub) sub.textContent = `${PORTFOLIO_CAT_LABELS[cat] || cat}${extra.year ? ' · ' + extra.year : ''}`;
          const imgEl = existing.querySelector('img.adm-portfolio-img');
          if (imgEl) imgEl.alt = title;
          // Swap image if new ones were selected
          const thumbs = preview ? preview.querySelectorAll('.adm-preview-thumb') : [];
          if (thumbs.length && imgEl) imgEl.src = thumbs[0].querySelector('img').src;
        }
        // Reset to add mode
        addBtn.innerHTML = '<i class="ri-image-add-line"></i> Add to Portfolio';
        delete addBtn.dataset.editingId;
        _clearUploadForm();
        portfolioUpdateCount();
        showAdminToast('Project Updated', `"${title}" has been updated.`, 'green');
        return;
      }

      // ── ADD MODE ───────────────────────────────────────────
      const thumbs = preview ? preview.querySelectorAll('.adm-preview-thumb') : [];
      if (!thumbs.length) {
        showAdminToast('No Images', 'Please add at least one image.', 'red');
        return;
      }

      if (grid) {
        // First thumb is the grid thumbnail; rest are carousel extras stored in detail
        const extraImgs = [];
        thumbs.forEach((thumb, i) => {
          const img = thumb.querySelector('img');
          if (!img) return;
          if (i === 0) {
            const tile = portfolioBuildTile(img.src, title, cat, _slugify(title), extra);
            const addCard = grid.querySelector('.adm-portfolio-add-card');
            if (addCard) grid.insertBefore(tile, addCard);
            else grid.appendChild(tile);
          } else {
            extraImgs.push(img.src);
          }
        });
        // Store extra carousel images on the tile
        if (extraImgs.length) {
          const newTile = grid.querySelector(`.adm-portfolio-item[data-id="${_slugify(title)}"]`);
          if (newTile) {
            let det = {};
            try { det = JSON.parse(newTile.dataset.detail || '{}'); } catch { }
            det.carouselImgs = extraImgs;
            newTile.dataset.detail = JSON.stringify(det);
          }
        }
      }

      _clearUploadForm();
      portfolioUpdateCount();
      showAdminToast('Project Added', `"${title}" added. Click Publish to go live.`, 'green');
    });
  }

})();


/* ──────────────────────────────────────────────────────────────
   A7c. PORTFOLIO — EDIT & DELETE HANDLERS
   Edit pre-fills the upload form so all fields are editable.
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {

  // ── DELETE ──────────────────────────────────────────────────
  const delBtn = e.target.closest('.adm-port-delete');
  if (delBtn) {
    const tile = delBtn.closest('.adm-portfolio-item');
    if (tile) { tile.remove(); portfolioUpdateCount(); }
    return;
  }

  // ── EDIT ────────────────────────────────────────────────────
  const editBtn = e.target.closest('.adm-port-edit');
  if (!editBtn) return;

  const tile = editBtn.closest('.adm-portfolio-item');
  if (!tile) return;

  const title = tile.querySelector('.adm-portfolio-overlay-title')?.textContent?.trim() || '';
  const cat = tile.dataset.cat || '';
  const id = tile.dataset.id || '';
  let detail = {};
  try { detail = JSON.parse(tile.dataset.detail || '{}'); } catch { }

  // Pre-fill every upload form field
  const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
  set('admUploadTitle', title);
  set('admUploadCategory', cat);
  set('admUploadClient', detail.client);
  set('admUploadYear', detail.year || '2026');
  set('admUploadShortDesc', detail.shortDesc);
  set('admUploadOverview', detail.overview);
  set('admUploadTags', detail.tags);
  set('admUploadTools', detail.tools);
  set('admUploadDeliverables', detail.deliverables);

  // Switch button to update mode
  const addBtn = document.getElementById('admAddToPortfolio');
  if (addBtn) {
    addBtn.innerHTML = '<i class="ri-save-line"></i> Update Project';
    addBtn.dataset.editingId = id;
  }

  // Scroll the upload card into view
  const uploadCard = document.getElementById('admUploadZone');
  if (uploadCard) uploadCard.closest('.db-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  showAdminToast('Edit Mode', `Editing "${title}" — make changes and click Update Project.`, 'green');
});


/* ──────────────────────────────────────────────────────────────
   A7d. PORTFOLIO — PUBLISH TO portfolio.html VIA localStorage
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  if (!e.target.closest('#admPublishPortfolio')) return;
  const count = portfolioSave();
  showAdminToast(
    'Portfolio Published',
    `${count} project${count !== 1 ? 's' : ''} saved. Reload portfolio.html to see changes.`,
    'green'
  );
});


/* ──────────────────────────────────────────────────────────────
   A8. CATEGORY TABS — portfolio filter
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const tab = e.target.closest('.adm-cat-tab[data-cat]');
  if (!tab) return;

  const group = tab.dataset.group || 'portfolio-cat';
  document.querySelectorAll(`.adm-cat-tab[data-group="${group}"]`).forEach(t => t.classList.remove('active'));
  tab.classList.add('active');

  const cat = tab.dataset.cat;
  const grid = document.getElementById('admPortfolioGrid');
  if (!grid) return;

  grid.querySelectorAll('.adm-portfolio-item').forEach(item => {
    item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
  });
});


/* ──────────────────────────────────────────────────────────────
   A9. ADMIN TOAST HELPER
────────────────────────────────────────────────────────────── */
function showAdminToast(title, message, type = 'green') {
  // Reuse existing #dbToast if present, else create one
  let toast = document.getElementById('dbToast');
  let toastIcon = toast ? toast.querySelector('.db-toast-icon') : null;
  let toastTitle = document.getElementById('toastTitle');
  let toastMsg = document.getElementById('toastMsg');

  if (!toast) return; // fallback — no toast element

  if (toastIcon) {
    if (type === 'green') {
      toastIcon.className = 'db-toast-icon ri-checkbox-circle-fill';
      toastIcon.style.color = 'var(--clr-accent)';
    } else {
      toastIcon.className = 'db-toast-icon ri-close-circle-fill';
      toastIcon.style.color = '#FF4D4D';
    }
  }

  if (toastTitle) toastTitle.textContent = title;
  if (toastMsg) toastMsg.textContent = message;

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3800);
}


/* ──────────────────────────────────────────────────────────────
   A10. SIDEBAR TOGGLE
   NOTE: Handled entirely by script.js which already attaches
   the correct toggle (.open class on both #dbSidebar and
   #sidebarOverlay) before this file loads. Adding a second
   listener here would cancel the first, causing the sidebar
   to open and immediately close on every tap.
   adminSwitchView() above handles closing on nav item click.
────────────────────────────────────────────────────────────── */


/* ──────────────────────────────────────────────────────────────
   A11. NOTIFICATION BUTTON TOGGLE (reuse panel from HTML)
────────────────────────────────────────────────────────────── */
(function initAdminNotif() {
  const btn = document.getElementById('notifBtn');
  const panel = document.getElementById('notifPanel');
  if (!btn || !panel) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
})();


/* ──────────────────────────────────────────────────────────────
   A12. INITIALISE — set default view on load
────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  adminSwitchView('overview');
});



/* ================================================================
   JDEVS. — Admin Sections JS Additions (append to admin-dashboard.js)
   Handles: progress controls, Add New Work panel, quote note saving
================================================================ */


/* ──────────────────────────────────────────────────────────────
   B1. PROGRESS +/- CONTROLS on work cards
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-prog-btn[data-dir]');
  if (!btn) return;

  const card = btn.closest('.adm-work-card');
  if (!card) return;

  const fill = card.querySelector('.db-progress-fill');
  const pctSpan = card.querySelector('.adm-work-progress-label span:last-child');
  if (!fill || !pctSpan) return;

  let current = parseInt(fill.style.width) || 0;
  const dir = btn.dataset.dir; // 'up' | 'down'

  current = dir === 'up'
    ? Math.min(100, current + 10)
    : Math.max(0, current - 10);

  fill.style.width = current + '%';
  pctSpan.textContent = current + '%';

  // Auto-update status badge when hitting 100% or 0%
  const badge = card.querySelector('.db-status');
  if (current === 100 && badge) {
    badge.className = 'db-status completed';
    badge.textContent = 'Completed';
    card.className = card.className.replace(/wk-\w+/g, 'wk-done');
    const due = card.querySelector('.adm-work-due');
    if (due) {
      due.style.color = 'var(--clr-accent)';
      due.innerHTML = '<i class="ri-checkbox-circle-line"></i> Delivered';
    }
    showAdminToast('Work Complete', 'Project progress set to 100% and marked delivered.', 'green');
  }

  if (current === 0 && badge && badge.textContent !== 'Pending') {
    badge.className = 'db-status pending';
    badge.textContent = 'Pending';
    card.className = card.className.replace(/wk-\w+/g, 'wk-pending');
  }
});


/* ──────────────────────────────────────────────────────────────
   B2. ADD NEW WORK PANEL — toggle
────────────────────────────────────────────────────────────── */
(function initAddWorkPanel() {
  const toggleBtn = document.getElementById('admAddWorkToggle');
  const panel = document.getElementById('admAddWorkPanel');
  const closeBtn = document.getElementById('admAddWorkClose');
  const submitBtn = document.getElementById('admAddWorkSubmit');

  if (!toggleBtn || !panel) return;

  toggleBtn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      toggleBtn.innerHTML = '<i class="ri-close-line"></i> Cancel';
    } else {
      toggleBtn.innerHTML = '<i class="ri-add-line"></i> Add New Work';
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
      toggleBtn.innerHTML = '<i class="ri-add-line"></i> Add New Work';
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const title = document.getElementById('admWkTitle')?.value.trim();
      const client = document.getElementById('admWkClient')?.value.trim();
      const service = document.getElementById('admWkService')?.value;
      const revenue = document.getElementById('admWkRevenue')?.value.trim();
      const due = document.getElementById('admWkDue')?.value;
      const source = document.getElementById('admWkSource')?.value;

      if (!title || !client) {
        showAdminToast('Missing Info', 'Please enter a title and client name.', 'red');
        return;
      }

      const grid = document.getElementById('wkGrid');
      if (!grid) return;

      // Build ID
      const existing = grid.querySelectorAll('.adm-work-card').length;
      const newId = '#WK-' + String(existing + 17).padStart(3, '0');

      // Build due label
      let dueLabel = 'TBD';
      let dueCls = '';
      if (due) {
        const d = new Date(due);
        dueLabel = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      }

      const sourceTag = source === 'free'
        ? '<span class="adm-work-tag source-free"><i class="ri-questionnaire-line"></i> Free Quote</span>'
        : source === 'user'
          ? '<span class="adm-work-tag source-user"><i class="ri-user-3-line"></i> User Quote</span>'
          : '';

      const revenueLabel = revenue
        ? `<span class="adm-work-revenue">KES ${Number(revenue).toLocaleString()}</span>`
        : '<span style="color:var(--clr-muted);font-size:0.8rem;">No charge</span>';

      const serviceTag = service
        ? `<span class="adm-work-tag service"><i class="ri-pen-nib-line"></i> ${service}</span>`
        : '';

      const card = document.createElement('div');
      card.className = 'adm-work-card wk-pending';
      card.dataset.status = 'pending';
      card.innerHTML = `
        <div class="adm-work-head">
          <div>
            <div class="adm-work-id">${newId}</div>
            <div class="adm-work-title">${title}</div>
          </div>
          <span class="db-status pending">Pending</span>
        </div>
        <div class="adm-work-tags">
          ${serviceTag}
          ${sourceTag}
        </div>
        <div class="adm-work-client">
          <i class="ri-user-3-line"></i> ${client} &nbsp;·&nbsp; ${revenueLabel}
        </div>
        <div class="adm-work-progress-wrap">
          <div class="adm-work-progress-label"><span>Progress</span><span>0%</span></div>
          <div class="db-progress-bar">
            <div class="db-progress-fill" style="width:0%;"></div>
          </div>
          <div class="adm-prog-row">
            <button class="adm-prog-btn" data-dir="down" title="–10%">−</button>
            <button class="adm-prog-btn" data-dir="up"   title="+10%">+</button>
            <span style="font-size:0.7rem;color:var(--clr-muted);margin-left:0.2rem;">adjust progress</span>
          </div>
        </div>
        <div class="adm-work-footer">
          <span class="adm-work-due"><i class="ri-calendar-line"></i> ${dueLabel}</span>
          <div class="adm-work-actions">
            <button class="adm-work-btn" data-action="manage" title="Manage"><i class="ri-settings-3-line"></i></button>
            <button class="adm-work-btn" data-action="complete" title="Mark Complete"><i class="ri-checkbox-circle-line"></i></button>
            <button class="adm-work-btn" title="Message Client"><i class="ri-chat-1-line"></i></button>
            <button class="adm-work-btn danger" data-action="delete" title="Remove"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>
      `;

      grid.prepend(card);

      // Reset form
      ['admWkTitle', 'admWkClient', 'admWkRevenue', 'admWkDue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      panel.classList.remove('open');
      toggleBtn.innerHTML = '<i class="ri-add-line"></i> Add New Work';

      showAdminToast('Work Added', `${newId} · "${title}" added to Active Works.`, 'green');
    });
  }
})();


/* ──────────────────────────────────────────────────────────────
   B3. QUOTE NOTE — auto-save indicator (demo feedback)
────────────────────────────────────────────────────────────── */
document.addEventListener('input', function (e) {
  const ta = e.target.closest('.adm-quote-note textarea');
  if (!ta) return;

  const note = ta.closest('.adm-quote-note');
  if (!note) return;

  // Debounce save indicator
  clearTimeout(ta._saveTimer);
  ta._saveTimer = setTimeout(() => {
    const label = note.querySelector('.adm-quote-note-label');
    if (label) {
      const original = label.textContent.replace(' · Saved ✓', '');
      label.textContent = original + ' · Saved ✓';
      setTimeout(() => { label.textContent = original; }, 2200);
    }
  }, 800);
});


/* ──────────────────────────────────────────────────────────────
   B4. ACTIVE WORKS FILTER — grid cards (mirrors quote filter)
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-filter-btn[data-group="wk-filter"]');
  if (!btn) return;

  // Active state already handled by A3 in admin-dashboard.js
  // This block handles the grid (not list) correctly
  const filterValue = btn.dataset.filter;
  const targetGrid = document.querySelector(btn.dataset.target);
  if (!targetGrid) return;

  targetGrid.querySelectorAll('.adm-work-card').forEach(card => {
    if (filterValue === 'all' || card.dataset.status === filterValue) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
});



/* ──────────────────────────────────────────────────────────────
   C1. ADMIN DASHBOARD — LIGHT / DARK THEME TOGGLE
   Scoped to #dbShell only; navbar & footer stay dark.
   Both the sidebar row and the Settings toggle stay in sync.
   Preference stored under 'jdevs-adm-theme' (separate from user dash).
────────────────────────────────────────────────────────────── */

window.toggleAdminTheme = function () {
  const shell = document.getElementById('dbShell');
  if (!shell) return;

  shell.classList.toggle('light-mode');
  const lightActive = shell.classList.contains('light-mode');

  // Keep body in sync so fixed-position elements outside #dbShell (e.g. slide panel) pick up the theme
  document.body.classList.toggle('light-mode', lightActive);

  // ── Settings toggle ──
  const settingsToggle = document.getElementById('admThemeToggle');
  const settingsLabel = document.getElementById('admThemeSettingLabel');
  const sunIcon = document.getElementById('admThemeIconSun');
  const moonIcon = document.getElementById('admThemeIconMoon');

  if (settingsToggle) settingsToggle.classList.toggle('active', !lightActive);
  if (settingsLabel) settingsLabel.textContent = lightActive ? 'Currently using Light Mode' : 'Currently using Dark Mode';
  if (sunIcon) sunIcon.style.color = lightActive ? 'var(--clr-accent-dim)' : 'var(--clr-muted)';
  if (moonIcon) moonIcon.style.color = !lightActive ? 'var(--clr-accent)' : 'var(--clr-muted)';

  // ── Sidebar toggle ──
  const sidebarToggle = document.getElementById('admSidebarThemeToggle');
  const sidebarLabel = document.getElementById('admSidebarThemeLabel');
  const sidebarSun = document.getElementById('admSidebarThemeIconSun');
  const sidebarMoon = document.getElementById('admSidebarThemeIconMoon');

  if (sidebarToggle) sidebarToggle.classList.toggle('active', !lightActive);
  if (sidebarLabel) sidebarLabel.textContent = lightActive ? 'Light Mode' : 'Dark Mode';
  if (sidebarSun) sidebarSun.style.color = lightActive ? 'var(--clr-accent-dim)' : 'var(--clr-muted)';
  if (sidebarMoon) sidebarMoon.style.color = !lightActive ? 'var(--clr-accent)' : 'var(--clr-muted)';

  // ── Persist preference ──
  try { localStorage.setItem('jdevs-adm-theme', lightActive ? 'light' : 'dark'); } catch (e) { }

  // ── Toast feedback ──
  if (window.showAdminToast) {
    const mode = lightActive ? 'Light Mode' : 'Dark Mode';
    showAdminToast('Theme Changed', `Admin dashboard switched to ${mode}.`, 'green');
  }
};


/* ── Restore saved theme on page load ────────────────────────── */
(function restoreAdminTheme() {
  const shell = document.getElementById('dbShell');
  if (!shell) return;

  let saved;
  try { saved = localStorage.getItem('jdevs-adm-theme'); } catch (e) { }

  // Default: light mode. Only switch to dark if explicitly saved.
  const useDark = saved === 'dark';

  const settingsToggle = document.getElementById('admThemeToggle');
  const settingsLabel = document.getElementById('admThemeSettingLabel');
  const sunIcon = document.getElementById('admThemeIconSun');
  const moonIcon = document.getElementById('admThemeIconMoon');
  const sidebarToggle = document.getElementById('admSidebarThemeToggle');
  const sidebarLabel = document.getElementById('admSidebarThemeLabel');
  const sidebarSun = document.getElementById('admSidebarThemeIconSun');
  const sidebarMoon = document.getElementById('admSidebarThemeIconMoon');

  if (useDark) {
    shell.classList.remove('light-mode');
    document.body.classList.remove('light-mode');

    if (settingsToggle) settingsToggle.classList.add('active');
    if (settingsLabel) settingsLabel.textContent = 'Currently using Dark Mode';
    if (sunIcon) sunIcon.style.color = 'var(--clr-muted)';
    if (moonIcon) moonIcon.style.color = 'var(--clr-accent)';

    if (sidebarToggle) sidebarToggle.classList.add('active');
    if (sidebarLabel) sidebarLabel.textContent = 'Dark Mode';
    if (sidebarSun) sidebarSun.style.color = 'var(--clr-muted)';
    if (sidebarMoon) sidebarMoon.style.color = 'var(--clr-accent)';
  } else {
    shell.classList.add('light-mode');
    document.body.classList.add('light-mode');

    if (settingsToggle) settingsToggle.classList.remove('active');
    if (settingsLabel) settingsLabel.textContent = 'Currently using Light Mode';
    if (sunIcon) sunIcon.style.color = 'var(--clr-accent-dim)';
    if (moonIcon) moonIcon.style.color = 'var(--clr-muted)';

    if (sidebarToggle) sidebarToggle.classList.remove('active');
    if (sidebarLabel) sidebarLabel.textContent = 'Light Mode';
    if (sidebarSun) sidebarSun.style.color = 'var(--clr-accent-dim)';
    if (sidebarMoon) sidebarMoon.style.color = 'var(--clr-muted)';
  }
})();

/* ================================================================
   JDEVS. — Admin Dashboard JS Additions
   Append this entire block to the END of admin-dashboard.js

   Covers:
     C2.  adminSwitchView title map additions
          ─ Add these two entries inside the `titles` object in
            the existing adminSwitchView() function (adminDashboard.js line ~29):
            'billing' : ['Invoices & Billing', 'Create, track, and manage all client invoices.'],
            'clients' : ['Client Management', 'View and manage all registered and contact clients.'],

     D1.  Create Invoice panel — toggle + submit
     D2.  Invoice table filter (reuses A3 pattern)
     D3.  Invoice table search
     D4.  Mark Invoice as Paid
     D5.  Invoice row delete
     D6.  Client accordion — expand / collapse
     D7.  Client list filter + search
================================================================ */


/* ──────────────────────────────────────────────────────────────
   NOTE: In adminSwitchView() add these to the `titles` object:
   ─────────────────────────────────────────────────────────────
   'billing' : ['Invoices & Billing', 'Create, track, and manage all client invoices.'],
   'clients' : ['Client Management', 'View and manage all registered and contact clients.'],
────────────────────────────────────────────────────────────── */


/* ──────────────────────────────────────────────────────────────
   D0a. CLIENT TYPEAHEAD — type to filter OR click arrow to browse
────────────────────────────────────────────────────────────── */
(function initClientTypeahead() {
  const input = document.getElementById('invClient');
  const emailInput = document.getElementById('invEmail');
  const listEl = document.getElementById('invClientList');
  const arrowBtn = document.getElementById('invClientDropToggle');
  if (!input || !listEl) return;

  const allOpts = Array.from(listEl.querySelectorAll('.adm-inv-client-opt'));

  function showList() { listEl.classList.add('open'); }
  function hideList() { listEl.classList.remove('open'); }
  function filterList(q) {
    let anyVisible = false;
    allOpts.forEach(opt => {
      const match = !q || opt.dataset.name.toLowerCase().includes(q) || opt.dataset.email.toLowerCase().includes(q);
      opt.style.display = match ? '' : 'none';
      if (match) anyVisible = true;
    });
    return anyVisible;
  }

  // Type to filter
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { hideList(); return; }
    filterList(q);
    showList();
  });

  // Arrow button — show all
  if (arrowBtn) {
    arrowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (listEl.classList.contains('open')) { hideList(); return; }
      allOpts.forEach(o => o.style.display = '');
      showList();
      input.focus();
    });
  }

  // Pick a client — auto-fill name + email
  listEl.addEventListener('click', (e) => {
    const opt = e.target.closest('.adm-inv-client-opt');
    if (!opt) return;
    input.value = opt.dataset.name;
    if (emailInput && opt.dataset.email) emailInput.value = opt.dataset.email;
    hideList();
    input.focus();
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !listEl.contains(e.target) && (!arrowBtn || !arrowBtn.contains(e.target))) {
      hideList();
    }
  });

  // Keyboard nav
  input.addEventListener('keydown', (e) => {
    if (!listEl.classList.contains('open')) return;
    const visible = allOpts.filter(o => o.style.display !== 'none');
    const focused = listEl.querySelector('.adm-inv-client-opt.hover');
    let idx = focused ? visible.indexOf(focused) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (focused) focused.classList.remove('hover');
      idx = Math.min(idx + 1, visible.length - 1);
      visible[idx]?.classList.add('hover');
      visible[idx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (focused) focused.classList.remove('hover');
      idx = Math.max(idx - 1, 0);
      visible[idx]?.classList.add('hover');
      visible[idx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focused) { focused.click(); }
    } else if (e.key === 'Escape') {
      hideList();
    }
  });
})();


/* ──────────────────────────────────────────────────────────────
   D0b. SERVICE — reveal custom text input when "other" selected
────────────────────────────────────────────────────────────── */
(function initServiceCustom() {
  const sel = document.getElementById('invService');
  const custom = document.getElementById('invServiceCustom');
  if (!sel || !custom) return;

  sel.addEventListener('change', () => {
    if (sel.value === 'other') {
      custom.style.display = '';
      custom.focus();
    } else {
      custom.style.display = 'none';
      custom.value = '';
    }
  });
})();



(function initCreateInvoicePanel() {

  const toggleBtn = document.getElementById('admCreateInvToggle');
  const panel = document.getElementById('admCreateInvPanel');
  const closeBtn = document.getElementById('admCreateInvClose');
  const closeBtn2 = document.getElementById('admCreateInvClose2');
  const submitBtn = document.getElementById('admCreateInvSubmit');

  if (!toggleBtn || !panel) return;

  function openPanel() { panel.classList.add('open'); toggleBtn.innerHTML = '<i class="ri-close-line"></i> Cancel'; }
  function closePanel() { panel.classList.remove('open'); toggleBtn.innerHTML = '<i class="ri-add-line"></i> Create Invoice'; }

  toggleBtn.addEventListener('click', () => panel.classList.contains('open') ? closePanel() : openPanel());
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (closeBtn2) closeBtn2.addEventListener('click', closePanel);

  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    const client = document.getElementById('invClient')?.value.trim();
    const email = document.getElementById('invEmail')?.value.trim();
    const type = document.getElementById('invType')?.value;
    const serviceSel = document.getElementById('invService');
    const serviceCustom = document.getElementById('invServiceCustom')?.value.trim();
    const service = (serviceSel?.value === 'other' ? serviceCustom : serviceSel?.value) || '';
    const amount = document.getElementById('invAmount')?.value.trim();
    const due = document.getElementById('invDue')?.value;
    const desc = document.getElementById('invDesc')?.value.trim();

    if (!client || !amount) {
      showAdminToast('Missing Fields', 'Please enter at least a client name and amount.', 'red');
      return;
    }

    const tbody = document.getElementById('invTableBody');
    if (!tbody) return;

    // Build invoice number
    const existingRows = tbody.querySelectorAll('tr.adm-inv-row').length;
    const prefix = type === 'quote' ? '#QUO' : '#INV';
    const num = String(43 + existingRows).padStart(4, '0');
    const invRef = `${prefix}-${num}`;

    // Format due date
    let dueTxt = '—';
    if (due) {
      const d = new Date(due);
      dueTxt = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const initials = client.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const tr = document.createElement('tr');
    tr.className = 'adm-inv-row';
    tr.dataset.status = 'unpaid';
    tr.innerHTML = `
      <td><span class="req-id">${invRef}</span></td>
      <td>
        <div class="adm-inv-client">
          <div class="adm-inv-avatar" style="background:rgba(181,255,46,0.12);color:var(--clr-accent);">${initials}</div>
          <div>
            <div class="adm-inv-name">${client}</div>
            <div class="adm-inv-email">${email || 'No email'}</div>
          </div>
        </div>
      </td>
      <td style="color:var(--clr-muted);font-size:0.82rem;">${service || desc || 'Custom'}</td>
      <td style="font-weight:700;color:var(--clr-white);">KES ${Number(amount).toLocaleString()}</td>
      <td style="color:var(--clr-muted);font-size:0.8rem;">${today}</td>
      <td style="color:var(--clr-muted);font-size:0.8rem;">${dueTxt}</td>
      <td><span class="db-status pending">Unpaid</span></td>
      <td>
        <div class="adm-inv-actions">
          <button class="adm-inv-btn mark-paid" data-id="${invRef}" title="Mark as Paid">
            <i class="ri-check-line"></i> Mark Paid
          </button>
          <button class="adm-inv-btn icon-only adm-inv-preview-btn" title="Preview"><i class="ri-eye-line"></i></button>
          <button class="adm-inv-btn icon-only danger" title="Delete"><i class="ri-delete-bin-line"></i></button>
        </div>
      </td>
    `;

    tbody.prepend(tr);
    closePanel();

    // Reset fields
    ['invClient', 'invEmail', 'invAmount', 'invDue', 'invDesc', 'invServiceCustom'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const svcSel = document.getElementById('invService');
    if (svcSel) svcSel.value = '';
    const svcCustom = document.getElementById('invServiceCustom');
    if (svcCustom) svcCustom.style.display = 'none';

    showAdminToast('Invoice Created', `${invRef} created for ${client} — KES ${Number(amount).toLocaleString()}.`, 'green');
  });

})();


/* ──────────────────────────────────────────────────────────────
   D2. INVOICE TABLE FILTER (uses existing A3 adm-filter-btn logic)
   The existing A3 handler in admin-dashboard.js works for .adm-quote-card
   inside .adm-quote-list. Invoice rows use <tr> inside #invTable so we
   need a separate handler that operates on <tr> rows.
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-filter-btn[data-group="inv-filter"]');
  if (!btn) return;

  // Active state
  document.querySelectorAll('.adm-filter-btn[data-group="inv-filter"]').forEach(b => {
    b.classList.remove('active', 'active-red');
  });
  const colorClass = btn.dataset.color ? 'active-' + btn.dataset.color : 'active';
  btn.classList.add(colorClass);

  const filter = btn.dataset.filter;
  document.querySelectorAll('#invTableBody tr.adm-inv-row').forEach(row => {
    row.style.display = (filter === 'all' || row.dataset.status === filter) ? '' : 'none';
  });
});


/* ──────────────────────────────────────────────────────────────
   D3. INVOICE TABLE SEARCH — live filter by client name / ref
────────────────────────────────────────────────────────────── */
(function initInvSearch() {
  const input = document.getElementById('invSearch');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('#invTableBody tr.adm-inv-row').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
})();


/* ──────────────────────────────────────────────────────────────
   D4. MARK INVOICE AS PAID — button click on any inv row
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-inv-btn.mark-paid');
  if (!btn) return;

  const row = btn.closest('tr.adm-inv-row');
  if (!row) return;

  const id = btn.dataset.id || 'Invoice';

  // Update status badge
  const badge = row.querySelector('.db-status');
  if (badge) { badge.className = 'db-status completed'; badge.textContent = 'Paid'; }

  row.dataset.status = 'paid';

  // Swap action buttons — remove Mark Paid, keep preview/download/delete
  btn.remove();

  // Add a download button if not already there
  const actionsDiv = row.querySelector('.adm-inv-actions');
  if (actionsDiv) {
    const dlBtn = document.createElement('button');
    dlBtn.className = 'adm-inv-btn icon-only';
    dlBtn.title = 'Download PDF';
    dlBtn.innerHTML = '<i class="ri-download-line"></i>';
    actionsDiv.prepend(dlBtn);
  }

  showAdminToast('Payment Recorded', `${id} marked as Paid.`, 'green');
});


/* ──────────────────────────────────────────────────────────────
   D5. DELETE INVOICE ROW
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-inv-btn.icon-only.danger');
  if (!btn) return;

  // Check we're inside an invoice row (not another section's delete)
  const row = btn.closest('tr.adm-inv-row');
  if (!row) return;

  const id = row.querySelector('.req-id')?.textContent || 'Invoice';
  row.style.opacity = '0';
  row.style.transition = 'opacity 0.3s ease';
  setTimeout(() => row.remove(), 300);

  showAdminToast('Invoice Deleted', `${id} has been removed.`, 'red');
});


/* ──────────────────────────────────────────────────────────────
   D6. CLIENT ACCORDION — expand / collapse
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const head = e.target.closest('.adm-client-head');
  if (!head) return;

  // Don't trigger on button clicks inside the header area
  if (e.target.closest('button')) return;

  const card = head.closest('.adm-client-card');
  if (!card) return;

  // Close siblings
  const list = card.closest('.adm-client-list');
  if (list) {
    list.querySelectorAll('.adm-client-card.open').forEach(open => {
      if (open !== card) open.classList.remove('open');
    });
  }

  card.classList.toggle('open');
});


/* ──────────────────────────────────────────────────────────────
   D7. CLIENT FILTER + SEARCH
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-filter-btn[data-group="cl-filter"]');
  if (!btn) return;

  document.querySelectorAll('.adm-filter-btn[data-group="cl-filter"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const filter = btn.dataset.filter;
  document.querySelectorAll('#clientList .adm-client-card').forEach(card => {
    card.style.display = (filter === 'all' || card.dataset.status === filter) ? '' : 'none';
  });
});

(function initClientSearch() {
  const input = document.getElementById('clientSearch');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('#clientList .adm-client-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
})();


/* ──────────────────────────────────────────────────────────────
   D8. INVOICE / QUOTATION PREVIEW MODAL (Admin)
   Reads data directly from the clicked row's cells so no
   data-* attributes need to be added to every button.
────────────────────────────────────────────────────────────── */
(function initAdminInvPreview() {

  /* ── Open modal on preview button click ─────────────────── */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.adm-inv-preview-btn');
    if (!btn) return;

    const row = btn.closest('tr.adm-inv-row');
    if (!row) return;

    const cells = row.querySelectorAll('td');

    // Pull values from table cells
    const ref = cells[0]?.querySelector('.req-id')?.textContent?.trim() || '—';
    const client = cells[1]?.querySelector('.adm-inv-name')?.textContent?.trim() || '—';
    const email = cells[1]?.querySelector('.adm-inv-email')?.textContent?.trim() || '—';
    const desc = cells[2]?.textContent?.trim() || '—';
    const amtRaw = cells[3]?.textContent?.trim() || '0';   // e.g. "KES 1,200"
    const date = cells[4]?.textContent?.trim() || '—';
    const due = cells[5]?.textContent?.trim() || '—';
    const status = row.dataset.status || 'unpaid';

    const isQuote = ref.startsWith('#QUO');

    // Strip "KES " and commas for the amount fields
    const amtNum = amtRaw.replace(/KES\s*/i, '').replace(/,/g, '').trim();
    const amtFormatted = 'KES ' + Number(amtNum).toLocaleString();

    // Populate modal
    document.getElementById('admModalRef').textContent = ref;
    document.getElementById('admModalType').textContent = isQuote ? 'Quotation' : 'Invoice';
    document.getElementById('admModalClient').textContent = client;
    document.getElementById('admModalEmail').textContent = email;
    document.getElementById('admModalDate').textContent = date;
    document.getElementById('admModalDue').textContent = due;
    document.getElementById('admModalDueLabel').textContent = isQuote ? 'Valid Until' : 'Due Date';
    document.getElementById('admModalDesc').textContent = desc;
    document.getElementById('admModalItemAmt').textContent = amtNum;
    document.getElementById('admModalSubtotal').textContent = amtFormatted;
    document.getElementById('admModalTotal').textContent = amtFormatted;

    // Show "Mark as Paid" only for unpaid / overdue invoices (not quotes, not already paid)
    const markPaidBtn = document.getElementById('admInvMarkPaidBtn');
    if (markPaidBtn) {
      markPaidBtn.style.display = (!isQuote && (status === 'unpaid' || status === 'overdue')) ? '' : 'none';
      markPaidBtn.dataset.rowRef = ref;
    }

    // Open
    const backdrop = document.getElementById('admInvModalBackdrop');
    if (backdrop) backdrop.classList.add('open');
  });

  /* ── Close modal ──────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const backdrop = document.getElementById('admInvModalBackdrop');
    if (!backdrop) return;
    if (e.target.closest('#admInvModalClose') || e.target === backdrop) {
      backdrop.classList.remove('open');
    }
  });

  /* ── Download stub ────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#admInvDownloadBtn')) return;
    const ref = document.getElementById('admModalRef')?.textContent || 'document';
    showAdminToast('Download Started', ref + ' PDF is being prepared.', 'green');
  });

  /* ── Mark as Paid from modal ──────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#admInvMarkPaidBtn')) return;

    const ref = document.getElementById('admModalRef')?.textContent;
    if (!ref) return;

    // Find the matching row and update it
    const row = document.querySelector(`tr.adm-inv-row .req-id`);
    const allRows = document.querySelectorAll('tr.adm-inv-row');
    let targetRow = null;
    allRows.forEach(r => {
      if (r.querySelector('.req-id')?.textContent?.trim() === ref) targetRow = r;
    });

    if (targetRow) {
      const badge = targetRow.querySelector('.db-status');
      if (badge) { badge.className = 'db-status completed'; badge.textContent = 'Paid'; }
      targetRow.dataset.status = 'paid';

      // Remove the "Mark Paid" table button
      const markBtn = targetRow.querySelector('.adm-inv-btn.mark-paid');
      if (markBtn) markBtn.remove();

      // Add download button if not already there
      const actionsDiv = targetRow.querySelector('.adm-inv-actions');
      if (actionsDiv && !actionsDiv.querySelector('[title="Download PDF"]')) {
        const dlBtn = document.createElement('button');
        dlBtn.className = 'adm-inv-btn icon-only';
        dlBtn.title = 'Download PDF';
        dlBtn.innerHTML = '<i class="ri-download-line"></i>';
        actionsDiv.prepend(dlBtn);
      }
    }

    // Close modal
    document.getElementById('admInvModalBackdrop')?.classList.remove('open');
    showAdminToast('Payment Recorded', `${ref} marked as Paid.`, 'green');
  });

})();


/* ──────────────────────────────────────────────────────────────
   REVISION FILTER (reuses A3 pattern for adm-rev-card items)
   The existing A3 handler in admin-dashboard.js filters
   .adm-quote-card inside .adm-quote-list by data-status.
   Since .adm-rev-card also has .adm-quote-card, it works
   automatically via the data-group="rev-filter" + data-target="#revList".
────────────────────────────────────────────────────────────── */
// No extra code needed — the existing A3 handler covers it.
// The rev-filter buttons use data-target="#revList" which is the
// same container, and cards have data-status attributes set.


/* ================================================================
   MANAGE PANEL — CLIENT PREVIEW TAB
   Replaces the standalone Track Progress Board section.
   Tab switcher + live preview renderer inside the slide panel.
================================================================ */

/* ──────────────────────────────────────────────────────────────
   TAB SWITCHER
   Toggles between "Manage" (adm-cp-body) and "Client Preview"
   (adm-cp-preview-pane) inside the same slide panel.
────────────────────────────────────────────────────────────── */
function admCpSwitchTab(tab) {
  const managePane  = document.getElementById('admCpBodyManage');
  const previewPane = document.getElementById('admCpPreviewPane');
  const tabs = document.querySelectorAll('.adm-cp-tab');

  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));

  if (tab === 'preview') {
    if (managePane)  managePane.style.display  = 'none';
    if (previewPane) previewPane.style.display = '';
    admCpRenderPreview();
  } else {
    if (managePane)  managePane.style.display  = '';
    if (previewPane) previewPane.style.display = 'none';
  }
}


/* ──────────────────────────────────────────────────────────────
   PREVIEW RENDERER
   Reads the current project data from localStorage (same key the
   Manage panel's Save & Sync button writes to) and renders a
   faithful replica of what the client sees on their dashboard.
────────────────────────────────────────────────────────────── */
function admCpRenderPreview() {
  const container = document.getElementById('admCpPrevInner');
  if (!container) return;

  // Determine which project key is open in the panel
  const workId = document.getElementById('admCpPanel')?.dataset.workKey || '';
  const storageKey = workId ? 'jdevs_proj_' + workId.replace('#', '') : null;

  let data = null;
  if (storageKey) {
    try { data = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch {}
  }

  // Fallback: pull what's currently visible in the Manage panel itself
  if (!data) {
    data = _admCpReadPanelData();
  }

  if (!data) {
    container.innerHTML = '<p style="color:var(--clr-muted);font-size:0.82rem;text-align:center;padding:2rem 0;">No data saved yet — use the Manage tab to set milestones and post updates, then save.</p>';
    return;
  }

  const pct      = data.pct || 0;
  const title    = _cpEsc(data.title    || document.getElementById('admCpTitle')?.textContent || 'Project');
  const meta     = _cpEsc(data.meta     || document.getElementById('admCpMeta')?.textContent  || '');
  const nextTitle = _cpEsc(data.nextTitle || '');
  const nextSub   = _cpEsc(data.nextSub  || '');

  // Date stats from stored dates
  const today     = new Date();
  let daysActive  = '—', daysLeft = '—', dueFmt = '—';
  if (data.startDate) {
    const s = new Date(data.startDate);
    daysActive = Math.max(0, Math.round((today - s) / 86400000));
  }
  if (data.dueDate) {
    const d = new Date(data.dueDate);
    daysLeft = Math.max(0, Math.round((d - today) / 86400000));
    dueFmt = d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
  }

  // Milestones
  const milestonesHtml = (data.milestones || []).map(m => `
    <div class="tpb-prev-ms">
      <div class="tpb-prev-ms-dot ${m.state}">
        <i class="${m.state === 'done' ? 'ri-check-line' : m.state === 'active' ? 'ri-loader-4-line' : (m.icon || 'ri-circle-line')}"></i>
      </div>
      <div>
        <div class="tpb-prev-ms-label">${_cpEsc(m.label)}</div>
        <div class="tpb-prev-ms-date">${_cpEsc(m.date)}</div>
        ${m.note ? `<div class="tpb-prev-ms-note">${_cpEsc(m.note)}</div>` : ''}
      </div>
    </div>
  `).join('');

  // Updates
  const updatesHtml = (data.updates || []).map(u => `
    <div class="tpb-prev-upd">
      <div class="tpb-prev-upd-dot ${u.icon}"><i class="${u.ri}"></i></div>
      <div>
        <div class="tpb-prev-upd-text">${u.text}</div>
        <div class="tpb-prev-upd-time">${_cpEsc(u.time)}</div>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="adm-cp-prev-label"><i class="ri-eye-line"></i> Live Client View — ${title}</div>

    <!-- Project Header -->
    <div class="tpb-prev-head">
      <div class="tpb-prev-badge"><i class="ri-loader-4-line"></i> In Progress</div>
      <div class="tpb-prev-title">${title}</div>
      <div class="tpb-prev-meta">${meta}</div>
    </div>

    <!-- Stats row -->
    <div class="tpb-prev-stats">
      <div class="tpb-prev-stat">
        <div class="tpb-prev-stat-val">${daysActive}</div>
        <div class="tpb-prev-stat-lbl">Days Active</div>
      </div>
      <div class="tpb-prev-stat-div"></div>
      <div class="tpb-prev-stat">
        <div class="tpb-prev-stat-val accent">${pct}%</div>
        <div class="tpb-prev-stat-lbl">Complete</div>
      </div>
      <div class="tpb-prev-stat-div"></div>
      <div class="tpb-prev-stat">
        <div class="tpb-prev-stat-val">${daysLeft}</div>
        <div class="tpb-prev-stat-lbl">Days Left</div>
      </div>
      <div class="tpb-prev-stat-div"></div>
      <div class="tpb-prev-stat">
        <div class="tpb-prev-stat-val">${dueFmt}</div>
        <div class="tpb-prev-stat-lbl">Due Date</div>
      </div>
    </div>

    <!-- Milestones -->
    ${milestonesHtml ? `
    <div class="tpb-prev-section">
      <div class="tpb-prev-section-head"><i class="ri-map-2-line"></i> Project Milestones</div>
      <div class="tpb-prev-timeline">${milestonesHtml}</div>
    </div>` : ''}

    <!-- Updates -->
    ${updatesHtml ? `
    <div class="tpb-prev-section">
      <div class="tpb-prev-section-head"><i class="ri-pulse-line"></i> Latest Updates <span class="tpb-pill" style="margin-left:auto;">From JDEVS</span></div>
      <div class="tpb-prev-updates">${updatesHtml}</div>
    </div>` : ''}

    <!-- Up Next -->
    ${nextTitle ? `
    <div class="tpb-prev-next">
      <div class="tpb-prev-next-icon"><i class="ri-arrow-right-up-line"></i></div>
      <div>
        <div class="tpb-prev-next-title">${nextTitle}</div>
        <div class="tpb-prev-next-sub">${nextSub}</div>
      </div>
    </div>` : ''}
  `;
}

/* Read what's currently set in the Manage panel as a fallback */
function _admCpReadPanelData() {
  const pct = parseInt(document.getElementById('admCpPct')?.textContent) || 0;
  const title = document.getElementById('admCpTitle')?.textContent || '';
  const meta  = document.getElementById('admCpMeta')?.textContent  || '';
  const nextTitle = document.getElementById('admCpNextTitle')?.value?.trim() || '';
  const nextSub   = document.getElementById('admCpNextSub')?.value?.trim()   || '';

  // Milestones from the rendered panel list
  const milestones = [];
  document.querySelectorAll('#admCpMsList .adm-cp-ms-item').forEach(item => {
    milestones.push({
      label : item.querySelector('.adm-cp-ms-label')?.textContent?.trim() || '',
      date  : item.querySelector('.adm-cp-ms-date')?.textContent?.trim()  || '',
      state : item.dataset.state || 'pending',
      icon  : 'ri-circle-line',
      note  : item.querySelector('.adm-cp-ms-note-input')?.value?.trim() || '',
    });
  });

  // Updates from the rendered feed
  const updates = [];
  document.querySelectorAll('#admCpUpdFeed .adm-cp-update-item').forEach(item => {
    const iconEl = item.querySelector('.adm-cp-upd-icon');
    const iconCls = iconEl ? (iconEl.classList.contains('green') ? 'green' : iconEl.classList.contains('blue') ? 'blue' : iconEl.classList.contains('orange') ? 'orange' : 'green') : 'green';
    const riCls = iconEl?.querySelector('i')?.className || 'ri-pencil-line';
    updates.push({
      icon : iconCls,
      ri   : riCls,
      text : item.querySelector('.adm-cp-upd-text p')?.innerHTML?.trim() || '',
      time : item.querySelector('.adm-cp-upd-time')?.textContent?.trim()  || '',
    });
  });

  if (!title && !milestones.length && !updates.length) return null;
  return { pct, title, meta, milestones, updates, nextTitle, nextSub };
}

function _cpEsc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


/* ================================================================
   MANAGE PANEL — OPEN / CLOSE / POPULATE / SAVE
   Handles the slide panel opened via the gear button on work cards.
================================================================ */

/* ──────────────────────────────────────────────────────────────
   Open the panel — reads data from the clicked work card
────────────────────────────────────────────────────────────── */
function admCpOpen(card) {
  const panel   = document.getElementById('admCpPanel');
  const overlay = document.getElementById('admCpOverlay');
  if (!panel || !overlay) return;

  // Pull card metadata
  const workId    = card.querySelector('.adm-work-id')?.textContent?.trim()    || '';
  const workTitle = card.querySelector('.adm-work-title')?.textContent?.trim() || 'Project';
  const clientEl  = card.querySelector('.adm-work-client');
  const clientTxt = clientEl ? clientEl.textContent.replace(/\s+/g, ' ').trim() : '';
  const pct       = parseInt(card.querySelector('.db-progress-fill')?.style.width) || 0;

  // Store work key on panel for preview renderer
  panel.dataset.workKey = workId;

  // Populate header
  document.getElementById('admCpTitle').textContent = workTitle;
  document.getElementById('admCpMeta').textContent  = clientTxt;
  document.getElementById('admCpPct').textContent   = pct;

  // Try to load saved data from localStorage
  const storageKey = workId ? 'jdevs_proj_' + workId.replace('#', '') : null;
  let saved = null;
  if (storageKey) {
    try { saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch {}
  }

  // Populate dates
  document.getElementById('admCpStartDate').value = saved?.startDate || '';
  document.getElementById('admCpDueDate').value   = saved?.dueDate   || '';

  // Populate next banner
  document.getElementById('admCpNextTitle').value = saved?.nextTitle || '';
  document.getElementById('admCpNextSub').value   = saved?.nextSub   || '';

  // Populate milestones
  admCpRenderMilestones(saved?.milestones || []);

  // Populate updates feed
  admCpRenderUpdates(saved?.updates || []);

  // Always start on Manage tab
  admCpSwitchTab('manage');

  // Open
  panel.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ──────────────────────────────────────────────────────────────
   Close the panel
────────────────────────────────────────────────────────────── */
function admCpClose() {
  document.getElementById('admCpPanel')?.classList.remove('open');
  document.getElementById('admCpOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────────
   Render milestones list
────────────────────────────────────────────────────────────── */
function admCpRenderMilestones(milestones) {
  const list = document.getElementById('admCpMsList');
  if (!list) return;
  list.innerHTML = milestones.map((m, i) => `
    <div class="adm-cp-ms-item" data-idx="${i}" data-state="${m.state || 'pending'}">
      <select class="adm-cp-ms-state-sel" title="State">
        <option value="done"    ${m.state === 'done'    ? 'selected' : ''}>✅</option>
        <option value="active"  ${m.state === 'active'  ? 'selected' : ''}>🔄</option>
        <option value="pending" ${m.state === 'pending' ? 'selected' : ''}>⏳</option>
      </select>
      <input class="adm-cp-ms-label-input adm-cp-ms-label" value="${_cpEsc(m.label)}" placeholder="Milestone…" />
      <input class="adm-cp-ms-date-input adm-cp-ms-date"  value="${_cpEsc(m.date)}"  placeholder="Date" />
      <button class="adm-cp-ms-del" title="Remove"><i class="ri-delete-bin-line"></i></button>
    </div>
  `).join('');
}

/* ──────────────────────────────────────────────────────────────
   Render updates feed
────────────────────────────────────────────────────────────── */
function admCpRenderUpdates(updates) {
  const feed = document.getElementById('admCpUpdFeed');
  if (!feed) return;
  if (!updates.length) { feed.innerHTML = ''; return; }
  feed.innerHTML = updates.map((u, i) => `
    <div class="adm-cp-update-item" data-idx="${i}">
      <div class="adm-cp-upd-icon ${u.icon}"><i class="${u.ri}"></i></div>
      <div style="flex:1;">
        <div class="adm-cp-upd-text"><p>${u.text}</p></div>
        <div class="adm-cp-upd-time">${_cpEsc(u.time)}</div>
      </div>
      <button class="adm-cp-ms-del" data-upd-del="${i}" title="Remove"><i class="ri-delete-bin-line"></i></button>
    </div>
  `).join('');
}

/* ──────────────────────────────────────────────────────────────
   Collect current panel state into a data object
────────────────────────────────────────────────────────────── */
function _admCpCollect() {
  const pct = parseInt(document.getElementById('admCpPct')?.textContent) || 0;
  const title = document.getElementById('admCpTitle')?.textContent?.trim() || '';
  const meta  = document.getElementById('admCpMeta')?.textContent?.trim()  || '';
  const startDate = document.getElementById('admCpStartDate')?.value || '';
  const dueDate   = document.getElementById('admCpDueDate')?.value   || '';
  const nextTitle = document.getElementById('admCpNextTitle')?.value?.trim() || '';
  const nextSub   = document.getElementById('admCpNextSub')?.value?.trim()   || '';

  const milestones = [];
  document.querySelectorAll('#admCpMsList .adm-cp-ms-item').forEach(item => {
    milestones.push({
      label : item.querySelector('.adm-cp-ms-label')?.value?.trim() || '',
      date  : item.querySelector('.adm-cp-ms-date')?.value?.trim()  || '',
      state : item.querySelector('.adm-cp-ms-state-sel')?.value     || 'pending',
      icon  : 'ri-circle-line',
      note  : '',
    });
  });

  const updates = [];
  document.querySelectorAll('#admCpUpdFeed .adm-cp-update-item').forEach(item => {
    const iconEl  = item.querySelector('.adm-cp-upd-icon');
    const iconCls = iconEl
      ? (iconEl.classList.contains('green') ? 'green' : iconEl.classList.contains('blue') ? 'blue' : 'orange')
      : 'green';
    const riCls = iconEl?.querySelector('i')?.className || 'ri-pencil-line';
    updates.push({
      icon : iconCls,
      ri   : riCls,
      text : item.querySelector('.adm-cp-upd-text p')?.innerHTML?.trim() || '',
      time : item.querySelector('.adm-cp-upd-time')?.textContent?.trim()  || '',
    });
  });

  return { pct, title, meta, startDate, dueDate, nextTitle, nextSub, milestones, updates };
}

/* ──────────────────────────────────────────────────────────────
   CLICK HANDLER — Manage button on work cards
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-work-btn[data-action="manage"]');
  if (!btn) return;
  const card = btn.closest('.adm-work-card');
  if (card) admCpOpen(card);
});

/* ──────────────────────────────────────────────────────────────
   CLICK HANDLER — Close button + overlay click
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  if (e.target.closest('#admCpClose') || e.target.id === 'admCpOverlay') {
    admCpClose();
  }
});

/* ──────────────────────────────────────────────────────────────
   CLICK HANDLER — Add Milestone
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  if (!e.target.closest('#admCpAddMs')) return;
  const list = document.getElementById('admCpMsList');
  if (!list) return;
  const idx = list.querySelectorAll('.adm-cp-ms-item').length;
  const row = document.createElement('div');
  row.className = 'adm-cp-ms-item';
  row.dataset.idx   = idx;
  row.dataset.state = 'pending';
  row.innerHTML = `
    <select class="adm-cp-ms-state-sel" title="State">
      <option value="done">✅</option>
      <option value="active">🔄</option>
      <option value="pending" selected>⏳</option>
    </select>
    <input class="adm-cp-ms-label-input adm-cp-ms-label" placeholder="Milestone name…" />
    <input class="adm-cp-ms-date-input adm-cp-ms-date"  placeholder="e.g. May 20" />
    <button class="adm-cp-ms-del" title="Remove"><i class="ri-delete-bin-line"></i></button>
  `;
  list.appendChild(row);
  row.querySelector('.adm-cp-ms-label')?.focus();
});

/* ──────────────────────────────────────────────────────────────
   CLICK HANDLER — Delete Milestone row
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const del = e.target.closest('.adm-cp-ms-item .adm-cp-ms-del');
  if (!del) return;
  del.closest('.adm-cp-ms-item')?.remove();
});

/* ──────────────────────────────────────────────────────────────
   CLICK HANDLER — Delete Update from feed
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const del = e.target.closest('[data-upd-del]');
  if (!del) return;
  del.closest('.adm-cp-update-item')?.remove();
});

/* ──────────────────────────────────────────────────────────────
   CLICK HANDLER — Post Update to feed
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  if (!e.target.closest('#admCpPostUpd')) return;
  const textarea = document.getElementById('admCpUpdText');
  const selEl    = document.getElementById('admCpUpdIcon');
  const feed     = document.getElementById('admCpUpdFeed');
  if (!textarea || !selEl || !feed) return;

  const text = textarea.value.trim();
  if (!text) { showAdminToast('Empty Update', 'Please type an update before posting.', 'red'); return; }

  const [iconCls, riCls] = (selEl.value || 'green|ri-pencil-line').split('|');
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const item = document.createElement('div');
  item.className = 'adm-cp-update-item';
  const idx = feed.querySelectorAll('.adm-cp-update-item').length;
  item.dataset.idx = idx;
  item.innerHTML = `
    <div class="adm-cp-upd-icon ${_cpEsc(iconCls)}"><i class="${_cpEsc(riCls)}"></i></div>
    <div style="flex:1;">
      <div class="adm-cp-upd-text"><p>${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p></div>
      <div class="adm-cp-upd-time">${now}</div>
    </div>
    <button class="adm-cp-ms-del" data-upd-del="${idx}" title="Remove"><i class="ri-delete-bin-line"></i></button>
  `;
  feed.prepend(item);
  textarea.value = '';
  showAdminToast('Update Posted', 'Client update added to the feed.', 'green');
});

/* ──────────────────────────────────────────────────────────────
   CLICK HANDLER — Save & Sync to localStorage
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  if (!e.target.closest('#admCpSave')) return;
  const panel = document.getElementById('admCpPanel');
  const workId = panel?.dataset.workKey || '';
  if (!workId) { showAdminToast('No Project', 'Could not determine work order ID.', 'red'); return; }

  const storageKey = 'jdevs_proj_' + workId.replace('#', '');
  const data = _admCpCollect();

  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
    showAdminToast('Saved', `${workId} synced to client dashboard.`, 'green');
  } catch (err) {
    showAdminToast('Save Failed', 'localStorage error — storage may be full.', 'red');
  }
});

/* ──────────────────────────────────────────────────────────────
   CHANGE HANDLER — milestone state select updates data-state
────────────────────────────────────────────────────────────── */
document.addEventListener('change', function (e) {
  const sel = e.target.closest('.adm-cp-ms-state-sel');
  if (!sel) return;
  const item = sel.closest('.adm-cp-ms-item');
  if (item) item.dataset.state = sel.value;
});
