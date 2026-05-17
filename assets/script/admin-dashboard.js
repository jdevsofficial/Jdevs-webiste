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
    'track-progress': ['Progress Boards', 'Control what each client sees when they click "Track Progress".'],
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


/* ════════════════════════════════════════════════════════════════
   PROGRESS BOARDS — Admin editor for the user "Track Progress" panel
   Mirrors the tpProjects data structure in dashboard.html exactly.
   Data persisted to localStorage → read by user dashboard on load.
════════════════════════════════════════════════════════════════ */

/* ── Default data (mirrors dashboard.html tpProjects) ────────── */
const TPB_DEFAULTS = {
  coffee: {
    title: 'Coffee Brand Identity',
    meta: 'Branding · #QR-0089 · Started Apr 21, 2026',
    startDate: '2026-04-21',
    dueDate: '2026-05-08',
    pct: 65,
    milestones: [
      { label: 'Brief & Discovery', date: 'Apr 21, 2026', state: 'done', icon: 'ri-file-text-line', note: 'Brand questionnaire completed. Tone: premium, warm, artisanal.' },
      { label: 'Concept Research', date: 'Apr 23, 2026', state: 'done', icon: 'ri-search-eye-line', note: 'Mood board finalised — earthy tones, hand-drawn textures, serif typography.' },
      { label: 'Initial Design Drafts', date: 'Apr 28, 2026', state: 'done', icon: 'ri-brush-3-line', note: '3 logo concepts drafted. Color system and typeface pairing selected.' },
      { label: 'Client Review', date: 'In progress', state: 'active', icon: 'ri-eye-line', note: 'Drafts ready for your review — expect a link via email by May 2.' },
      { label: 'Revisions & Refinement', date: 'Upcoming', state: 'pending', icon: 'ri-edit-line', note: '' },
      { label: 'Brand Guidelines Doc', date: 'Upcoming', state: 'pending', icon: 'ri-book-2-line', note: '' },
      { label: 'Final Delivery', date: 'May 8, 2026', state: 'pending', icon: 'ri-rocket-line', note: '' },
    ],
    updates: [
      { icon: 'green', ri: 'ri-brush-3-line', text: '<strong>3 logo concepts completed</strong> — ready for your review. Check your email for the preview link.', time: 'Apr 28 · 3:12 PM' },
      { icon: 'blue', ri: 'ri-palette-line', text: 'Color system defined: <strong>Espresso Brown, Cream White, Forest Green</strong>. Looks stunning.', time: 'Apr 26 · 11:45 AM' },
      { icon: 'green', ri: 'ri-image-line', text: 'Mood board approved and <strong>visual direction locked in</strong>. Moving to design phase.', time: 'Apr 23 · 9:00 AM' },
    ],
    nextTitle: 'Up Next: Your Review',
    nextSub: "We'll share design drafts for feedback. Your input at this stage shapes the final brand direction.",
  },
  landing: {
    title: 'Landing Page UI',
    meta: 'Web Design · #QR-0092 · Started Apr 28, 2026',
    startDate: '2026-04-28',
    dueDate: '2026-05-20',
    pct: 15,
    milestones: [
      { label: 'Brief & Scope', date: 'Apr 28, 2026', state: 'done', icon: 'ri-file-text-line', note: 'Requirements captured: SaaS landing page, 5 sections, mobile-first.' },
      { label: 'Wireframe Layout', date: 'In progress', state: 'active', icon: 'ri-layout-3-line', note: 'Low-fidelity wireframes being drafted — hero, features, pricing, CTA, footer.' },
      { label: 'Visual Design', date: 'Upcoming', state: 'pending', icon: 'ri-palette-line', note: '' },
      { label: 'Prototype & Review', date: 'Upcoming', state: 'pending', icon: 'ri-device-line', note: '' },
      { label: 'Responsive QA', date: 'Upcoming', state: 'pending', icon: 'ri-smartphone-line', note: '' },
      { label: 'Final Handoff', date: 'May 20, 2026', state: 'pending', icon: 'ri-rocket-line', note: '' },
    ],
    updates: [
      { icon: 'blue', ri: 'ri-layout-3-line', text: '<strong>Wireframing started</strong> — mapping the hero and features sections first.', time: 'May 1 · 9:30 AM' },
      { icon: 'green', ri: 'ri-file-text-line', text: 'Project brief confirmed. <strong>Scope & sitemap agreed</strong>. Work begins today.', time: 'Apr 28 · 2:00 PM' },
    ],
    nextTitle: 'Up Next: Wireframe Review',
    nextSub: "You'll receive a low-fidelity wireframe to approve before we move into full visual design.",
  },
};

/* ── State ─────────────────────────────────────────────────── */
let _tpbKey = 'coffee';            // active project key
let _tpbData = {};                 // deep clone of current working data

/* ── Load: merge localStorage over defaults ──────────────────── */
function tpbLoad(key) {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem('jdevs_track_' + key) || 'null'); }
    catch { return null; }
  })();
  return saved ? Object.assign({}, TPB_DEFAULTS[key], saved) : JSON.parse(JSON.stringify(TPB_DEFAULTS[key]));
}

/* ── Save to localStorage ────────────────────────────────────── */
function tpbSave() {
  _tpbReadFormIntoData();
  try {
    localStorage.setItem('jdevs_track_' + _tpbKey, JSON.stringify(_tpbData));
    showAdminToast('Progress Board Saved', '"' + _tpbData.title + '" track panel updated — client will see changes on next load.', 'green');
  } catch (e) {
    showAdminToast('Save Failed', 'localStorage error: ' + e.message, 'red');
  }
}

/* ── Reset to default ────────────────────────────────────────── */
function tpbReset() {
  _tpbData = JSON.parse(JSON.stringify(TPB_DEFAULTS[_tpbKey]));
  localStorage.removeItem('jdevs_track_' + _tpbKey);
  tpbRenderAll();
  showAdminToast('Reset to Default', 'Progress board restored to original defaults.', '');
}

