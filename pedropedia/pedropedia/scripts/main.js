function rightAnswer(event) {
  const button = event.target;
  party.confetti(button, {
    count: party.variation.range(20, 50),
    size: party.variation.skew(1, 0.3),
  });
}

function buildWrongAnswerSVG() {
  const wrongAnswerEmoji = document.createElementNS("http://www.w3.org/2000/svg", "text");
  wrongAnswerEmoji.setAttribute("x", "0");
  wrongAnswerEmoji.setAttribute("y", "1em");
  wrongAnswerEmoji.setAttribute("font-size", "16");
  wrongAnswerEmoji.setAttribute("fill", "#000000");
  if (Math.random() > 0.1) {
    wrongAnswerEmoji.textContent = "💩";
  } else {
    wrongAnswerEmoji.textContent = "😢";
  }
  const wrongAnswerSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  wrongAnswerSVG.setAttribute("height", "20");
  wrongAnswerSVG.setAttribute("width", "20");
  wrongAnswerSVG.appendChild(wrongAnswerEmoji);
  return wrongAnswerSVG;
}

function wrongAnswer(event) {
  const button = event.target;
  wrongAnswerSVG = buildWrongAnswerSVG();
  party.scene.current.createEmitter({
    emitterOptions: {
      loops: 1,
      useGravity: true,
      modules: [
        new party.ModuleBuilder()
          .drive("size")
          .by((t) => 1.5 + 0.1 * (Math.cos(t * 10) + 1))
          .build(),
        new party.ModuleBuilder()
          .drive("rotation")
          .by((t) => new party.Vector(0, 10, 10).scale(t))
          .relative()
          .build(),
      ],
    },
    emissionOptions: {
      rate: 2,
      bursts: [{ time: 0, count: party.variation.skew(30, 10) }],
      sourceSampler: party.sources.dynamicSource(button),
      angle: party.variation.skew(-90, 30),
      rotation: party.variation.skew(-10, 5),
      spread: 120,
      initialSpeed: party.variation.range(300, 800),
      initialLifetime: party.variation.range(1, 8),
    },
    rendererOptions: {
      shapeFactory: wrongAnswerSVG,
      applyLighting: undefined,
    },
  });
}

function getDateContent(date) {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const post = JSON.parse(this.responseText);
      document.getElementById("fact-date").innerHTML = post.date;
      document.getElementById("fact-contents").innerHTML = post.content;
      id_right = post.is_true ? "btn-true" : "btn-false";
      const rightButton = document.getElementById(id_right);

      id_wrong = post.is_true ? "btn-false" : "btn-true";
      const wrongButton = document.getElementById(id_wrong);

      rightButton.removeEventListener("click", rightAnswer);
      rightButton.removeEventListener("click", wrongAnswer);
      rightButton.addEventListener("click", rightAnswer);

      wrongButton.removeEventListener("click", rightAnswer);
      wrongButton.removeEventListener("click", wrongAnswer);
      wrongButton.addEventListener("click", wrongAnswer);

      const date = post.date;
      const today = new Date(date);
      prevButton = document.getElementById("btn-prev");
      nextButton = document.getElementById("btn-next");
      lastButton = document.getElementById("btn-last");

      if (post.first_date) {
        prevButton.className = "button-inactive";
        prevButton.onclick = null;
      } else {
        prevButton.className = "button-active";
        prevButton.onclick = null;
        const prev_date = new Date(new Date(today).setDate(today.getDate() - 1)).toISOString().slice(0, 10);
        prevButton.onclick = function (e) {
          getDateContent(prev_date);
        };
      }

      if (post.last_date) {
        nextButton.className = "button-inactive";
        lastButton.className = "button-inactive";
        nextButton.onclick = null;
        lastButton.onclick = null;
      } else {
        nextButton.className = "button-active";
        lastButton.className = "button-active";
        const next_date = new Date(new Date(today).setDate(today.getDate() + 1)).toISOString().slice(0, 10);
        nextButton.onclick = function (e) {
          getDateContent(next_date);
        };
        lastButton.onclick = function (e) {
          getDateContent();
        };
      }
    }
  };

  // api/date gets todays data
  path = typeof date === "undefined" ? "api/date" : `api/date/${date}`;
  xhttp.open("GET", path, true);
  xhttp.send();
}

document.addEventListener("DOMContentLoaded", function () {
  date = document.getElementById("fact-date").innerHTML;
  getDateContent(date);
});
