// import { WebSocketServer ,WebSocket}      from "ws";

// const wss=new WebSocketServer({port:8080});

// let userCount=0;
// type User = {
//     id: number;
//     name: string;
//     };
// let allSockets=new Map<string,User>();
// wss.on("connection",(socket)=>{
//     // console.log("user connected");
//     userCount=userCount+1;
//     allSockets.push(socket);
//     console.log("user connected #" + userCount);

//     socket.on("message",(event)=>{
//         console.log("message received  "+event.toString()+" message received from user"+ userCount);
//        allSockets.forEach(element => {
//         { element.send(event.toString()+" sent from the server");}
//        });
        
//     })

//     socket.on("disconnect",()=>{
//         allSockets=allSockets.filter(x=>x!=socket);
//     })
// // })
// import { WebSocketServer, WebSocket } from "ws";

// const wss = new WebSocketServer({ port: 8080 });

// let userCount = 0;

// // Store all sockets in a Map<string, WebSocket[]>, where each key is a room name
// let allSockets = new Map<string, WebSocket[]>();

// wss.on("connection", (socket) => {
//     userCount++;
//     let currentRoom: string | null = null;

//     console.log(`User connected. Total users: ${userCount}`);

//     socket.on("message", (event) => {
//         const message = event.toString();
//         let parsedMessage;

//         try {
//             parsedMessage = JSON.parse(message); // Expecting JSON format for commands
//         } catch (e) {
//             console.error("Invalid message format. Expected JSON.");
//             return;
//         }

//         const { action, room, payload } = parsedMessage;

//         if (action === "join" && room) {
//             // Handle joining a new room
//             if (!allSockets.has(room)) {
//                 allSockets.set(room, []);
//             }

//             // If already in a room, remove from the previous room
//             if (currentRoom) {
//                 const previousSockets = allSockets.get(currentRoom)!;
//                 allSockets.set(
//                     currentRoom,
//                     previousSockets.filter((s) => s !== socket)
//                 );
//                 console.log(`User left room: ${currentRoom}`);
//             }

//             // Add the socket to the new room
//             currentRoom = room;
//             allSockets.get(room)!.push(socket);
//             console.log(`User joined room: ${room}`);
//         } else if (action === "message" && currentRoom) {
//             // Broadcast message to all users in the current room
//             const socketsInRoom = allSockets.get(currentRoom) || [];
//             socketsInRoom.forEach((s) => {
//                 if (s !== socket && s.readyState === WebSocket.OPEN) {
//                     s.send(`${payload} (from room: ${currentRoom})`);
//                 }
//             });
//         } else {
//             console.error("Invalid action or missing room.");
//         }
//     });

//     socket.on("close", () => {
//         // Remove the socket from the room on disconnect
//         if (currentRoom) {
//             const socketsInRoom = allSockets.get(currentRoom) || [];
//             allSockets.set(
//                 currentRoom,
//                 socketsInRoom.filter((s) => s !== socket)
//             );
//             console.log(`User disconnected from room: ${currentRoom}`);
//         }
//     });
// });
import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let userCount = 0;

// Store all sockets in a Map<string, WebSocket[]>, where each key is a room name
let allSockets = new Map<string, WebSocket[]>();

wss.on("connection", (socket) => {
    userCount++;
    let currentRoom: string | null = null;

    console.log(`User connected. Total users: ${userCount}`);

    socket.on("message", (event) => {
        const message = event.toString();
        let parsedMessage;

        // Parse incoming message
        try {
            parsedMessage = JSON.parse(message);
        } catch (e) {
            console.error("Invalid message format. Expected JSON.");
            socket.send(
                JSON.stringify({ error: "Invalid message format. Expected JSON." })
            );
            return;
        }

        const { action, room, payload } = parsedMessage;

        // Validate action
        if (!action || typeof action !== "string") {
            console.error("Invalid or missing 'action' field.");
            socket.send(
                JSON.stringify({ error: "Invalid or missing 'action' field." })
            );
            return;
        }

        if (action === "join" && room && typeof room === "string") {
            // Handle joining a new room
            if (!allSockets.has(room)) {
                allSockets.set(room, []);
            }

            // If already in a room, remove from the previous room
            if (currentRoom) {
                const previousSockets = allSockets.get(currentRoom)!;
                allSockets.set(
                    currentRoom,
                    previousSockets.filter((s) => s !== socket)
                );
                console.log(`User left room: ${currentRoom}`);
            }

            // Add the socket to the new room
            currentRoom = room;
            allSockets.get(room)!.push(socket);
            console.log(`User joined room: ${room}`);
            socket.send(
                JSON.stringify({ message: `You have joined room: ${room}` })
            );
        } else if (action === "message" && currentRoom && payload) {
            // Broadcast message to all users in the current room
            const socketsInRoom = allSockets.get(currentRoom) || [];
            socketsInRoom.forEach((s) => {
                if (s !== socket && s.readyState === WebSocket.OPEN) {
                    s.send(`${payload} (from room: ${currentRoom})`);
                }
            });
            console.log(
                `Message broadcasted in room '${currentRoom}': ${payload}`
            );
        } else {
            console.error("Invalid action or missing room.");
            socket.send(
                JSON.stringify({
                    error: "Invalid action or missing room.",
                })
            );
        }
    });

    socket.on("close", () => {
        // Remove the socket from the room on disconnect
        if (currentRoom) {
            const socketsInRoom = allSockets.get(currentRoom) || [];
            allSockets.set(
                currentRoom,
                socketsInRoom.filter((s) => s !== socket)
            );
            console.log(`User disconnected from room: ${currentRoom}`);
        }
    });
});
