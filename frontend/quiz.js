/* Frontend quiz.js - interacts with backend API */
if(!localStorage.getItem('token')){
  alert('Please login first.');
  window.location = '/index.html';
}
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

let questions = [];
let shuffled = [];
let answers = [];
let marked = [];
let currentIndex = 0;
let total = 0;
const FULL_SECONDS = 20 * 60;
let remaining = FULL_SECONDS;
let timerInterval = null;

// DOM
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const markBtn = document.getElementById('markBtn');
const timerEl = document.getElementById('timer');
const timeProgress = document.getElementById('time-progress');
const currentNum = document.getElementById('current-num');
const totalNum = document.getElementById('total-num');
const navButtonsContainer = document.getElementById('nav-buttons');

async function loadQuestions(){
  const res = await fetch('/api/questions', { headers: { 'Authorization': 'Bearer ' + token }});
  if(!res.ok){ alert('Failed to load questions'); return; }
  questions = await res.json();
  // shuffle indexes
  shuffled = questions.map((q,i)=>q.id); // store original ids
  // randomize order
  shuffled = shuffled.sort(()=>Math.random()-0.5);
  total = questions.length;
  answers = new Array(total).fill(null);
  marked = new Array(total).fill(false);
  totalNum.textContent = total;
  renderQuestion();
  startTimer();
}

function renderQuestion(){
  const qOrigId = shuffled[currentIndex];
  const q = questions.find(x=>x.id===qOrigId);
  currentNum.textContent = currentIndex + 1;
  questionEl.textContent = q.q;
  answersEl.innerHTML = '';
  q.a.forEach((ans, idx)=>{
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = ans;
    btn.onclick = ()=>selectAnswer(idx);
    if(answers[currentIndex] === idx) btn.classList.add('selected');
    answersEl.appendChild(btn);
  });
  updateNavPanel();
}

function selectAnswer(idx){
  answers[currentIndex] = idx;
  const btns = answersEl.querySelectorAll('.answer-btn');
  btns.forEach(b=>b.classList.remove('selected'));
  btns[idx].classList.add('selected');
  updateNavPanel();
}

function updateNavPanel(){
  navButtonsContainer.innerHTML = '';
  for(let i=0;i<total;i++){
    const b = document.createElement('button');
    b.className = 'q-btn';
    b.textContent = i+1;
    if(i===currentIndex) b.classList.add('current');
    else if(answers[i] !== null) b.classList.add('answered');
    else b.classList.add('unanswered');
    b.onclick = (function(idx){ return function(){ currentIndex = idx; renderQuestion(); }; })(i);
    navButtonsContainer.appendChild(b);
  }
}

prevBtn.onclick = ()=>{
  if(currentIndex>0){ currentIndex--; renderQuestion(); }
};
nextBtn.onclick = ()=>{
  if(currentIndex<total-1){ currentIndex++; renderQuestion(); }
};
markBtn.onclick = ()=>{ marked[currentIndex] = !marked[currentIndex]; updateNavPanel(); };

function formatTime(sec){ const m = Math.floor(sec/60).toString().padStart(2,'0'); const s = (sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }

function startTimer(){
  timerEl.textContent = `⏳ ${formatTime(remaining)}`;
  timeProgress.style.width = `${((FULL_SECONDS-remaining)/FULL_SECONDS)*100}%`;
  timerInterval = setInterval(()=>{ remaining--; if(remaining<0){ clearInterval(timerInterval); autoSubmit(); return; } timerEl.textContent = `⏳ ${formatTime(remaining)}`; timeProgress.style.width = `${((FULL_SECONDS-remaining)/FULL_SECONDS)*100}%`; }, 1000);
}

async function submitQuiz(){
  if(!confirm('Submit quiz now?')) return;
  clearInterval(timerInterval);
  const payload = { user, answersOnShuffled: answers, shuffledOrder: shuffled, marked };
  const res = await fetch('/api/submit', { method:'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify(payload) });
  if(res.ok){ alert('Submitted successfully'); window.location = '/index.html'; } else { alert('Submit failed'); }
}

async function autoSubmit(){
  alert('Time up — auto submitting...');
  await submitQuiz();
}

submitBtn.onclick = submitQuiz;

// load
loadQuestions();
