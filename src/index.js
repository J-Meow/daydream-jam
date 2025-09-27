"use strict"
const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
const game = {
    keysHeld: [],
    mouse: false, // or [x, y]
    data: {},
    funcs: {},
    canvas: canvas,
    ctx: ctx,
    sheets: {
        main: "assets/main.png",
    },
    levelData: [
        [
            { type: 1234 }
        ]
    ],
    consts: {
        DOWN: 0,
        UP: 1
    }
}

var data = game.data
var funcs = game.funcs
const C = game.consts
funcs.handleKey = function (type, { key, repeat, shiftKey, metaKey, ctrlKey }) {
    var keysHeld = data.keysHeld
    var keyData = { key, repeat, shift: shiftKey, ctrl: ctrlKey || metaKey }
    if (type === C.DOWN) {
        if (keyData.repeat) {
            // ignore
        } else {
            // do stuff...
            if (held) keysHeld.push(key)
            if (keyData.shift) {
                keysHeld.push("shift")
            }
            if (keyData.ctrl) {
                keysHeld.push("ctrl")
            }
        }
    } else if (type === C.UP) {
        // do stuff...
        if (held) keysHeld.splice(key, 1)
        if (keyData.shift)  funcs.addKey("shift")
        if (keyData.ctrl) {
            keysHeld.push("ctrl")
        }
    }
}
funcs.heldKey = keysHeld.includes.bind(keysHeld)
funcs.addKey = function() {
    
}

function renderSprite(x, y, rotation, sheet) {
    ctx.save()
    ctx.translate(x, y)
    if (rotation !== 0) ctx.rotate(rotation)
    const sw = sheet.spriteW, sh = sheet.spriteH
    const cols = sheet.imageW / sw
    const sx = (index % cols) * sw
    const sy = Math.floor(index / cols) * sh
    const dw = sw
    const dh = sh
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(sheet.image, sx, sy, sw, sh, -dw * 0.5, -dh * 0.5, dw, dh) // TODO
    ctx.restore()
}

document.addEventListener("resize", game.handleResize)
document.addEventListener("click", game.handleClick)
document.addEventListener("keydown", e => game.handleKey(e, C.DOWN))
document.addEventListener("keyup", e => game.handleKey(e, C.UP))
document.addEventListener("blur", e => {
    game.mouse = false
    game.keysHeld.length = 0
})