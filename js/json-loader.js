/**
 * Centralized Data Loading & Storage Bridge
 */
const JsonDataLoader = {
  COURSES_KEY: "va_courses_meta",
  CUSTOM_QUESTIONS_KEY: "va_custom_questions",

  async loadCourses() {
    try {
      const response = await fetch("data/courses.json");
      if (!response.ok) throw new Error("Could not load courses.json");
      const data = await response.json();
      localStorage.setItem(this.COURSES_KEY, JSON.stringify(data.courses));
      return data;
    } catch (err) {
      console.warn("Using cached course metadata:", err);
      const cached = localStorage.getItem(this.COURSES_KEY);
      return cached ? { courses: JSON.parse(cached) } : { courses: [] };
    }
  },

  async loadChapterQuestions(courseId, chapterNumber) {
    try {
      const response = await fetch(`data/${courseId}.json`);
      if (!response.ok) throw new Error(`Could not load data/${courseId}.json`);
      const courseData = await response.json();
      
      const chapterObj = courseData.chapters.find(ch => Number(ch.chapter) === Number(chapterNumber));
      let questions = chapterObj ? [...chapterObj.questions] : [];

      // Merge custom admin questions
      const customStore = JSON.parse(localStorage.getItem(this.CUSTOM_QUESTIONS_KEY) || "[]");
      const matchedCustom = customStore.filter(
        q => q.courseId === courseId && Number(q.chapter) === Number(chapterNumber)
      );

      return [...questions, ...matchedCustom];
    } catch (err) {
      console.error(`Error loading questions for ${courseId}:`, err);
      return [];
    }
  }
};
