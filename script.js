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

  // Quiz Logik
  document.querySelectorAll(".quiz-option").forEach((option) => {
    option.addEventListener("click", function () {
      const quizContainer = this.closest(".quiz-container");
      const quizId = quizContainer.id.replace("quiz-", "");
      const isCorrect = this.getAttribute("data-correct") === "true";
      const quizResult = quizContainer.querySelector(".quiz-result");
      const buttonContainer = quizContainer.querySelector(".button-container");
      const options = quizContainer.querySelectorAll(".quiz-option");

      // Markiere Antworten
      options.forEach((opt) => {
        if (opt.getAttribute("data-correct") === "true") {
          opt.classList.add("correct");
        } else {
          opt.classList.add("incorrect");
        }
        opt.style.pointerEvents = "none";
      });

      if (isCorrect) {
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
        quizResult.textContent = "❌ Leider falsch. Versuch es nochmal!";
        quizResult.classList.add("incorrect");

        if (!buttonContainer.querySelector(".retry-btn")) {
          const retry = document.createElement("button");
          retry.textContent = "🔄 Erneut versuchen";
          retry.className = "retry-btn";
          buttonContainer.appendChild(retry);

          retry.addEventListener("click", () => {
            options.forEach((opt) => {
              opt.classList.remove("correct", "incorrect");
              opt.style.pointerEvents = "auto";
            });
            quizResult.textContent = "";
            quizResult.classList.remove("incorrect");
            buttonContainer.innerHTML = "";
          });
        }
      }
    });
  });
});