/* ── Select project tab ──────────────────────────────────────── */
function tpbSelectProject(btn) {
  document.querySelectorAll('.tpb-proj-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  _tpbKey = btn.dataset.proj;
  _tpbData = tpbLoad(_tpbKey);
  tpbRenderAll();
}

/* ── Render everything from _tpbData ─────────────────────────── */
function tpbRenderAll() {
  const d = _tpbData;

  // Stats fields
  _setVal('tpbStartDate', d.startDate || '');
  _setVal('tpbDueDate', d.dueDate || '');
  _setVal('tpbPctSlider', d.pct);
  tpbSyncPct(d.pct);
  tpbAutoCalc();

  // Milestones
  tpbRenderMilestones();

  // Updates
  tpbRenderUpdates();

  // Up Next
  _setVal('tpbNextTitle', d.nextTitle || '');
  _setVal('tpbNextSub', d.nextSub || '');

  // Live preview
  tpbLivePreview();
}

/* ── Sync pct slider display ─────────────────────────────────── */
function tpbSyncPct(val) {
  val = Math.min(100, Math.max(0, parseInt(val) || 0));
  document.getElementById('tpbPctDisplay').textContent = val + '%';
  document.getElementById('tpbPctSlider').value = val;
  _tpbData.pct = val;
  // Update preview
  const el = document.getElementById('prevPct');
  if (el) el.textContent = val + '%';
}

/* ── Auto-calculate days from dates ──────────────────────────── */
function tpbAutoCalc() {
  const startVal = document.getElementById('tpbStartDate')?.value;
  const dueVal = document.getElementById('tpbDueDate')?.value;
  const today = new Date();

  if (startVal) {
    const start = new Date(startVal);
    const diff = Math.max(0, Math.round((today - start) / 86400000));
    _setVal('tpbDaysActive', diff);
    _tpbData.startDate = startVal;
  }
  if (dueVal) {
    const due = new Date(dueVal);
    const left = Math.max(0, Math.round((due - today) / 86400000));
    _setVal('tpbDaysLeft', left);
    const fmt = due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    _setVal('tpbDueFmt', fmt);
    _tpbData.dueDate = dueVal;
    // Update preview
    const pDays = document.getElementById('prevDays');
    const pLeft = document.getElementById('prevLeft');
    const pDue = document.getElementById('prevDue');
    if (pDays && startVal) pDays.textContent = Math.max(0, Math.round((today - new Date(startVal)) / 86400000));
    if (pLeft) pLeft.textContent = left;
    if (pDue) pDue.textContent = fmt;
  }
}

/* ── Render milestone editor list ────────────────────────────── */
function tpbRenderMilestones() {
  const list = document.getElementById('tpbMsList');
  if (!list) return;
  list.innerHTML = '';
  (_tpbData.milestones || []).forEach((ms, idx) => {
    const row = document.createElement('div');
    row.className = 'tpb-ms-row';
    row.dataset.idx = idx;
    row.innerHTML = `
      <div class="tpb-ms-order-btns">
        <button class="tpb-ms-order-btn" onclick="tpbMsMove(${idx},-1)" title="Move up">▲</button>
        <button class="tpb-ms-order-btn" onclick="tpbMsMove(${idx}, 1)" title="Move down">▼</button>
      </div>
      <input class="tpb-input" style="font-size:0.8rem; padding:0.4rem 0.6rem;" value="${_esc(ms.label)}" placeholder="Milestone label"
        oninput="_tpbData.milestones[${idx}].label=this.value; tpbLivePreview();" />
      <input class="tpb-input" style="font-size:0.8rem; padding:0.4rem 0.6rem;" value="${_esc(ms.date)}" placeholder="Date / status"
        oninput="_tpbData.milestones[${idx}].date=this.value; tpbLivePreview();" />
      <select class="tpb-ms-state-sel state-${ms.state}" onchange="tpbMsStateChange(this,${idx})">
        <option value="done"    ${ms.state === 'done' ? 'selected' : ''}>✅ Done</option>
        <option value="active"  ${ms.state === 'active' ? 'selected' : ''}>⏳ Active</option>
        <option value="pending" ${ms.state === 'pending' ? 'selected' : ''}>○ Pending</option>
      </select>
      <button class="tpb-ms-del-btn" onclick="tpbMsDelete(${idx})" title="Remove"><i class="ri-delete-bin-line"></i></button>
      <input class="tpb-ms-note-field" value="${_esc(ms.note || '')}" placeholder="Optional note shown to client…"
        oninput="_tpbData.milestones[${idx}].note=this.value; tpbLivePreview();" />
    `;
    list.appendChild(row);
  });
  tpbLivePreview();
}

function tpbMsStateChange(sel, idx) {
  _tpbData.milestones[idx].state = sel.value;
  sel.className = 'tpb-ms-state-sel state-' + sel.value;
  tpbLivePreview();
}

function tpbMsMove(idx, dir) {
  const ms = _tpbData.milestones;
  const target = idx + dir;
  if (target < 0 || target >= ms.length) return;
  [ms[idx], ms[target]] = [ms[target], ms[idx]];
  tpbRenderMilestones();
}

function tpbMsDelete(idx) {
  _tpbData.milestones.splice(idx, 1);
  tpbRenderMilestones();
}

function tpbAddMilestone() {
  _tpbData.milestones.push({ label: 'New Milestone', date: 'Upcoming', state: 'pending', icon: 'ri-checkbox-blank-circle-line', note: '' });
  tpbRenderMilestones();
  // Scroll list to bottom
  const list = document.getElementById('tpbMsList');
  if (list) list.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Render update list ───────────────────────────────────────── */
function tpbRenderUpdates() {
  const list = document.getElementById('tpbUpdList');
  if (!list) return;
  list.innerHTML = '';
  (_tpbData.updates || []).forEach((u, idx) => {
    const row = document.createElement('div');
    row.className = 'tpb-upd-row';
    row.innerHTML = `
      <div class="tpb-upd-dot ${u.icon}"><i class="${u.ri}"></i></div>
      <div class="tpb-upd-body">
        <div class="tpb-upd-text">${u.text}</div>
        <div class="tpb-upd-time">${u.time}</div>
      </div>
      <button class="tpb-ms-del-btn" onclick="tpbDelUpdate(${idx})" title="Remove"><i class="ri-delete-bin-line"></i></button>
    `;
    list.appendChild(row);
  });
  tpbLivePreview();
}

function tpbDelUpdate(idx) {
  _tpbData.updates.splice(idx, 1);
  tpbRenderUpdates();
}

function tpbAddUpdate() {
  const form = document.getElementById('tpbUpdateForm');
  form.style.display = form.style.display === 'none' ? '' : 'none';
  if (form.style.display !== 'none') {
    // Set default timestamp
    const now = new Date();
    const fmt = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' +
      now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const timeEl = document.getElementById('tpbUpdTime');
    if (timeEl && !timeEl.value) timeEl.value = fmt;
  }
}

function tpbCommitUpdate() {
  const icon = document.getElementById('tpbUpdIcon')?.value || 'green';
  const ri = document.getElementById('tpbUpdRi')?.value || 'ri-brush-3-line';
  const text = document.getElementById('tpbUpdText')?.value.trim() || '';
  const time = document.getElementById('tpbUpdTime')?.value.trim() || '';
  if (!text) { showAdminToast('Missing Text', 'Please write the update message.', 'red'); return; }
  _tpbData.updates.unshift({ icon, ri, text, time });
  // Clear form
  ['tpbUpdText', 'tpbUpdTime'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('tpbUpdateForm').style.display = 'none';
  tpbRenderUpdates();
}

/* ── Live preview render ─────────────────────────────────────── */
function tpbLivePreview() {
  const d = _tpbData;
  if (!d) return;

  // Title / meta
  _setText('prevTitle', d.title || '');
  _setText('prevMeta', d.meta || '');

  // Stats
  _setText('prevPct', (d.pct || 0) + '%');

  // Milestones
  const tl = document.getElementById('prevTimeline');
  if (tl) {
    tl.innerHTML = (d.milestones || []).map(m => `
      <div class="tpb-prev-ms">
        <div class="tpb-prev-ms-dot ${m.state}">
          <i class="${m.state === 'done' ? 'ri-check-line' : m.state === 'active' ? 'ri-loader-4-line' : m.icon || 'ri-circle-line'}"></i>
        </div>
        <div>
          <div class="tpb-prev-ms-label">${_esc(m.label)}</div>
          <div class="tpb-prev-ms-date">${_esc(m.date)}</div>
          ${m.note ? `<div class="tpb-prev-ms-note">${_esc(m.note)}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Updates
  const ul = document.getElementById('prevUpdates');
  if (ul) {
    ul.innerHTML = (d.updates || []).map(u => `
      <div class="tpb-prev-upd">
        <div class="tpb-prev-upd-dot ${u.icon}"><i class="${u.ri}"></i></div>
        <div>
          <div class="tpb-prev-upd-text">${u.text}</div>
          <div class="tpb-prev-upd-time">${_esc(u.time)}</div>
        </div>
      </div>
    `).join('');
  }

  // Up Next
  _setText('prevNextTitle', document.getElementById('tpbNextTitle')?.value || d.nextTitle || '');
  _setText('prevNextSub', document.getElementById('tpbNextSub')?.value || d.nextSub || '');
}

/* ── Toggle preview col on mobile ────────────────────────────── */
function tpbTogglePreview() {
  // Sync form data into _tpbData before opening the modal
  _tpbReadFormIntoData();
  tpbModalOpen();
}

/* ── Read form fields back into _tpbData before saving ───────── */
function _tpbReadFormIntoData() {
  _tpbData.nextTitle = document.getElementById('tpbNextTitle')?.value.trim() || '';
  _tpbData.nextSub = document.getElementById('tpbNextSub')?.value.trim() || '';
  _tpbData.pct = parseInt(document.getElementById('tpbPctSlider')?.value) || 0;
  _tpbData.startDate = document.getElementById('tpbStartDate')?.value || '';
  _tpbData.dueDate = document.getElementById('tpbDueDate')?.value || '';
  // milestones and updates are already live-synced via oninput handlers
}

/* ── Helpers ─────────────────────────────────────────────────── */
function _setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function _setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }
function _esc(str) { return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/* ── Init on view load ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  // Load coffee data as default
  _tpbData = tpbLoad('coffee');
  tpbRenderAll();

  // Up Next fields: live preview on type
  ['tpbNextTitle', 'tpbNextSub'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', tpbLivePreview);
  });
});



/* ================================================================
   JDEVS. — Admin Dashboard JS Additions
   APPEND THIS ENTIRE FILE to the end of admin-dashboard.js
   ================================================================

   Covers:
     E1.  adminSwitchView title map additions (revisions + finished-projects)
          — ALSO manually add these two lines inside the `titles` object
            in the existing adminSwitchView() function:
            'revisions'         : ['Revisions', 'Client revision requests and admin responses.'],
            'finished-projects' : ['Finished Projects', 'Completed and delivered work gallery.'],

     E2.  Revisions — accordion (reuses existing A2 adm-quote-head handler)
     E3.  Revisions — filter bar (reuses A3 pattern via data-group="rev-filter")
     E4.  Revisions — inline search (reuses A4 pattern)
     E5.  Revisions — Post Revision Update handler
     E6.  Finished Projects — file upload + drag-drop + thumbs
     E7.  Finished Projects — Add to grid
     E8.  Finished Projects — category filter + delete + lightbox
     E9.  Progress Board — fullscreen preview modal
================================================================ */


/* ──────────────────────────────────────────────────────────────
   E1. View title entries are now handled directly in adminSwitchView().
────────────────────────────────────────────────────────────── */


/* ──────────────────────────────────────────────────────────────
   E5. REVISIONS — Post Revision Update handler
   Reads the card's form fields, posts update into the
   adm-rev-updates-posted container, saves to localStorage
   so the user dashboard can display it.
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-rev-post-btn');
  if (!btn) return;

  const card = btn.closest('.adm-rev-card');
  if (!card) return;

  const revId = btn.dataset.revid || card.dataset.revid || 'REV-???';
  const iconSel = card.querySelector('.adm-rev-icon-sel');
  const riSel = card.querySelector('.adm-rev-ri-sel');
  const textEl = card.querySelector('.adm-rev-update-text');
  const statusSel = card.querySelector('.adm-rev-status-sel');

  const icon = iconSel ? iconSel.value : 'blue';
  const ri = riSel ? riSel.value : 'ri-refresh-line';
  const text = textEl ? textEl.value.trim() : '';
  const newStatus = statusSel ? statusSel.value : null;

  if (!text) {
    showAdminToast('Empty Update', 'Please write an update message before posting.', 'red');
    return;
  }

  // Build timestamp
  const now = new Date();
  const time = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ' · ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // Render the posted update into the DOM
  const postedContainer = document.getElementById('revPosted-' + revId);
  if (postedContainer) {
    const item = document.createElement('div');
    item.className = 'adm-rev-posted-item';
    item.innerHTML = `
      <div class="tpb-prev-upd-dot ${icon}"><i class="${ri}"></i></div>
      <div class="adm-rev-posted-body">
        <div class="adm-rev-posted-text">${_escRev(text)}</div>
        <div class="adm-rev-posted-time">${time}</div>
      </div>
    `;
    postedContainer.prepend(item);
  }

  // Update card status if changed
  if (newStatus && card.dataset.status !== newStatus) {
    card.dataset.status = newStatus;

    const badge = card.querySelector('.adm-quote-head .db-status');
    if (badge) {
      const statusMap = {
        'pending': ['pending', 'Pending'],
        'in-progress': ['progress', 'In Progress'],
        'resolved': ['completed', 'Resolved'],
      };
      const [cls, txt] = statusMap[newStatus] || ['pending', 'Pending'];
      badge.className = 'db-status ' + cls;
      badge.textContent = txt;
    }

    // Update stat counters
    _revUpdateStats();
  }

  // Persist to localStorage so user dashboard picks it up
  _revSaveUpdate(revId, { icon, ri, text, time, status: newStatus });

  // Clear the textarea
  if (textEl) textEl.value = '';

  showAdminToast('Update Posted', `Revision update for ${revId} is now visible to the client.`, 'green');
});

/* save/load rev updates via localStorage */
function _revSaveUpdate(revId, update) {
  const key = 'jdevs_rev_' + revId.toLowerCase().replace('-', '_');
  let updates = [];
  try { updates = JSON.parse(localStorage.getItem(key) || '[]'); } catch { }
  updates.unshift(update);
  try { localStorage.setItem(key, JSON.stringify(updates)); } catch { }
}

function _revLoadUpdates(revId) {
  const key = 'jdevs_rev_' + revId.toLowerCase().replace('-', '_');
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function _escRev(str) {
  return (str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _revUpdateStats() {
  const cards = document.querySelectorAll('#revList .adm-rev-card');
  let pending = 0, inProg = 0, resolved = 0, urgent = 0;
  cards.forEach(c => {
    const s = c.dataset.status;
    if (s === 'pending') pending++;
    if (s === 'in-progress') inProg++;
    if (s === 'resolved') resolved++;
    // count urgent
    if (c.querySelector('.adm-rev-priority-tag.urgent')) {
      if (s !== 'resolved') urgent++;
    }
  });
  const _s = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  _s('revStatPending', pending);
  _s('revStatInProgress', inProg);
  _s('revStatResolved', resolved);
  _s('revStatUrgent', urgent);
  _s('revNavBadge', pending + inProg);
  _s('revCountAll', cards.length);
  _s('revCountPending', pending);
}

/* restore posted updates from localStorage on page load */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('#revList .adm-rev-card').forEach(card => {
    const revId = card.dataset.revid;
    if (!revId) return;

    const savedUpdates = _revLoadUpdates(revId);
    if (!savedUpdates.length) return;

    const container = document.getElementById('revPosted-' + revId);
    if (!container) return;

    savedUpdates.forEach(u => {
      const item = document.createElement('div');
      item.className = 'adm-rev-posted-item';
      item.innerHTML = `
        <div class="tpb-prev-upd-dot ${u.icon}"><i class="${u.ri}"></i></div>
        <div class="adm-rev-posted-body">
          <div class="adm-rev-posted-text">${_escRev(u.text)}</div>
          <div class="adm-rev-posted-time">${_escRev(u.time)}</div>
        </div>
      `;
      container.appendChild(item);
    });
  });
});

/* Revision search */
(function initRevSearch() {
  document.addEventListener('input', function (e) {
    const input = e.target;
    if (input.id !== 'revSearch') return;
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('#revList .adm-rev-card').forEach(card => {
      card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
})();


/* ================================================================
   FINISHED PROJECTS UPGRADE — JS
   
   HOW TO USE:
   1. In admin-dashboard.js, DELETE the existing blocks:
        E6. FINISHED PROJECTS — File upload + drag/drop + thumbnails
        E7. FINISHED PROJECTS — Add to grid handler
   
   2. Paste this entire file in their place.
   
   E8, E9 (category filter, delete, lightbox) remain unchanged.
================================================================ */


/* ──────────────────────────────────────────────────────────────
   DATA STORE — Active Projects & Linked Invoices
   Update these arrays whenever you add/complete a work order.
────────────────────────────────────────────────────────────── */
const JDEVS_ACTIVE_PROJECTS = [
  {
    workId: '#WK-014',
    title: 'Coffee Brand Identity',
    client: 'John Doe',
    email: 'john@example.com',
    service: 'Branding',
    category: 'branding',
    status: 'in-progress',
    invoiceRef: '#INV-0041',
  },
  {
    workId: '#WK-015',
    title: 'Landing Page UI',
    client: 'John Doe',
    email: 'john@example.com',
    service: 'Web Design',
    category: 'web',
    status: 'in-progress',
    invoiceRef: '#INV-0042',
  },
  {
    workId: '#WK-013',
    title: 'Menu Card Design',
    client: 'Amina Hassan',
    email: 'amina.h@yahoo.com',
    service: 'Print Design',
    category: 'print',
    status: 'review',
    invoiceRef: '#QUO-0018',
  },
  {
    workId: '#WK-016',
    title: 'Kids Brand Logo',
    client: 'Grace Mutua',
    email: 'g.mutua@gmail.com',
    service: 'Logo Design',
    category: 'logo',
    status: 'pending',
    invoiceRef: null,
  },
  {
    workId: '#WK-012',
    title: 'Event Flyer',
    client: 'David Omondi',
    email: 'david@example.com',
    service: 'Print Design',
    category: 'print',
    status: 'in-progress',
    invoiceRef: null,
  },
];

/* Invoice lookup — keyed by invoice ref */
const JDEVS_INVOICES = {
  '#INV-0041': {
    ref: '#INV-0041',
    type: 'Invoice',
    client: 'John Doe',
    email: 'john@example.com',
    desc: 'Brand Identity Pack',
    amount: 'KES 399',
    issued: 'Apr 20, 2026',
    due: 'Apr 30, 2026',
    status: 'overdue',
  },
  '#INV-0042': {
    ref: '#INV-0042',
    type: 'Invoice',
    client: 'John Doe',
    email: 'john@example.com',
    desc: 'Landing Page UI',
    amount: 'KES 1,200',
    issued: 'May 1, 2026',
    due: 'May 20, 2026',
    status: 'unpaid',
  },
  '#QUO-0018': {
    ref: '#QUO-0018',
    type: 'Quotation',
    client: 'Amina Hassan',
    email: 'amina.h@yahoo.com',
    desc: 'Branding Package',
    amount: 'KES 8,000',
    issued: 'Apr 30, 2026',
    due: 'May 30, 2026',
    status: 'unpaid',
  },
  '#INV-0039': {
    ref: '#INV-0039',
    type: 'Invoice',
    client: 'John Doe',
    email: 'john@example.com',
    desc: 'Logo Design',
    amount: 'KES 149',
    issued: 'Apr 12, 2026',
    due: 'Apr 20, 2026',
    status: 'paid',
  },
  '#INV-0035': {
    ref: '#INV-0035',
    type: 'Invoice',
    client: 'John Doe',
    email: 'john@example.com',
    desc: 'Social Media Templates',
    amount: 'KES 95',
    issued: 'Feb 28, 2026',
    due: 'Mar 10, 2026',
    status: 'paid',
  },
};


/* ──────────────────────────────────────────────────────────────
   HELPER — open the existing admin invoice preview modal
   (reuses the modal already present in admin-dashboard.html)
────────────────────────────────────────────────────────────── */
function fpOpenInvoiceModal(invRef) {
  const inv = JDEVS_INVOICES[invRef];
  if (!inv) {
    showAdminToast('No Invoice', 'Could not find invoice data for ' + invRef, 'red');
    return;
  }

  // Populate the existing adm invoice modal fields
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('admModalRef', inv.ref);
  set('admModalType', inv.type);
  set('admModalClient', inv.client);
  set('admModalEmail', inv.email);
  set('admModalDate', inv.issued);
  set('admModalDue', inv.due);
  set('admModalDesc', inv.desc);
  set('admModalItemAmt', inv.amount);
  set('admModalSubtotal', inv.amount);
  set('admModalTotal', inv.amount);

  // Due label — hide for Quotations
  const dueLabel = document.getElementById('admModalDueLabel');
  if (dueLabel) dueLabel.style.display = inv.type === 'Quotation' ? 'none' : '';

  // Mark Paid button visibility
  const markPaidBtn = document.getElementById('admInvMarkPaidBtn');
  if (markPaidBtn) {
    markPaidBtn.style.display = (inv.status === 'unpaid' || inv.status === 'overdue') ? '' : 'none';
  }

  // Open backdrop
  const backdrop = document.getElementById('admInvModalBackdrop');
  if (backdrop) backdrop.classList.add('open');
}


/* ──────────────────────────────────────────────────────────────
   E6. FINISHED PROJECTS — Project selector + auto-fill
────────────────────────────────────────────────────────────── */
(function initFpProjectSelector() {
  const select = document.getElementById('fpProjectSelect');
  const banner = document.getElementById('fpLinkedBanner');
  const unlinkBtn = document.getElementById('fpUnlinkBtn');
  const invBadge = document.getElementById('fpInvBadge');
  const noInv = document.getElementById('fpNoInv');
  const invPeekBtn = document.getElementById('fpInvPeekBtn');
  if (!select) return;

  /* Populate select options from data store */
  const STATUS_LABELS = {
    'in-progress': 'In Progress',
    'review': 'In Review',
    'pending': 'Pending',
  };

  JDEVS_ACTIVE_PROJECTS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.workId;
    opt.textContent = `${p.workId} · ${p.title} — ${p.client} (${STATUS_LABELS[p.status] || p.status})`;
    select.appendChild(opt);
  });

  /* Active selected project reference */
  let _selectedProject = null;

  function showBanner(project) {
    _selectedProject = project;

    document.getElementById('fpLinkedWorkId').textContent = project.workId;
    document.getElementById('fpLinkedProjectName').textContent = project.title;
    document.getElementById('fpLinkedClientName').textContent = project.client;
    document.getElementById('fpLinkedClientEmail').textContent = project.email;

    // Auto-fill form fields
    const titleEl = document.getElementById('fpTitle');
    const clientEl = document.getElementById('fpClient');
    const categoryEl = document.getElementById('fpCategory');
    if (titleEl && !titleEl.value) titleEl.value = project.title;
    if (clientEl && !clientEl.value) clientEl.value = project.client;
    if (categoryEl && !categoryEl.value) categoryEl.value = project.category;

    // Invoice badge
    if (project.invoiceRef && JDEVS_INVOICES[project.invoiceRef]) {
      const inv = JDEVS_INVOICES[project.invoiceRef];
      document.getElementById('fpInvRef').textContent = inv.ref;

      const statusEl = document.getElementById('fpInvStatus');
      statusEl.textContent = inv.status.charAt(0).toUpperCase() + inv.status.slice(1);
      statusEl.className = 'adm-fp-inv-status ' + inv.status;

      invBadge.style.display = 'flex';
      noInv.style.display = 'none';
    } else {
      invBadge.style.display = 'none';
      noInv.style.display = 'flex';
    }

    banner.style.display = '';
  }

  function hideBanner() {
    _selectedProject = null;
    banner.style.display = 'none';
    select.value = '';
  }

  /* On project select */
  select.addEventListener('change', function () {
    if (!this.value) { hideBanner(); return; }
    const project = JDEVS_ACTIVE_PROJECTS.find(p => p.workId === this.value);
    if (project) showBanner(project);
  });

  /* Unlink */
  if (unlinkBtn) unlinkBtn.addEventListener('click', hideBanner);

  /* Invoice peek */
  if (invPeekBtn) {
    invPeekBtn.addEventListener('click', function () {
      if (_selectedProject && _selectedProject.invoiceRef) {
        fpOpenInvoiceModal(_selectedProject.invoiceRef);
      }
    });
  }

  /* Expose selected project to the Add button handler */
  window._fpGetSelectedProject = function () { return _selectedProject; };
  window._fpClearSelectedProject = function () { hideBanner(); };
})();


/* ──────────────────────────────────────────────────────────────
   E6b. FINISHED PROJECTS — File upload + drag/drop + thumbnails
────────────────────────────────────────────────────────────── */
(function initFpUpload() {
  const dropZone = document.getElementById('fpDropZone');
  const fileInput = document.getElementById('fpFileInput');
  const thumbsEl = document.getElementById('fpThumbs');
  if (!dropZone || !fileInput || !thumbsEl) return;

  let _fpFiles = [];

  function renderThumbs() {
    thumbsEl.innerHTML = '';
    if (!_fpFiles.length) { thumbsEl.style.display = 'none'; return; }
    thumbsEl.style.display = 'flex';
    _fpFiles.forEach((f, idx) => {
      const thumb = document.createElement('div');
      thumb.className = 'adm-fp-thumb';
      thumb.innerHTML = `
        <img src="${f.src}" alt="${f.name}" />
        <button class="adm-fp-thumb-del" data-idx="${idx}" title="Remove">
          <i class="ri-close-line"></i>
        </button>`;
      thumbsEl.appendChild(thumb);
    });
    thumbsEl.querySelectorAll('.adm-fp-thumb-del').forEach(btn => {
      btn.addEventListener('click', function () {
        _fpFiles.splice(parseInt(this.dataset.idx), 1);
        renderThumbs();
      });
    });
  }

  function processFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        _fpFiles.push({ src: e.target.result, name: file.name });
        renderThumbs();
      };
      reader.readAsDataURL(file);
    });
  }

  fileInput.addEventListener('change', function () { processFiles(this.files); });

  dropZone.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', function () { this.classList.remove('drag-over'); });
  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    processFiles(e.dataTransfer.files);
  });

  window._fpGetFiles = function () { return _fpFiles; };
  window._fpClearFiles = function () { _fpFiles = []; renderThumbs(); };
})();


/* ──────────────────────────────────────────────────────────────
   E7. FINISHED PROJECTS — Add to grid handler
────────────────────────────────────────────────────────────── */
(function initFpAdd() {
  const addBtn = document.getElementById('fpAddBtn');
  const clearBtn = document.getElementById('fpClearBtn');
  if (!addBtn) return;

  const CAT_LABELS = {
    logo: 'Logo', branding: 'Branding', print: 'Print',
    web: 'Web', social: 'Social', other: 'Other',
  };

  function _fpClear() {
    ['fpTitle', 'fpClient', 'fpNotes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const cat = document.getElementById('fpCategory');
    const dateEl = document.getElementById('fpDate');
    if (cat) cat.value = '';
    if (dateEl) dateEl.value = '';
    if (window._fpClearFiles) window._fpClearFiles();
    if (window._fpClearSelectedProject) window._fpClearSelectedProject();
  }

  if (clearBtn) clearBtn.addEventListener('click', _fpClear);

  addBtn.addEventListener('click', function () {
    const title = document.getElementById('fpTitle')?.value.trim();
    const client = document.getElementById('fpClient')?.value.trim();
    const cat = document.getElementById('fpCategory')?.value;
    const dateVal = document.getElementById('fpDate')?.value;
    const notes = document.getElementById('fpNotes')?.value.trim();
    const files = window._fpGetFiles ? window._fpGetFiles() : [];
    const project = window._fpGetSelectedProject ? window._fpGetSelectedProject() : null;

    if (!title) {
      showAdminToast('Missing Title', 'Please enter a project title.', 'red');
      return;
    }

    const grid = document.getElementById('fpGrid');
    if (!grid) return;

    /* Date string */
    let dateStr = 'Recently';
    if (dateVal) {
      const d = new Date(dateVal);
      dateStr = 'Delivered ' + d.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    }

    /* Category pill */
    const catPillStr = cat
      ? `<span class="adm-fp-cat-pill ${cat}">${CAT_LABELS[cat] || cat}</span>`
      : '';
    const clientStr = client || 'JDEVS Client';

    /* Image content — multi-image carousel if >1 file */
    let imgContent = '';
    if (files.length === 0) {
      imgContent = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:var(--clr-accent);opacity:0.4;">
           <i class="ri-gallery-2-line"></i>
         </div>`;
    } else if (files.length === 1) {
      imgContent = `<img src="${files[0].src}" alt="${title}" style="width:100%;height:100%;object-fit:cover;display:block;" />`;
    } else {
      // Multiple images — carousel with dot indicators
      const slides = files.map((f, i) =>
        `<img src="${f.src}" alt="${title} ${i + 1}" class="adm-fp-slide" data-idx="${i}" style="width:100%;height:100%;object-fit:cover;display:${i === 0 ? 'block' : 'none'};position:absolute;inset:0;" />`
      ).join('');
      const dots = files.map((_, i) =>
        `<span class="adm-fp-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></span>`
      ).join('');
      imgContent = `
        <div class="adm-fp-carousel" style="position:relative;width:100%;height:100%;">
          ${slides}
          <button class="adm-fp-prev" title="Prev"><i class="ri-arrow-left-s-line"></i></button>
          <button class="adm-fp-next" title="Next"><i class="ri-arrow-right-s-line"></i></button>
          <div class="adm-fp-dots">${dots}</div>
          <span class="adm-fp-img-count"><i class="ri-image-line"></i> ${files.length}</span>
        </div>`;
    }

    /* Store all image srcs on the card for lightbox cycling */
    const allSrcs = JSON.stringify(files.map(f => f.src));

    /* Invoice ref — from linked project or empty */
    const invRef = project?.invoiceRef || null;
    const invBtnHtml = invRef
      ? `<button class="adm-fp-inv-overlay-btn adm-fp-card-inv-btn" data-inv="${invRef}" title="View Invoice">
           <i class="ri-receipt-line"></i> ${invRef}
         </button>`
      : '';

    /* Card */
    const card = document.createElement('div');
    card.className = 'adm-fp-card';
    card.dataset.cat = cat || 'other';
    card.dataset.notes = notes || '';
    card.dataset.invoiceRef = invRef || '';
    card.dataset.workId = project?.workId || '';
    card.dataset.allSrcs = allSrcs;

    card.innerHTML = `
      <div class="adm-fp-card-img" style="${files.length === 0 ? 'background:linear-gradient(135deg,#141414,#1e1e1e);' : ''}">
        ${imgContent}
        <div class="adm-fp-img-overlay">
          <button class="adm-port-btn adm-fp-view-btn" title="View full size">
            <i class="ri-eye-line"></i>
          </button>
          <button class="adm-port-btn danger adm-fp-delete-btn" title="Delete">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
      <div class="adm-fp-card-info">
        <div class="adm-fp-card-title">${title}</div>
        <div class="adm-fp-card-meta">
          <i class="ri-user-3-line"></i> ${clientStr}
          &nbsp;·&nbsp; ${catPillStr}
          ${project?.workId ? `<span style="font-size:0.7rem;color:var(--clr-muted);margin-left:0.25rem;">${project.workId}</span>` : ''}
        </div>
        <div class="adm-fp-card-date"><i class="ri-calendar-check-line"></i> ${dateStr}</div>
        ${invBtnHtml}
        ${notes ? `<div style="font-size:0.72rem;color:var(--clr-muted);margin-top:0.3rem;">${notes}</div>` : ''}
      </div>`;

    grid.prepend(card);
    _fpClear();
    _fpUpdateCount();
    showAdminToast('Project Added', `"${title}" added to Finished Projects.`, 'green');
  });
})();


/* ──────────────────────────────────────────────────────────────
   E7b. FINISHED PROJECTS — Invoice button on card
   (delegated click handler — works for dynamically added cards)
────────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-fp-card-inv-btn');
  if (!btn) return;
  const invRef = btn.dataset.inv;
  if (invRef) fpOpenInvoiceModal(invRef);
});


/* ──────────────────────────────────────────────────────────────
   E8. FINISHED PROJECTS — category filter, delete, lightbox, carousel
────────────────────────────────────────────────────────────── */

/* Category tab filter */
document.addEventListener('click', function (e) {
  const tab = e.target.closest('.adm-cat-tab[data-group="fp-cat"]');
  if (!tab) return;
  document.querySelectorAll('.adm-cat-tab[data-group="fp-cat"]').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  const cat = tab.dataset.cat;
  document.querySelectorAll('#fpGrid .adm-fp-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
  });
});

/* Delete button */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-fp-delete-btn');
  if (!btn) return;
  const card = btn.closest('.adm-fp-card');
  if (!card) return;
  const title = card.querySelector('.adm-fp-card-title')?.textContent || 'Project';
  card.style.opacity = '0';
  card.style.transition = 'opacity 0.25s ease';
  setTimeout(() => { card.remove(); _fpUpdateCount(); }, 250);
  showAdminToast('Project Removed', `"${title}" removed from Finished Projects.`, 'red');
});

