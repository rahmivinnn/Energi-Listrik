// Energy Quest: Quiz System Implementation
// Level 4 - Fisher-Yates Shuffled Knowledge Quiz

class QuizSystem {
    constructor() {
        this.isCompleted = false;
        this.isActive = false;
        this.questionsPerSession = GAME_CONSTANTS.QUIZ_QUESTIONS_PER_SESSION;
        this.timePerQuestion = GAME_CONSTANTS.QUIZ_TIME_PER_QUESTION;
        this.passingScore = GAME_CONSTANTS.QUIZ_PASSING_SCORE;
        
        // Quiz state
        this.sessionQuestions = [];
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.currentQuestionTimer = 0;
        this.questionAnswered = false;
        this.quizActive = false;
        this.timerInterval = null;
        
        console.log('Quiz System initialized');
    }

    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.createQuizUI();
        this.setupInteractions();
        this.showQuizIntroduction();
        
        console.log('Quiz System activated');
    }

    deactivate() {
        this.isActive = false;
        this.stopTimer();
        this.removePuzzleUI();
        console.log('Quiz System deactivated');
    }

    createQuizUI() {
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (!puzzleOverlay) return;

        puzzleOverlay.style.display = 'flex';
        puzzleOverlay.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <div class="quiz-title">
                        <h3>🧠 Evaluasi Pengetahuan Energi</h3>
                        <p>Kuis akhir dengan soal teracak (Fisher-Yates Shuffle)</p>
                    </div>
                    <div class="quiz-progress-info">
                        <div class="question-counter">
                            <span id="question-counter">0/10</span>
                        </div>
                        <div class="quiz-timer-display">
                            <div class="timer-circle">
                                <span id="timer-display">30</span>
                            </div>
                        </div>
                        <div class="score-display">
                            <span id="score-display">0/0</span>
                        </div>
                    </div>
                </div>

                <div class="quiz-content" id="quiz-content" style="display: none;">
                    <div class="question-section">
                        <div class="question-number" id="question-number">Pertanyaan 1</div>
                        <div class="question-text" id="question-text">
                            <!-- Question will be populated here -->
                        </div>
                        <div class="question-category" id="question-category">
                            <!-- Category will be shown here -->
                        </div>
                    </div>

                    <div class="answers-section">
                        <div class="answer-options" id="answer-options">
                            <!-- Answer options will be populated here -->
                        </div>
                    </div>

                    <div class="question-feedback" id="question-feedback" style="display: none;">
                        <div class="feedback-icon" id="feedback-icon">✓</div>
                        <div class="feedback-text" id="feedback-text">
                            <!-- Feedback will be shown here -->
                        </div>
                        <button id="next-question-btn" class="next-btn">Pertanyaan Berikutnya →</button>
                    </div>
                </div>

                <div class="quiz-intro" id="quiz-intro">
                    <div class="intro-content">
                        <h3>🚪 Gerbang Evaluasi Akhir</h3>
                        <p>Kamu telah mengumpulkan semua 4 Kunci Energi!</p>
                        
                        <div class="quiz-rules">
                            <h4>Aturan Kuis:</h4>
                            <ul>
                                <li>🔀 <strong>10 pertanyaan acak</strong> dari 20+ bank soal</li>
                                <li>⏰ <strong>30 detik</strong> per pertanyaan</li>
                                <li>🎯 <strong>Minimal 70%</strong> jawaban benar untuk lulus</li>
                                <li>🔄 <strong>Soal diacak</strong> setiap sesi (Fisher-Yates Shuffle)</li>
                            </ul>
                        </div>

                        <div class="quiz-topics">
                            <h4>Topik Kuis:</h4>
                            <div class="topic-tags">
                                <span class="topic-tag">⚡ Dasar Kelistrikan</span>
                                <span class="topic-tag">💡 Efisiensi Energi</span>
                                <span class="topic-tag">🧮 Perhitungan Energi</span>
                                <span class="topic-tag">🛡️ Keamanan Listrik</span>
                                <span class="topic-tag">🌱 Energi Terbarukan</span>
                            </div>
                        </div>

                        <div class="start-quiz-section">
                            <p><strong>Siap untuk tantangan akhir?</strong></p>
                            <button id="start-quiz-btn" class="start-quiz-btn">🚀 Mulai Kuis</button>
                        </div>
                    </div>
                </div>

                <div class="quiz-results" id="quiz-results" style="display: none;">
                    <div class="results-content">
                        <h3 id="results-title">Hasil Kuis</h3>
                        <div class="final-score">
                            <div class="score-circle">
                                <span id="final-score">0%</span>
                            </div>
                        </div>
                        <div class="results-stats">
                            <div class="stat-item">
                                <span class="stat-label">Jawaban Benar:</span>
                                <span class="stat-value" id="correct-answers">0/10</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Skor:</span>
                                <span class="stat-value" id="score-percentage">0%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Status:</span>
                                <span class="stat-value" id="pass-status">-</span>
                            </div>
                        </div>
                        <div class="results-actions" id="results-actions">
                            <!-- Action buttons will be populated based on pass/fail -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addQuizStyles();
    }

    addQuizStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .quiz-container {
                background: rgba(26, 26, 46, 0.98);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 15px;
                padding: 30px;
                max-width: 95%;
                max-height: 95%;
                overflow-y: auto;
                width: 800px;
            }

            .quiz-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
            }

            .quiz-title h3 {
                color: #00ffff;
                margin-bottom: 5px;
                text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }

            .quiz-progress-info {
                display: flex;
                gap: 20px;
                align-items: center;
            }

            .question-counter, .score-display {
                background: rgba(0, 0, 0, 0.5);
                padding: 8px 15px;
                border-radius: 20px;
                border: 1px solid rgba(0, 255, 255, 0.3);
                font-weight: bold;
                color: #00ffff;
            }

            .timer-circle {
                width: 60px;
                height: 60px;
                border: 3px solid rgba(255, 255, 0, 0.3);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                font-weight: bold;
                color: #ffff00;
                position: relative;
            }

            .timer-circle.warning {
                border-color: rgba(255, 100, 0, 0.8);
                color: #ff6400;
                animation: timer-pulse 1s infinite;
            }

            .timer-circle.danger {
                border-color: rgba(255, 0, 0, 0.8);
                color: #ff0000;
                animation: timer-pulse 0.5s infinite;
            }

            @keyframes timer-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .quiz-intro {
                text-align: center;
            }

            .intro-content {
                max-width: 600px;
                margin: 0 auto;
            }

            .quiz-rules, .quiz-topics {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 255, 255, 0.2);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }

            .quiz-rules h4, .quiz-topics h4 {
                color: #00ffff;
                margin-bottom: 15px;
                text-align: center;
            }

            .quiz-rules ul {
                margin-left: 20px;
            }

            .quiz-rules li {
                margin-bottom: 8px;
                color: #cccccc;
                line-height: 1.4;
            }

            .topic-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
            }

            .topic-tag {
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #00ffff;
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 0.9rem;
            }

            .start-quiz-btn {
                background: linear-gradient(135deg, #00ffff, #0099cc);
                color: #000;
                border: none;
                padding: 15px 40px;
                border-radius: 10px;
                font-size: 1.2rem;
                font-weight: bold;
                cursor: pointer;
                margin-top: 30px;
                transition: all 0.3s ease;
            }

            .start-quiz-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 10px 20px rgba(0, 255, 255, 0.3);
            }

            .question-section {
                margin-bottom: 30px;
            }

            .question-number {
                color: #00ffff;
                font-size: 1.1rem;
                margin-bottom: 15px;
                text-align: center;
            }

            .question-text {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 20px;
                font-size: 1.2rem;
                line-height: 1.5;
                color: #ffffff;
                text-align: center;
                margin-bottom: 15px;
            }

            .question-category {
                text-align: center;
                font-size: 0.9rem;
                color: #00ffff;
                background: rgba(0, 255, 255, 0.1);
                padding: 5px 15px;
                border-radius: 15px;
                display: inline-block;
            }

            .answer-options {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 30px 0;
            }

            .answer-option {
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                padding: 15px 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
                font-size: 1rem;
                line-height: 1.4;
                color: #ffffff;
            }

            .answer-option:hover {
                background: rgba(0, 255, 255, 0.1);
                border-color: rgba(0, 255, 255, 0.6);
                transform: translateY(-2px);
            }

            .answer-option.selected {
                border-color: #ffff00;
                background: rgba(255, 255, 0, 0.1);
            }

            .answer-option.correct {
                border-color: #00ff00;
                background: rgba(0, 255, 0, 0.2);
                animation: correct-pulse 1s ease-in-out;
            }

            .answer-option.incorrect {
                border-color: #ff0000;
                background: rgba(255, 0, 0, 0.2);
                animation: incorrect-shake 0.5s ease-in-out;
            }

            .answer-option:disabled {
                cursor: not-allowed;
                opacity: 0.7;
            }

            @keyframes correct-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            @keyframes incorrect-shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            .question-feedback {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid rgba(0, 255, 255, 0.5);
                border-radius: 10px;
                padding: 25px;
                text-align: center;
                margin: 20px 0;
            }

            .feedback-icon {
                font-size: 3rem;
                margin-bottom: 15px;
            }

            .feedback-icon.correct {
                color: #00ff00;
            }

            .feedback-icon.incorrect {
                color: #ff4444;
            }

            .feedback-text {
                font-size: 1.1rem;
                line-height: 1.5;
                color: #ffffff;
                margin-bottom: 20px;
            }

            .next-btn {
                background: linear-gradient(135deg, #00ffff, #0099cc);
                color: #000;
                border: none;
                padding: 12px 25px;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .next-btn:hover {
                transform: translateY(-2px);
            }

            .quiz-results {
                text-align: center;
            }

            .results-content {
                max-width: 500px;
                margin: 0 auto;
            }

            .results-content h3 {
                color: #00ffff;
                margin-bottom: 30px;
                font-size: 2rem;
            }

            .score-circle {
                width: 150px;
                height: 150px;
                border: 5px solid rgba(0, 255, 255, 0.3);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 30px auto;
                position: relative;
            }

            .score-circle.passed {
                border-color: #00ff00;
                animation: success-glow 2s infinite;
            }

            .score-circle.failed {
                border-color: #ff4444;
            }

            @keyframes success-glow {
                0%, 100% { 
                    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
                }
                50% { 
                    box-shadow: 0 0 40px rgba(0, 255, 0, 0.6);
                }
            }

            .score-circle span {
                font-size: 2.5rem;
                font-weight: bold;
                color: #00ffff;
            }

            .score-circle.passed span {
                color: #00ff00;
            }

            .score-circle.failed span {
                color: #ff4444;
            }

            .results-stats {
                display: flex;
                justify-content: space-around;
                margin: 30px 0;
            }

            .stat-item {
                text-align: center;
            }

            .stat-label {
                font-size: 0.9rem;
                color: #cccccc;
                margin-bottom: 5px;
                display: block;
            }

            .stat-value {
                font-size: 1.2rem;
                font-weight: bold;
                color: #00ffff;
            }

            .results-actions {
                margin-top: 30px;
            }

            .results-btn {
                background: linear-gradient(135deg, #00ffff, #0099cc);
                color: #000;
                border: none;
                padding: 12px 25px;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                margin: 0 10px;
                transition: all 0.3s ease;
            }

            .results-btn.retry {
                background: linear-gradient(135deg, #ff6600, #cc5500);
                color: #fff;
            }

            .results-btn:hover {
                transform: translateY(-2px);
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .quiz-container {
                    padding: 20px;
                    width: 95%;
                }
                
                .quiz-header {
                    flex-direction: column;
                    gap: 20px;
                    text-align: center;
                }
                
                .quiz-progress-info {
                    justify-content: space-around;
                    width: 100%;
                }
                
                .answer-options {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }
                
                .question-text {
                    font-size: 1.1rem;
                    padding: 15px;
                }
                
                .answer-option {
                    padding: 12px 15px;
                    font-size: 0.95rem;
                }
                
                .results-stats {
                    flex-direction: column;
                    gap: 15px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    setupInteractions() {
        const startQuizBtn = document.getElementById('start-quiz-btn');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => this.startQuiz());
        }

        const nextQuestionBtn = document.getElementById('next-question-btn');
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', () => this.nextQuestion());
        }
    }

    showQuizIntroduction() {
        // Quiz intro is shown by default in the UI
        console.log('Quiz introduction displayed');
    }

    startQuiz() {
        // Generate shuffled questions using Fisher-Yates algorithm
        this.sessionQuestions = QuizShuffle.createQuizSession(
            QUIZ_QUESTIONS, 
            this.questionsPerSession
        );

        console.log('Quiz session created with Fisher-Yates shuffle:', this.sessionQuestions.sessionId);
        console.log('Questions shuffled:', this.sessionQuestions.questions.map(q => q.id));

        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.quizActive = true;

        // Hide intro, show quiz content
        document.getElementById('quiz-intro').style.display = 'none';
        document.getElementById('quiz-content').style.display = 'block';

        // Start first question
        this.showCurrentQuestion();

        window.audioManager.playSFX('SUCCESS');
    }

    showCurrentQuestion() {
        if (this.currentQuestionIndex >= this.sessionQuestions.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.sessionQuestions.questions[this.currentQuestionIndex];
        this.questionAnswered = false;
        this.currentQuestionTimer = this.timePerQuestion;

        // Update question display
        const questionNumber = document.getElementById('question-number');
        const questionText = document.getElementById('question-text');
        const questionCategory = document.getElementById('question-category');
        const answerOptions = document.getElementById('answer-options');
        const questionCounter = document.getElementById('question-counter');

        if (questionNumber) {
            questionNumber.textContent = `Pertanyaan ${this.currentQuestionIndex + 1}`;
        }

        if (questionText) {
            questionText.textContent = question.question;
        }

        if (questionCategory) {
            questionCategory.textContent = `📚 ${question.category}`;
        }

        if (questionCounter) {
            questionCounter.textContent = `${this.currentQuestionIndex + 1}/${this.sessionQuestions.questions.length}`;
        }

        // Create answer options
        if (answerOptions) {
            answerOptions.innerHTML = '';
            question.answers.forEach((answer, index) => {
                const answerElement = document.createElement('div');
                answerElement.className = 'answer-option';
                answerElement.textContent = answer;
                answerElement.dataset.index = index;
                answerElement.addEventListener('click', () => this.selectAnswer(index));
                answerOptions.appendChild(answerElement);
            });
        }

        // Hide feedback
        document.getElementById('question-feedback').style.display = 'none';

        // Start timer
        this.startTimer();

        window.audioManager.playSFX('CLICK');
    }

    startTimer() {
        this.stopTimer(); // Clear any existing timer
        
        this.timerInterval = setInterval(() => {
            this.currentQuestionTimer--;
            this.updateTimerDisplay();

            if (this.currentQuestionTimer <= 0) {
                this.onTimeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        const timerCircle = document.querySelector('.timer-circle');

        if (timerDisplay) {
            timerDisplay.textContent = Math.max(0, this.currentQuestionTimer);
        }

        if (timerCircle) {
            // Change color based on remaining time
            if (this.currentQuestionTimer <= 5) {
                timerCircle.className = 'timer-circle danger';
            } else if (this.currentQuestionTimer <= 10) {
                timerCircle.className = 'timer-circle warning';
            } else {
                timerCircle.className = 'timer-circle';
            }
        }
    }

    selectAnswer(answerIndex) {
        if (this.questionAnswered) return;

        this.questionAnswered = true;
        this.stopTimer();

        const question = this.sessionQuestions.questions[this.currentQuestionIndex];
        const isCorrect = question.correctAnswer === answerIndex;

        if (isCorrect) {
            this.correctAnswers++;
        }

        // Update visual feedback
        this.showAnswerFeedback(answerIndex, isCorrect, question);

        // Update score display
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `${this.correctAnswers}/${this.currentQuestionIndex + 1}`;
        }

        // Play sound
        if (isCorrect) {
            window.audioManager.playQuizCorrect();
        } else {
            window.audioManager.playQuizWrong();
        }
    }

    showAnswerFeedback(selectedIndex, isCorrect, question) {
        // Highlight answers
        const answerElements = document.querySelectorAll('.answer-option');
        answerElements.forEach((element, index) => {
            element.style.pointerEvents = 'none';
            
            if (index === selectedIndex) {
                element.classList.add(isCorrect ? 'correct' : 'incorrect');
            } else if (index === question.correctAnswer) {
                element.classList.add('correct');
            }
        });

        // Show feedback panel
        const feedbackPanel = document.getElementById('question-feedback');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackText = document.getElementById('feedback-text');

        if (feedbackPanel && feedbackIcon && feedbackText) {
            feedbackIcon.textContent = isCorrect ? '✅' : '❌';
            feedbackIcon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
            
            const feedbackMessage = isCorrect ? 'BENAR!' : 'SALAH!';
            feedbackText.innerHTML = `
                <h4>${feedbackMessage}</h4>
                <p><strong>Penjelasan:</strong></p>
                <p>${question.explanation}</p>
            `;
            
            feedbackPanel.style.display = 'block';
        }
    }

    onTimeUp() {
        if (this.questionAnswered) return;

        this.questionAnswered = true;
        this.stopTimer();

        const question = this.sessionQuestions.questions[this.currentQuestionIndex];
        
        // Show time's up feedback
        const feedbackPanel = document.getElementById('question-feedback');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackText = document.getElementById('feedback-text');

        if (feedbackPanel && feedbackIcon && feedbackText) {
            feedbackIcon.textContent = '⏰';
            feedbackIcon.className = 'feedback-icon incorrect';
            
            feedbackText.innerHTML = `
                <h4>WAKTU HABIS!</h4>
                <p><strong>Jawaban yang benar:</strong> ${question.answers[question.correctAnswer]}</p>
                <p><strong>Penjelasan:</strong></p>
                <p>${question.explanation}</p>
            `;
            
            feedbackPanel.style.display = 'block';
        }

        // Highlight correct answer
        const answerElements = document.querySelectorAll('.answer-option');
        answerElements.forEach((element, index) => {
            element.style.pointerEvents = 'none';
            if (index === question.correctAnswer) {
                element.classList.add('correct');
            }
        });

        window.audioManager.playSFX('ERROR');
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.sessionQuestions.questions.length) {
            this.showCurrentQuestion();
        } else {
            this.endQuiz();
        }
    }

    endQuiz() {
        this.quizActive = false;
        this.stopTimer();

        const scorePercentage = (this.correctAnswers / this.sessionQuestions.questions.length) * 100;
        const passed = scorePercentage >= this.passingScore;

        this.showQuizResults(scorePercentage, passed);

        if (passed) {
            this.completeQuiz();
        }
    }

    showQuizResults(scorePercentage, passed) {
        // Hide quiz content, show results
        document.getElementById('quiz-content').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';

        // Update results display
        const resultsTitle = document.getElementById('results-title');
        const finalScore = document.getElementById('final-score');
        const correctAnswers = document.getElementById('correct-answers');
        const scorePercentageElement = document.getElementById('score-percentage');
        const passStatus = document.getElementById('pass-status');
        const resultsActions = document.getElementById('results-actions');

        if (resultsTitle) {
            resultsTitle.textContent = passed ? '🎉 KUIS LULUS!' : '📚 BELUM LULUS';
            resultsTitle.style.color = passed ? '#00ff00' : '#ff4444';
        }

        if (finalScore) {
            finalScore.textContent = `${Math.round(scorePercentage)}%`;
            const scoreCircle = finalScore.parentElement;
            scoreCircle.className = `score-circle ${passed ? 'passed' : 'failed'}`;
        }

        if (correctAnswers) {
            correctAnswers.textContent = `${this.correctAnswers}/${this.sessionQuestions.questions.length}`;
        }

        if (scorePercentageElement) {
            scorePercentageElement.textContent = `${Math.round(scorePercentage)}%`;
            scorePercentageElement.style.color = passed ? '#00ff00' : '#ff4444';
        }

        if (passStatus) {
            passStatus.textContent = passed ? 'LULUS' : 'BELUM LULUS';
            passStatus.style.color = passed ? '#00ff00' : '#ff4444';
        }

        // Show appropriate action buttons
        if (resultsActions) {
            if (passed) {
                resultsActions.innerHTML = `
                    <button id="continue-game-btn" class="results-btn">
                        🎯 Lanjutkan Permainan
                    </button>
                `;
                
                const continueBtn = document.getElementById('continue-game-btn');
                if (continueBtn) {
                    continueBtn.addEventListener('click', () => this.continueAfterQuiz());
                }
            } else {
                resultsActions.innerHTML = `
                    <button id="retry-quiz-btn" class="results-btn retry">
                        🔄 Coba Lagi
                    </button>
                    <button id="study-more-btn" class="results-btn">
                        📖 Pelajari Materi
                    </button>
                `;
                
                const retryBtn = document.getElementById('retry-quiz-btn');
                const studyBtn = document.getElementById('study-more-btn');
                
                if (retryBtn) retryBtn.addEventListener('click', () => this.retryQuiz());
                if (studyBtn) studyBtn.addEventListener('click', () => this.showStudyMaterial());
            }
        }

        // Play result sound
        if (passed) {
            window.audioManager.playSuccessSound();
        } else {
            window.audioManager.playErrorSound();
        }
    }

    completeQuiz() {
        this.isCompleted = true;
        
        // Award final energy key
        setTimeout(() => {
            window.uiManager.collectEnergyKey(3);
        }, 2000);

        // Show completion message
        setTimeout(() => {
            this.showQuizCompletionMessage();
        }, 4000);
    }

    showQuizCompletionMessage() {
        const completionContent = `
            <h3>🏆 Evaluasi Akhir Selesai!</h3>
            <p><strong>Selamat!</strong> Kamu telah menyelesaikan semua tantangan Energy Quest!</p>
            
            <h4>Pencapaian Kamu:</h4>
            <ul>
                <li>✅ Memahami rangkaian listrik dasar</li>
                <li>✅ Menguasai efisiensi energi</li>
                <li>✅ Menghitung tagihan listrik</li>
                <li>✅ Lulus evaluasi pengetahuan (${Math.round((this.correctAnswers / this.sessionQuestions.questions.length) * 100)}%)</li>
            </ul>
            
            <div class="final-achievement">
                <h4>🎖️ LENCANA PENELITI MUDA ENERGI 🎖️</h4>
                <p>Kamu telah menjadi ahli efisiensi energi!</p>
            </div>
            
            <p><strong>Misi Selesai:</strong> Ilmuwan berhasil diselamatkan!</p>
        `;

        window.uiManager.showEducationalPanel('Kuis Selesai', completionContent);
    }

    continueAfterQuiz() {
        // Complete the level and proceed to ending
        if (window.gameEngine) {
            window.gameEngine.completeLevel(4);
        }
        
        // Transition to ending
        setTimeout(() => {
            window.gameFSM.changeState(GAME_CONSTANTS.GAME_STATES.ENDING);
        }, 2000);
    }

    retryQuiz() {
        this.resetQuiz();
        this.startQuiz();
        window.audioManager.playSFX('CLICK');
    }

    showStudyMaterial() {
        const studyContent = `
            <h3>📚 Materi Pembelajaran</h3>
            <p>Pelajari kembali materi berikut sebelum mengulang kuis:</p>
            
            <h4>🔌 Dasar Kelistrikan</h4>
            <ul>
                <li>Rangkaian tertutup dan terbuka</li>
                <li>Fungsi komponen listrik (baterai, saklar, lampu)</li>
                <li>Aliran arus dari positif ke negatif</li>
            </ul>
            
            <h4>💡 Efisiensi Energi</h4>
            <ul>
                <li>Pemanfaatan cahaya alami</li>
                <li>Penggunaan perangkat seperlunya</li>
                <li>Tips hemat energi di rumah</li>
            </ul>
            
            <h4>🧮 Perhitungan Energi</h4>
            <ul>
                <li>Formula: E = (P × t) / 1000</li>
                <li>Konversi Watt ke kWh</li>
                <li>Perhitungan tagihan PLN</li>
            </ul>
            
            <h4>🛡️ Keamanan Listrik</h4>
            <ul>
                <li>Bahaya air dan listrik</li>
                <li>Fungsi MCB dan pengaman</li>
                <li>Prosedur darurat</li>
            </ul>
            
            <p><strong>Tip:</strong> Mainkan ulang level sebelumnya untuk memperdalam pemahaman!</p>
        `;

        window.uiManager.showEducationalPanel('Materi Pembelajaran', studyContent);
    }

    resetQuiz() {
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.questionAnswered = false;
        this.quizActive = false;
        this.isCompleted = false;
        this.stopTimer();

        // Show intro again
        document.getElementById('quiz-intro').style.display = 'block';
        document.getElementById('quiz-content').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'none';

        // Reset displays
        const questionCounter = document.getElementById('question-counter');
        const scoreDisplay = document.getElementById('score-display');

        if (questionCounter) questionCounter.textContent = '0/10';
        if (scoreDisplay) scoreDisplay.textContent = '0/0';
    }

    removePuzzleUI() {
        const puzzleOverlay = document.getElementById('puzzle-overlay');
        if (puzzleOverlay) {
            puzzleOverlay.style.display = 'none';
            puzzleOverlay.innerHTML = '';
        }
    }

    // Public interface
    isPuzzleCompleted() {
        return this.isCompleted;
    }

    resetPuzzleState() {
        this.resetQuiz();
    }

    getScore() {
        if (this.sessionQuestions.questions.length === 0) return 0;
        return (this.correctAnswers / this.sessionQuestions.questions.length) * 100;
    }

    destroy() {
        this.stopTimer();
        this.deactivate();
    }
}

// Export for global access
window.QuizSystem = QuizSystem;