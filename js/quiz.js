/**
 * VICTORY ACADEMY - QUESTION ROOM & EXAMINATION ENGINE
 * Mobile-Optimized Continuous Scrollable Feed
 */
const QuizEngine = {
  state: {
    courseId: "",
    chapterNumber: 1,
    mode: "exam", // 'exam' or 'practice'
    questions: [],
    answers: {}, // { index: { selectedIndex, isCorrect } }
    timeRemaining: 0,
    timerInterval: null,
    isSubmitted: false
  },

  async start() {
    const params = new URLSearchParams(window.location.search);
    this.state.courseId = params.get("course") || "psychology";
    this.state.chapterNumber = parseInt(params.get("chapter") || "1", 10);
    this.state.mode = params.get("mode") || "exam";

    // Set top header tags
    const titleEl = document.getElementById("quiz-course-code");
    const chapEl = document.getElementById("quiz-chapter-tag");
    const headlineEl = document.getElementById("room-headline");

    if (titleEl) titleEl.textContent = this.state.courseId.toUpperCase();
    if (chapEl) chapEl.textContent = `Chapter ${this.state.chapterNumber}`;
    if (headlineEl) {
      headlineEl.textContent = this.state.mode === "exam" ? "Timed Examination Room" : "Practice Study Feed";
    }

    const rawQuestions = await JsonDataLoader.loadChapterQuestions(
      this.state.courseId,
      this.state.chapterNumber
    );

    if (!rawQuestions || !rawQuestions.length) {
      alert("No questions found for this chapter.");
      window.location.href = "courses.html";
      return;
    }

    // Scramble options while safely preserving answer index
    this.state.questions = this.prepareQuestions(rawQuestions);
    
    // Timer setup (60s per question in exam mode)
    if (this.state.mode === "exam") {
      this.state.timeRemaining = this.state.questions.length * 60;
      this.startTimer();
    } else {
      const timerDisplay = document.getElementById("quiz-timer");
      if (timerDisplay) timerDisplay.textContent = "Practice";
    }

    // Render the complete scrollable question feed
    this.renderScrollableFeed();
    this.bindEvents();
  },

  prepareQuestions(questions) {
    return questions.map(q => {
      const originalOptions = [...q.options];
      const correctText = originalOptions[q.answer];
      const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
      const newAnswerIndex = shuffledOptions.indexOf(correctText);

      return {
        ...q,
        options: shuffledOptions,
        answer: newAnswerIndex
      };
    });
  },

  renderScrollableFeed() {
    const feed = document.getElementById("questions-scroll-feed");
    const totalEl = document.getElementById("total-count");
    const answeredEl = document.getElementById("answered-count");

    if (!feed) return;
    feed.innerHTML = "";

    const total = this.state.questions.length;
    if (totalEl) totalEl.textContent = total;
    if (answeredEl) answeredEl.textContent = "0";

    this.state.questions.forEach((q, qIdx) => {
      const card = document.createElement("div");
      card.className = "mobile-q-card";
      card.id = `q-card-${qIdx}`;

      // Difficulty badge and number
      const difficultyClass = q.difficulty ? `diff-${q.difficulty}` : "diff-medium";
      const qHeader = `
        <div class="q-meta-row">
          <span class="q-number-pill">Question ${qIdx + 1} of ${total}</span>
          <span class="q-difficulty-badge ${difficultyClass}">${q.difficulty || "Standard"}</span>
        </div>
        <h3 class="q-prompt-title">${q.question}</h3>
      `;

      // Render options
      const labels = ["A", "B", "C", "D"];
      let optionsHtml = `<div class="q-options-container" id="opt-container-${qIdx}">`;
      q.options.forEach((optText, optIdx) => {
        optionsHtml += `
          <button class="mobile-opt-btn" data-qidx="${qIdx}" data-optidx="${optIdx}" id="btn-${qIdx}-${optIdx}">
            <span class="opt-key">${labels[optIdx]}</span>
            <span class="opt-label-text">${optText}</span>
          </button>
        `;
      });
      optionsHtml += `</div>`;

      // Explanation reveal card
      const expHtml = `
        <div class="explanation-reveal-card" id="exp-${qIdx}" style="display: none;">
          <h4>💡 Answer & Explanation</h4>
          <p>${q.explanation || "No explanation provided for this question."}</p>
        </div>
      `;

      card.innerHTML = qHeader + optionsHtml + expHtml;
      feed.appendChild(card);
    });

    // Attach click handlers to all options
    feed.querySelectorAll(".mobile-opt-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const qIdx = parseInt(btn.getAttribute("data-qidx"), 10);
        const optIdx = parseInt(btn.getAttribute("data-optidx"), 10);
        this.handleOptionSelect(qIdx, optIdx, btn);
      });
    });
  },

  handleOptionSelect(qIdx, optIdx, selectedBtn) {
    if (this.state.isSubmitted) return;

    // Check if question was already answered
    if (this.state.answers[qIdx] !== undefined) return;

    const q = this.state.questions[qIdx];
    const isCorrect = (optIdx === q.answer);

    // Save answer state
    this.state.answers[qIdx] = {
      selectedIndex: optIdx,
      isCorrect: isCorrect
    };

    // Disable buttons for this question
    const container = document.getElementById(`opt-container-${qIdx}`);
    if (container) {
      container.querySelectorAll(".mobile-opt-btn").forEach(btn => {
        btn.disabled = true;
      });
    }

    // Colorize choices
    const correctBtn = document.getElementById(`btn-${qIdx}-${q.answer}`);
    if (isCorrect) {
      selectedBtn.classList.add("is-correct");
    } else {
      selectedBtn.classList.add("is-wrong");
      if (correctBtn) correctBtn.classList.add("is-correct");
    }

    // Slide open explanation
    const expCard = document.getElementById(`exp-${qIdx}`);
    if (expCard) expCard.style.display = "block";

    // Update live answered counter
    const answeredCount = Object.keys(this.state.answers).length;
    const total = this.state.questions.length;
    const answeredEl = document.getElementById("answered-count");
    const bar = document.getElementById("quiz-progress-bar");

    if (answeredEl) answeredEl.textContent = answeredCount;
    if (bar) bar.style.width = `${(answeredCount / total) * 100}%`;
  },

  startTimer() {
    const timerDisplay = document.getElementById("quiz-timer");
    const timerBox = document.getElementById("timer-box");

    this.state.timerInterval = setInterval(() => {
      this.state.timeRemaining--;

      const mins = Math.floor(this.state.timeRemaining / 60);
      const secs = this.state.timeRemaining % 60;
      if (timerDisplay) {
        timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }

      if (this.state.timeRemaining <= 120 && timerBox) {
        timerBox.classList.add("danger");
      }

      if (this.state.timeRemaining <= 0) {
        clearInterval(this.state.timerInterval);
        alert("Time expired! Submitting your examination answers now.");
        this.submitExam();
      }
    }, 1000);
  },

  submitExam() {
    if (this.state.isSubmitted) return;
    this.state.isSubmitted = true;
    clearInterval(this.state.timerInterval);

    let score = 0;
    const reviewData = this.state.questions.map((q, idx) => {
      const ansObj = this.state.answers[idx];
      const isCorrect = ansObj ? ansObj.isCorrect : false;
      const userChoice = ansObj ? ansObj.selectedIndex : null;
      if (isCorrect) score++;

      return {
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.answer,
        userAnswer: userChoice,
        isCorrect: isCorrect,
        explanation: q.explanation
      };
    });

    const total = this.state.questions.length;
    const percentage = Math.round((score / total) * 100);

    const resultPayload = {
      courseId: this.state.courseId,
      chapterNumber: this.state.chapterNumber,
      totalQuestions: total,
      correctCount: score,
      percentage: percentage,
      timestamp: new Date().toISOString(),
      review: reviewData
    };

    sessionStorage.setItem("va_active_result", JSON.stringify(resultPayload));

    // Save to historical records
    const history = JSON.parse(localStorage.getItem("va_quiz_history") || "[]");
    history.unshift(resultPayload);
    localStorage.setItem("va_quiz_history", JSON.stringify(history.slice(0, 50)));

    window.location.href = "results.html";
  },

  bindEvents() {
    const submitBtn = document.getElementById("submit-exam-btn");
    const quickSubmitTop = document.getElementById("quick-submit-top");

    const handleConfirmSubmit = () => {
      const answered = Object.keys(this.state.answers).length;
      const total = this.state.questions.length;
      if (answered < total) {
        if (!confirm(`You answered ${answered} of ${total} questions. Do you want to submit now?`)) {
          return;
        }
      }
      this.submitExam();
    };

    if (submitBtn) submitBtn.addEventListener("click", handleConfirmSubmit);
    if (quickSubmitTop) quickSubmitTop.addEventListener("click", handleConfirmSubmit);
  }
};

document.addEventListener("DOMContentLoaded", () => QuizEngine.start());
