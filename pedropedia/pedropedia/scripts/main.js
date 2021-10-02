function animateRightAnswerButton(id) {
  document.getElementById(id).addEventListener("click", function (e) {
    party.confetti(this, {
      count: party.variation.range(20, 40),
    });
  });
}

function animateWrongAnswerButton(id) {
  const wrongButton = document.getElementById(id);

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

  wrongButton.addEventListener("click", function (e) {
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
        rate: 5,
        bursts: [{ time: 0, count: party.variation.skew(30, 10) }],
        sourceSampler: party.sources.dynamicSource(wrongButton),
        angle: party.variation.range(-150, -30),
        initialSpeed: 500,
        initialLifetime: party.variation.range(6, 8),
      },
      rendererOptions: {
        shapeFactory: wrongAnswerSVG,
        applyLighting: undefined,
      },
    });
  });
}

function getDateContent(date) {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const post = JSON.parse(this.responseText);
      document.getElementById("fact-date").innerHTML = post.date;
      document.getElementById("fact-contents").innerHTML = post.content;
      if (post.isTrue) {
        id_right = "btn-holder-true";
        id_wrong = "btn-holder-false";
      } else {
        id_right = "btn-holder-false";
        id_wrong = "btn-holder-true";
      }
      animateRightAnswerButton(id_right);
      animateWrongAnswerButton(id_wrong);
    }
  };
  xhttp.open("GET", `/date/${date}`, true);
  xhttp.send();
}

const today = new Date().toISOString().slice(0, 10);
getDateContent(today);
