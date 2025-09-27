"use strict"
const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
const l = console.log
const game = {
    w: 1600,
    h: 900,
    keysHeld: [],
    keysDown: [],
    keysUp: [],
    data: {},
    funcs: {},
    canvas: canvas,
    ctx: ctx,
    sheets: {
        main: {
            src: './static/assets/sprites/main.png',
            spriteW: 96,
            spriteH: 24,
            imageW: 24,
            imageH: 24,
            ids: ["player", "coin", "!", "?"],
        }
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

document.addEventListener("DOMContentLoaded", function () {
    var sheetsLoaded = 0
    var keys = Object.keys(game.sheets)
    var totalSheets = keys.length
    keys.forEach(function (s) {
        let sheet = game.sheets[s]
        sheet.img = new Image()
        sheet.img.onload = function () {
            if (++sheetsLoaded === totalSheets) {
                // START
                funcs.update()
            }
        }
        sheet.img.onerror = e => {
            console.warn(e)
        }
        sheet.img.src = sheet.src
    })
})

var data = game.data
var funcs = game.funcs
const C = game.consts
funcs.handleKey = function ({ key, repeat, shiftKey, metaKey, ctrlKey }, type) {
    var keyData = { key, repeat, shift: shiftKey, ctrl: ctrlKey || metaKey }
    if (type === C.DOWN) {
        if (keyData.repeat) {
            // ignore
        } else {
            if (keyData.shift) funcs.addKey("shift")
            else if (keyData.ctrl) funcs.addKey("ctrl")
            else funcs.addKey(key)

        }
    } else if (type === C.UP) {
        if (keyData.shift) funcs.removeKey("shift")
        else if (keyData.ctrl) funcs.removeKey("ctrl")
        funcs.removeKey(key)
    }
}
funcs.heldKey = game.keysHeld.includes.bind(game.keysHeld)
funcs.addKey = function (key) {
    if (!game.keysDown.includes(key)) {
        game.keysDown.push(key)
    }
    if (!game.keysHeld.includes(key)) {
        game.keysHeld.push(key)
        return true
    }
    return false
}
funcs.removeKey = function (key) {
    if (!game.keysUp.includes(key)) {
        game.keysUp.push(key)
    }
    var index = game.keysHeld.indexOf(key)
    if (index !== -1) {
        game.keysHeld.splice(index, 1)
        return true
    }
    return false
}

var frame = 0
funcs.render = function () {
    requestAnimationFrame(funcs.render)
}
funcs.update = function () {
    ctx.clearRect(0, 0, game.w, game.h)
    renderSprite("player", "main", 0, 0)
    console.log(game.keysDown, game.keysUp, game.keysHeld)
    game.keysDown.length = 0
    game.keysUp.length = 0
    setTimeout(funcs.update, frame % 3 === 0 ? 34 : 33)
}

function renderSprite(name, sheet, x, y, rotation) {
    const s = game.sheets[sheet]
    const index = s.ids.indexOf(name)
    ctx.save()
    ctx.translate(x, y)
    if (rotation !== 0) ctx.rotate(rotation)
    const sw = s.spriteW, sh = s.spriteH
    const cols = s.imageW / sw
    const sx = (index % cols) * sw
    const sy = Math.floor(index / cols) * sh
    const dw = s.imageW
    const dh = s.imageH
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(s.img, sx, sy, sw, sh, 0, 0, dw, dh)
    ctx.restore()
}

document.addEventListener("keydown", e => funcs.handleKey(e, C.DOWN))
document.addEventListener("keyup", e => funcs.handleKey(e, C.UP))
document.addEventListener("blur", e => {
    game.keysHeld.length = 0
    game.keysDown.length = 0
    game.keysUp.length = 0
})