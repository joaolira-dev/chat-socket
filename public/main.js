const socket = io();
let userName = "";
let userList = [];

let loginPage = document.querySelector("#loginPage");
let chatPage = document.querySelector("#chatPage");
let offPage = document.querySelector("#offPage");

let loginInput = document.querySelector("#loginPageInput");
let textInput = document.querySelector("#chatTextInput");

loginPage.style.display = "flex";
chatPage.style.display = "none";

const scrollToBottom = () => {
  const chatList = document.querySelector(".chatList");
  chatList.scrollTop = chatList.scrollHeight;
};

const offScreen = () => {
  loginPage.style.display = "none";
  chatPage.style.display = "none";
  offPage.style.display = "flex";
};

const renderUserList = (list) => {
  let userList = document.querySelector(".usersList");
  userList.innerHTML = list
    .map(
      (user) =>
        `<li> <span class="on-icon">🟢</span> ${user} <span>(online) </span> </li>`
    )
    .join("");
};

const addMessage = (type, user, msg) => {
  let ul = document.querySelector(".chatList");

  switch (type) {
    case "status":
      ul.innerHTML += "<li class=m-status>" + msg + "</li>";
      break;
    case "msg":
      if (userName === user) {
        ul.innerHTML += `<li class="m-txt"><span class="me">${user}</span> ${msg}</li>`;
      } else {
        ul.innerHTML += `<li class="m-txt"><span>${user}</span> ${msg}</li>`;
      }
  }
};

loginInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    let name = loginInput.value.trim();
    if (name !== "") {
      userName = name;
      document.title = `Conectado - (${userName})`;
      socket.emit("join-request", userName);
    } else {
      alert("Digite um nome");
    }
  }
});

textInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    let txt = textInput.value.trim();
    textInput.value = "";

    if (txt != "") {
      addMessage("msg", userName, txt);
      socket.emit("send-msg", txt);
    }
  }
});

socket.on("user-ok", (list) => {
  loginPage.style.display = "none";
  chatPage.style.display = "flex";
  textInput.focus();

  addMessage("status", null, "Conectado!");

  userList = list;
  renderUserList(userList);
});

socket.on("list-update", (data) => {
  if (data.joined) {
    addMessage("status", null, data.joined + " entrou no chat");
  }

  if (data.left) {
    addMessage("status", null, data.left + " saiu do chat");
  }

  userList = data.list;
  renderUserList(userList);
});

socket.on("show-msg", (data) => {
  addMessage("msg", data.username, data.message);
  scrollToBottom()
});

socket.on("disconnect", () => {
  offScreen();
});

socket.on("connect", () => {
  if (userName) {
    // Reenvia o nome de usuário ao servidor após a reconexão
    socket.emit("join-request", userName);
    offPage.style.display = "none";
    chatPage.style.display = "flex";
  }
});
