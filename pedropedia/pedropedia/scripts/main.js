function confetti(button) {
  party.confetti(button, {
    count: party.variation.range(20, 40),
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
  wrongAnswerEmoji.textContent = "💩";
  const wrongAnswerSVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  wrongAnswerSVG.setAttribute("height", "20");
  wrongAnswerSVG.setAttribute("width", "20");
  wrongAnswerSVG.appendChild(wrongAnswerEmoji);
  return wrongAnswerSVG;
}

function poopEmoji(button) {
  wrongAnswerSVG = buildWrongAnswerSVG();
  party.scene.current.createEmitter({
    emitterOptions: {
      loops: 1,
      useGravity: true,
      modules: [
        new party.ModuleBuilder()
          .drive("size")
          .by((t) => 1 + 0.6 * (Math.cos(t * 10) + 1))
          .build(),
        new party.ModuleBuilder()
          .drive("rotation")
          .by((t) => new party.Vector(0, 100, 100).scale(t))
          .relative()
          .build(),
      ],
    },
    emissionOptions: {
      rate: 2,
      bursts: [{ time: 0, count: party.variation.skew(30, 10) }],
      sourceSampler: party.sources.dynamicSource(button),
      angle: party.variation.range(-150, -30),
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
      id_right = post.is_true ? "btn-holder-true" : "btn-holder-false";
      const rightButton = document.getElementById(id_right);

      id_wrong = post.is_true ? "btn-holder-false" : "btn-holder-true";
      const wrongButton = document.getElementById(id_wrong);

      rightButton.removeEventListener("click", confetti);
      rightButton.removeEventListener("click", poopEmoji);
      rightButton.addEventListener("click", confetti);

      wrongButton.removeEventListener("click", confetti);
      wrongButton.removeEventListener("click", poopEmoji);
      wrongButton.addEventListener("click", poopEmoji);
    }
  };

  // api/date gets todays data
  path = typeof date === "undefined" ? "api/date" : `api/date/${date}`;
  xhttp.open("GET", path, true);
  xhttp.send();
}

date = document.getElementById("fact-date").innerHTML;
getDateContent(date);
