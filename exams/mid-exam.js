let examData = null;
let currentQIndex = 0;
let userAnswers = {};
let timer = null;
let secondsLeft = 0;
let activeCourseFile = "";

// View Elements
const lobbyView = document.getElementById("lobbyView");
const examView = document.getElementById("examView");
const reviewView = document.getElementById("reviewView");

// Called from course cards in the lobby
async function selectCourse(jsonFile) {
  try {
    activeCourseFile = jsonFile;
    const res = await fetch(jsonFile);
    if (!res.ok) throw new Error("Could not load course file.");
    examData = await res.json();

    startExamSession();
  } catch (err) {
    console.error(err);
    alert(
      `Failed to load ${jsonFile}. Ensure the file exists in your project directory.`,
    );
  }
}

function startExamSession() {
  userAnswers = {};
  currentQIndex = 0;

  // Set up titles
  document.getElementById("activeCourseTitle").textContent = examData.examTitle;
  document.getElementById("activeCourseMeta").textContent =
    `${examData.department || "Freshman Studies"} • Total Marks: ${examData.totalMarks || 30}`;
  document.getElementById("qTotalText").textContent = examData.questions.length;

  // Switch Views
  lobbyView.classList.add("hidden");
  reviewView.classList.add("hidden");
  examView.classList.remove("hidden");

  // Timer Initialization
  secondsLeft = (examData.durationMinutes || 45) * 60;
  startTimerCountdown();

  renderQuestion(0);
}

function startTimerCountdown() {
  clearInterval(timer);
  const timerText = document.getElementById("timerText");
  const timerContainer = document.getElementById("timerContainer");
  timerContainer.classList.remove("warning");

  timer = setInterval(() => {
    secondsLeft--;
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    timerText.textContent = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

    if (secondsLeft <= 300) {
      timerContainer.classList.add("warning");
    }

    if (secondsLeft <= 0) {
      clearInterval(timer);
      submitExam();
    }
  }, 1000);
}

function renderQuestion(index) {
  currentQIndex = index;
  const q = examData.questions[index];

  document.getElementById("qIndexText").textContent = index + 1;
  document.getElementById("questionPrompt").textContent =
    `${index + 1}. ${q.question}`;

  // Progress Bar
  const pct = ((index + 1) / examData.questions.length) * 100;
  document.getElementById("progressBar").style.width = `${pct}%`;

  // Render Options
  const wrapper = document.getElementById("optionsWrapper");
  wrapper.innerHTML = "";
  const alphabet = ["A", "B", "C", "D", "E", "F"];

  q.options.forEach((optText, optIdx) => {
    const btn = document.createElement("button");
    btn.className = `option-btn ${userAnswers[index] === optIdx ? "selected" : ""}`;
    btn.innerHTML = `
      <span class="opt-letter">${alphabet[optIdx] || optIdx + 1}</span>
      <span>${optText}</span>
    `;
    btn.onclick = () => {
      userAnswers[index] = optIdx;
      renderQuestion(index);
      updateAnsweredCount();
    };
    wrapper.appendChild(btn);
  });

  // Buttons visibility
  document.getElementById("prevBtn").disabled = index === 0;
  if (index === examData.questions.length - 1) {
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("submitBtn").style.display = "inline-block";
  } else {
    document.getElementById("nextBtn").style.display = "inline-block";
    document.getElementById("submitBtn").style.display = "none";
  }

  updateAnsweredCount();
}

function updateAnsweredCount() {
  const answered = Object.keys(userAnswers).length;
  document.getElementById("answeredCountText").textContent =
    `${answered} of ${examData.questions.length} Answered`;
}

function nextQuestion() {
  if (currentQIndex < examData.questions.length - 1) {
    renderQuestion(currentQIndex + 1);
  }
}

function prevQuestion() {
  if (currentQIndex > 0) {
    renderQuestion(currentQIndex - 1);
  }
}

function confirmSubmit() {
  const answered = Object.keys(userAnswers).length;
  const total = examData.questions.length;
  if (answered < total) {
    const proceed = confirm(
      `You have answered ${answered} of ${total} questions. Are you sure you want to finish?`,
    );
    if (!proceed) return;
  }
  submitExam();
}

function submitExam() {
  clearInterval(timer);

  // Score Calculation
  let correctCount = 0;
  examData.questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.answer) {
      correctCount++;
    }
  });

  const total = examData.questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  // Switch to Review View
  examView.classList.add("hidden");
  reviewView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

  document.getElementById("finalPctCircle").textContent = `${percentage}%`;
  document.getElementById("scoreHeader").textContent =
    percentage >= 50 ? "Well Done!" : "Keep Practicing!";
  document.getElementById("scoreDetails").textContent =
    `You scored ${correctCount} out of ${total} (${((correctCount / total) * (examData.totalMarks || 30)).toFixed(1)} / 30 marks)`;

  // Generate the detailed breakdown
  renderDetailedReview();
}

function renderDetailedReview() {
  const container = document.getElementById("reviewQuestionsList");
  container.innerHTML = "";
  const alphabet = ["A", "B", "C", "D", "E", "F"];

  examData.questions.forEach((q, idx) => {
    const isUserCorrect = userAnswers[idx] === q.answer;
    const isUnanswered = userAnswers[idx] === undefined;

    const reviewCard = document.createElement("div");
    reviewCard.className = `review-item ${isUserCorrect ? "is-correct" : "is-wrong"}`;

    let badgeText = isUserCorrect
      ? `<span style="color: var(--accent-green); font-weight:700;">✓ Correct</span>`
      : isUnanswered
        ? `<span style="color: var(--accent-red); font-weight:700;">⚠ Unanswered</span>`
        : `<span style="color: var(--accent-red); font-weight:700;">✗ Wrong</span>`;

    let optionsMarkup = "";
    q.options.forEach((optText, optIdx) => {
      let optClass = "review-opt";
      if (optIdx === q.answer) {
        optClass += " actual-correct"; // Green
      } else if (userAnswers[idx] === optIdx && !isUserCorrect) {
        optClass += " user-wrong"; // Red
      }

      optionsMarkup += `
        <div class="${optClass}">
          <strong>${alphabet[optIdx] || optIdx + 1}.</strong> ${optText}
          ${optIdx === q.answer ? " — <em>(Correct Answer)</em>" : ""}
          ${userAnswers[idx] === optIdx && !isUserCorrect ? " — <em>(Your Choice)</em>" : ""}
        </div>
      `;
    });

    reviewCard.innerHTML = `
      <div class="review-title">
        <span><strong>Q${idx + 1}:</strong> ${q.question}</span>
        <div>${badgeText}</div>
      </div>
      <div class="review-opts">
        ${optionsMarkup}
      </div>
      <div class="explanation-panel">
        <strong>Explanation:</strong> ${q.explanation || "Reference lecture course module for standard textbook solution."}
      </div>
    `;

    container.appendChild(reviewCard);
  });
}

function backToLobby() {
  clearInterval(timer);
  reviewView.classList.add("hidden");
  examView.classList.add("hidden");
  lobbyView.classList.remove("hidden");
}

function retakeCurrentExam() {
  if (activeCourseFile) {
    selectCourse(activeCourseFile);
  }
}
