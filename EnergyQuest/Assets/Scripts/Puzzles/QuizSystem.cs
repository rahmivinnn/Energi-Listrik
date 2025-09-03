using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.Utils;
using EnergyQuest.UI;
using EnergyQuest.Audio;

namespace EnergyQuest.Puzzles
{
    [System.Serializable]
    public class QuizQuestion
    {
        [Header("Question Data")]
        public string questionText;
        public string[] answerOptions;
        public int correctAnswerIndex;
        public string explanation;
        public QuizCategory category;

        public QuizQuestion(string question, string[] options, int correctIndex, string explain, QuizCategory cat)
        {
            questionText = question;
            answerOptions = options;
            correctAnswerIndex = correctIndex;
            explanation = explain;
            category = cat;
        }

        public bool IsAnswerCorrect(int selectedIndex)
        {
            return selectedIndex == correctAnswerIndex;
        }

        public string GetCorrectAnswer()
        {
            if (correctAnswerIndex >= 0 && correctAnswerIndex < answerOptions.Length)
                return answerOptions[correctAnswerIndex];
            return "";
        }
    }

    public enum QuizCategory
    {
        BasicElectricity,
        EnergyEfficiency,
        EnergyCalculation,
        ElectricalSafety,
        RenewableEnergy
    }

    public class QuizSystem : MonoBehaviour
    {
        [Header("Quiz Configuration")]
        public int questionsPerSession = 10;
        public int totalQuestions = 20;
        public float timePerQuestion = 30f;
        public bool isCompleted = false;

        [Header("Quiz UI")]
        public Text questionNumberText;
        public Text questionText;
        public Button[] answerButtons;
        public Text[] answerTexts;
        public Text timerText;
        public Slider timerSlider;

        [Header("Results UI")]
        public GameObject resultsPanel;
        public Text finalScoreText;
        public Text correctAnswersText;
        public Text efficiencyText;
        public Button retryButton;
        public Button continueButton;

        [Header("Feedback UI")]
        public GameObject feedbackPanel;
        public Text feedbackText;
        public Image feedbackIcon;
        public Button nextQuestionButton;

        [Header("Progress")]
        public Slider progressSlider;
        public Text progressText;

        // Quiz state
        private List<QuizQuestion> allQuestions = new List<QuizQuestion>();
        private List<QuizQuestion> sessionQuestions = new List<QuizQuestion>();
        private int currentQuestionIndex = 0;
        private int correctAnswers = 0;
        private float currentQuestionTimer = 0f;
        private bool questionAnswered = false;
        private bool quizActive = false;

        private void Start()
        {
            InitializeQuestions();
            SetupUIListeners();
            ResetQuiz();
        }

        private void Update()
        {
            if (quizActive && !questionAnswered)
            {
                UpdateQuestionTimer();
            }
        }

