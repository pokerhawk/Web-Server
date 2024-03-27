const express = require("express");
const app = express();
// const cors = require("cors");
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const { exec, spawn } = require("child_process");

//DIRETÓRIO DO INDEX.HTML
const path_to_html = '/home/pk/Work/Web-Server/Components/index.html';
//DIRETÓRIO PARA AONDE ESTÁ SEUS SERVIDORES
const path_to_server_folder = '/home/pk/Servers';

app.get("/", function (req, res, next) {
  // Serve o index.html pro diretório root do website.
  res.sendFile(path_to_html);
  // res.render('index');
});

io.on("connection", (socket) => {
  let child_process_terraria;
  let child_process_tmod;
  let child_process_mine;
  let repeated_data;

  //SOCKET DO TERRARIA
  socket.on("terraria_server", (data) => {
    if (data == "start") {
      child_process_terraria = spawn(
        "bash",
        [`${path_to_server_folder}/Terraria_Server/TerrariaServer`],
        { stdio: "pipe" }
      );
    }
    if (data == "exit") {
      child_process_terraria.stdin.write("exit");
      child_process_terraria.stdin.end();
      socket.emit("terraria_server", "Server Closed!!");
    }
    if (data != "start" && data != "exit") {
      child_process_terraria.stdin.write(data + "\n");
    }
    child_process_terraria.stdout.on("data", (log) => {
      if (repeated_data != log.toString()) {
        console.log(log.toString());
        socket.emit("terraria_server", log.toString());
        repeated_data = log.toString();
      }
    });
  });

  //SOCKET DO TMOD
  socket.on("tmod_server", (data) => {
    if (data == "start") {
      child_process_tmod = exec(
        `bash ${path_to_server_folder}/tMod_Server/LaunchUtils/ScriptCaller.sh -server`
      );
    }
    if (data == "exit") {
      child_process_tmod.stdin.write("exit");
      child_process_tmod.stdin.end();
    }
    if (data != "start" && data != "exit") {
      child_process_tmod.stdin.write(data + "\n");
    }
    child_process_tmod.stdout.on("data", (log) => {
      if (repeated_data != log.toString()) {
        console.log(log.toString());
        // console.log(child_process_tmod.pid);
        socket.emit("tmod_server", log.toString());
        repeated_data = log.toString();
      }
    });
  });

  //SOCKET DO MINECRAFT
  socket.on("minecraft_server", (data) => {
    if (data == "start") {
      child_process_mine = spawn(
        "java",
        [
          "-jar",
          "-Xmx2048M",
          "-Xms2048M",
          "minecraft_server.1.18.2.jar",
          "nogui",
        ],
        { stdio: "pipe", cwd: `${path_to_server_folder}/Mine_Server/` }
      );
    }
    if (data == "/stop") {
      child_process_mine.stdin.write("/stop");
      child_process_mine.stdin.end();
    }
    if (data != "start" && data != "/stop") {
      child_process_mine.stdin.write(data + "\n");
    }
    child_process_mine.stdout.on("data", (log) => {
      if (repeated_data != log.toString()) {
        console.log(log.toString());
        socket.emit("minecraft_server", log.toString());
        repeated_data = log.toString();
      }
    });
  });

  //SOCKET
  //Console log de quando alguem conecta
  console.log("Usuario conectado, ID: " + socket.id);
});

server.listen(3000, () => {
  console.log("Server running on port 3000...");
});