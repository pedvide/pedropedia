function rightAnswer(event) {
  const button = event.target;
  party.confetti(button, {
    count: party.variation.range(20, 50),
    size: party.variation.skew(1, 0.3),
  });
}

function buildWrongAnswerSVG() {
  const wrongAnswerEmoji = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  wrongAnswerEmoji.setAttribute("x", "0");
  wrongAnswerEmoji.setAttribute("y", "1em");
  wrongAnswerEmoji.setAttribute("font-size", "16");
  wrongAnswerEmoji.setAttribute("fill", "#000000");
  if (Math.random() > 0.1) {
    wrongAnswerEmoji.textContent = "💩";
  } else {
    wrongAnswerEmoji.textContent = "😢";
  }
  const wrongAnswerSVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
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

function getIdContent(id) {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const post = JSON.parse(this.responseText);
      document.getElementById("fact-date").innerHTML = post.date;
      document.getElementById("fact-contents").innerHTML = post.content;
      document.getElementById("fact-id").innerHTML = post.id;
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

      const id = post.id;
      prevButton = document.getElementById("btn-prev");
      nextButton = document.getElementById("btn-next");
      lastButton = document.getElementById("btn-last");

      if (post.first_id) {
        prevButton.className = "button-inactive";
        prevButton.onclick = null;
      } else {
        prevButton.className = "button-active";
        prevButton.onclick = null;
        prevButton.onclick = function (e) {
          getIdContent(id - 1);
        };
      }

      if (post.last_id) {
        nextButton.className = "button-inactive";
        lastButton.className = "button-inactive";
        nextButton.onclick = null;
        lastButton.onclick = null;
      } else {
        nextButton.className = "button-active";
        lastButton.className = "button-active";
        nextButton.onclick = function (e) {
          getIdContent(id + 1);
        };
        lastButton.onclick = function (e) {
          getIdContent();
        };
      }
    }
  };

  // api/date gets todays data
  path = typeof id === "undefined" ? "api/id" : `api/id/${id}`;
  xhttp.open("GET", path, true);
  xhttp.send();
}

document.addEventListener("DOMContentLoaded", function () {
  const id = document.getElementById("fact-id").innerHTML;
  getIdContent(id);
});
