const state = {
  sets: [],
  subject: null,
  exam: null,
  current: 0,
  answers: []
};

const views = {
  home: document.getElementById("homeView"),
  sets: document.getElementById("setsView"),
  exam: document.getElementById("examView"),
  result: document.getElementById("resultView")
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[name].classList.remove("hidden");
  window.scrollTo({top: 0, behavior: "smooth"});
}

async function loadSets() {
  const response = await fetch("sets.json");
  if (!response.ok) throw new Error("Could not load sets.json");
  state.sets = await response.json();
}

function selectSubject(subject) {
  state.subject = subject;
  document.getElementById("setsTitle").textContent = `${subject} Question Sets`;

  const list = document.getElementById("setsList");
  const sets = state.sets.filter(s => s.subject === subject);

  if (!sets.length) {
    list.innerHTML = `<div class="set-card"><div><h3>No sets available</h3><p>Add a JSON set and an entry to sets.json.</p></div></div>`;
  } else {
    list.innerHTML = sets.map((set, index) => `
      <div class="set-card">
        <div>
          <h3>${escapeHtml(set.title)}</h3>
          <p>${escapeHtml(set.file)}</p>
        </div>
        <button class="primary-button" onclick="startExam(${state.sets.indexOf(set)})">Start Exam</button>
      </div>
    `).join("");
  }
  showView("sets");
}

async function startExam(setIndex) {
  const set = state.sets[setIndex];
  try {
    const response = await fetch(set.file);
    if (!response.ok) throw new Error(`Could not load ${set.file}`);
    state.exam = await response.json();
    state.current = 0;
    state.answers = new Array(state.exam.questions.length).fill(null);

    document.getElementById("examSubject").textContent = state.exam.subject.toUpperCase();
    document.getElementById("examTitle").textContent = state.exam.title;

    showView("exam");
    renderQuestion();
  } catch (error) {
    alert(error.message);
  }
}

function renderQuestion() {
  const questions = state.exam.questions;
  const q = questions[state.current];

  document.getElementById("questionCounter").textContent =
    `Question ${state.current + 1} of ${questions.length}`;

  const answered = state.answers.filter(a => a !== null).length;
  document.getElementById("answeredCounter").textContent =
    `${answered} answered`;

  document.getElementById("progressBar").style.width =
    `${((state.current + 1) / questions.length) * 100}%`;

  document.getElementById("questionText").innerHTML = q.question;

  const labels = ["A", "B", "C", "D"];
  document.getElementById("options").innerHTML = q.options.map((option, i) => `
    <button class="option ${state.answers[state.current] === i ? "selected" : ""}"
            onclick="selectAnswer(${i})">
      <strong>${labels[i]}.</strong> ${option}
    </button>
  `).join("");

  document.getElementById("previousButton").disabled = state.current === 0;
  document.getElementById("nextButton").textContent =
    state.current === questions.length - 1 ? "Finish Exam ✓" : "Next →";

  renderNavigator();

  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([document.getElementById("questionCard")]);
  }
}

function selectAnswer(index) {
  state.answers[state.current] = index;
  renderQuestion();
}

function renderNavigator() {
  const nav = document.getElementById("navigator");
  nav.innerHTML = state.exam.questions.map((_, i) => `
    <button class="nav-question ${i === state.current ? "current" : ""} ${state.answers[i] !== null ? "answered" : ""}"
            onclick="goToQuestion(${i})">${i + 1}</button>
  `).join("");
}

function goToQuestion(index) {
  state.current = index;
  renderQuestion();
}

function nextQuestion() {
  if (state.current < state.exam.questions.length - 1) {
    state.current++;
    renderQuestion();
  } else {
    finishExam();
  }
}

function previousQuestion() {
  if (state.current > 0) {
    state.current--;
    renderQuestion();
  }
}

function finishExam() {
  const unanswered = state.answers.filter(a => a === null).length;
  if (unanswered > 0) {
    const proceed = confirm(`You have ${unanswered} unanswered question(s). Finish the exam anyway?`);
    if (!proceed) return;
  }

  const correct = state.exam.questions.reduce(
    (count, q, i) => count + (state.answers[i] === q.answer ? 1 : 0), 0
  );
  const total = state.exam.questions.length;
  const wrong = total - correct - unanswered;
  const percentage = total ? Math.round((correct / total) * 100) : 0;

  document.getElementById("resultTitle").textContent = state.exam.title;
  document.getElementById("scoreText").textContent = `${correct} / ${total}`;
  document.getElementById("percentageText").textContent = `${percentage}%`;
  document.getElementById("correctCount").textContent = correct;
  document.getElementById("wrongCount").textContent = wrong;
  document.getElementById("unansweredCount").textContent = unanswered;

  document.getElementById("reviewSection").classList.add("hidden");
  showView("result");
}

function showReview() {
  const labels = ["A", "B", "C", "D"];
  const list = document.getElementById("reviewList");

  list.innerHTML = state.exam.questions.map((q, i) => {
    const selected = state.answers[i];
    const isCorrect = selected === q.answer;
    const selectedText = selected === null
      ? "Not answered"
      : `${labels[selected]}. ${q.options[selected]}`;
    const correctText = `${labels[q.answer]}. ${q.options[q.answer]}`;

    return `
      <article class="review-item ${isCorrect ? "correct" : "wrong"}">
        <div class="review-question">Q${i + 1}. ${q.question}</div>
        <div class="review-answer ${isCorrect ? "correct-text" : "wrong-text"}">
          <strong>Your answer:</strong> ${selectedText}
        </div>
        ${isCorrect ? "" : `<div class="review-answer correct-text"><strong>Correct answer:</strong> ${correctText}</div>`}
        <div class="explanation"><strong>Explanation:</strong> ${q.explanation || ""}</div>
        <div class="explanation"><strong>Topic:</strong> ${q.topic || ""}</div>
      </article>
    `;
  }).join("");

  document.getElementById("reviewSection").classList.remove("hidden");
  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([document.getElementById("reviewSection")]);
  }
  document.getElementById("reviewSection").scrollIntoView({behavior: "smooth"});
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.querySelectorAll(".subject-card").forEach(button => {
  button.addEventListener("click", () => selectSubject(button.dataset.subject));
});

document.getElementById("backToSubjects").addEventListener("click", () => showView("home"));
document.getElementById("previousButton").addEventListener("click", previousQuestion);
document.getElementById("nextButton").addEventListener("click", nextQuestion);
document.getElementById("exitExam").addEventListener("click", () => {
  if (confirm("Exit this exam? Your current answers will be lost.")) showView("sets");
});
document.getElementById("reviewButton").addEventListener("click", showReview);
document.getElementById("homeButton").addEventListener("click", () => showView("home"));

loadSets().catch(error => {
  console.error(error);
  alert("Could not load the exam sets. If you are opening this file directly, use GitHub Pages or a local web server.");
});
