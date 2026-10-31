/**
 * VICTORY ACADEMY - COURSE & CHAPTER EXPLORER
 */
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("courses-catalog-grid");
  const searchInput = document.getElementById("course-search");
  const programFilter = document.getElementById("program-filter");

  const data = await JsonDataLoader.loadCourses();
  const courses = data.courses || [];

  // Load chapter data
  let chaptersDict = {};
  try {
    const chRes = await fetch("data/chapters.json");
    if (chRes.ok) {
      chaptersDict = await chRes.json();
    }
  } catch (e) {
    console.warn("Could not load chapters.json directly", e);
  }

  function render(list) {
    container.innerHTML = "";
    if (!list.length) {
      container.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 2rem;">No courses match your criteria.</p>`;
      return;
    }

    list.forEach(course => {
      const chList = chaptersDict[course.id] || [];
      const card = document.createElement("div");
      card.className = "card course-card";
      
      let chaptersHtml = "";
      if (chList.length > 0) {
        chaptersHtml = `
          <div class="chapters-dropdown-wrapper" style="margin-top: 1rem;">
            <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">
              Select Chapter (${chList.length} Available):
            </label>
            <select id="select-chap-${course.id}" class="chapter-selector-input" style="width: 100%; padding: 0.55rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--navy-900); color: var(--text-main); font-size: 0.85rem; margin-bottom: 0.75rem;">
              ${chList.map(ch => `<option value="${ch.chapterNumber}">Ch. ${ch.chapterNumber}: ${ch.title} (${ch.questionCount} Qs)</option>`).join("")}
            </select>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="card-icon">${course.icon}</div>
        <span class="card-badge" style="background: rgba(37,99,235,0.15); color: ${course.badgeColor}; border: 1px solid ${course.badgeColor}40;">
          ${course.code}
        </span>
        <h3 class="card-title">${course.title}</h3>
        <p class="card-desc">${course.description}</p>
        
        <div style="font-size: 0.8rem; color: var(--gold-400); font-weight: 700; margin-bottom: 0.5rem;">
          ⚡ ${course.totalQuestions || "50+"} Curated Questions Across ${course.totalChapters || "All"} Chapters
        </div>

        ${chaptersHtml}

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
          <button id="exam-btn-${course.id}" class="btn btn-primary btn-sm" style="flex: 1;">Timed Exam</button>
          <button id="practice-btn-${course.id}" class="btn btn-outline btn-sm" style="flex: 1;">Practice Feed</button>
        </div>
      `;

      container.appendChild(card);

      const examBtn = card.querySelector(`#exam-btn-${course.id}`);
      const practiceBtn = card.querySelector(`#practice-btn-${course.id}`);
      const chapSelect = card.querySelector(`#select-chap-${course.id}`);

      if (examBtn) {
        examBtn.addEventListener("click", () => {
          const selectedCh = chapSelect ? chapSelect.value : 1;
          window.location.href = `quiz.html?course=${course.id}&chapter=${selectedCh}&mode=exam`;
        });
      }

      if (practiceBtn) {
        practiceBtn.addEventListener("click", () => {
          const selectedCh = chapSelect ? chapSelect.value : 1;
          window.location.href = `quiz.html?course=${course.id}&chapter=${selectedCh}&mode=practice`;
        });
      }
    });
  }

  render(courses);

  function applyFilters() {
    const q = (searchInput ? searchInput.value : "").toLowerCase().trim();
    const prog = programFilter ? programFilter.value : "all";

    const filtered = courses.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      const matchProg = prog === "all" || c.programId === prog;
      return matchSearch && matchProg;
    });

    render(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (programFilter) programFilter.addEventListener("change", applyFilters);
});
