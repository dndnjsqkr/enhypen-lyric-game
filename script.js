const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const scoreScreen = document.getElementById('score-screen');

const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');

const questionCountSpan = document.getElementById('question-count');
const songTitleSpan = document.getElementById('song-title');
const currentScoreSpan = document.getElementById('current-score');
const lyricsContainer = document.getElementById('lyrics-container');
const messageP = document.getElementById('message');

const finalScoreSpan = document.getElementById('final-score');
const finalAccuracySpan = document.getElementById('final-accuracy');
const subMessageP = document.querySelector('.sub-message');

let gameData = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalAnswersCount = 0;
let correctAnswersCount = 0;

const INITIAL_POINT_PER_BLANK = 100;
const MAX_QUESTIONS = 10;

async function loadGameData() {
    try {
        const response = await fetch('data.json');
        gameData = await response.json();
        console.log("데이터 로드 성공:", gameData.length + "개");
    } catch (error) {
        console.error("데이터 로드 실패:", error);
        alert("데이터를 불러오는데 실패했습니다. data.json 파일을 확인해주세요.");
    }
}

function showScreen(screenName) {
    startScreen.classList.remove('show');
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('show');
    gameScreen.classList.add('hidden');
    scoreScreen.classList.remove('show');
    scoreScreen.classList.add('hidden');

    if (screenName === 'start') {
        startScreen.classList.remove('hidden');
        startScreen.classList.add('show');
    } else if (screenName === 'game') {
        gameScreen.classList.remove('hidden');
        gameScreen.classList.add('show');
    } else if (screenName === 'score') {
        scoreScreen.classList.remove('hidden');
        scoreScreen.classList.add('show');
    }
}

function startGame() {
    if (gameData.length === 0) {
        alert("데이터가 아직 로드되지 않았습니다. 잠시만 기다려주세요.");
        return;
    }

    currentQuestionIndex = 0;
    score = 0;
    correctAnswersCount = 0;
    totalAnswersCount = 0;

    shuffleArray(gameData);
    currentQuestions = gameData.slice(0, Math.min(MAX_QUESTIONS, gameData.length));
    
    currentQuestions.forEach(q => totalAnswersCount += q.answers.length);

    updateStatusUI();
    showScreen('game');
    loadQuestion(currentQuestionIndex);
}

function loadQuestion(index) {
    if (index >= currentQuestions.length) {
        endGame();
        return;
    }

    const currentQ = currentQuestions[index];
    
    questionCountSpan.textContent = `${index + 1}/${currentQuestions.length}`;
    songTitleSpan.textContent = `🎵 ${currentQ.title}`;
    messageP.textContent = '';
    submitBtn.disabled = false;
    submitBtn.textContent = "정답 확인";

    const maskedLyric = currentQ.lyrics_masked;
    const htmlContent = maskedLyric.replace(/\[(.*?)\]/g, (match, word) => {
        return `<input type="text" class="lyric-input" data-answer="${word}" autocomplete="off">`;
    });

    lyricsContainer.innerHTML = htmlContent;

    const inputs = lyricsContainer.querySelectorAll('.lyric-input');
    if(inputs.length > 0) inputs[0].focus();

    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') checkAnswer();
        });
    });
}

function checkAnswer() {
    const inputs = lyricsContainer.querySelectorAll('.lyric-input');
    let isCurrentQuestionPerfect = true;
    let currentCorrectCount = 0;

    inputs.forEach(input => {
        const userAnswer = input.value.trim().toLowerCase().replace(/\s+/g, ''); // 공백제거 비교
        const correctAnswer = input.dataset.answer.trim().toLowerCase().replace(/\s+/g, '');

        if (userAnswer === correctAnswer) {
            input.style.backgroundColor = '#d4edda'; 
            input.style.border = '2px solid #28a745';
            input.style.color = '#155724';
            input.disabled = true;
            currentCorrectCount++;
        } else {
            isCurrentQuestionPerfect = false;
            input.style.backgroundColor = '#f8d7da';
            input.style.border = '2px solid #dc3545';
            input.style.color = '#721c24';
            input.value = input.dataset.answer;
            input.disabled = true;
        }
    });

    const points = currentCorrectCount * INITIAL_POINT_PER_BLANK;
    score += points;
    correctAnswersCount += currentCorrectCount;
    
    updateStatusUI();

    if (isCurrentQuestionPerfect) {
        messageP.textContent = `🎉 정답입니다! +${points}점`;
        messageP.style.color = '#4CAF50';
    } else if (currentCorrectCount > 0) {
        messageP.textContent = `⚠️ 부분 정답! ${currentCorrectCount}개 맞춤 (+${points}점)`;
        messageP.style.color = '#ffc107';
    } else {
        messageP.textContent = `❌ 아쉬워요! 정답을 확인하세요.`;
        messageP.style.color = '#ff4d4d';
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "다음 문제로 이동 중...";
    
    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    }, 2000);
}

function endGame() {
    showScreen('score');

    finalScoreSpan.textContent = score;

    const accuracy = totalAnswersCount === 0 ? 0 : Math.round((correctAnswersCount / totalAnswersCount) * 100);
    finalAccuracySpan.textContent = `${accuracy}%`;

    if (accuracy === 100) {
        subMessageP.textContent = "👑 당신을 진정한 엔진으로 인정합니다!";
        subMessageP.style.color = "#FFD700";
    } else if (accuracy >= 80) {
        subMessageP.textContent = "✨ 환상적인 실력! 거의 다 맞췄어요!";
        subMessageP.style.color = "#ffffff";
    } else if (accuracy >= 50) {
        subMessageP.textContent = "👍 잘했어요! 조금만 더 분발해봐요!";
        subMessageP.style.color = "#cccccc";
    } else {
        subMessageP.textContent = "😊 노래를 다시 듣고 도전해보세요! 아자스!";
        subMessageP.style.color = "#cccccc";
    }
}

function updateStatusUI() {
    currentScoreSpan.textContent = `SCORE : ${score}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

window.addEventListener('load', loadGameData);
startBtn.addEventListener('click', startGame);
submitBtn.addEventListener('click', checkAnswer);
restartBtn.addEventListener('click', startGame);

shareBtn.addEventListener('click', () => {
    const captureArea = document.getElementById('score-screen');

    const btns = document.querySelector('.button-group');
    btns.style.display = 'none';

    html2canvas(captureArea, {
        backgroundColor: "#121212"
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'enhypen_challenge_result.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
        btns.style.display = 'flex';
        
        alert("결과 이미지가 저장되었습니다! 갤러리를 확인해주세요 📸");
    });
});