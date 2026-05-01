const ws = new WebSocket('http://127.0.0.1:3000');

ws.onopen = function() {
    console.log("connection success!");
    ws.send("Domo Server!"); 
};

ws.onmessage = function(event) {
    console.log("data received from server: ", event.data);
};

ws.onerror = function(error) {
    console.error("connection failed: ", error);
};

ws.onclose = function(event) {
    console.log("conection closed. code: ", event.code);
};