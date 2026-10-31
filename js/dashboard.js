/**
 * Student Dashboard & History Analytics
 */
document.addEventListener("DOMContentLoaded", () => {
  const history = JSON.parse(localStorage.getItem("va_quiz_history") || "[]");

  const totalQuizzes = history.length;
  let totalCorrect = 0;
  let totalQuestions = 0;

  history.forEach(item => {
    totalCorrect += item.correctCount || 0;
    totalQuestions += item.totalQuestions || 0;
  });

  const avgScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const qComp = document.getElementById("metric-quizzes-completed");
  const qAns = document.getElementById("metric-questions-answered");
  const qAvg = document.getElementById("metric-average-score");

  if (qComp) qComp.textContent = totalQuizzes;
  if (qAns) qAns.textContent = totalQuestions;
  if (qAvg) qAvg.textContent = `${avgScore}%`;

  const listEl = document.getElementById("recent-activity-list");
  if (listEl) {
    listEl.innerHTML = "";
    if (history.length === 0) {
      listEl.innerHTML = `<p style="color: var(--text-muted); padding: 1rem;">No quizzes taken yet. Explore courses to begin your preparation!</p>`;
    } else {
      history.slice(0, 5).forEach(item => {
        const el = document.createElement("div");
        el.className = "activity-item";
        
        let scoreBadge = "score-low";
        if (item.percentage >= 80) scoreBadge = "score-high";
        else if (item.percentage >= 60) scoreBadge = "score-mid";

        const dateFormatted = new Date(item.timestamp).toLocaleDateString();

        el.innerHTML = `
          <div class="activity-course">
            <span class="activity-icon">📘</span>
            <div>
              <div class="activity-name">${item.courseId.toUpperCase()} — Chapter ${item.chapterNumber}</div>
              <div class="activity-date">Completed on ${dateFormatted}</div>
            </div>
          </div>
          <div class="activity-score-badge ${scoreBadge}">${item.percentage}%</div>
        `;
        listEl.appendChild(el);
      });
    }
  }
});
