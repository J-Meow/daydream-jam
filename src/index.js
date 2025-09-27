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
            keysHeld = keysHeld.push(key)
            keys
        }
    } else if (type === C.UP) {
        keyData
    }
}

document.addEventListener("resize", game.handleResize)
document.addEventListener("click", game.handleClick)
document.addEventListener("keydown", e => game.handleKey(e, C.DOWN))
document.addEventListener("keyup", e => game.handleKey(e, C.UP))
document.addEventListener("blur", e => {
    game.mouse = false
    game.keysHeld.length = 0
})