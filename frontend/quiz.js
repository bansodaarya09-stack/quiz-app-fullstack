const API_BASE = "https://quiz-backend-yloo.onrender.com";

if (!localStorage.getItem("token")) {
    window.location.href = "index.html";
}

let timer = 20 * 60; // 20 minutes
let interval = setInterval(() => {
    let min = Math.floor(timer / 60);
    let sec = timer % 60;
    document.getElementById("timer").textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;
    timer--;
    if (timer < 0) submitQuiz();
}, 1000);

// QUESTIONS WILL LOAD FROM LOCAL JS FILE
// (Assuming you stored 30 questions in quiz.js or quiz.html)

async function submitQuiz() {
    clearInterval(interval);

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("user");

    let score = calculateScore();

    const res = await fetch(API_BASE + "/api/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ username, score })
    });

    let data = await res.json().catch(async () => {
        console.log(await res.text());
        alert("Server error.");
    });

    if (res.ok) {
        alert("Quiz submitted! Your score: " + score);
        window.location.href = "index.html";
    } else {
        alert(data.error || "Submit failed.");
    }
}

function calculateScore() {
    let score = 0;
    // Your scoring code here
    return score;
}
