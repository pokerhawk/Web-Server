const express = require("express");
const app = express();
// const cors = require("cors");
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const { exec, spawn } = require("child_process");

app.get("/", function (req, res, next) {
  // Serve the index.html file in the root directory of the website.
  res.sendFile("~/Files/Web-Server/Components/index.html");
  // res.render('index');
});

io.on("connection", (socket) => {
  console.log("Usuario conectado, ID: " + socket.id);
  // socket.on("message", (data) => {
  //   console.log(data);
  //   socket.broadcast.emit("message", data);
  // });
  socket.on("terrariaServer", (data) => {
    if (data == "start") {
      const child = spawn(
        "bash",
        ["/home/pk/Servers/Terraria_Server/TerrariaServer"],
        { stdio: "pipe" } //change to inherit
      );
    }
  });
});

//COLOCAR TUDO ABAIXO DENTRO DO DE CIMA

app.get("/terrariaServer", (req, res) => {
  const child = spawn("bash", [
    "/home/pk/Servers/Terraria_Server/TerrariaServer",
  ]);
  child.stdout.on("data", (data) => {
    const array_data = data.toString().split(" ");
    // console.log(array_data); //TEST PARA CONDICIONAIS
    for (i in array_data) {
      if (array_data[i] == "World:") {
        child.stdin.write("1\n");
      }
      if (array_data[i] == "players") {
        child.stdin.write("4\n");
      }
      if (array_data[i] == "port") {
        child.stdin.write("\n");
      }
      if (array_data[i] == "forward") {
        child.stdin.write("n\n");
      }
      if (array_data[i] == "password") {
        child.stdin.write("rosadinha\n");
      }
      if (array_data[i] == "save\n") {
        child.stdin.write("save\n");
      }
      if (array_data[i] == "exit\n") {
        child.stdin.write("exit");
        res.json("Servidor Fechado");
        return child.stdin.end();
      }
    }
    console.log(data.toString());
  });
});

app.get("/tModServer", (req, res) => {
  const child_process = exec(
    "bash ~/Servers/tMod_Server/LaunchUtils/ScriptCaller.sh -server"
  );
  child_process.stdout.on("data", (data) => {
    const array_data = data.toString().split(" ");
    console.log(array_data);
    for (i in array_data) {
      if (array_data[i] == "World:") {
        child_process.stdin.write("1\n");
      }
      if (array_data[i] == "players") {
        child_process.stdin.write("4\n");
      }
      if (array_data[i] == "port") {
        child_process.stdin.write("\n");
      }
      if (array_data[i] == "forward") {
        child_process.stdin.write("n\n");
      }
      if (array_data[i] == "password") {
        child_process.stdin.write("rosadinha\n");
      }
      if (array_data[i] == "save\n") {
        child_process.stdin.write("save\n");
      }
      if (array_data[i] == "exit\n") {
        child_process.stdin.write("exit\n");
      }
    }
    // console.log(data.toString());
  });
});

app.get("/mineServer", (req, res) => {
  const child = spawn(
    "java",
    ["-jar", "-Xmx2048M", "-Xms2048M", "minecraft_server.1.18.2.jar", "nogui"],
    { stdio: "inherit", cwd: "/home/pk/Servers/Mine_Server/" }
  );
});

server.listen(3000, () => {
  console.log("Server running on port 3000...");
});
