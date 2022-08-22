const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

/** @param {FrameRequestCallback} fn */
export function requestAnimation(fn) {
    function animate(...args) {
        fn(...args);
        requestAnimationFrame(animate);
    }
    animate();
}

export function isPointInsideBox(point = { x: 0, y: 0 }, box = { x: 0, y: 0, width: 10, height: 10 }) {
    return box?.x <= point?.x &&
        point?.x <= box?.x + box?.width &&
        box?.y <= point?.y &&
        point?.y <= box?.y + box?.height;
}
export function areBoxesCollide(box = { x: 0, y: 0, width: 10, height: 10 }, box2 = { x: 0, y: 0, width: 10, height: 10 }) {
    return isPointInsideBox(box, box2) ||
        isPointInsideBox({ ...box, x: box.x + box.width }, box2) ||
        isPointInsideBox({ ...box, y: box.y + box.height }, box2) ||
        isPointInsideBox({ x: box.x + box.width, y: box.y + box.height }, box2)
}
export function getPointDistance(point = { x: 0, y: 0 }, point2 = { x: 0, y: 0 }) {
    let x = point2.x - point.x;
    let y = point2.y - point.y;
    return Math.sqrt(x * x + y * y);
}
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
export function roundRect(
    x,
    y,
    width,
    height,
    radius = 5,
    fill = false,
    stroke = true
) {
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

Object.defineProperty(TextMetrics.prototype, 'height', {
    get: function () {
        return this.actualBoundingBoxAscent + this.actualBoundingBoxDescent;
    }
});