        private void InitializeQuestions()
        {
            allQuestions.Clear();

            // Basic Electricity Questions
            allQuestions.Add(new QuizQuestion(
                "Apa yang dimaksud dengan rangkaian listrik tertutup?",
                new string[] { "Rangkaian yang tidak memiliki saklar", "Rangkaian dimana arus dapat mengalir dari positif ke negatif", "Rangkaian yang selalu menyala", "Rangkaian yang tidak menggunakan kabel" },
                1,
                "Rangkaian tertutup memungkinkan arus listrik mengalir dari kutub positif ke negatif sumber tegangan.",
                QuizCategory.BasicElectricity
            ));

            allQuestions.Add(new QuizQuestion(
                "Fungsi utama saklar dalam rangkaian listrik adalah?",
                new string[] { "Menambah tegangan", "Memutus atau menghubungkan arus listrik", "Mengurangi daya", "Menyimpan energi" },
                1,
                "Saklar berfungsi untuk memutus atau menghubungkan aliran arus listrik dalam rangkaian.",
                QuizCategory.BasicElectricity
            ));

            allQuestions.Add(new QuizQuestion(
                "Satuan untuk mengukur daya listrik adalah?",
                new string[] { "Volt", "Ampere", "Watt", "Ohm" },
                2,
                "Watt adalah satuan untuk mengukur daya listrik. Semakin tinggi watt, semakin besar konsumsi energi.",
                QuizCategory.BasicElectricity
            ));

            // Energy Efficiency Questions
            allQuestions.Add(new QuizQuestion(
                "Cara terbaik menghemat energi di siang hari adalah?",
                new string[] { "Menyalakan semua lampu", "Menutup semua jendela", "Memanfaatkan cahaya alami", "Menggunakan AC terus-menerus" },
                2,
                "Memanfaatkan cahaya alami dari jendela dapat mengurangi penggunaan lampu di siang hari.",
                QuizCategory.EnergyEfficiency
            ));

            allQuestions.Add(new QuizQuestion(
                "Mengapa pintu kulkas harus ditutup dengan cepat?",
                new string[] { "Agar makanan tidak basi", "Untuk menghemat energi listrik", "Agar kulkas tidak rusak", "Semua jawaban benar" },
                3,
                "Semua jawaban benar. Menutup kulkas dengan cepat menghemat energi dan menjaga kualitas makanan.",
                QuizCategory.EnergyEfficiency
            ));

            allQuestions.Add(new QuizQuestion(
                "Perangkat mana yang paling boros energi di rumah?",
                new string[] { "Lampu LED 10W", "Kipas angin 75W", "AC 1500W", "Charger HP 20W" },
                2,
                "AC mengonsumsi energi paling besar (1500W) dibanding perangkat lainnya.",
                QuizCategory.EnergyEfficiency
            ));

            // Energy Calculation Questions
            allQuestions.Add(new QuizQuestion(
                "Lampu 60W menyala 8 jam/hari. Berapa konsumsi energi hariannya?",
                new string[] { "0.48 kWh", "4.8 kWh", "48 kWh", "480 kWh" },
                0,
                "E = (60 × 8) / 1000 = 0.48 kWh per hari",
                QuizCategory.EnergyCalculation
            ));

            allQuestions.Add(new QuizQuestion(
                "Jika tarif listrik Rp1.467/kWh, berapa biaya TV 200W yang menyala 6 jam/hari selama sebulan?",
                new string[] { "Rp52.812", "Rp105.624", "Rp158.436", "Rp211.248" },
                0,
                "E = (200 × 6 × 30) / 1000 = 36 kWh. Biaya = 36 × 1.467 = Rp52.812",
                QuizCategory.EnergyCalculation
            ));

            // Add more questions...
            AddMoreQuestions();
        }

