import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

// ✅ Data structures with correct typing
let connections: Record<string, string[]> = {};
let messages: Record<
    string,
    { sender: string; data: string; "socket-id-sender": string }[]
> = {};
let timeOnline: Record<string, Date> = {};

// Function to initialize socket server
export const connectToSocket = (server: HttpServer): Server => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        },
    });

    io.on("connection", (socket: Socket) => {
        // 🔹 User joins a call
        socket.on("join-call", (path: string) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit(
                        "chat-message",
                        messages[path][a].data,
                        messages[path][a].sender,
                        messages[path][a]["socket-id-sender"]
                    );
                }
            }
        });

        // 🔹 WebRTC signaling
        socket.on("signal", (toId: string, message: any) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // 🔹 Chat messages
        socket.on("chat-message", (data: string, sender: string) => {
            const [matchingRoom, found] = Object.entries(connections).reduce <
                [string, boolean]
                > (([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ["", false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({
                    sender,
                    data,
                    "socket-id-sender": socket.id,
                });

                console.log("message", matchingRoom, ":", sender, data);

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        // 🔹 Disconnect cleanup
        socket.on("disconnect", () => {
            const diffTime = Math.abs(
                (timeOnline[socket.id]?.getTime() || 0) - new Date().getTime()
            );
            console.log(`User ${socket.id} was online for ${diffTime}ms`);

            for (const [k, v] of Object.entries(connections)) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        for (let b = 0; b < connections[k].length; ++b) {
                            io.to(connections[k][b]).emit("user-left", socket.id);
                        }

                        const index = connections[k].indexOf(socket.id);
                        if (index !== -1) {
                            connections[k].splice(index, 1);
                        }

                        if (connections[k].length === 0) {
                            delete connections[k];
                        }
                    }
                }
            }

            delete timeOnline[socket.id];
        });
    });

    return io;
};
