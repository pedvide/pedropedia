export function getDateContent(date) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          const post = JSON.parse(this.responseText);
          document.getElementById("fact-date").innerHTML = post.date
          document.getElementById("fact-contents").innerHTML = post.content
          document.getElementById("btn-true").parentElement.id = `${post.isTrue? "right" : "wrong"}-answer`
          document.getElementById("btn-false").parentElement.id = `${post.isTrue? "wrong" : "right"}-answer`
        }
    };
    xhttp.open("GET", `/date/${date}`, true);
    xhttp.send();
}