        private void AddMoreQuestions()
        {
            // Electrical Safety
            allQuestions.Add(new QuizQuestion(
                "Yang harus dilakukan jika ada konsleting listrik?",
                new string[] { "Menyiram dengan air", "Matikan saklar utama dulu", "Memegang kabel langsung", "Membiarkannya" },
                1,
                "Matikan saklar utama (MCB) terlebih dahulu untuk memutus aliran listrik sebelum memperbaiki.",
                QuizCategory.ElectricalSafety
            ));

            allQuestions.Add(new QuizQuestion(
                "Mengapa tidak boleh menyentuh kabel listrik dengan tangan basah?",
                new string[] { "Air menghantarkan listrik", "Tangan akan kotor", "Kabel akan rusak", "Tidak ada masalah" },
                0,
                "Air adalah penghantar listrik yang baik, sehingga menyentuh kabel dengan tangan basah sangat berbahaya.",
                QuizCategory.ElectricalSafety
            ));

            // Renewable Energy
            allQuestions.Add(new QuizQuestion(
                "Sumber energi terbarukan yang paling umum untuk rumah adalah?",
                new string[] { "Batu bara", "Panel surya", "Gas alam", "Bensin" },
                1,
                "Panel surya mengkonversi energi matahari menjadi listrik dan merupakan sumber energi terbarukan.",
                QuizCategory.RenewableEnergy
            ));

            allQuestions.Add(new QuizQuestion(
                "Keuntungan utama menggunakan energi terbarukan adalah?",
                new string[] { "Lebih murah", "Ramah lingkungan", "Lebih cepat", "Lebih mudah" },
                1,
                "Energi terbarukan ramah lingkungan karena tidak menghasilkan polusi dan tidak akan habis.",
                QuizCategory.RenewableEnergy
            ));

            // More Energy Efficiency
            allQuestions.Add(new QuizQuestion(
                "Cara terbaik menggunakan rice cooker yang hemat energi?",
                new string[] { "Dibiarkan menyala terus", "Digunakan mode hemat energi", "Dimatikan saat memasak", "Dipanaskan berkali-kali" },
                1,
                "Mode hemat energi pada rice cooker mengurangi konsumsi listrik setelah nasi matang.",
                QuizCategory.EnergyEfficiency
            ));

            allQuestions.Add(new QuizQuestion(
                "Mengapa lampu LED lebih hemat energi dari lampu pijar?",
                new string[] { "Lebih terang", "Konsumsi daya lebih rendah", "Lebih murah", "Tahan lama" },
                1,
                "Lampu LED mengonsumsi daya jauh lebih rendah (10W) dibanding lampu pijar (60W) untuk tingkat kecerahan yang sama.",
                QuizCategory.EnergyEfficiency
            ));

            // More Calculation Questions
            allQuestions.Add(new QuizQuestion(
                "Setrika 1000W digunakan 1 jam/hari. Berapa biaya bulanannya jika tarif Rp1.467/kWh?",
                new string[] { "Rp44.010", "Rp22.005", "Rp66.015", "Rp88.020" },
                0,
                "E = (1000 × 1 × 30) / 1000 = 30 kWh. Biaya = 30 × 1.467 = Rp44.010",
                QuizCategory.EnergyCalculation
            ));

            allQuestions.Add(new QuizQuestion(
                "Jika target tagihan Rp300.000 dengan tarif Rp1.467/kWh, berapa maksimal konsumsi bulanan?",
                new string[] { "204.5 kWh", "245.6 kWh", "189.3 kWh", "167.8 kWh" },
                0,
                "Konsumsi maksimal = 300.000 / 1.467 = 204.5 kWh per bulan",
                QuizCategory.EnergyCalculation
            ));

            // More Basic Electricity
            allQuestions.Add(new QuizQuestion(
                "Apa yang terjadi jika rangkaian listrik terbuka?",
                new string[] { "Arus mengalir dengan lancar", "Arus tidak mengalir", "Tegangan naik", "Daya bertambah" },
                1,
                "Pada rangkaian terbuka, arus tidak dapat mengalir karena tidak ada jalur tertutup.",
                QuizCategory.BasicElectricity
            ));

            allQuestions.Add(new QuizQuestion(
                "Komponen apa yang berfungsi sebagai sumber energi dalam rangkaian sederhana?",
                new string[] { "Lampu", "Kabel", "Baterai", "Saklar" },
                2,
                "Baterai berfungsi sebagai sumber energi listrik dalam rangkaian sederhana.",
                QuizCategory.BasicElectricity
            ));

            // More Safety Questions
            allQuestions.Add(new QuizQuestion(
                "Apa fungsi MCB (Miniature Circuit Breaker) di rumah?",
                new string[] { "Menambah tegangan", "Melindungi dari korsleting", "Menghemat energi", "Mempercepat aliran listrik" },
                1,
                "MCB berfungsi melindungi rangkaian listrik dari korsleting dan arus berlebih.",
                QuizCategory.ElectricalSafety
            ));

            allQuestions.Add(new QuizQuestion(
                "Berapa tegangan listrik standar di rumah Indonesia?",
                new string[] { "110V", "220V", "240V", "380V" },
                1,
                "Tegangan listrik standar di Indonesia adalah 220V untuk rumah tangga.",
                QuizCategory.BasicElectricity
            ));

            Debug.Log($"Initialized {allQuestions.Count} quiz questions");
        }

        private void SetupUIListeners()
        {
            // Setup answer buttons
            for (int i = 0; i < answerButtons.Length; i++)
            {
                int index = i; // Capture for closure
                if (answerButtons[i] != null)
                {
                    answerButtons[i].onClick.AddListener(() => OnAnswerSelected(index));
                }
            }

            // Setup other buttons
            if (nextQuestionButton != null)
                nextQuestionButton.onClick.AddListener(NextQuestion);

            if (retryButton != null)
                retryButton.onClick.AddListener(RetryQuiz);

            if (continueButton != null)
                continueButton.onClick.AddListener(CompleteQuiz);

            // Initially hide panels
            if (feedbackPanel != null)
                feedbackPanel.SetActive(false);

            if (resultsPanel != null)
                resultsPanel.SetActive(false);
        }

        public void StartQuiz()
        {
            // Shuffle questions using Fisher-Yates algorithm
            List<QuizQuestion> shuffledQuestions = FisherYatesShuffle.GetRandomSubset(allQuestions, questionsPerSession);
            sessionQuestions = shuffledQuestions;

            // Reset quiz state
            currentQuestionIndex = 0;
            correctAnswers = 0;
            quizActive = true;

            // Show first question
            ShowCurrentQuestion();

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("quiz_start");
            }

            Debug.Log($"Quiz started with {sessionQuestions.Count} shuffled questions");
        }

