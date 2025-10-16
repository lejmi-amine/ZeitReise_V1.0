document.addEventListener("DOMContentLoaded", () => {
  let score = 0;
  let answeredQuizzes = new Set();

  // Scroll Animation
  const milestones = document.querySelectorAll(".milestone");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  });
  milestones.forEach((m) => observer.observe(m));

  // Tab Navigation
  function openTab(tabName) {
    // Tab Inhalte verstecken
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.remove("active");
    });

    // Tab Links deaktivieren
    document.querySelectorAll(".tab-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Gewählten Tab anzeigen
    document.getElementById(tabName).classList.add("active");
    event.currentTarget.classList.add("active");

    // Fortschrittsbalken für Timeline Tab neu berechnen
    if (tabName === "timeline") {
      updateProgressBar();
    }

    // Leaderboard für Quiz Tab aktualisieren
    if (tabName === "quiz") {
      updateLeaderboardPreview();
    }
  }

  // Leaderboard Vorschau
  function updateLeaderboardPreview() {
    const scores = JSON.parse(localStorage.getItem("quizScores")) || [];
    const preview = document.getElementById("leaderboard-preview");

    if (scores.length === 0) {
      preview.innerHTML =
        '<p style="text-align: center; color: #6c757d;">Noch keine Ergebnisse. Sei der Erste! 🏆</p>';
      return;
    }

    const topScores = scores.slice(0, 5); // Top 5 anzeigen
    preview.innerHTML = topScores
      .map(
        (score, index) => `
        <div class="leaderboard-item">
            <div class="leaderboard-rank">#${index + 1}</div>
            <div class="leaderboard-name">${score.name}</div>
            <div class="leaderboard-score">${score.percentage}%</div>
        </div>
    `
      )
      .join("");
  }

  // Progress Bar
  window.addEventListener("scroll", () => {
    const scroll = window.scrollY;
    const height = document.body.scrollHeight - window.innerHeight;
    const progress = (scroll / height) * 100;
    document.getElementById("progress-bar").style.width = progress + "%";
  });

  // Theme Switch
  document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("retro");
  });

  // Quiz öffnen
  document.querySelectorAll(".show-quiz").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const quizId = btn.getAttribute("data-quiz");
      const quizContainer = document.getElementById(`quiz-${quizId}`);

      // Schließe alle anderen Container
      document
        .querySelectorAll(".quiz-container, .video-container")
        .forEach((container) => {
          if (container !== quizContainer) container.classList.remove("active");
        });

      quizContainer.classList.toggle("active");
    });
  });

  // Video Button Logik - AUTOPLAY beim Klick
  document.querySelectorAll(".show-video").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const videoId = this.getAttribute("data-video");
      const videoContainer = document.getElementById(`video-${videoId}`);
      const video = videoContainer.querySelector("video");

      // Schließe alle anderen Container
      document
        .querySelectorAll(".quiz-container, .video-container")
        .forEach((container) => {
          if (container !== videoContainer) {
            container.classList.remove("active");
            // Pausiere andere Videos
            const otherVideo = container.querySelector("video");
            if (otherVideo) {
              otherVideo.pause();
              otherVideo.currentTime = 0;
            }
          }
        });

      // Öffne/Schließe diesen Video-Container
      videoContainer.classList.toggle("active");

      // Autoplay wenn geöffnet
      if (videoContainer.classList.contains("active") && video) {
        video.currentTime = 0;
        video.play().catch((error) => {
          console.log("Autoplay wurde blockiert:", error);
          video.controls = true;
        });
      } else if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
  });

  // Quiz Logik - GEFIXTE VERSION
  document.querySelectorAll(".quiz-option").forEach((option) => {
    option.addEventListener("click", function () {
      const quizContainer = this.closest(".quiz-container");
      const quizId = quizContainer.id.replace("quiz-", "");
      const isCorrect = this.getAttribute("data-correct") === "true";
      const quizResult = quizContainer.querySelector(".quiz-result");
      const buttonContainer = quizContainer.querySelector(".button-container");
      const options = quizContainer.querySelectorAll(".quiz-option");

      if (isCorrect) {
        // Richtige Antwort - zeige alle als Feedback
        options.forEach((opt) => {
          if (opt.getAttribute("data-correct") === "true") {
            opt.classList.add("correct");
          } else {
            opt.classList.add("incorrect");
          }
          opt.style.pointerEvents = "none";
        });

        quizResult.textContent = "✅ Richtig! Gut gemacht!";
        quizResult.classList.add("correct");

        if (!answeredQuizzes.has(quizId)) {
          score++;
          answeredQuizzes.add(quizId);
          document.getElementById(
            "score-text"
          ).textContent = `Team Zeitmaschine | DHBW Software Engineering 2025/26 | Score: ${score}`;
        }

        if (!buttonContainer.querySelector(".next-btn")) {
          const next = document.createElement("button");
          next.textContent = "➡️ Weiter zur nächsten Epoche";
          next.className = "next-btn";
          buttonContainer.appendChild(next);

          // Next Button Logik
          next.addEventListener("click", () => {
            const currentMilestone = quizContainer.closest(".milestone");
            const allMilestones = document.querySelectorAll(".milestone");

            let foundCurrent = false;
            let nextMilestone = null;

            for (let i = 0; i < allMilestones.length; i++) {
              if (allMilestones[i] === currentMilestone) {
                foundCurrent = true;
                continue;
              }
              if (foundCurrent) {
                nextMilestone = allMilestones[i];
                break;
              }
            }

            if (nextMilestone) {
              const targetPosition = nextMilestone.offsetTop - 80;
              window.scrollTo({
                top: targetPosition,
                behavior: "smooth",
              });

              setTimeout(() => {
                quizContainer.classList.remove("active");
              }, 500);
            } else {
              document.querySelector(".future-milestones").scrollIntoView({
                behavior: "smooth",
              });
              setTimeout(() => {
                quizContainer.classList.remove("active");
              }, 500);
            }
          });
        }
      } else {
        // Falsche Antwort - nur diese Option als falsch markieren
        this.classList.add("incorrect");
        quizResult.textContent = "❌ Leider falsch. Versuch es nochmal!";
        quizResult.classList.add("incorrect");

        if (!buttonContainer.querySelector(".retry-btn")) {
          const retry = document.createElement("button");
          retry.textContent = "🔄 Erneut versuchen";
          retry.className = "retry-btn";
          buttonContainer.appendChild(retry);

          retry.addEventListener("click", () => {
            // Reset nur diese falsche Antwort
            this.classList.remove("incorrect");
            quizResult.textContent = "";
            quizResult.classList.remove("incorrect");
            buttonContainer.innerHTML = "";
            // Pointer Events bleiben aktiv für alle Optionen
          });
        }
      }
    });
  });
});
