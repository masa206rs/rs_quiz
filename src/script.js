import { questions } from './questions.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // フィードバックリンクを追加する関数
    function addFeedbackLink(questionText) {
      const feedbackLink = document.createElement("a");
      feedbackLink.href = `https://docs.google.com/forms/d/e/1FAIpQLScRu5VMW6S2Wi3xingwBtu-MuYZf3gsDydbFOjjagzXYyUrSw/viewform?usp=dialog&entry.79302337=${encodeURIComponent(questionText)}`;
      feedbackLink.textContent = "回答の誤りを報告";
      feedbackLink.target = "_blank";
      feedbackLink.style.display = "block";
      feedbackLink.style.marginTop = "0.5rem";
      feedbackLink.style.fontSize = "0.9rem";
      feedbackLink.style.color = "var(--primary-color)";
      feedbackLink.style.textAlign = "right";
      choicesContainer.appendChild(feedbackLink);
    }

    // DOM要素の取得
    const playerSection = document.getElementById("player-section");
    const quizSection = document.getElementById("quiz-section");
    const resultSection = document.getElementById("result-section");
    const startButton = document.getElementById("start-button");
    const restartButton = document.getElementById("restart-button");
    const questionText = document.getElementById("question-text");
    const choicesContainer = document.getElementById("choices-container");
    const currentScoreDisplay = document.getElementById("current-score");
    const remainingQuestionsDisplay = document.getElementById("remaining-questions");
    const finalScoreDisplay = document.getElementById("final-score");
    const description = document.querySelector('.description');
    
    // ゲーム状態
    let currentQuestionIndex = 0;
    let score = 0;
    let timeoutId = null;
    let shuffledQuestions = [];
    const TIMEOUT_DURATION = 30000; // 30秒
    const QUESTIONS_PER_GAME = 20;    // 1ゲームの問題数
    const language = navigator.language.startsWith("ja") ? "ja" : "en";

    // 前回の問題を記録
    let previousQuestions = [];

    // 配列をシャッフルする関数(Fisher–Yatesアルゴリズム)
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // 新しい問題セットを生成する関数
    function generateNewQuestionSet() {
      // 前回出題された問題を除外
      let availableQuestions = questions.filter(q => !previousQuestions.includes(q));
      
      // 利用可能な問題が少なくなった場合、履歴をリセット
      if (availableQuestions.length < QUESTIONS_PER_GAME) {
        previousQuestions = [];
        availableQuestions = [...questions];
      }

      // 問題をシャッフルし、先頭から QUESTIONS_PER_GAME 問を選択
      const shuffled = shuffleArray([...availableQuestions]);
      previousQuestions = [...previousQuestions, ...shuffled.slice(0, QUESTIONS_PER_GAME)];
      
      return shuffled.slice(0, QUESTIONS_PER_GAME);
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
        timerBar.style.transition = "none";
        timerBar.offsetHeight; // 強制リフロー

        const durationInSeconds = TIMEOUT_DURATION / 1000;
        timerBar.style.transition = `width linear ${durationInSeconds}s`;
        timerBar.style.width = "0";
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        handleTimeout();
      }, TIMEOUT_DURATION);
    }

    // 「次の問題へ」ボタンを生成する関数
    function showNextQuestionButton() {
      const nextButton = document.createElement("button");
      nextButton.textContent = "次の問題へ";
      nextButton.classList.add("action-button", "next-question");
      nextButton.style.marginTop = "1rem";
      nextButton.addEventListener("click", () => {
        nextButton.disabled = true;
        nextButton.remove();
        currentQuestionIndex++;
        if (currentQuestionIndex < QUESTIONS_PER_GAME) {
          remainingQuestionsDisplay.textContent = QUESTIONS_PER_GAME - currentQuestionIndex;
          loadQuestion();
        } else {
          showResults();
        }
      });
      choicesContainer.appendChild(nextButton);
    }

    // タイムアウト処理
    function handleTimeout() {
      const buttons = Array.from(choicesContainer.querySelectorAll('.choice-btn'));
      buttons.forEach(button => {
        button.disabled = true;
      });

      const questionData = shuffledQuestions[currentQuestionIndex];
      const correctButton = buttons[questionData.correct];
      if (correctButton) {
        correctButton.classList.add("correct");
      }

      let judgmentElement = document.getElementById("judgment");
      if (judgmentElement) {
        judgmentElement.className = "judgment incorrect";
        judgmentElement.textContent = "❌";
      } else {
        judgmentElement = document.createElement("div");
        judgmentElement.id = "judgment";
        judgmentElement.className = "judgment incorrect";
        judgmentElement.textContent = "❌";
        choicesContainer.appendChild(judgmentElement);
      }

      const explanation = document.createElement("p");
      explanation.textContent = language === "ja" ? 
        questionData.explanation + "(時間切れ)" : 
        questionData.explanationEn + " (Time's up)";
      explanation.style.marginTop = "1rem";
      choicesContainer.appendChild(explanation);

      // フィードバックリンクを追加
      addFeedbackLink(questionData.question);

      showNextQuestionButton();
    }

    // 共通のスタートハンドラー関数
    function handleStart(e) {
      e.preventDefault();
      startQuiz();
    }

    // 共通のリスタートハンドラー関数
    function handleRestart(e) {
      e.preventDefault();
      resultSection.style.display = 'none';
      resultSection.classList.add("hidden");
      playerSection.classList.remove("hidden");
      description.classList.remove("hidden");
      description.style.display = 'block';
      playerSection.style.display = 'block';
      document.querySelector('h1').style.display = 'block';
    }

    // タッチ開始時刻の記録用変数
    let touchStartTime = 0;
    let restartTouchStartTime = 0;

    // スタートボタンのイベント設定
    startButton.addEventListener("touchstart", (e) => {
      touchStartTime = Date.now();
    }, { passive: true });
    startButton.addEventListener("touchend", (e) => {
      if (Date.now() - touchStartTime < 300) {
        handleStart(e);
      }
    });
    startButton.addEventListener("click", (e) => {
      if (!('ontouchstart' in window)) {
        handleStart(e);
      }
    });

    // リスタートボタンのイベント設定
    restartButton.addEventListener("touchstart", (e) => {
      restartTouchStartTime = Date.now();
    }, { passive: true });
    restartButton.addEventListener("touchend", (e) => {
      if (Date.now() - restartTouchStartTime < 300) {
        handleRestart(e);
      }
    });
    restartButton.addEventListener("click", (e) => {
      if (!('ontouchstart' in window)) {
        handleRestart(e);
      }
    });

    // クイズ開始
    function startQuiz() {
      currentQuestionIndex = 0;
      score = 0;
      currentScoreDisplay.textContent = score;
      remainingQuestionsDisplay.textContent = QUESTIONS_PER_GAME;
      
      shuffledQuestions = generateNewQuestionSet();
      
      requestAnimationFrame(() => {
        document.querySelector('h1').style.display = 'none';
        description.style.display = 'none';
        playerSection.style.display = 'none';
        quizSection.style.display = 'block';
        description.classList.add("hidden");
        playerSection.classList.add("hidden");
        quizSection.classList.remove("hidden");
        
        loadQuestion();
      });
    }

    // 問題をロードする関数
    function loadQuestion() {
      const questionData = shuffledQuestions[currentQuestionIndex];
      questionText.textContent = language === "ja" ? questionData.question : questionData.questionEn;

      while (choicesContainer.firstChild) {
        choicesContainer.removeChild(choicesContainer.firstChild);
      }

      const timerElement = createTimer();
      choicesContainer.appendChild(timerElement);
      
      const options = language === "ja" ? questionData.options : questionData.optionsEn;
      options.forEach((option, index) => {
        const button = document.createElement("button");
        button.classList.add("choice-btn");
        button.textContent = option;
        
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

      startTimer();
    }

    // 答えを処理する関数
    function handleAnswer(selectedIndex) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const questionData = shuffledQuestions[currentQuestionIndex];
      const correctIndex = questionData.correct;
      const buttons = Array.from(choicesContainer.querySelectorAll('.choice-btn'));

      buttons.forEach((button) => {
        button.disabled = true;
        button.style.pointerEvents = 'none';
      });

      const correctButton = buttons[correctIndex];
      if (correctButton) {
        correctButton.classList.add("correct");
      }

      if (selectedIndex !== correctIndex) {
        const selectedButton = buttons[selectedIndex];
        if (selectedButton) {
          selectedButton.classList.add("incorrect");
        }
      }

      const judgmentElement = document.createElement("div");
      judgmentElement.id = "judgment";
      judgmentElement.className = selectedIndex === correctIndex ? "judgment correct" : "judgment incorrect";
      judgmentElement.textContent = selectedIndex === correctIndex ? "⭕" : "❌";
      choicesContainer.appendChild(judgmentElement);

      if (selectedIndex === correctIndex) {
        score++;
        currentScoreDisplay.textContent = score;
      }

      const explanation = document.createElement("p");
      explanation.textContent = language === "ja" ? questionData.explanation : questionData.explanationEn;
      explanation.style.marginTop = "1rem";
      choicesContainer.appendChild(explanation);

      // フィードバックリンクを追加
      addFeedbackLink(questionData.question);

      showNextQuestionButton();
    }

    // 結果を表示する関数
    function showResults() {
      requestAnimationFrame(() => {
        quizSection.style.display = 'none';
        quizSection.classList.add("hidden");
        resultSection.style.display = 'block';
        resultSection.classList.remove("hidden");
        finalScoreDisplay.textContent = score;
        updateShareButtons();
      });
    }

    // シェアボタンの更新
    function updateShareButtons() {
      const shareTextX = `Mazda Roadsterクイズで${score}点獲得しました!(20点満点) #MX-5 #ロードスター #Roadsterクイズ #ロードスタークイズ`;
      const shareText = `Mazda Roadsterクイズで${score}点獲得しました!(20点満点)`;
      const url = 'https://rs-quiz.onrender.com/';
      
      const twitterShare = document.getElementById('twitter-share-result');
      twitterShare.href = `https://twitter.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareTextX)}`;
      
      const facebookShare = document.getElementById('facebook-share-result');
      facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      
      const lineShare = document.getElementById('line-share-result');
      lineShare.href = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}%0a${encodeURIComponent(url)}`;
      
      [twitterShare, facebookShare, lineShare].forEach(button => {
        button.setAttribute('target', '_blank');
        button.setAttribute('rel', 'noopener noreferrer');
      });
    }

  } catch (error) {
    console.error("アプリケーション初期化エラー:", error);
    alert("アプリケーションの初期化に失敗しました。ページを更新してください。");
  }
});
