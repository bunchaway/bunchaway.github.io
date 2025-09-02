const homeScreen = document.getElementById('home-screen');
const setupScreen = document.getElementById('setup-screen');
const quizScreen = document.getElementById('quiz-screen');

const flashcardList = document.getElementById('flashcard-list');
const quizCountInput = document.getElementById('quiz-count-input');
const startButton = document.getElementById('start-button');
const backToHomeButton = document.getElementById('back-to-home');
const maxQuestionsInfo = document.getElementById('max-questions-info');
const currentDeckName = document.getElementById('current-deck-name');
const exitQuizButton = document.getElementById('exit-quiz');

const questionTerm = document.getElementById('question-term');
const answersContainer = document.getElementById('answers-container');
const quizProgress = document.getElementById('quiz-progress');
const scoreDisplay = document.getElementById('score-display');
const feedbackMessage = document.getElementById('feedback-message');

let allFlashcardDecks = {};
let currentDeckData = [];
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let wrongAnswers = []; 
let hasAnsweredCurrentQuestion = false;

// Xử lý khi bấm nút "Bắt đầu"
startButton.addEventListener('click', () => {
    totalQuestions = parseInt(quizCountInput.value);
    if (isNaN(totalQuestions) || totalQuestions <= 0 || totalQuestions > currentDeckData.length) {
        alert('Số câu hỏi không hợp lệ!');
        return;
    }
    
    quizQuestions = shuffleArray([...currentDeckData]).slice(0, totalQuestions);
    
    currentQuestionIndex = 0;
    score = 0;
    
    homeScreen.classList.add('hidden-screen');
    setupScreen.classList.add('hidden-screen');
    quizScreen.classList.remove('hidden-screen');
    
    displayQuestion();
});

// Xử lý nút "Quay lại"
backToHomeButton.addEventListener('click', () => {
    setupScreen.classList.add('hidden-screen');
    homeScreen.classList.remove('hidden-screen');
});

// Xử lý nút "Thoát Quiz"
exitQuizButton.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn thoát quiz? Mọi tiến trình sẽ bị mất.')) {
        quizScreen.classList.add('hidden-screen');
        homeScreen.classList.remove('hidden-screen');
    }
});

// Hàm hiển thị danh sách bộ thẻ
function displayFlashcardDecks() {
    flashcardList.innerHTML = '';
    const deckNames = Object.keys(allFlashcardDecks);
    
    if (deckNames.length === 0) {
        flashcardList.innerHTML = '<p class="info-text">Chưa có bộ thẻ nào được thêm.</p>';
    } else {
        deckNames.forEach(name => {
            const deckDiv = document.createElement('div');
            deckDiv.classList.add('flashcard-deck');

            const deckButton = document.createElement('button');
            deckButton.textContent = `${name} (${allFlashcardDecks[name].length} thẻ)`;
            deckButton.classList.add('deck-name-btn');
            deckButton.addEventListener('click', () => selectDeck(name));

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            const garbageImage = document.createElement('img');
            garbageImage.src = 'assets/trash.svg';
            garbageImage.alt = 'Xóa';
            garbageImage.classList.add('delete-icon');
            deleteButton.appendChild(garbageImage);
            
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteDeck(name);
            });
            
            deckDiv.appendChild(deckButton);
            deckDiv.appendChild(deleteButton);
            flashcardList.appendChild(deckDiv);
        });
    }
}

// Hàm xóa bộ thẻ
function deleteDeck(deckName) {
    if (confirm(`Bạn có chắc chắn muốn xóa bộ thẻ "${deckName}" không?`)) {
        delete allFlashcardDecks[deckName];
        localStorage.setItem('bunchawayDecks', JSON.stringify(allFlashcardDecks));
        displayFlashcardDecks();
    }
}

// Phân tích dữ liệu từ tệp CSV
function parseCsvData(txt) {
    const lines = txt.trim().split('\n');
    return lines.map(line => {
        const parts = line.split(' : ');
        const term = parts[0].trim();
        const definition = parts.slice(1).join(',').trim();
        return { term, definition };
    });
}

// Hiển thị câu hỏi
function displayQuestion() {
    if (currentQuestionIndex >= totalQuestions) {
        localStorage.setItem('quizResult', JSON.stringify({ score, totalQuestions, wrongAnswers }));
        window.location.href = 'result.html';
        return;
    }
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    questionTerm.textContent = currentQuestion.term;
    
    const incorrectAnswers = shuffleArray([...currentDeckData])
        .filter(item => item.definition !== currentQuestion.definition)
        .map(item => item.definition)
        .slice(0, 3);
        
    const allAnswers = shuffleArray([...incorrectAnswers, currentQuestion.definition]);
    
    answersContainer.innerHTML = '';
    feedbackMessage.textContent = '';
    hasAnsweredCurrentQuestion = false;

    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.classList.add('answer-button');
        button.addEventListener('click', () => handleAnswer(answer, currentQuestion.term, currentQuestion.definition));
        answersContainer.appendChild(button);
    });
    
    updateProgress();
}

// Xử lý khi người dùng chọn đáp án
function handleAnswer(selectedAnswer, term, correctAnswer) {
    if (hasAnsweredCurrentQuestion) return;

    const answerButtons = answersContainer.querySelectorAll('.answer-button');
    answerButtons.forEach(btn => btn.disabled = true);
    
    if (selectedAnswer === correctAnswer) {
        feedbackMessage.textContent = 'Chính xác! 🎉';
        feedbackMessage.classList.remove('text-red');
        feedbackMessage.classList.add('text-green');
        score++;
    } else {
        feedbackMessage.textContent = `Sai rồi, đáp án đúng là: "${correctAnswer}"`;
        feedbackMessage.classList.remove('text-green');
        feedbackMessage.classList.add('text-red');
        wrongAnswers.push({
            question: term,
            yourAnswer: selectedAnswer,
            correctAnswer: correctAnswer
        });
    }

    hasAnsweredCurrentQuestion = true;
    updateProgress();
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

// Cập nhật thông tin tiến độ và điểm số
function updateProgress() {
    quizProgress.textContent = `Câu ${currentQuestionIndex + 1}/${totalQuestions}`;
    scoreDisplay.textContent = `Đúng: ${score}/${totalQuestions}`;
}

// Hàm xáo trộn mảng
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Tải dữ liệu từ localStorage khi trang được load
window.addEventListener('load', () => {
    const storedDecks = localStorage.getItem('bunchawayDecks');
    if (storedDecks) {
        allFlashcardDecks = JSON.parse(storedDecks);
    }
    displayFlashcardDecks();
});

// Chức năng chọn bộ thẻ
function selectDeck(deckName) {
    currentDeckData = allFlashcardDecks[deckName];
    currentDeckName.textContent = deckName;
    
    homeScreen.classList.add('hidden-screen');
    setupScreen.classList.remove('hidden-screen');
}