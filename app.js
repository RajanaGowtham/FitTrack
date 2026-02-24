const state = {
  days: ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Cardio'],
  activeDayIndex: 0,
  workouts: {},
  theme: 'light'
};

const dom = {
  daySelector: document.getElementById('daySelector'),
  workoutDaysContainer: document.getElementById('workoutDaysContainer'),
  addDayBtn: document.getElementById('addDayBtn'),
  themeToggle: document.getElementById('themeToggle'),
  hamburger: document.getElementById('hamburger'),
  navLinks: document.getElementById('navLinks'),
  heightCm: document.getElementById('heightCm'),
  weightKg: document.getElementById('weightKg'),
  calcBmiBtn: document.getElementById('calcBmiBtn'),
  bmiResult: document.getElementById('bmiResult'),
  bmiCategory: document.getElementById('bmiCategory'),
  genderSelect: document.getElementById('genderSelect'),
  calHeight: document.getElementById('calHeight'),
  calWeight: document.getElementById('calWeight'),
  calAge: document.getElementById('calAge'),
  calcCalBtn: document.getElementById('calcCalBtn'),
  calorieResult: document.getElementById('calorieResult'),
  weeklyWorkouts: document.getElementById('weeklyWorkouts'),
  totalExercises: document.getElementById('totalExercises'),
  resetProgressBtn: document.getElementById('resetProgressBtn')
};

function loadFromStorage() {
  const saved = localStorage.getItem('fittrack_workouts');
  if (saved) {
    try {
      state.workouts = JSON.parse(saved);
    } catch { state.workouts = {}; }
  }
  const savedTheme = localStorage.getItem('fittrack_theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    state.theme = savedTheme;
    document.body.className = savedTheme + '-mode';
    dom.themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
}
loadFromStorage();

function saveWorkouts() {
  localStorage.setItem('fittrack_workouts', JSON.stringify(state.workouts));
  updateProgressStats();
}

function renderDayChips() {
  dom.daySelector.innerHTML = '';
  state.days.forEach((day, idx) => {
    const chip = document.createElement('span');
    chip.className = `day-chip ${idx === state.activeDayIndex ? 'active-day' : ''}`;
    chip.textContent = day;
    chip.dataset.index = idx;
    chip.addEventListener('click', (e) => {
      state.activeDayIndex = Number(e.currentTarget.dataset.index);
      renderDayChips();
      renderWorkoutPanel();
    });
    dom.daySelector.appendChild(chip);
  });
}

function renderWorkoutPanel() {
  const activeDay = state.days[state.activeDayIndex];
  if (!state.workouts[activeDay]) state.workouts[activeDay] = [];
  const exercises = state.workouts[activeDay];

  let html = `<div class="workout-day-panel"><h3>${activeDay} exercises</h3>`;
  exercises.forEach((ex, i) => {
    html += `<div class="exercise-item"><span class="exercise-name">${ex}</span><button class="delete-exercise" data-day="${activeDay}" data-index="${i}"><i class="fas fa-trash"></i></button></div>`;
  });
  html += `<div class="add-exercise-form"><input type="text" id="newExInput" placeholder="e.g. Bench press"><button class="btn-primary" id="addExBtn"><i class="fas fa-plus"></i> add</button></div></div>`;
  dom.workoutDaysContainer.innerHTML = html;

  document.querySelectorAll('.delete-exercise').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const day = e.currentTarget.dataset.day;
      const idx = e.currentTarget.dataset.index;
      state.workouts[day].splice(idx, 1);
      if (state.workouts[day].length === 0) delete state.workouts[day];
      saveWorkouts();
      renderWorkoutPanel();
    });
  });

  const addBtn = document.getElementById('addExBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const input = document.getElementById('newExInput');
      const val = input.value.trim();
      if (val) {
        const day = state.days[state.activeDayIndex];
        if (!state.workouts[day]) state.workouts[day] = [];
        state.workouts[day].push(val);
        saveWorkouts();
        renderWorkoutPanel();
      }
    });
  }
}

dom.addDayBtn.addEventListener('click', () => {
  const newName = prompt('New workout day name (e.g. Arms)');
  if (newName && newName.trim() && !state.days.includes(newName.trim())) {
    state.days.push(newName.trim());
    state.activeDayIndex = state.days.length - 1;
    renderDayChips();
    renderWorkoutPanel();
  }
});

dom.calcBmiBtn.addEventListener('click', () => {
  const h = parseFloat(dom.heightCm.value) / 100;
  const w = parseFloat(dom.weightKg.value);
  if (h > 0 && w > 0) {
    const bmi = (w / (h * h)).toFixed(1);
    dom.bmiResult.textContent = `${bmi} kg/m²`;
    let cat = '';
    if (bmi < 18.5) cat = 'underweight';
    else if (bmi < 25) cat = 'normal weight';
    else if (bmi < 30) cat = 'overweight';
    else cat = 'obese';
    dom.bmiCategory.textContent = `category: ${cat}`;
  }
});

dom.calcCalBtn.addEventListener('click', () => {
  const gender = dom.genderSelect.value;
  const h = parseFloat(dom.calHeight.value);
  const w = parseFloat(dom.calWeight.value);
  const age = parseFloat(dom.calAge.value);
  if (h && w && age) {
    let bmr;
    if (gender === 'male') bmr = 10 * w + 6.25 * h - 5 * age + 5;
    else bmr = 10 * w + 6.25 * h - 5 * age - 161;
    dom.calorieResult.textContent = `${Math.round(bmr)} kcal/day`;
  }
});

function updateProgressStats() {
  const totalEx = Object.values(state.workouts).flat().length;
  const uniqueDays = Object.keys(state.workouts).length;
  dom.totalExercises.textContent = totalEx;
  dom.weeklyWorkouts.textContent = uniqueDays;
}

dom.resetProgressBtn.addEventListener('click', () => {
  if (confirm('Reset all workout data?')) {
    state.workouts = {};
    localStorage.removeItem('fittrack_workouts');
    renderWorkoutPanel();
    updateProgressStats();
  }
});

dom.themeToggle.addEventListener('click', () => {
  const isDark = document.body.className.includes('dark');
  document.body.className = isDark ? 'light-mode' : 'dark-mode';
  state.theme = isDark ? 'light' : 'dark';
  localStorage.setItem('fittrack_theme', state.theme);
  dom.themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

dom.hamburger.addEventListener('click', () => {
  dom.navLinks.style.display = dom.navLinks.style.display === 'flex' ? 'none' : 'flex';
  if (dom.navLinks.style.display === 'flex') {
    dom.navLinks.style.flexDirection = 'column';
    dom.navLinks.style.position = 'absolute';
    dom.navLinks.style.top = '80px';
    dom.navLinks.style.right = '20px';
    dom.navLinks.style.background = 'rgba(0,0,0,0.7)';
    dom.navLinks.style.padding = '20px';
    dom.navLinks.style.borderRadius = '30px';
  } else {
    dom.navLinks.style.display = '';
  }
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active-link'));
    e.currentTarget.classList.add('active-link');
    if (window.innerWidth <= 800) dom.navLinks.style.display = 'none';
  });
});

renderDayChips();
renderWorkoutPanel();
updateProgressStats();