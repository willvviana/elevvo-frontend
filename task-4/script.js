(() => {
  "use strict";

  // ---------- Data ----------
  // In a real blog this comes from an API or a build step.
  // For this task, it's a hardcoded array — one source of truth.
  const POSTS = [
    {
      id: 1,
      title: "Why I stopped using a todo app for everything",
      category: "Tech",
      date: "2025-09-12",
      description: "A todo app is a tool, not a personality. Here's the line I draw between what goes in and what doesn't.",
      image: "https://picsum.photos/seed/todo/600/400",
    },
    {
      id: 2,
      title: "Three days in Kyoto without a plan",
      category: "Travel",
      date: "2025-08-30",
      description: "The best parts of the trip weren't on any itinerary. A short account of getting lost on purpose.",
      image: "https://picsum.photos/seed/kyoto/600/400",
    },
    {
      id: 3,
      title: "The only pasta sauce I make anymore",
      category: "Food",
      date: "2025-08-18",
      description: "Six ingredients. Forty minutes. Better than anything in a jar, and it freezes.",
      image: "https://picsum.photos/seed/pasta/600/400",
    },
    {
      id: 4,
      title: "Reading code is the job. Writing it is the bonus.",
      category: "Tech",
      date: "2025-08-05",
      description: "Most engineers spend more time reading than writing. Nobody teaches this. They should.",
      image: "https://picsum.photos/seed/code/600/400",
    },
    {
      id: 5,
      title: "A weekend in the Dolomites",
      category: "Travel",
      date: "2025-07-21",
      description: "Two days, one backpack, zero regrets. Notes on the trail, the huts, and the coffee.",
      image: "https://picsum.photos/seed/dolomites/600/400",
    },
    {
      id: 6,
      title: "Bread is not hard. Bad recipes are.",
      category: "Food",
      date: "2025-07-10",
      description: "The four rules that fixed my loaves. No starter required for the first one.",
      image: "https://picsum.photos/seed/bread/600/400",
    },
    {
      id: 7,
      title: "Small tools, long lives",
      category: "Tech",
      date: "2025-06-28",
      description: "Why I keep coming back to software that does one thing and does it well.",
      image: "https://picsum.photos/seed/tools/600/400",
    },
    {
      id: 8,
      title: "The case for eating alone",
      category: "Food",
      date: "2025-06-14",
      description: "Not antisocial. Just better focus on the food. A short defense of the solo table.",
      image: "https://picsum.photos/seed/alone/600/400",
    },
    {
      id: 9,
      title: "Packing for two weeks in one bag",
      category: "Travel",
      date: "2025-05-30",
      description: "The list, the reasoning, and the two things I always regret bringing.",
      image: "https://picsum.photos/seed/packing/600/400",
    },
  ];

  // Derived list of categories. "All" first, then unique categories from POSTS.
  const CATEGORIES = ["All", ...new Set(POSTS.map((p) => p.category))];

  const POSTS_PER_PAGE = 6;

  // ---------- State ----------
  // One object. Every render reads from it. Every interaction mutates it.
  // No state lives anywhere else (no data-attributes holding truth, no closures).
  const state = {
    category: "All",
    search: "",
    page: 1,
  };

  // ---------- DOM refs ----------
  const grid         = document.getElementById("postsGrid");
  const emptyState   = document.getElementById("emptyState");
  const pagination   = document.getElementById("pagination");
  const filtersWrap  = document.getElementById("categoryFilters");
  const searchInput  = document.getElementById("search");
  const yearEl       = document.getElementById("year");

  yearEl.textContent = new Date().getFullYear();

  // ---------- Helpers ----------

  // Format ISO date "2025-09-12" → "Sep 12, 2025"
  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  // Apply category + search filters. Pure function of POSTS and state.
  function getFilteredPosts() {
    const q = state.search.trim().toLowerCase();
    return POSTS.filter((post) => {
      const catMatch    = state.category === "All" || post.category === state.category;
      const searchMatch = !q || post.title.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }

  // Escape user-visible strings before inserting into innerHTML.
  // Not strictly needed here since the data is trusted, but this is the habit.
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---------- Renderers ----------

  function renderCategoryButtons() {
    filtersWrap.innerHTML = CATEGORIES.map((cat) => {
      const selected = state.category === cat;
      return `
        <button
          type="button"
          class="cat-btn"
          role="tab"
          aria-selected="${selected}"
          data-category="${escapeHtml(cat)}"
        >${escapeHtml(cat)}</button>
      `;
    }).join("");
  }

  function renderPosts() {
    const filtered = getFilteredPosts();
    const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));

    // Clamp current page if filters shrank the result set.
    // Without this, going from page 3 → a filter with 1 page leaves you on a blank screen.
    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * POSTS_PER_PAGE;
    const visible = filtered.slice(start, start + POSTS_PER_PAGE);

    // Conditional rendering: either cards, or the empty state.
    if (visible.length === 0) {
      grid.innerHTML = "";
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      grid.innerHTML = visible.map(renderPostCard).join("");
    }

    renderPagination(totalPages);
  }

  function renderPostCard(post) {
    return `
      <article class="post-card">
        <div class="post-card__image">
          <img src="${escapeHtml(post.image)}" alt="" loading="lazy" />
        </div>
        <div class="post-card__body">
          <div class="post-card__meta">
            <span class="post-card__cat">${escapeHtml(post.category)}</span>
            <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>
          </div>
          <h3 class="post-card__title">${escapeHtml(post.title)}</h3>
          <p class="post-card__desc">${escapeHtml(post.description)}</p>
        </div>
      </article>
    `;
  }

  function renderPagination(totalPages) {
    // Hide pagination entirely when there's only one page — no point showing "1".
    if (totalPages <= 1) {
      pagination.innerHTML = "";
      pagination.hidden = true;
      return;
    }
    pagination.hidden = false;

    const buttons = [];
    buttons.push(`
      <button type="button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>
        Prev
      </button>
    `);

    for (let i = 1; i <= totalPages; i++) {
      buttons.push(`
        <button
          type="button"
          data-page="${i}"
          ${i === state.page ? 'aria-current="page"' : ""}
        >${i}</button>
      `);
    }

    buttons.push(`
      <button type="button" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""}>
        Next
      </button>
    `);

    pagination.innerHTML = buttons.join("");
  }

  // ---------- Events ----------

  // Category click (delegated — survives re-renders of the button list)
  filtersWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    state.category = btn.dataset.category;
    state.page = 1;             // reset page on filter change
    renderCategoryButtons();
    renderPosts();
  });

  // Search input. Debounce so we don't re-render on every keystroke.
  // 150ms is a good default — feels instant, cuts renders by ~70%.
  let searchTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value;
      state.page = 1;
      renderPosts();
    }, 150);
  });

  // Pagination click (delegated)
  pagination.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    state.page = Number(btn.dataset.page);
    renderPosts();
    // Scroll back to top of grid so user sees the new page
    document.querySelector(".filters").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ---------- Initial render ----------
  renderCategoryButtons();
  renderPosts();
})();