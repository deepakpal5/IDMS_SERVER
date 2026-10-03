require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDatabase = require("./config/database");
const IdmsServer = require("./websocket/idmsServer");
const DashboardServer = require("./websocket/dashboardServer");
const WebSocketGateway = require("./websocket/websocketGateway");


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const inverter = require("./routes/inverterRoutes");


const app = express();

const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inverters",inverter);



connectDatabase();



const idmsServer = new IdmsServer();

const dashboardServer = new DashboardServer();

new WebSocketGateway(server, idmsServer, dashboardServer);






app.get("/", (req, res) => {

    res.json({
        status: "IDMS Running"
    });

});

const PORT = process.env.PORT || 3000;

// Host configuration
const HOST = process.env.HOST || "localhost";
server.listen(PORT, () => {

   const httpUrl = `http://${HOST}:${PORT}`;
    const idmsWsUrl = `ws://${HOST}:${PORT}/idms`;
    const dashboardWsUrl = `ws://${HOST}:${PORT}/dashboard`;

    console.log("\n========================================");
    console.log("        IDMS SERVER STARTED");
    console.log("========================================");

    console.log(`Host URL        : ${httpUrl}`);
    console.log(`API Base URL    : ${httpUrl}/api`);

    console.log("\nWebSocket URLs:");
    console.log(`IDMS WebSocket  : ${idmsWsUrl}`);
    console.log(`Dashboard WS    : ${dashboardWsUrl}`);

    console.log("========================================\n");

});