/* Carousel prev/next buttons */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-fp-prev, .adm-fp-next');
  if (!btn) return;
  e.stopPropagation();
  const carousel = btn.closest('.adm-fp-carousel');
  if (!carousel) return;
  const slides = carousel.querySelectorAll('.adm-fp-slide');
  const dots = carousel.querySelectorAll('.adm-fp-dot');
  let current = 0;
  slides.forEach((s, i) => { if (s.style.display !== 'none') current = i; });
  const dir = btn.classList.contains('adm-fp-next') ? 1 : -1;
  const next = (current + dir + slides.length) % slides.length;
  slides[current].style.display = 'none';
  slides[next].style.display = 'block';
  dots.forEach((d, i) => d.classList.toggle('active', i === next));
});

/* Carousel dot navigation */
document.addEventListener('click', function (e) {
  const dot = e.target.closest('.adm-fp-dot');
  if (!dot) return;
  e.stopPropagation();
  const carousel = dot.closest('.adm-fp-carousel');
  if (!carousel) return;
  const idx = parseInt(dot.dataset.idx);
  carousel.querySelectorAll('.adm-fp-slide').forEach((s, i) => {
    s.style.display = i === idx ? 'block' : 'none';
  });
  carousel.querySelectorAll('.adm-fp-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
});

/* View/lightbox button — supports multiple images with arrow navigation */
let _lbSrcs = [], _lbIdx = 0, _lbCaption = '';

document.addEventListener('click', function (e) {
  const btn = e.target.closest('.adm-fp-view-btn');
  if (!btn) return;
  const card = btn.closest('.adm-fp-card');
  if (!card) return;

  const title = card.querySelector('.adm-fp-card-title')?.textContent || '';
  const client = card.querySelector('.adm-fp-card-meta')?.textContent?.trim() || '';
  _lbCaption = `${title} · ${client}`;

  // Get all images from data attribute or from single img
  try {
    _lbSrcs = JSON.parse(card.dataset.allSrcs || '[]');
  } catch (_) { _lbSrcs = []; }

  if (!_lbSrcs.length) {
    const img = card.querySelector('.adm-fp-card-img img');
    if (img && img.src && !img.src.startsWith('data:') === false || img?.src) {
      _lbSrcs = [img.src];
    }
  }

  if (_lbSrcs.length === 0) {
    showAdminToast('No Image', 'No image uploaded for this project yet.', 'red');
    return;
  }

  _lbIdx = 0;
  openFpLightbox(_lbSrcs[0], _lbCaption, _lbSrcs.length);
});

/* Lightbox functions */
function openFpLightbox(src, caption, total) {
  const backdrop = document.getElementById('fpLightboxBackdrop');
  const imgEl = document.getElementById('fpLightboxImg');
  const capEl = document.getElementById('fpLightboxCaption');
  const prevBtn = document.getElementById('fpLbPrev');
  const nextBtn = document.getElementById('fpLbNext');
  const counterEl = document.getElementById('fpLbCounter');
  if (!backdrop || !imgEl) return;
  imgEl.src = src;
  if (capEl) capEl.textContent = caption || '';
  if (counterEl) counterEl.textContent = total > 1 ? `${_lbIdx + 1} / ${total}` : '';
  if (prevBtn) prevBtn.style.display = total > 1 ? '' : 'none';
  if (nextBtn) nextBtn.style.display = total > 1 ? '' : 'none';
  backdrop.classList.add('open');
}

function closeFpLightbox() {
  const backdrop = document.getElementById('fpLightboxBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

/* Close lightbox on backdrop click (not on img/nav clicks) */
document.addEventListener('DOMContentLoaded', function () {
  const lb = document.getElementById('fpLightboxBackdrop');
  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === this) closeFpLightbox();
    });
  }
});

