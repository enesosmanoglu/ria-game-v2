import { requestAnimation } from "./lib.js";
import { ws } from "./ws.js";
import positions from "./positions.js";
import drawings from "./drawings.js";

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let pressedKeys = [];

ctx.bgColor = '#000';
canvas.width = 1366;
canvas.height = 768;
canvas.ratio = canvas.width / canvas.height;

document.body.style.backgroundColor = '#eee';
canvas.style.backgroundColor = '#a3a';

(window.onload = window.onresize = () => {
    let width = window.innerWidth;
    let height = width / canvas.ratio;

    if (height > window.innerHeight) {
        height = window.innerHeight;
        width = height * canvas.ratio;
    }

    canvas.style.width = width + "px";
    setTimeout(function () {
        canvas.style.height = height + "px";
    }, 0);
})();

let speed = 100;
positions[0] = { x: 0, y: 0 };
drawings[0] = [];

let lastTime = 0;
let dt = 0;
requestAnimation(time => {
    dt = (time - lastTime) / 1000;
    lastTime = time;

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = ctx.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (pressedKeys.length) {
        let xx = positions[0].x;
        let yy = positions[0].y;
        if (pressedKeys.includes('KeyW'))
            positions[0].y -= dt * speed
        if (pressedKeys.includes('KeyS'))
            positions[0].y += dt * speed
        if (pressedKeys.includes('KeyA'))
            positions[0].x -= dt * speed
        if (pressedKeys.includes('KeyD'))
            positions[0].x += dt * speed
        if (~~xx != ~~positions[0].x || ~~yy != ~~positions[0].y) {
            ws.sendJSON({ t: 'position', x: ~~positions[0].x, y: ~~positions[0].y })
        }
    }

    ctx.fillStyle = '#fff';
    ctx.fillRect(canvas.width / 2, canvas.height / 2, 5, 5);

    ctx.setTransform(1, 0, 0, 1,
        canvas.width / 2 - positions[0].x,
        canvas.height / 2 - positions[0].y,
    );

    for (let d = 0; d < Object.keys(drawings).length; d++) {
        const drawingKey = Object.keys(drawings)[d];
        const drawing = drawings[drawingKey];
        for (let j = 0; j < drawing.length; j++) {
            const draw = drawing[j];
            ctx.strokeStyle = j % 2 ? '#ee1' : '#a3a';
            ctx.lineCap = 'round'
            ctx.beginPath()
            for (let i = 0; i < draw.length; i++) {
                const pos = draw[i];
                let { x, y } = pos
                // ctx.fillRect(x, y, 5, 5);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.beginPath()
                ctx.moveTo(x, y);
            }
        }
    }



    // ctx.fillRect(20, 20, 5, 5);


    for (let i = 0; i < Object.keys(positions).length; i++) {
        const wsId = Object.keys(positions)[i];
        const pos = positions[wsId];
        ctx.fillRect(pos.x, pos.y, 5, 5);

        fillText({
            text: wsId == 0 ? ws.id : wsId,
            fontSize: 16,
            x: pos.x,
            y: pos.y - 10,
        });
        fillText({
            text: `(${~~pos.x},${~~pos.y})`,
            fontSize: 10,
            x: pos.x,
            y: pos.y + 10,
            baseline: 'hanging'
        });
    }

});

let canDraw = false;
document.addEventListener('mousedown', e => {
    canDraw = true;
    let xx = e.offsetX * canvas.width / parseInt(canvas.style.width);
    let yy = e.offsetY * canvas.height / parseInt(canvas.style.height);
    xx += -canvas.width / 2 + positions[0].x
    yy += -canvas.height / 2 + positions[0].y
    xx = ~~xx
    yy = ~~yy
    drawings[0].push([{ x: xx, y: yy }])
    ws.send(JSON.stringify({ t: 'drawStart', x: xx, y: yy }))
})
document.addEventListener('mouseup', e => {
    canDraw = false;
    console.log(drawings[0])
    drawings[0].last.shift();
    ws.send(JSON.stringify({ t: 'drawStop' }))
})

let lastMoveTime = new Date().getTime()
canvas.addEventListener('mousemove', e => {
    let dmt = (new Date().getTime() - lastMoveTime)


    // if (dmt < 20) return;
    if (!canDraw) return;
    let xx = e.offsetX * canvas.width / parseInt(canvas.style.width);
    let yy = e.offsetY * canvas.height / parseInt(canvas.style.height);
    xx += -canvas.width / 2 + positions[0].x
    yy += -canvas.height / 2 + positions[0].y
    xx = ~~xx
    yy = ~~yy

    if (!drawings[0].last.includes({ x: xx, y: yy })) {
        let duration = 0;
        let i = drawings[0].length - 1;
        let j = drawings[0].last.length;
        drawings[0].last.push({ x: xx, y: yy })
        if (duration)
            setTimeout(() => {
                drawings[0][i]?.shift();
            }, duration)
        ws.send(JSON.stringify({ t: 'draw', x: xx, y: yy, d: duration }))
    }

    lastMoveTime = new Date().getTime()
});
document.addEventListener('keydown', e => {
    pressedKeys = [...pressedKeys, e.code].unique;
});
document.addEventListener('keyup', e => {
    pressedKeys = pressedKeys.filter(key => key !== e.code);
});
onblur = () => {
    console.log('blur');
    pressedKeys = [];
}

function fillText({
    text = 'Text',
    x = 0,
    y = 0,
    fontSize = 36,
    fontFamily = 'Fira Code',
    align = 'center',
    baseline = 'middle',
    color = '#fff',
    strokeColor = '#000',
    strokeWidth = 0,
    leading = fontSize / 4,
}) {
    text = '' + text;
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px "${fontFamily}"`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    let lines = text.split('\n');

    let box = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    }
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let { width, height } = ctx.measureText(line);
        lines[i] = {
            text: line,
            x: 0,
            y: box.height,
            width,
            height,
        };
        box.width = Math.max(box.width, width);
        box.height += height + leading;
    }

    ctx.save()
    ctx.textBaseline = 'top';
    if (baseline == 'middle')
        ctx.translate(x, y - box.height / 2);
    else if (baseline == 'bottom')
        ctx.translate(x, y - box.height);
    else
        ctx.translate(x, y);

    lines.forEach(line => {
        ctx.fillText(line.text, line.x, line.y);
    });
    ctx.restore();

    return {
        text,
        lines,
        x,
        y,
        width: box.width,
        height: box.height,
        fontSize,
        fontFamily,
        align,
        baseline,
        color,
        strokeColor,
        strokeWidth,
    };

}