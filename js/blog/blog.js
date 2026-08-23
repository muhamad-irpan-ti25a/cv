// ==================== State Aplikasi Blog ====================
const state = {
  q: "",
  category: "Semua",
  page: 1,
  perPage: 6, // Jumlah artikel per halaman
  chipsLoaded: false
};

const el = (sel) => document.querySelector(sel);

const formatDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ==================== Render Kategori (Chips) ====================
function renderChips() {
  const wrap = el("#chips");
  if (!wrap || state.chipsLoaded) return;
  if (typeof POSTS === "undefined") return;

  const categories = [
    "Semua",
    ...Array.from(new Set(POSTS.map((p) => p.category))),
  ];
  
  wrap.innerHTML = categories.map((cat) => `
    <button class="blog-chip ${state.category === cat ? "active" : ""}" data-category="${cat}">
      ${cat}
    </button>
  `).join("");

  wrap.querySelectorAll(".blog-chip").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selectedCat = e.target.getAttribute("data-category");
      if (state.category !== selectedCat) {
        state.category = selectedCat;
        state.page = 1; // Reset ke halaman 1 saat ganti kategori
        
        wrap.querySelectorAll(".blog-chip").forEach(c => c.classList.remove("active"));
        e.target.classList.add("active");
        
        renderGrid();
      }
    });
  });

  state.chipsLoaded = true;
}

// ==================== Filter & Paginate Data ====================
function getFiltered() {
  if (typeof POSTS === "undefined") return [];
  const q = state.q.trim().toLowerCase();
  let items = POSTS.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (state.category !== "Semua") {
    items = items.filter((p) => p.category === state.category);
  }
  
  if (q) {
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
    );
  }
  
  return items;
}

function paginate(items) {
  const total = Math.ceil(items.length / state.perPage) || 1;
  
  // Memastikan batas halaman valid
  if (state.page > total) state.page = total;
  if (state.page < 1) state.page = 1;

  const start = (state.page - 1) * state.perPage;
  const end = start + state.perPage;
  
  return { 
    items: items.slice(start, end), 
    totalPages: total,
    totalItems: items.length
  };
}

// ==================== Render Grid Artikel ====================
function renderGrid() {
  const grid = el("#blogGrid");
  if (!grid) return;
  
  const filtered = getFiltered();
  const { items, totalPages } = paginate(filtered);

  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#94a3b8; padding:40px;">Tidak ada artikel yang ditemukan.</div>`;
    if (el("#pagination")) el("#pagination").innerHTML = "";
    return;
  }

  grid.innerHTML = items.map((p) => `
    <article class="blog-card">
      <a href="#post/${p.id}" class="thumb">
        <img class="blog-card-thumb" src="${p.cover}" alt="${p.title}" loading="lazy" decoding="async" onerror="this.src='https://via.placeholder.com/400x200?text=Blog+Cover'">
      </a>
      <div class="blog-card-body">
        <div class="blog-meta">
          <span><i data-lucide="user"></i> ${p.author}</span>
          <span>•</span>
          <span><i data-lucide="calendar"></i> <time datetime="${p.date}">${formatDate(p.date)}</time></span>
          <span>•</span>
          <span><i data-lucide="folder"></i> ${p.category}</span>
        </div>
        <h3 class="blog-card-title">${p.title}</h3>
        <p class="blog-card-excerpt">${p.excerpt}</p>
        <div class="blog-card-footer">
          <a href="#post/${p.id}" class="blog-read-btn">Baca Selengkapnya <i data-lucide="arrow-right"></i></a>
        </div>
      </div>
    </article>
  `).join("");

  renderPagination(totalPages);

  if (typeof lucide !== "undefined") lucide.createIcons();
}

// ==================== Render & Event Listener Pagination ====================
function renderPagination(totalPages) {
  const nav = el("#pagination");
  if (!nav) return;

  // Jika halaman hanya 1, tampilkan navigasi dalam keadaan disabled
  const isFirstPage = state.page === 1;
  const isLastPage = state.page === totalPages;

  nav.innerHTML = `
    <button class="page-btn" ${isFirstPage ? "disabled" : ""} id="prevPageBtn" aria-label="Halaman Sebelumnya">« Prev</button>
    <span style="font-size:0.85rem; color:#94a3b8; padding:0 12px; font-weight: 500;">Halaman ${state.page} dari ${totalPages}</span>
    <button class="page-btn" ${isLastPage ? "disabled" : ""} id="nextPageBtn" aria-label="Halaman Selanjutnya">Next »</button>
  `;

  const prevBtn = el("#prevPageBtn");
  const nextBtn = el("#nextPageBtn");

  // Event Click Tombol Prev
  if (prevBtn && !isFirstPage) {
    prevBtn.addEventListener("click", () => {
      state.page--;
      renderGrid();
      scrollToBlogTop();
    });
  }

  // Event Click Tombol Next
  if (nextBtn && !isLastPage) {
    nextBtn.addEventListener("click", () => {
      state.page++;
      renderGrid();
      scrollToBlogTop();
    });
  }
}

// Helper smooth scroll ke bagian atas grid saat berpindah halaman
function scrollToBlogTop() {
  const homeSection = el("#homeView");
  if (homeSection) {
    homeSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ==================== Render Detail Post ====================
function renderPost(id) {
  if (typeof POSTS === "undefined") return;
  const p = POSTS.find((x) => x.id === id);
  if (!p) {
    window.location.hash = "#";
    return;
  }

  if (el("#postTitle")) el("#postTitle").textContent = p.title;
  if (el("#postMeta")) {
    el("#postMeta").innerHTML = `
      <span><i data-lucide="user"></i> ${p.author}</span>
      <span>•</span>
      <span><i data-lucide="calendar"></i> ${formatDate(p.date)}</span>
      <span>•</span>
      <span><i data-lucide="folder"></i> ${p.category}</span>
    `;
  }

  const coverEl = el("#postCover");
  if (coverEl) {
    coverEl.loading = "lazy";
    coverEl.decoding = "async";
    coverEl.src = p.cover;
    coverEl.onerror = () => {
      coverEl.src = "https://via.placeholder.com/800x400?text=Blog+Cover";
    };
  }

  if (el("#postBody")) el("#postBody").innerHTML = p.body;
  
  const tags = el("#postTags");
  if (tags) {
    tags.innerHTML = (p.tags || [])
      .map((t) => `<span class="post-tag-item">#${t}</span>`)
      .join("");
  }

  if (typeof lucide !== "undefined") lucide.createIcons();
}

// ==================== Router ====================
function router() {
  const hash = decodeURIComponent(window.location.hash || "#");
  const [path, param] = hash.replace("#", "").split("/");

  const homeView = el("#homeView");
  const postView = el("#postView");

  if (path === "post" && param) {
    if (homeView) homeView.style.display = "none";
    if (postView) postView.style.display = "block";
    renderPost(param);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    if (postView) postView.style.display = "none";
    if (homeView) homeView.style.display = "block";
    renderChips();
    renderGrid();
  }
}

// ==================== Inisialisasi ====================
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = el("#searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.q = e.target.value;
      state.page = 1; // Reset ke halaman 1 saat mengetik kata kunci pencarian
      renderGrid();
    });
  }

  window.addEventListener("hashchange", router);
  router();
});