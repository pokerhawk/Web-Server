const express = require("express");
const app = express();
// const cors = require("cors");
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const { exec, spawn } = require("child_process");

app.get("/", function (req, res, next) {
  // Serve the index.html file in the root directory of the website.
  res.sendFile("/home/pk/Files/Web-Server/Components/index.html");
  // res.render('index');
});

io.on("connection", (socket) => {
  let child_process_terraria;
  let child_process_tmod;
  let child_process_mine;
  let repeated_data;
  socket.on("terraria_server", (data) => {
    if (data == "start") {
      child_process_terraria = spawn(
        "bash",
        ["/home/pk/Servers/Terraria_Server/TerrariaServer"],
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
  socket.on("tmod_server", (data) => {
    if (data == "start") {
      child_process_tmod = exec(
        "bash /home/pk/Servers/tMod_Server/LaunchUtils/ScriptCaller.sh -server"
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
        { stdio: "pipe", cwd: "/home/pk/Servers/Mine_Server/" }
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
  console.log("Usuario conectado, ID: " + socket.id);
});

server.listen(3000, () => {
  console.log("Server running on port 3000...");
});
