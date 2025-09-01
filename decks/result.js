document.addEventListener('DOMContentLoaded', () => {
    const finalScore = document.getElementById('final-score');
    const incorrectAnswersList = document.getElementById('incorrect-answers-list');
    const noMistakesMessage = document.getElementById('no-mistakes-message');

    const resultData = JSON.parse(localStorage.getItem('quizResult'));

    if (resultData) {
        finalScore.textContent = `${resultData.score}/${resultData.totalQuestions}`;
        
        if (resultData.wrongAnswers.length > 0) {
            resultData.wrongAnswers.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('incorrect-answer-item');
                li.innerHTML = `
                    <p class="incorrect-question">Câu hỏi: ${item.question}</p>
                    <p class="incorrect-your-answer">Câu trả lời của bạn: <span>${item.yourAnswer}</span></p>
                    <p class="incorrect-correct-answer">Đáp án đúng: <span>${item.correctAnswer}</span></p>
                `;
                incorrectAnswersList.appendChild(li);
            });
        } else {
            noMistakesMessage.classList.remove('hidden-element');
        }
        
        localStorage.removeItem('quizResult');
    } else {
        window.location.href = 'index.html';
    }
});