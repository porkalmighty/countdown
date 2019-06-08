const express = require("express");
const app = express();
const http = require("http").Server(app);
const socket = require("socket.io")(http);
const port = 4000;

app.use(express.static("public"));

// socket
socket.on("connection", socket => {
  console.log("you are connected");
});

http.listen(port, () => {
  console.log("connected to port " + port);
});
