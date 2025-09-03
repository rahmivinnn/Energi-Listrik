using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using EnergyQuest.Core;
using EnergyQuest.Audio;

namespace EnergyQuest.GameStates
{
    public class AboutHandler : MonoBehaviour, IGameState
    {
        [Header("About UI")]
        public Canvas aboutCanvas;
        public ScrollRect aboutScrollRect;
        public Text aboutContent;
        public Button backButton;

        [Header("Game Info Display")]
        public Text gameTitle;
        public Text gameVersion;
        public Text targetAudience;
        public Text gameObjectives;

        [Header("Technical Info")]
        public Text technicalSpecs;
        public Text algorithmsUsed;
        public Text educationalContent;

        [Header("Team Info")]
        public Text developmentInfo;
        public Text acknowledgments;

        private void Awake()
        {
            SetupAboutUI();
        }

        public void OnStateEnter()
        {
            // Activate about canvas
            if (aboutCanvas != null)
                aboutCanvas.gameObject.SetActive(true);

            // Load about content
            LoadAboutContent();

            // Play about background music
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlayBackgroundMusic("about_ambient");
            }

            // Auto-scroll to top
            if (aboutScrollRect != null)
            {
                aboutScrollRect.verticalNormalizedPosition = 1f;
            }
        }

        public void OnStateUpdate()
        {
            // Handle escape key to return to main menu
            if (Input.GetKeyDown(KeyCode.Escape))
            {
                ReturnToMainMenu();
            }

            // Handle scroll with arrow keys
            if (aboutScrollRect != null)
            {
                if (Input.GetKey(KeyCode.UpArrow))
                {
                    aboutScrollRect.verticalNormalizedPosition += Time.deltaTime * 0.5f;
                }
                else if (Input.GetKey(KeyCode.DownArrow))
                {
                    aboutScrollRect.verticalNormalizedPosition -= Time.deltaTime * 0.5f;
                }
            }
        }

        public void OnStateExit()
        {
            // Deactivate about canvas
            if (aboutCanvas != null)
                aboutCanvas.gameObject.SetActive(false);
        }

        private void SetupAboutUI()
        {
            // Setup back button
            if (backButton != null)
            {
                backButton.onClick.AddListener(ReturnToMainMenu);
            }
        }

        private void LoadAboutContent()
        {
            // Game basic information
            if (gameTitle != null)
            {
                gameTitle.text = "ENERGY QUEST: MISTERI HEMAT LISTRIK";
            }

            if (gameVersion != null)
            {
                gameVersion.text = $"Versi: {GameManager.Instance?.gameVersion.ToString("F1") ?? "1.0"}";
            }

            if (targetAudience != null)
            {
                targetAudience.text = "Target Audiens: Siswa SMP (usia 12–15 tahun)";
            }

            // Game objectives
            if (gameObjectives != null)
            {
                string objectives = "TUJUAN GAME:\n\n" +
                                  "1. EDUKASI: Membantu siswa memahami konsep dasar listrik dan pentingnya efisiensi energi\n\n" +
                                  "2. HIBURAN: Memberikan pengalaman petualangan dengan nuansa misteri yang menarik\n\n" +
                                  "3. KESADARAN ENERGI: Menanamkan perilaku hemat energi dalam kehidupan sehari-hari";

                gameObjectives.text = objectives;
            }

            // Technical specifications
            if (technicalSpecs != null)
            {
                string techSpecs = "SPESIFIKASI TEKNIS:\n\n" +
                                 "• Platform: Android\n" +
                                 "• Engine: Unity 3D\n" +
                                 "• Genre: Puzzle Adventure Edukasi\n" +
                                 "• Bahasa: Indonesia\n" +
                                 "• Target FPS: 60\n" +
                                 "• Minimum RAM: 2GB\n" +
                                 "• Storage: ~500MB";

                technicalSpecs.text = techSpecs;
            }

            // Algorithms used
            if (algorithmsUsed != null)
            {
                string algorithms = "ALGORITMA YANG DIGUNAKAN:\n\n" +
                                  "1. FINITE STATE MACHINE (FSM)\n" +
                                  "   Mengatur transisi antar state dalam game seperti menu, level, dan cutscene\n\n" +
                                  "2. FISHER-YATES SHUFFLE\n" +
                                  "   Mengacak soal kuis secara fair dan unbiased untuk evaluasi akhir\n\n" +
                                  "3. PERHITUNGAN ENERGI LISTRIK\n" +
                                  "   Formula: E = (P × t) / 1000\n" +
                                  "   Untuk simulasi tagihan listrik yang realistis";

                algorithmsUsed.text = algorithms;
            }

            // Educational content
            if (educationalContent != null)
            {
                string education = "MATERI EDUKASI:\n\n" +
                                 "LEVEL 1 - RUANG TAMU:\n" +
                                 "• Rangkaian listrik dasar\n" +
                                 "• Fungsi saklar dan komponen listrik\n\n" +
                                 "LEVEL 2 - DAPUR:\n" +
                                 "• Efisiensi penggunaan energi\n" +
                                 "• Pemanfaatan cahaya alami\n" +
                                 "• Pengelolaan perangkat rumah tangga\n\n" +
                                 "LEVEL 3 - LABORATORIUM:\n" +
                                 "• Perhitungan konsumsi energi\n" +
                                 "• Simulasi tagihan listrik\n" +
                                 "• Optimasi penggunaan listrik\n\n" +
                                 "LEVEL 4 - RUANG BAWAH TANAH:\n" +
                                 "• Evaluasi pemahaman menyeluruh\n" +
                                 "• Keamanan kelistrikan\n" +
                                 "• Energi terbarukan";

                educationalContent.text = education;
            }

            // Development information
            if (developmentInfo != null)
            {
                string devInfo = "INFORMASI PENGEMBANGAN:\n\n" +
                               "Game ini dikembangkan sebagai media edukasi untuk meningkatkan kesadaran penggunaan energi listrik yang efisien di kalangan siswa SMP.\n\n" +
                               "FITUR UTAMA:\n" +
                               "• Puzzle interaktif berbasis fisika\n" +
                               "• Simulasi perhitungan energi real-time\n" +
                               "• Sistem evaluasi adaptif\n" +
                               "• Interface ramah mobile\n" +
                               "• Konten edukasi terintegrasi\n\n" +
                               "METODOLOGI:\n" +
                               "Game-based learning dengan pendekatan konstruktivisme, dimana pemain membangun pemahaman melalui eksplorasi dan eksperimen langsung.";

                developmentInfo.text = devInfo;
            }

            // Acknowledgments
            if (acknowledgments != null)
            {
                string ack = "UCAPAN TERIMA KASIH:\n\n" +
                           "• Kementerian Pendidikan dan Kebudayaan RI\n" +
                           "• Guru-guru SMP yang memberikan masukan\n" +
                           "• Siswa-siswa yang menjadi tester\n" +
                           "• PLN (Perusahaan Listrik Negara)\n" +
                           "• Komunitas Unity Indonesia\n\n" +
                           "SUMBER REFERENSI:\n" +
                           "• Buku Fisika SMP Kurikulum 2013\n" +
                           "• Standar Tarif Listrik PLN 2024\n" +
                           "• Panduan Efisiensi Energi ESDM\n\n" +
                           "Terima kasih telah bermain Energy Quest!\n" +
                           "Mari bersama-sama hemat energi untuk masa depan!";

                acknowledgments.text = ack;
            }

            // Combine all content for main about text
            if (aboutContent != null)
            {
                string fullContent = 
                    (gameTitle?.text ?? "") + "\n\n" +
                    (gameVersion?.text ?? "") + "\n" +
                    (targetAudience?.text ?? "") + "\n\n" +
                    (gameObjectives?.text ?? "") + "\n\n" +
                    (technicalSpecs?.text ?? "") + "\n\n" +
                    (algorithmsUsed?.text ?? "") + "\n\n" +
                    (educationalContent?.text ?? "") + "\n\n" +
                    (developmentInfo?.text ?? "") + "\n\n" +
                    (acknowledgments?.text ?? "");

                StartCoroutine(TypewriterEffect(aboutContent, fullContent, 0.01f));
            }
        }

