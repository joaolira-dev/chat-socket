const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io")

const app = express()


const server = http.createServer(app)

// socket
const io = socketIO(server)

server.listen(3000, () => {
   console.log("Servidor rodando...")
})



app.use(express.static(path.join(__dirname, "public")))

let connectedUsers = []

io.on("connection", (socket) => {
   console.log("conexao detectada")
   socket.on("join-request", (username) => {
      socket.username = username
      connectedUsers.push(username)
      console.log(connectedUsers)

      socket.emit("user-ok", connectedUsers)

      // funcao para emitir para todos os usuarios

      socket.broadcast.emit("list-update", {
         joined: username,
         list: connectedUsers
      })
   })

   socket.on("disconnect", () => {
      connectedUsers = connectedUsers.filter(user => user != socket.username)
      console.log(connectedUsers)
      socket.broadcast.emit("list-update", {
         left: socket.username,
         list: connectedUsers
      })
   })

   socket.on("send-msg", (txt) => {
      let object = {
         username: socket.username,
         message: txt
      }

      // mostrar mensagem para mim
      //socket.emit("show-msg", object)

      // mostrar mensagem para todos
      socket.broadcast.emit("show-msg", object)
   })
})

