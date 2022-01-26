const app = require('./app');
const http = require("http");
const debug = require("debug");

const normalizePort = (val) => {  // ensure port is a valid number
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

const onError = (error) => {  // checks error and stop server
  if (error.syscall !== "listen") throw error;
  const bind = (typeof addr === "string") ? "pipe " + addr : "port " + port;
  switch (error.code) {
    case "EACCESS":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
        console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
    }
  }
  
const onListening = () => {   // log listening
  const addr = server.address();
  const bind = (typeof addr === "string") ? "pipe " + addr : "port " + port;
  debug("Listening on " + bind);
}

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);
server.on("error", onError);  // pass in case of errors
server.on("listening", onListening);  // call when we start listening
server.listen(port, () => console.log(`Listening at port ${port}...`));