        private IEnumerator TypewriterEffect(Text textComponent, string fullText, float charDelay)
        {
            textComponent.text = "";

            foreach (char c in fullText)
            {
                textComponent.text += c;
                yield return new WaitForSeconds(charDelay);
            }
        }

        public void ReturnToMainMenu()
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.PlaySFX("button_click");
            }

            FiniteStateMachine.Instance.ChangeState(GameState.MainMenu);
        }

        // Additional info methods
        public void ShowDeveloperInfo()
        {
            string devInfo = "INFORMASI PENGEMBANG:\n\n" +
                           "Game ini dikembangkan menggunakan Unity Engine 3D dengan fokus pada edukasi energi listrik.\n\n" +
                           "TEKNOLOGI:\n" +
                           "• C# Programming Language\n" +
                           "• Unity 2022.3 LTS\n" +
                           "• Android SDK\n" +
                           "• Unity Analytics\n\n" +
                           "METODOLOGI PENGEMBANGAN:\n" +
                           "• Agile Development\n" +
                           "• User-Centered Design\n" +
                           "• Educational Game Design Principles\n" +
                           "• Mobile-First Approach";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Info Pengembang", devInfo);
            }
        }

        public void ShowEducationalFramework()
        {
            string framework = "KERANGKA EDUKASI:\n\n" +
                             "TEORI PEMBELAJARAN:\n" +
                             "• Konstruktivisme: Pemain membangun pengetahuan melalui eksplorasi\n" +
                             "• Experiential Learning: Belajar melalui pengalaman langsung\n" +
                             "• Gamification: Motivasi melalui elemen game\n\n" +
                             "KOMPETENSI YANG DIKEMBANGKAN:\n" +
                             "• Pemahaman konsep dasar kelistrikan\n" +
                             "• Kemampuan perhitungan energi\n" +
                             "• Kesadaran efisiensi energi\n" +
                             "• Problem solving skills\n" +
                             "• Critical thinking\n\n" +
                             "PENILAIAN:\n" +
                             "• Formative assessment melalui puzzle\n" +
                             "• Summative assessment melalui kuis akhir\n" +
                             "• Self-assessment melalui refleksi";

            if (UIManager.Instance != null)
            {
                UIManager.Instance.ShowEducationalInfo("Kerangka Edukasi", framework);
            }
        }

        private void OnDestroy()
        {
            if (backButton != null)
                backButton.onClick.RemoveAllListeners();
        }
    }
}