        private void ShowCurrentQuestion()
        {
            if (currentQuestionIndex >= sessionQuestions.Count)
            {
                EndQuiz();
                return;
            }

            questionAnswered = false;
            currentQuestionTimer = timePerQuestion;

            var question = sessionQuestions[currentQuestionIndex];

            // Update question UI
            if (questionNumberText != null)
                questionNumberText.text = $"Pertanyaan {currentQuestionIndex + 1}/{sessionQuestions.Count}";

            if (questionText != null)
                questionText.text = question.questionText;

            // Update answer buttons
            for (int i = 0; i < answerButtons.Length && i < question.answerOptions.Length; i++)
            {
                if (answerButtons[i] != null)
                {
                    answerButtons[i].gameObject.SetActive(true);
                    answerButtons[i].interactable = true;
                    
                    // Reset button color
                    var buttonColors = answerButtons[i].colors;
                    buttonColors.normalColor = Color.white;
                    answerButtons[i].colors = buttonColors;
                }

                if (answerTexts[i] != null)
                {
                    answerTexts[i].text = question.answerOptions[i];
                }
            }

            // Hide unused buttons
            for (int i = question.answerOptions.Length; i < answerButtons.Length; i++)
            {
                if (answerButtons[i] != null)
                    answerButtons[i].gameObject.SetActive(false);
            }

            // Update progress
            UpdateProgress();

            // Hide feedback panel
            if (feedbackPanel != null)
                feedbackPanel.SetActive(false);

            // Play question sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("question_appear");
            }
        }

        private void UpdateQuestionTimer()
        {
            currentQuestionTimer -= Time.deltaTime;

            // Update timer UI
            if (timerText != null)
            {
                int seconds = Mathf.Max(0, Mathf.CeilToInt(currentQuestionTimer));
                timerText.text = $"Waktu: {seconds}s";
            }

            if (timerSlider != null)
            {
                timerSlider.value = currentQuestionTimer / timePerQuestion;
            }

            // Time's up
            if (currentQuestionTimer <= 0f && !questionAnswered)
            {
                OnTimeUp();
            }
        }

        private void OnTimeUp()
        {
            questionAnswered = true;

            // Show time's up feedback
            ShowAnswerFeedback(-1, false, "Waktu habis! Jawaban yang benar: " + 
                sessionQuestions[currentQuestionIndex].GetCorrectAnswer());

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("time_up");
            }
        }

        public void OnAnswerSelected(int answerIndex)
        {
            if (questionAnswered || !quizActive) return;

            questionAnswered = true;
            var currentQuestion = sessionQuestions[currentQuestionIndex];
            bool isCorrect = currentQuestion.IsAnswerCorrect(answerIndex);

            if (isCorrect)
            {
                correctAnswers++;
            }

            // Disable all answer buttons
            foreach (var button in answerButtons)
            {
                if (button != null)
                    button.interactable = false;
            }

            // Highlight selected answer
            HighlightAnswer(answerIndex, isCorrect);

            // Show feedback
            ShowAnswerFeedback(answerIndex, isCorrect, currentQuestion.explanation);

            // Play sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX(isCorrect ? "correct_answer" : "wrong_answer");
            }
        }

        private void HighlightAnswer(int selectedIndex, bool isCorrect)
        {
            if (selectedIndex >= 0 && selectedIndex < answerButtons.Length && answerButtons[selectedIndex] != null)
            {
                var buttonColors = answerButtons[selectedIndex].colors;
                buttonColors.normalColor = isCorrect ? Color.green : Color.red;
                answerButtons[selectedIndex].colors = buttonColors;
            }

            // Also highlight correct answer if wrong answer was selected
            if (!isCorrect)
            {
                int correctIndex = sessionQuestions[currentQuestionIndex].correctAnswerIndex;
                if (correctIndex >= 0 && correctIndex < answerButtons.Length && answerButtons[correctIndex] != null)
                {
                    var buttonColors = answerButtons[correctIndex].colors;
                    buttonColors.normalColor = Color.green;
                    answerButtons[correctIndex].colors = buttonColors;
                }
            }
        }

        private void ShowAnswerFeedback(int selectedIndex, bool isCorrect, string explanation)
        {
            if (feedbackPanel == null) return;

            feedbackPanel.SetActive(true);

            if (feedbackText != null)
            {
                string feedbackMessage = isCorrect ? "BENAR!" : "SALAH!";
                feedbackMessage += "\n\n" + explanation;
                feedbackText.text = feedbackMessage;
                feedbackText.color = isCorrect ? Color.green : Color.red;
            }

            if (feedbackIcon != null)
            {
                feedbackIcon.sprite = isCorrect ? UIManager.Instance.successIcon : UIManager.Instance.errorIcon;
                feedbackIcon.color = isCorrect ? Color.green : Color.red;
            }
        }

        public void NextQuestion()
        {
            currentQuestionIndex++;
            
            if (currentQuestionIndex < sessionQuestions.Count)
            {
                ShowCurrentQuestion();
            }
            else
            {
                EndQuiz();
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("next_question");
            }
        }

        private void UpdateProgress()
        {
            if (progressSlider != null)
            {
                float progress = (float)currentQuestionIndex / sessionQuestions.Count;
                progressSlider.value = progress;
            }

            if (progressText != null)
            {
                progressText.text = $"Progress: {currentQuestionIndex}/{sessionQuestions.Count}";
            }
        }

        private void EndQuiz()
        {
            quizActive = false;

            // Calculate final score
            float scorePercentage = (float)correctAnswers / sessionQuestions.Count * 100f;
            bool passed = scorePercentage >= 70f; // 70% passing grade

            // Show results
            ShowQuizResults(scorePercentage, passed);

            if (passed)
            {
                CompleteQuizSuccessfully();
            }
        }

        private void ShowQuizResults(float scorePercentage, bool passed)
        {
            if (resultsPanel == null) return;

            resultsPanel.SetActive(true);

            if (finalScoreText != null)
            {
                finalScoreText.text = $"Skor Akhir: {scorePercentage:F1}%";
                finalScoreText.color = passed ? Color.green : Color.red;
            }

            if (correctAnswersText != null)
            {
                correctAnswersText.text = $"Jawaban Benar: {correctAnswers}/{sessionQuestions.Count}";
            }

            if (efficiencyText != null)
            {
                string efficiencyMessage = passed ? "LULUS! Pemahaman energi sangat baik!" : "BELUM LULUS. Coba lagi untuk meningkatkan pemahaman.";
                efficiencyText.text = efficiencyMessage;
                efficiencyText.color = passed ? Color.green : Color.red;
            }

            // Show appropriate buttons
            if (retryButton != null)
                retryButton.gameObject.SetActive(!passed);

            if (continueButton != null)
                continueButton.gameObject.SetActive(passed);

            // Play result sound
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX(passed ? "quiz_passed" : "quiz_failed");
            }
        }

        private void CompleteQuizSuccessfully()
        {
            isCompleted = true;

            // Award final energy key
            if (GameManager.Instance != null)
            {
                GameManager.Instance.CollectEnergyKey(3); // Fourth and final energy key
            }

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayKeyCollected();
            }
        }

        public void RetryQuiz()
        {
            ResetQuiz();
            StartQuiz();

            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("retry");
            }
        }

        public void CompleteQuiz()
        {
            // This is called when player passes and wants to continue
            if (resultsPanel != null)
                resultsPanel.SetActive(false);

            // Trigger level completion
            var basementHandler = FindObjectOfType<BasementHandler>();
            if (basementHandler != null)
            {
                basementHandler.OnQuizCompleted();
            }
        }

        private void ResetQuiz()
        {
            currentQuestionIndex = 0;
            correctAnswers = 0;
            questionAnswered = false;
            quizActive = false;
            isCompleted = false;

            // Hide all panels
            if (feedbackPanel != null)
                feedbackPanel.SetActive(false);

            if (resultsPanel != null)
                resultsPanel.SetActive(false);

            // Reset button states
            foreach (var button in answerButtons)
            {
                if (button != null)
                {
                    button.interactable = true;
                    var buttonColors = button.colors;
                    buttonColors.normalColor = Color.white;
                    button.colors = buttonColors;
                }
            }
        }

        // Public methods for level handler
        public bool IsPuzzleCompleted()
        {
            return isCompleted;
        }

        public void ResetPuzzleState()
        {
            ResetQuiz();
        }

        public int GetCorrectAnswersCount()
        {
            return correctAnswers;
        }

        public int GetTotalQuestionsCount()
        {
            return sessionQuestions.Count;
        }

        public float GetScorePercentage()
        {
            if (sessionQuestions.Count == 0) return 0f;
            return (float)correctAnswers / sessionQuestions.Count * 100f;
        }

        private void OnDestroy()
        {
            // Remove all listeners
            foreach (var button in answerButtons)
            {
                if (button != null)
                    button.onClick.RemoveAllListeners();
            }

            if (nextQuestionButton != null) nextQuestionButton.onClick.RemoveAllListeners();
            if (retryButton != null) retryButton.onClick.RemoveAllListeners();
            if (continueButton != null) continueButton.onClick.RemoveAllListeners();
        }
    }
}