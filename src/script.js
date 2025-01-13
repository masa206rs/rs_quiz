import { questions } from './questions.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // DOM要素の取得
    const playerSection = document.getElementById("player-section");
    const quizSection = document.getElementById("quiz-section");
    const resultSection = document.getElementById("result-section");
    const startButton = document.getElementById("start-button");
    const restartButton = document.getElementById("restart-button");
    const questionText = document.getElementById("question-text");
    const choicesContainer = document.getElementById("choices-container");
    const currentScoreDisplay = document.getElementById("current-score");
    const finalScoreDisplay = document.getElementById("final-score");
    const description = document.querySelector('.description');
    
    // ゲーム状態
    let currentQuestionIndex = 0;
    let score = 0;
    let timeoutId = null;
    let shuffledQuestions = [];
    const TIMEOUT_DURATION = 10000; // 10秒
    const QUESTIONS_PER_GAME = 20; // 1ゲームの問題数
    const language = navigator.language.startsWith("ja") ? "ja" : "en";

    // 配列をシャッフルする関数
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
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
      const buttons = Array.from(choicesContainer.querySelectorAll('.choice-btn'));
      buttons.forEach(button => {
        button.disabled = true;
      });

      // 正解を表示
      const questionData = shuffledQuestions[currentQuestionIndex];
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
        if (currentQuestionIndex < QUESTIONS_PER_GAME) {
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
      
      // 問題をシャッフルして最初の20問を選択
      shuffledQuestions = shuffleArray([...questions]).slice(0, QUESTIONS_PER_GAME);
      
      // DOMの更新を一括で行う
      requestAnimationFrame(() => {
        // サイトタイトルを非表示
        document.querySelector('h1').style.display = 'none';
        
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
      const questionData = shuffledQuestions[currentQuestionIndex];
      
      // 質問文を更新
      questionText.textContent = language === "ja" ? questionData.question : questionData.questionEn;

      // 選択肢コンテナを完全にクリア
      while (choicesContainer.firstChild) {
        choicesContainer.removeChild(choicesContainer.firstChild);
      }

      // タイマーを追加
      const timerElement = createTimer();
      choicesContainer.appendChild(timerElement);
      
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

      const questionData = shuffledQuestions[currentQuestionIndex];
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
      const judgmentElement = document.createElement("div");
      judgmentElement.id = "judgment";
      judgmentElement.className = selectedIndex === correctIndex ? "judgment correct" : "judgment incorrect";
      judgmentElement.textContent = selectedIndex === correctIndex ? "⭕" : "❌";
      choicesContainer.appendChild(judgmentElement);

      if (selectedIndex === correctIndex) {
        score++;
        currentScoreDisplay.textContent = score;
      }

      // 説明を表示
      const explanation = document.createElement("p");
      explanation.textContent = language === "ja" ? questionData.explanation : questionData.explanationEn;
      explanation.style.marginTop = "1rem";
      choicesContainer.appendChild(explanation);

      // 2秒後に次の問題へ
      setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < QUESTIONS_PER_GAME) {
          loadQuestion();
        } else {
          showResults();
        }
      }, 2000);
    }

    // 結果を表示
    function showResults() {
      // DOMの更新を一括で行う
      requestAnimationFrame(() => {
        // クイズセクションを非表示
        quizSection.style.display = 'none';
        quizSection.classList.add("hidden");
        
        // 結果セクションを表示
        resultSection.style.display = 'block';
        resultSection.classList.remove("hidden");
        
        finalScoreDisplay.textContent = score;
        updateShareButtons();
      });
    }

    // シェアボタンの更新
    function updateShareButtons() {
      const shareTextX = `Mazda Roadsterクイズで${score}点獲得しました！(20点満点) #MX-5 #ロードスター #Roadsterクイズ #ロードスタークイズ`;
      const shareText = `Mazda Roadsterクイズで${score}点獲得しました！(20点満点)`;
      const url = 'https://masa206rs.github.io/rs_quiz/';
      
      // Twitter
      const twitterShare = document.getElementById('twitter-share-result');
      twitterShare.href = `https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareTextX)}`;
      
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
    let touchStartTime = 0;
    
    startButton.addEventListener("touchstart", (e) => {
      touchStartTime = Date.now();
    }, { passive: true });

    startButton.addEventListener("touchend", (e) => {
      // 300ms以内のタップのみを処理
      if (Date.now() - touchStartTime < 300) {
        e.preventDefault();
        startQuiz();
      }
    });

    // クリックイベントはデスクトップ用に残す
    startButton.addEventListener("click", (e) => {
      // タッチデバイスでない場合のみ処理
      if (!('ontouchstart' in window)) {
        e.preventDefault();
        startQuiz();
      }
    });

    // リスタートボタンのイベントリスナー
    let restartTouchStartTime = 0;
    
    restartButton.addEventListener("touchstart", (e) => {
      restartTouchStartTime = Date.now();
    }, { passive: true });

    restartButton.addEventListener("touchend", (e) => {
      // 300ms以内のタップのみを処理
      if (Date.now() - restartTouchStartTime < 300) {
        e.preventDefault();
        resultSection.classList.add("hidden");
        playerSection.classList.remove("hidden");
        description.classList.remove("hidden");
        description.style.display = 'block';
        playerSection.style.display = 'block';
        document.querySelector('h1').style.display = 'block';
      }
    });

    // クリックイベントはデスクトップ用に残す
    restartButton.addEventListener("click", (e) => {
      // タッチデバイスでない場合のみ処理
      if (!('ontouchstart' in window)) {
        e.preventDefault();
        resultSection.classList.add("hidden");
        playerSection.classList.remove("hidden");
        description.classList.remove("hidden");
        description.style.display = 'block';
        playerSection.style.display = 'block';
        document.querySelector('h1').style.display = 'block';
      }
    });

  } catch (error) {
    console.error("アプリケーション初期化エラー:", error);
    alert("アプリケーションの初期化に失敗しました。ページを更新してください。");
  }
});
