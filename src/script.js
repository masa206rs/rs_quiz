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
    const description = document.querySelector('.description');
    
    // ゲーム状態
    let currentQuestionIndex = 0;
    let score = 0;
    let playerName = "";
    let timeoutId = null;
    const TIMEOUT_DURATION = 10000; // 10秒
    const language = navigator.language.startsWith("ja") ? "ja" : "en";

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
      const buttons = Array.from(choicesContainer.querySelectorAll('.choice-btn'));
      buttons.forEach(button => {
        button.disabled = true;
      });

      // 正解を表示
      const questionData = questions[currentQuestionIndex];
      const correctButton = buttons[questionData.correct];
      if (correctButton) {
        correctButton.classList.add("correct");
      }

      // 正誤判定（バツ）を表示
      const judgmentElement = document.getElementById("judgment");
      if (judgmentElement) {
        judgmentElement.className = "judgment incorrect";
        judgmentElement.textContent = "❌";
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
      
      // DOMの更新を一括で行う
      requestAnimationFrame(() => {
        description.style.display = 'none';
        playerSection.style.display = 'none';
        quizSection.style.display = 'block';
        
        // クラスの更新
        description.classList.add("hidden");
        playerSection.classList.add("hidden");
        quizSection.classList.remove("hidden");
        
        loadQuestion();
      });
    }

    // 問題をロード
    function loadQuestion() {
      const questionData = questions[currentQuestionIndex];
      
      // 質問文を更新
      questionText.textContent = language === "ja" ? questionData.question : questionData.questionEn;

      // 選択肢コンテナを完全にクリア
      while (choicesContainer.firstChild) {
        choicesContainer.removeChild(choicesContainer.firstChild);
      }

      // タイマーを追加
      const timerElement = createTimer();
      choicesContainer.appendChild(timerElement);

      // 正誤判定表示用の要素を追加
      const judgmentElement = document.createElement("div");
      judgmentElement.id = "judgment";
      judgmentElement.className = "judgment";
      choicesContainer.appendChild(judgmentElement);
      
      // 選択肢を追加
      const options = language === "ja" ? questionData.options : questionData.optionsEn;
      options.forEach((option, index) => {
        const button = document.createElement("button");
        button.classList.add("choice-btn");
        button.textContent = option;
        
        // クリックとタッチの両方に対応
        const handleChoice = (e) => {
          e.preventDefault();
          handleAnswer(index);
          button.removeEventListener('click', handleChoice);
          button.removeEventListener('touchend', handleChoice);
        };
        
        button.addEventListener('click', handleChoice);
        button.addEventListener('touchend', handleChoice);
        
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
      const buttons = Array.from(choicesContainer.querySelectorAll('.choice-btn'));

      // すべてのボタンを無効化
      buttons.forEach((button) => {
        button.disabled = true;
        button.style.pointerEvents = 'none';
      });

      // 正解ボタンを特定
      const correctButton = buttons[correctIndex];
      if (correctButton) {
        correctButton.classList.add("correct");
      }

      // 選択されたボタンが不正解の場合、赤くマーク
      if (selectedIndex !== correctIndex) {
        const selectedButton = buttons[selectedIndex];
        if (selectedButton) {
          selectedButton.classList.add("incorrect");
        }
      }

      // 正誤判定を表示
      const judgmentElement = document.getElementById("judgment");
      if (judgmentElement) {
        if (selectedIndex === correctIndex) {
          score++;
          currentScoreDisplay.textContent = score;
          judgmentElement.className = "judgment correct";
          judgmentElement.textContent = "⭕";
        } else {
          judgmentElement.className = "judgment incorrect";
          judgmentElement.textContent = "❌";
        }
        // 判定を確実に表示するため、強制的に再描画
        judgmentElement.style.display = 'none';
        judgmentElement.offsetHeight;
        judgmentElement.style.display = 'block';
      }

      // 説明を表示
      const explanation = document.createElement("p");
      explanation.textContent = language === "ja" ? questionData.explanation : questionData.explanationEn;
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

    // 結果を表示
    function showResults() {
      quizSection.classList.add("hidden");
      resultSection.classList.remove("hidden");
      finalScoreDisplay.textContent = score;
      updateShareButtons();
    }

    // シェアボタンの更新
    function updateShareButtons() {
      const shareText = `Mazda Roadsterクイズで${score}点獲得しました！`;
      const url = 'https://yourusername.github.io/rs_quiz/';
      
      // Twitter
      const twitterShare = document.getElementById('twitter-share-result');
      twitterShare.href = `https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
      
      // Facebook
      const facebookShare = document.getElementById('facebook-share-result');
      facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      
      // LINE
      const lineShare = document.getElementById('line-share-result');
      lineShare.href = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}%0a${encodeURIComponent(url)}`;
      
      // 新しいウィンドウで開く設定
      [twitterShare, facebookShare, lineShare].forEach(button => {
        button.setAttribute('target', '_blank');
        button.setAttribute('rel', 'noopener noreferrer');
      });
    }

    // イベントリスナーの設定
    const handleStart = (e) => {
      e.preventDefault();
      playerName = playerNameInput.value.trim();
      if (!playerName) {
        alert("プレイヤー名を入力してください！");
        return;
      }
      startQuiz();
    };

    startButton.addEventListener("click", handleStart);
    startButton.addEventListener("touchend", handleStart);

    const handleRestart = (e) => {
      e.preventDefault();
      resultSection.classList.add("hidden");
      playerSection.classList.remove("hidden");
      description.classList.remove("hidden");
      description.style.display = 'block';
      playerSection.style.display = 'block';
      playerNameInput.value = "";
    };

    restartButton.addEventListener("click", handleRestart);
    restartButton.addEventListener("touchend", handleRestart);

  } catch (error) {
    console.error("アプリケーション初期化エラー:", error);
    alert("アプリケーションの初期化に失敗しました。ページを更新してください。");
  }
});