/* Lightbox prev/next */
document.addEventListener('click', function (e) {
  if (e.target.closest('#fpLbPrev')) {
    _lbIdx = (_lbIdx - 1 + _lbSrcs.length) % _lbSrcs.length;
    openFpLightbox(_lbSrcs[_lbIdx], _lbCaption, _lbSrcs.length);
  }
  if (e.target.closest('#fpLbNext')) {
    _lbIdx = (_lbIdx + 1) % _lbSrcs.length;
    openFpLightbox(_lbSrcs[_lbIdx], _lbCaption, _lbSrcs.length);
  }
});

/* Count label */
function _fpUpdateCount() {
  const count = document.querySelectorAll('#fpGrid .adm-fp-card').length;
  const label = document.getElementById('fpCountLabel');
  if (label) label.textContent = `${count} project${count !== 1 ? 's' : ''} delivered`;
}


/* ──────────────────────────────────────────────────────────────
   E9. PROGRESS BOARD — fullscreen preview modal
────────────────────────────────────────────────────────────── */
function tpbModalOpen() {
  const backdrop = document.getElementById('tpbModalBackdrop');
  const body = document.getElementById('tpbModalBody');
  if (!backdrop || !body) return;

  // Build the same HTML that the client preview panel shows
  const d = window._tpbData || {};

  const pct = d.pct || 0;
  const days = document.getElementById('tpbDaysActive')?.value || '—';
  const left = document.getElementById('tpbDaysLeft')?.value || '—';
  const due = document.getElementById('tpbDueFmt')?.value || '—';
  const title = d.title || document.getElementById('prevTitle')?.textContent || 'Project';
  const meta = d.meta || document.getElementById('prevMeta')?.textContent || '';

  const nextTitle = document.getElementById('tpbNextTitle')?.value || d.nextTitle || '';
  const nextSub = document.getElementById('tpbNextSub')?.value || d.nextSub || '';

  // Milestones HTML
  const milestonesHtml = (d.milestones || []).map(m => `
    <div class="tpb-prev-ms">
      <div class="tpb-prev-ms-dot ${m.state}">
        <i class="${m.state === 'done' ? 'ri-check-line' : m.state === 'active' ? 'ri-loader-4-line' : (m.icon || 'ri-circle-line')}"></i>
      </div>
      <div>
        <div class="tpb-prev-ms-label">${_esc(m.label)}</div>
        <div class="tpb-prev-ms-date">${_esc(m.date)}</div>
        ${m.note ? `<div class="tpb-prev-ms-note">${_esc(m.note)}</div>` : ''}
      </div>
    </div>
  `).join('');

  // Updates HTML
  const updatesHtml = (d.updates || []).map(u => `
    <div class="tpb-prev-upd">
      <div class="tpb-prev-upd-dot ${u.icon}"><i class="${u.ri}"></i></div>
      <div>
        <div class="tpb-prev-upd-text">${u.text}</div>
        <div class="tpb-prev-upd-time">${_esc(u.time)}</div>
      </div>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="tpb-preview-shell" style="border:none; border-radius:0;">
      <!-- Header -->
      <div class="tpb-prev-head">
        <div>
          <div class="tpb-prev-badge"><i class="ri-loader-4-line"></i> In Progress</div>
          <div class="tpb-prev-title">${_esc(title)}</div>
          <div class="tpb-prev-meta">${_esc(meta)}</div>
        </div>
      </div>
      <!-- Stats -->
      <div class="tpb-prev-stats">
        <div class="tpb-prev-stat"><div class="tpb-prev-stat-val">${days}</div><div class="tpb-prev-stat-lbl">Days Active</div></div>
        <div class="tpb-prev-stat-div"></div>
        <div class="tpb-prev-stat"><div class="tpb-prev-stat-val accent">${pct}%</div><div class="tpb-prev-stat-lbl">Complete</div></div>
        <div class="tpb-prev-stat-div"></div>
        <div class="tpb-prev-stat"><div class="tpb-prev-stat-val">${left}</div><div class="tpb-prev-stat-lbl">Days Left</div></div>
        <div class="tpb-prev-stat-div"></div>
        <div class="tpb-prev-stat"><div class="tpb-prev-stat-val">${_esc(due)}</div><div class="tpb-prev-stat-lbl">Due Date</div></div>
      </div>
      <!-- Milestones -->
      <div class="tpb-prev-section">
        <div class="tpb-prev-section-head"><i class="ri-map-2-line"></i> Project Milestones</div>
        <div class="tpb-prev-timeline">${milestonesHtml}</div>
      </div>
      <!-- Updates -->
      <div class="tpb-prev-section">
        <div class="tpb-prev-section-head"><i class="ri-pulse-line"></i> Latest Updates <span class="tpb-pill" style="margin-left:auto;">From JDEVS</span></div>
        <div class="tpb-prev-updates">${updatesHtml}</div>
      </div>
      <!-- Up Next -->
      ${nextTitle ? `
      <div class="tpb-prev-next">
        <div class="tpb-prev-next-icon"><i class="ri-arrow-right-up-line"></i></div>
        <div>
          <div class="tpb-prev-next-title">${_esc(nextTitle)}</div>
          <div class="tpb-prev-next-sub">${_esc(nextSub)}</div>
        </div>
      </div>` : ''}
    </div>
  `;

  backdrop.classList.add('open');
}

/* Close modal */
document.addEventListener('DOMContentLoaded', function () {
  const closeBtn = document.getElementById('tpbModalClose');
  if (closeBtn) closeBtn.addEventListener('click', tpbModalClose);

  const backdrop = document.getElementById('tpbModalBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', function (e) {
      if (e.target === this) tpbModalClose();
    });
  }

  // ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      tpbModalClose();
      closeFpLightbox();
    }
  });
});

function tpbModalClose() {
  const backdrop = document.getElementById('tpbModalBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

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
