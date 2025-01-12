import { questions } from './questions.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // DOM要素の取得
    const playerSection = document.getElementById("player-section");
    const quizSection = document.getElementById("quiz-section");
    const resultSection = document.getElementById("result-section");
    const startButton = document.getElementById("start-button");
    const restartButton = document.getElementById("restart-button");
    const playerNameInput = document.getElementById("player-name");
    const questionText = document.getElementById("question-text");
    const choicesContainer = document.getElementById("choices-container");
    const currentScoreDisplay = document.getElementById("current-score");
    const finalScoreDisplay = document.getElementById("final-score");
    const rankingList = document.getElementById("ranking-list");

    // ゲーム状態
    let currentQuestionIndex = 0;
    let score = 0;
    let playerName = "";
    let timeoutId = null;
    const TIMEOUT_DURATION = 10000; // 10秒
    const language = navigator.language.startsWith("ja") ? "ja" : "en";

    // ランキング機能は一時的に無効化
    async function displayRanking() {
      rankingList.innerHTML = "<p>ランキング機能は現在利用できません。</p>";
    }

    // タイマーの作成と表示
    function createTimer() {
      const timerContainer = document.createElement("div");
      timerContainer.id = "timer-container";
      timerContainer.style.marginTop = "1rem";
      timerContainer.style.textAlign = "center";
      
      const timerBar = document.createElement("div");
      timerBar.id = "timer-bar";
      timerBar.style.width = "100%";
      timerBar.style.height = "4px";
      timerBar.style.backgroundColor = "#e74c3c";
      timerBar.style.transition = "width linear";
      
      timerContainer.appendChild(timerBar);
      return timerContainer;
    }

    // タイマーの開始
    function startTimer() {
      const timerBar = document.getElementById("timer-bar");
      if (timerBar) {
        timerBar.style.width = "100%";
        // アニメーションをリセット
        timerBar.style.transition = "none";
        timerBar.offsetHeight; // リフロー
        timerBar.style.transition = "width linear 10s";
        timerBar.style.width = "0";
      }

      // 既存のタイマーをクリア
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // 新しいタイマーを設定
      timeoutId = setTimeout(() => {
        handleTimeout();
      }, TIMEOUT_DURATION);
    }

    // タイムアウト処理
    function handleTimeout() {
      const buttons = Array.from(choicesContainer.children);
      buttons.forEach(button => {
        if (button.classList.contains("choice-btn")) {
          button.disabled = true;
        }
      });

      // 正解を表示
      const questionData = questions[currentQuestionIndex];
      const correctButton = buttons[questionData.correct];
      if (correctButton) {
        correctButton.classList.add("correct");
      }

      // 説明を表示
      const explanation = document.createElement("p");
      explanation.textContent = language === "ja" ? 
        questionData.explanation + "（時間切れ）" : 
        questionData.explanationEn + " (Time's up)";
      explanation.style.marginTop = "1rem";
      choicesContainer.appendChild(explanation);

      // 2秒後に次の問題へ
      setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
          loadQuestion();
        } else {
          showResults();
        }
      }, 2000);
    }

    // クイズ開始
    function startQuiz() {
      currentQuestionIndex = 0;
      score = 0;
      currentScoreDisplay.textContent = score;
      playerSection.classList.add("hidden");
      quizSection.classList.remove("hidden");
      loadQuestion();
    }

    // 問題をロード
    function loadQuestion() {
      const questionData = questions[currentQuestionIndex];
      
      // 質問文を更新
      questionText.textContent = language === "ja" ? questionData.question : questionData.questionEn;

      // 選択肢コンテナをクリア
      choicesContainer.innerHTML = "";

      // タイマーを選択肢の前に追加
      const timerElement = createTimer();
      choicesContainer.appendChild(timerElement);

      const options = language === "ja" ? questionData.options : questionData.optionsEn;
      options.forEach((option, index) => {
        const button = document.createElement("button");
        button.classList.add("choice-btn");
        button.textContent = option;
        button.addEventListener("click", () => handleAnswer(index), { once: true });
        choicesContainer.appendChild(button);
      });

      // タイマー開始
      startTimer();
    }

    // 答えを処理
    function handleAnswer(selectedIndex) {
      // タイマーをクリア
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const questionData = questions[currentQuestionIndex];
      const correctIndex = questionData.correct;
      const buttons = Array.from(choicesContainer.children);

      buttons.forEach((button) => {
        if (button.classList.contains("choice-btn")) {
          button.disabled = true;
        }
      });

      const correctButton = buttons.find(button => 
        button.classList.contains("choice-btn") && 
        button.textContent === (language === "ja" ? 
          questionData.options[correctIndex] : 
          questionData.optionsEn[correctIndex])
      );
      
      if (correctButton) {
        correctButton.classList.add("correct");
      }

      const selectedButton = buttons.find(button => 
        button.classList.contains("choice-btn") && 
        button.textContent === (language === "ja" ? 
          questionData.options[selectedIndex] : 
          questionData.optionsEn[selectedIndex])
      );

      if (selectedButton && selectedIndex !== correctIndex) {
        selectedButton.classList.add("incorrect");
      }

      if (selectedIndex === correctIndex) {
        score++;
        currentScoreDisplay.textContent = score;
      }

      // 説明を表示
      const explanation = document.createElement("p");
      explanation.textContent = language === "ja" ? questionData.explanation : questionData.explanationEn;
      explanation.style.marginTop = "1rem";
      choicesContainer.appendChild(explanation);

      setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
          loadQuestion();
        } else {
          showResults();
        }
      }, 2000);
    }

    // 結果を表示
    function showResults() {
      quizSection.classList.add("hidden");
      resultSection.classList.remove("hidden");
      finalScoreDisplay.textContent = score;
    }

    // イベントリスナーの設定
    startButton.addEventListener("click", () => {
      playerName = playerNameInput.value.trim();
      if (!playerName) {
        alert("プレイヤー名を入力してください！");
        return;
      }
      startQuiz();
    });

    restartButton.addEventListener("click", () => {
      resultSection.classList.add("hidden");
      playerSection.classList.remove("hidden");
      playerNameInput.value = "";
    });

    // 初期ランキング表示
    await displayRanking();
  } catch (error) {
    console.error("アプリケーション初期化エラー:", error);
    alert("アプリケーションの初期化に失敗しました。ページを更新してください。");
  }
});
