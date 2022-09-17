import drawings from "./drawings.js";
import durationFormat from "./durationFormatter.js";
import positions from "./positions.js";

//' + window.location.hostname + '
export let url = 'wss://ria-game-v2.glitch.me:8080';
export let ws = new WebSocket(url);

export let onopen = () => {
    console.log('Connected to the server.');
}

export let onclose = () => {
    console.log('Disconnected from the server.', new Date());

    ws = new WebSocket(url);
    initWS(ws);
}

export let onerror = err => {
    console.error('Server error:', err);
}

export let onmessage = msg => {
    // console.log('Server message:', msg);

    let { data, timeStamp: timestamp } = msg;
    try {
        data = JSON.parse(data);
    } catch (error) {
        console.error('This message is not valid!', msg)
        return;
    }

    console.log(durationFormat(timestamp), data);

    if (data.t == 'ping')
        return ws.sendPing();

    if (data.t == 'info') {
        ws.id = data.id;
        ws.ip = data.ip;
        console.log(positions)
        for (let i = 0; i < Object.keys(data.ps).length; i++) {
            const wsId = Object.keys(data.ps)[i];
            if (wsId == ws.id) wsId = 0;
            positions[wsId] = data.ps[wsId];
        }

        for (let i = 0; i < Object.keys(data.ds).length; i++) {
            const wsId = Object.keys(data.ds)[i];
            if (wsId == ws.id) wsId = 0;
            drawings[wsId] = data.ds[wsId];
        }
        console.log(drawings)
    }

    if (data.t == 'position') {
        if (!data.id)
            data.id = 0;
        positions[data.id] = { x: data.x, y: data.y };
    }

    if (data.t == 'disconnect') {
        delete positions[data.id];
    }

    if (data.t == 'drawStart') {
        if (!drawings[data.id]) drawings[data.id] = [];

        drawings[data.id].push([{ x: data.x, y: data.y }]);
    }

    if (data.t == 'draw') {
        let i = drawings[data.id].length - 1;
        drawings[data.id]?.last?.push({ x: data.x, y: data.y });
        if (data.d)
            setTimeout(() => {
                drawings[data.id][i]?.shift();
            }, data.d)
    }

    if (data.t == 'drawStop') {
        drawings[data.id]?.last?.shift();
    }
}

initWS(ws);
export function initWS(ws) {
    ws.onopen = onopen;
    ws.onclose = onclose;
    ws.onerror = onerror;
    ws.onmessage = onmessage;
    ws.sendJSON = json => ws.send(JSON.stringify(json));
    ws.sendPing = () => ws.sendJSON({ t: 'pong' });
}
