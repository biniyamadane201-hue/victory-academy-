/**
 * Result View & Review Engine
 */
document.addEventListener("DOMContentLoaded", () => {
  const resultRaw = sessionStorage.getItem("va_active_result");
  if (!resultRaw) {
    window.location.href = "dashboard.html";
    return;
  }

  const result = JSON.parse(resultRaw);

  const scoreNum = document.getElementById("score-number");
  const scorePct = document.getElementById("score-percentage");
  const badgeEl = document.getElementById("performance-badge");

  if (scoreNum) scoreNum.textContent = `${result.correctCount} / ${result.totalQuestions}`;
  if (scorePct) scorePct.textContent = `${result.percentage}%`;

  if (badgeEl) {
    if (result.percentage >= 85) {
      badgeEl.textContent = "🏆 Mastered with Honors";
      badgeEl.className = "card-badge score-high";
    } else if (result.percentage >= 60) {
      badgeEl.textContent = "👍 Proficient";
      badgeEl.className = "card-badge score-mid";
    } else {
      badgeEl.textContent = "📚 Needs Improvement";
      badgeEl.className = "card-badge score-low";
    }
  }

  const reviewContainer = document.getElementById("review-stack");
  if (reviewContainer) {
    reviewContainer.innerHTML = "";
    result.review.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "question-box-card";
      card.style.marginBottom = "1.5rem";

      const labels = ["A", "B", "C", "D"];
      let optionsHtml = "";
      item.options.forEach((opt, oIdx) => {
        let stateClass = "";
        if (oIdx === item.correctAnswer) stateClass = "is-correct";
        else if (oIdx === item.userAnswer && !item.isCorrect) stateClass = "is-wrong";

        optionsHtml += `
          <div class="option-choice-item ${stateClass}" style="cursor: default;">
            <div class="option-prefix">${labels[oIdx]}</div>
            <div class="option-text-content">${opt}</div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="question-box-header">
          <span class="question-seq-badge">Question ${index + 1}</span>
          <span style="font-weight: 700; color: ${item.isCorrect ? '#10b981' : '#ef4444'}">
            ${item.isCorrect ? "✓ Correct" : item.userAnswer === null ? "— Unanswered" : "✗ Incorrect"}
          </span>
        </div>
        <p class="question-prompt-text">${item.question}</p>
        <div class="options-stack">${optionsHtml}</div>
        <div class="explanation-reveal-card">
          <h4>Explanation</h4>
          <p>${item.explanation}</p>
        </div>
      `;
      reviewContainer.appendChild(card);
    });
  }

  const retake = document.getElementById("retake-btn");
  const dash = document.getElementById("dashboard-btn");

  if (retake) {
    retake.addEventListener("click", () => {
      window.location.href = `quiz.html?course=${result.courseId}&chapter=${result.chapterNumber}`;
    });
  }

  if (dash) {
    dash.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
  }
});
