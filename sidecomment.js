const elems = document.querySelectorAll(".commentable-section");
const allElems = document.body.getElementsByTagName("*");
var showComments = JSON.parse(localStorage.getItem("showComments")) ? new Map(JSON.parse(localStorage.getItem("showComments"))) : new Map();
var comments = JSON.parse(localStorage.getItem("comments")) ? JSON.parse(localStorage.getItem("comments")) : [];
comments =   comments.sort(function(a, b) {
    let cmtA = a.parentId;
    let cmtB = b.parentId;
    if (cmtA < cmtB) {
      return -1;
    }
    if (cmtA > cmtB) {
      return 1;
    }
    return 0;
  });
var counter = parseInt(localStorage.getItem('counter')) ? parseInt(localStorage.getItem('counter')) : 0;
let commentContainer = document.getElementById("comment-container");
for (let i = 0; i < elems.length; i++) {
  renderButton(i);
}
let commentNodes = [];

renderPage();
attachCommentsToParent();
jqSimpleConnect.removeAll();

console.log(comments);

function renderPage() {
  for (let i = 0; i < comments.length; i++) {
    commentNodes[i] = renderComment(comments[i]);
    if (!(comments[i].parentId == "p2" || comments[i].parentId == "p1" || comments[i].parentId == "p3" || comments[i].parentId == "p4")) {
      commentNodes[i].className = "dialogbox-reply";
    }
  }
}

function drawLine(id) {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id == id) {
      jqSimpleConnect.connect("#" + comments[i].parentId, "#" + comments[i].id, {radius: 1, color: 'red'});
    }
  }
}

function renderButton(index) {
  let commentButton = document.createElement('button');
  commentButton.innerHTML = "Add comment";
  commentButton.id = "btn" + index;
  commentButton.className = "btn btn-success green btn-sm";
  elems[index].appendChild(commentButton);
  commentButton.addEventListener('click', renderCommentBox);
}

function renderCommentBox() {
  this.style.display = "none";
  let index = this.getAttribute('id').slice(3);
  let commentBox = document.createElement('div');
  let formElement = document.createElement('form');
  let inputElement = document.createElement('textarea');
  inputElement.id = "input" + index;
  let buttonElement = document.createElement('button');
  buttonElement.id = "but" + index;
  buttonElement.innerHTML = "Post";
  buttonElement.addEventListener('click', addComment);
  buttonElement.className = "btn btn-success green btn-sm";
  formElement.appendChild(inputElement);
  formElement.appendChild(buttonElement);
  commentBox.appendChild(formElement);
  commentBox.className = "status-upload";
  elems[index].appendChild(commentBox);
}

function addComment() {
  let id = this.getAttribute('id').slice(3);
  let value = document.getElementById("input" + id).value;
  let author = username();
  let parentId = this.parentNode.parentNode.parentNode.id;
  let comment = new Comment(counter, author, value, parentId, false);
  comments.push(comment);
  counter++;
  localStorage.setItem("counter", counter);
  localStorage.setItem("comments", JSON.stringify(comments));
  location.reload();
}

function Comment(id, author, text, parentId, isReply) {
  this.id = id;
  this.author = author;
  this.text = text;
  this.parentId = parentId;
  this.isReply = isReply;
}

function username() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function renderComment(comment) {
  let commentNode = document.createElement("div");
  let textDiv = document.createElement("div");
  let text = document.createTextNode(comment.text);
  textDiv.appendChild(text);
  textDiv.className = "message";
  let authorDiv = document.createElement("div");
  let author = document.createTextNode(comment.author);
  authorDiv.className = "author-name";
  authorDiv.appendChild(author);
  let replyDiv = document.createElement("div");
  let resolveDiv = document.createElement("div");
  let replyButton = document.createElement("button");
  let resolveButton = document.createElement("button");
  replyButton.innerHTML = "Reply";
  replyButton.addEventListener('click', replyToComment);
  replyButton.id = "reply" + comment.id;
  replyButton.className = "btn btn-success green btn-sm";
  let inputElement = document.createElement('textarea');
  inputElement.id = "replyInput" + comment.id;
  resolveButton.addEventListener('click', resolveComment);
  resolveButton.innerHTML = "Resolve";
  resolveButton.id = "resolve" + comment.id;
  resolveButton.className = "btn btn-danger btn-sm";
  replyDiv.appendChild(replyButton);
  replyDiv.appendChild(inputElement);
  resolveDiv.appendChild(resolveButton);
  commentNode.appendChild(resolveDiv);
  commentNode.appendChild(authorDiv);
  commentNode.appendChild(textDiv);
  commentNode.appendChild(replyDiv);
  commentNode.className = "dialogbox";
  commentNode.id = comment.id;
  commentNode.onmouseover = function() {
    drawLine(this.id);
  };
  commentNode.onmouseout = function() {
    jqSimpleConnect.removeAll();
  }
  return commentNode;
}

function replyToComment() {
  let id = this.getAttribute('id').slice(5);
  let value = document.getElementById("replyInput" + id).value;
  let author = username();
  let parentId = this.parentNode.parentNode.id;
  let comment = new Comment(counter, author, value, parentId, true);
  comments.push(comment);
  counter++;
  localStorage.setItem("counter", counter);
  localStorage.setItem("comments", JSON.stringify(comments));
  location.reload();
}

function resolveComment() {
  let id = parseInt(this.getAttribute('id').slice(7));
  let pos = comments.map((comment) => {
    return comment.id;
  }).indexOf(id);
  comments.splice(pos, 1);
  localStorage.setItem("comments", JSON.stringify(comments));
  location.reload();
}

function showComment(parent) {
  jqSimpleConnect.removeAll();
  for (let i = 0; i < commentNodes.length; i++) {
    if (comments[i].parentId == parent) {
      commentNodes[i].style.display = 'block';
      drawLine(parent);
    } else if (!comments[i].isReply) {
      commentNodes[i].style.display = 'none';
    }
  }

  let showComments1 = new Map([...showComments].map(([k, v]) => [k, false]));
  showComments1.set(parent, true);
  localStorage.setItem("showComments", JSON.stringify(Array.from(showComments1.entries())));
}

function attachCommentsToParent() {
  for (let i = 0; i < allElems.length; i++) {
    for (let j = 0; j < comments.length; j++) {
      if (allElems[i].id === comments[j].parentId) {
        if (comments[j].parentId == "p2" || comments[j].parentId == "p1" || comments[j].parentId == "p3" || comments[j].parentId == "p4") {
          commentContainer.appendChild(commentNodes[j]);
        } else {
          allElems[i].appendChild(commentNodes[j]);
        }
      }
    }
  }
}
