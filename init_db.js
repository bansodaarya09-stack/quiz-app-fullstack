const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./quiz.db');

db.serialize(()=>{
  // users
  db.run('CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password_hash TEXT, role TEXT, name TEXT, email TEXT)');
  // questions
  db.run('CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, a1 TEXT, a2 TEXT, a3 TEXT, a4 TEXT, correct_index INTEGER)');
  // results
  db.run('CREATE TABLE IF NOT EXISTS results (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, score INTEGER, total INTEGER, time_taken_seconds INTEGER, submitted_at TEXT)');

  // insert admin
  const adminHash = bcrypt.hashSync('admin123', 8);
  db.run('INSERT OR IGNORE INTO users (username, password_hash, role, name, email) VALUES (?,?,?,?,?)', ['admin', adminHash, 'admin', 'Administrator', 'admin@example.com']);

  // insert 30 questions
  const qs = [
    ["What is the capital of France?","Paris","London","Berlin","Rome",0],
    ["Which planet is known as the Red Planet?","Earth","Mars","Jupiter","Venus",1],
    ["Who wrote 'Hamlet'?","Shakespeare","Dickens","Hemingway","Tolkien",0],
    ["CPU stands for?","Central Process Unit","Central Processing Unit","Control Process Unit","None",1],
    ["Who invented Java?","James Gosling","Dennis Ritchie","Guido van Rossum","Bjarne Stroustrup",0],
    ["RAM stands for?","Read Access Memory","Random Access Memory","Run All Memory","None",1],
    ["HTML is a ____ language.","Programming","Markup","Machine","Database",1],
    ["Python was created by?","Dennis Ritchie","Guido van Rossum","James Gosling","Mark Zuckerberg",1],
    ["2 + 2 × 2 =","6","8","4","12",0],
    ["Which is an OS?","Windows","Chrome","Firefox","Instagram",0],
    ["SQL is used for?","Design","Querying DB","Styling","Animation",1],
    ["Which is not a language?","Java","Python","HTML","Chrome",3],
    ["WWW stands for?","World Wide Web","Wild Wide Web","Wide World Web","None",0],
    ["USB stands for?","Universal Serial Bus","United System Box","Unit Serial Board","None",0],
    ["C language invented by?","James","Dennis Ritchie","Charles","Rossum",1],
    ["Which is backend?","Java","HTML","CSS","Figma",0],
    ["CSS used for?","Logic","Structure","Styling","Database",2],
    ["Full form of AI?","Automatic Input","Artificial Intelligence","Auto Internet","None",1],
    ["Which is NoSQL DB?","MySQL","MongoDB","Oracle","MariaDB",1],
    ["LAN stands for?","Local Area Network","Long Area Net","Logical Area Net","None",0],
    ["Which company owns Android?","Apple","Google","Samsung","Nokia",1],
    ["Binary uses?","0 & 1","XYZ","ABC","None",0],
    ["PHP is used for?","Frontend","Backend","Styling","OS",1],
    ["Which is IDE?","VS Code","HTML","Google","SQL",0],
    ["Keyboard is?","Output","Input","Storage","None",1],
    ["Hard disk is?","Input","Output","Storage","None",2],
    ["Which is search engine?","Facebook","Google","Spotify","Gmail",1],
    ["Which is mobile OS?","Android","Chrome","YouTube","Maps",0],
    ["5 × 5 =","10","20","25","15",2],
    ["Shortcut for copy?","Ctrl+A","Ctrl+S","Ctrl+C","Ctrl+P",2]
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO questions (question, a1, a2, a3, a4, correct_index) VALUES (?,?,?,?,?,?)');
  for(const q of qs){
    stmt.run(q[0], q[1], q[2], q[3], q[4], q[5]);
  }
  stmt.finalize();

  console.log('DB initialized.');
  db.close();
});
