"use strict"
const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
const game = {
    keysHeld: [],
    keysDown: [],
    keysUp: [],
    mouse: false, // or [x, y]
    data: {},
    funcs: {},
    canvas: canvas,
    ctx: ctx,
    sheets: {
        main: {
            src: 'assets/main.png',
            spriteW: 32,
            spriteH: 16,
            imageW: 16,
            imageH: 16,
            ids: ["player", "coin", "!", "?"]
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
            if (held) funcs.addKey(key)
            if (keyData.shift) funcs.addKey("shift")
            if (keyData.ctrl) funcs.addKey("ctrl")
        }
    } else if (type === C.UP) {
        if (held) keysHeld.splice(key, 1)
        if (keyData.shift) funcs.removeKey("shift")
        if (keyData.ctrl) funcs.removeKey("ctrl")
    }
}
funcs.heldKey = keysHeld.includes.bind(keysHeld)
funcs.addKey = function (key) {
    if (!keysDown.includes(key)) {
        keysDown.push(key)
    }
    if (!keysHeld.includes(key)) {
        keysHeld.push(key)
        return true
    }
    return false
}
funcs.removeKey = function (key) {
    if (!keysUp.includes(key)) {
        keysUp.push(key)
    }
    var index = keysHeld.indexOf(key)
    if (index !== -1) {
        keysHeld.splice(index, 1)
        return true
    }
    return false
}

var frame = 0
funcs.render = function () {
    requestAnimationFrame(funcs.render)
}
funcs.update = function () {
    renderSprite
    setTimeout(funcs.update, frame % 3 === 0 ? 34 : 33)
}

function renderSprite(name, sheet, rotation) {
    const s = game.sheets[sheetName]
    const index = s.ids.indexOf(name)
    ctx.save()
    ctx.translate(x, y)
    if (rotation !== 0) ctx.rotate(rotation)
    const sw = s.spriteW, sh = s.spriteH
    const cols = s.imageW / sw
    const sx = (index % cols) * sw
    const sy = Math.floor(index / cols) * sh
    const dw = sw
    const dh = sh
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(s.image, sx, sy, sw, sh, 0, 0, dw, dh)
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

update()