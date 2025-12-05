const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET = 'change_this_secret';
const DB_FILE = './quiz.db';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// open or create DB
const db = new sqlite3.Database(DB_FILE);

// simple auth middleware
function authMiddleware(req, res, next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({error:'Missing auth'});
  const parts = h.split(' ');
  if(parts.length !== 2) return res.status(401).json({error:'Bad auth'});
  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch(err){
    return res.status(401).json({error:'Invalid token'});
  }
}

// admin-only middleware
function adminOnly(req, res, next){
  if(req.user.role !== 'admin') return res.status(403).json({error:'Forbidden'});
  next();
}

// REGISTER endpoint (Option B: name + email + username + password)
app.post('/api/register', (req, res) => {
  const { name, email, username, password } = req.body;
  if(!name || !email || !username || !password) return res.status(400).json({error: 'Missing fields'});
  // check uniqueness
  db.get('SELECT username, email FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
    if(err) return res.status(500).json({error:'DB error'});
    if(row) {
      if(row.username === username) return res.status(400).json({error:'Username already taken'});
      if(row.email === email) return res.status(400).json({error:'Email already registered'});
    }
    const hash = bcrypt.hashSync(password, 8);
    db.run('INSERT INTO users (username, password_hash, role, name, email) VALUES (?,?,?,?,?)', [username, hash, 'student', name, email], function(err2){
      if(err2) return res.status(500).json({error:'DB insert error'});
      res.json({ok:true, username});
    });
  });
});

app.post('/api/login', (req,res)=>{
  const {username, password} = req.body;
  if(!username || !password) return res.status(400).json({error:'username+password required'});
  // lookup user
  db.get('SELECT username, password_hash, role FROM users WHERE username = ?', [username], (err,row)=>{
    if(err) return res.status(500).json({error:'DB error'});
    if(!row) return res.status(401).json({error:'Invalid'});
    // compare
    if(!bcrypt.compareSync(password, row.password_hash)) return res.status(401).json({error:'Invalid'});
    const token = jwt.sign({username: row.username, role: row.role}, SECRET, {expiresIn:'8h'});
    res.json({token, role: row.role});
  });
});

app.get('/api/questions', authMiddleware, (req,res)=>{
  db.all('SELECT id, question, a1, a2, a3, a4 FROM questions ORDER BY id', [], (err, rows)=>{
    if(err) return res.status(500).json({error:'DB error'});
    const qs = rows.map(r=>({q: r.question, a:[r.a1, r.a2, r.a3, r.a4], id: r.id}));
    res.json(qs);
  });
});

app.post('/api/submit', authMiddleware, (req,res)=>{
  const username = req.user.username;
  const { answersOnShuffled, shuffledOrder } = req.body;
  if(!Array.isArray(answersOnShuffled) || !Array.isArray(shuffledOrder)) return res.status(400).json({error:'Bad payload'});
  db.all('SELECT id, correct_index FROM questions', [], (err, rows)=>{
    if(err) return res.status(500).json({error:'DB err'});
    const correctMap = {};
    rows.forEach(r=>{ correctMap[r.id] = r.correct_index; });
    let score = 0;
    for(let i=0;i<shuffledOrder.length;i++){
      const origId = shuffledOrder[i];
      const sel = answersOnShuffled[i];
      if(sel === null || sel === undefined) continue;
      if(correctMap[origId] === sel) score++;
    }
    const stmt = db.prepare('INSERT INTO results (username, score, total, time_taken_seconds, submitted_at) VALUES (?,?,?,?,?)');
    const total = shuffledOrder.length;
    const timeTaken = req.body.timeTakenSeconds || 0;
    stmt.run(username, score, total, timeTaken, new Date().toISOString(), function(err){
      if(err) return res.status(500).json({error:'DB save error'});
      res.json({ok:true, score, total});
    });
  });
});

app.get('/api/results', authMiddleware, adminOnly, (req,res)=>{
  db.all('SELECT username, score, total, time_taken_seconds, submitted_at FROM results', [], (err, rows)=>{
    if(err) return res.status(500).json({error:'DB error'});
    const out = {};
    rows.forEach(r=> out[r.username] = {score:r.score, total:r.total, timeTakenSeconds: r.time_taken_seconds, submittedAt: r.submitted_at});
    res.json(out);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on', PORT));
