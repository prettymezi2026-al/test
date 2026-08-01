/**
 * 초등학교 6학년 관용표현 학습 퀴즈 - 애플리케이션 메인 로직 (즉시 문제별 해설 기능 포함)
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const homeView = document.getElementById('home-view');
  const quizView = document.getElementById('quiz-view');
  const resultView = document.getElementById('result-view');

  const startBtn = document.getElementById('start-btn');
  const nextBtn = document.getElementById('next-btn');
  const nextBtnText = document.getElementById('next-btn-text');
  const restartBtn = document.getElementById('restart-btn');

  const quizStepText = document.getElementById('quiz-step-text');
  const progressFill = document.getElementById('progress-fill');
  const questionText = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');

  // Instant Feedback Elements
  const feedbackBox = document.getElementById('feedback-box');
  const feedbackHeader = document.getElementById('feedback-header');
  const feedbackExp = document.getElementById('feedback-exp');

  const finalScoreEl = document.getElementById('final-score');
  const resultTitleEl = document.getElementById('result-title');
  const resultSubtitleEl = document.getElementById('result-subtitle');
  const reviewListEl = document.getElementById('review-list');

  // Application State
  let currentQuestionIndex = 0;
  let userAnswers = []; // 각 문제별 사용자가 선택한 answerIndex
  let isAnswered = false; // 현재 문제 답변 완료 여부

  // Event Listeners
  startBtn.addEventListener('click', startQuiz);
  nextBtn.addEventListener('click', handleNextQuestion);
  restartBtn.addEventListener('click', restartQuiz);

  /**
   * 1. 퀴즈 시작
   */
  function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = new Array(quizData.length).fill(-1);

    switchView(quizView);
    renderQuestion();
  }

  /**
   * 2. 화면 전환 헬퍼 함수
   */
  function switchView(targetView) {
    [homeView, quizView, resultView].forEach(view => {
      view.classList.remove('active');
    });
    targetView.classList.add('active');
  }

  /**
   * 3. 현재 문제 및 보기 렌더링
   */
  function renderQuestion() {
    isAnswered = false;
    const currentQ = quizData[currentQuestionIndex];

    // 헤더 프로그레스 바 및 텍스트 업데이트
    const currentStep = currentQuestionIndex + 1;
    const totalQuestions = quizData.length;
    const progressPercent = (currentStep / totalQuestions) * 100;

    quizStepText.textContent = `문제 ${currentStep} / ${totalQuestions}`;
    progressFill.style.width = `${progressPercent}%`;

    // 피드백 박스 비활성화
    feedbackBox.className = 'feedback-box';

    // 질문 텍스트 업데이트
    questionText.textContent = currentQ.question;

    // 보기 옵션 리스트 렌더링
    optionsContainer.innerHTML = '';
    currentQ.options.forEach((optText, optIndex) => {
      const optionBtn = document.createElement('button');
      optionBtn.className = 'option-btn';

      optionBtn.innerHTML = `
        <span class="option-num">${optIndex + 1}</span>
        <span class="option-label">${optText}</span>
      `;

      optionBtn.addEventListener('click', () => selectOption(optIndex));
      optionsContainer.appendChild(optionBtn);
    });

    // 다음/제출 버튼 비활성화
    nextBtn.disabled = true;

    if (currentQuestionIndex === totalQuestions - 1) {
      nextBtnText.textContent = '최종 결과 보기';
    } else {
      nextBtnText.textContent = '다음 문제';
    }
  }

  /**
   * 4. 보기 선택 및 한 문제 풀 때 즉시 정답/오답 및 해설 출력
   */
  function selectOption(selectedOptIndex) {
    if (isAnswered) return; // 이미 풀이한 경우 중복 선택 방지
    isAnswered = true;

    userAnswers[currentQuestionIndex] = selectedOptIndex;
    const currentQ = quizData[currentQuestionIndex];
    const isCorrect = selectedOptIndex === currentQ.answerIndex;

    const optionBtns = optionsContainer.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, index) => {
      btn.style.cursor = 'default';
      if (index === currentQ.answerIndex) {
        btn.classList.add('correct'); // 정답 보기는 초록색 강조
      }
      if (index === selectedOptIndex && !isCorrect) {
        btn.classList.add('wrong'); // 틀린 경우 선택한 보기는 빨간색 강조
      }
    });

    // 즉시 피드백 박스 렌더링
    if (isCorrect) {
      feedbackBox.className = 'feedback-box active correct';
      feedbackHeader.innerHTML = '<span>⭕ 정답입니다! 훌륭해요.</span>';
    } else {
      feedbackBox.className = 'feedback-box active wrong';
      feedbackHeader.innerHTML = `<span>❌ 아쉽네요! 정답은 ${currentQ.answerIndex + 1}번입니다.</span>`;
    }

    feedbackExp.innerHTML = `
      <strong>💡 관용표현 [${currentQ.expression}] 해설:</strong><br>
      ${currentQ.explanation}
    `;

    // 다음 문제 (또는 결과 보기) 버튼 활성화
    nextBtn.disabled = false;
  }

  /**
   * 5. 다음 문제 이동 또는 최종 제출
   */
  function handleNextQuestion() {
    if (!isAnswered) return;

    if (currentQuestionIndex < quizData.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      submitQuiz();
    }
  }

  /**
   * 6. 퀴즈 제출 및 점수 계산 / 결과 렌더링
   */
  function submitQuiz() {
    let correctCount = 0;

    quizData.forEach((q, index) => {
      if (userAnswers[index] === q.answerIndex) {
        correctCount++;
      }
    });

    const scorePerQuestion = 100 / quizData.length;
    const finalScore = correctCount * scorePerQuestion;

    // 결과 화면 전환
    switchView(resultView);

    // 점수 카운트업 애니메이션
    animateScore(finalScore);

    // 점수대별 메시지 설정
    if (finalScore === 100) {
      resultTitleEl.textContent = '🎉 완벽해요! 100점 만점!';
      resultSubtitleEl.textContent = '초등학교 6학년 관용표현의 완벽한 달인이시군요!';
    } else if (finalScore >= 80) {
      resultTitleEl.textContent = '👏 대단해요! 뛰어난 실력!';
      resultSubtitleEl.textContent = '관용표현의 의미를 아주 잘 이해하고 있어요.';
    } else if (finalScore >= 60) {
      resultTitleEl.textContent = '👍 좋은 시도예요!';
      resultSubtitleEl.textContent = '틀린 문제를 오답노트로 복습하면 100점을 받을 수 있어요!';
    } else {
      resultTitleEl.textContent = '💪 힘내세요! 조금 더 연습해봐요!';
      resultSubtitleEl.textContent = '아래 오답 노트를 보며 관용표현의 뜻을 배워보세요.';
    }

    // 풀이 결과 및 오답 노트 렌더링
    renderReviewList();
  }

  /**
   * 7. 점수 애니메이션
   */
  function animateScore(targetScore) {
    let currentVal = 0;
    const duration = 1000;
    const stepTime = 20;
    const increment = targetScore / (duration / stepTime);

    const timer = setInterval(() => {
      currentVal += increment;
      if (currentVal >= targetScore) {
        currentVal = targetScore;
        clearInterval(timer);
      }
      finalScoreEl.textContent = Math.round(currentVal);
    }, stepTime);
  }

  /**
   * 8. 오답 노트 및 해설 리스트 렌더링
   */
  function renderReviewList() {
    reviewListEl.innerHTML = '';

    quizData.forEach((q, index) => {
      const userSelected = userAnswers[index];
      const isCorrect = userSelected === q.answerIndex;

      const reviewItem = document.createElement('div');
      reviewItem.className = `review-item ${isCorrect ? 'correct' : 'wrong'}`;

      const userChoiceText = userSelected !== -1 ? q.options[userSelected] : '미선택';
      const correctChoiceText = q.options[q.answerIndex];

      reviewItem.innerHTML = `
        <div class="review-item-header">
          <span class="review-item-qnum">문제 ${index + 1}</span>
          <span class="review-status-tag ${isCorrect ? 'correct' : 'wrong'}">
            ${isCorrect ? '정답 ⭕' : '오답 ❌'}
          </span>
        </div>
        <div class="review-question-text">${q.question}</div>
        <div class="review-answers-box">
          <div class="user-ans ${!isCorrect ? 'is-wrong' : ''}">
            <strong>내가 선택한 답:</strong> ${userChoiceText}
          </div>
          ${!isCorrect ? `
            <div class="correct-ans">
              <strong>올바른 정답:</strong> ${correctChoiceText}
            </div>
          ` : ''}
          <div class="exp-box">
            <strong>💡 관용표현 [${q.expression}] 해설:</strong><br>
            ${q.explanation}
          </div>
        </div>
      `;

      reviewListEl.appendChild(reviewItem);
    });
  }

  /**
   * 9. 다시 풀기 (메인으로 이동)
   */
  function restartQuiz() {
    switchView(homeView);
  }
});
