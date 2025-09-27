// Sprite, key, and spriteInteraction called functions are stuffed here


// KEYS
funcs.handleKey = function ({ key, repeat, shiftKey, metaKey, ctrlKey }, type) {
    var keyData = { key, repeat, shift: shiftKey, ctrl: ctrlKey || metaKey }
    if (type === C.DOWN) {
        if (keyData.repeat) {
            // ignore
        } else {
            funcs.addKey(key)
        }
    } else if (type === C.UP) {
        funcs.removeKey(key)
    }
}
funcs.heldKey = game.keysHeld.includes.bind(game.keysHeld)
funcs.isDown = game.keysDown.includes.bind(game.keysDown)
funcs.isUp = game.keysUp.includes.bind(game.keysUp)
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

document.addEventListener("keydown", e => funcs.handleKey(e, C.DOWN))
document.addEventListener("keyup", e => funcs.handleKey(e, C.UP))
document.addEventListener("blur", e => {
    game.keysHeld.length = 0
    game.keysDown.length = 0
    game.keysUp.length = 0
})


// SPRITES/RENDERING
funcs.renderSprite = function (name, sheet, x, y, size, rotation) {
    const s = game.sheets[sheet]
    const index = s.ids.indexOf(name)
    ctx.save()
    var scale = size || 1
    ctx.scale(scale, scale)
    ctx.translate(x, y)
    if (rotation !== 0) ctx.rotate(rotation)
    const sw = s.spriteW, sh = s.spriteH
    const cols = s.imageW / sw
    const sx = (index % cols) * sw
    const sy = Math.floor(index / cols) * sh
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(s.img, sx, sy, sw, sh, 0, 0, sw, sh)
    ctx.restore()
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

funcs.drawText = function (text, size = 24) {
    ctx.font = size + "px serif"
    // ctx.textBaseline="bottom"
    ctx.fillText(text, 10, 50)
}


// MISC
funcs.addClickEvent = function (id, func) {
    document.getElementById(id).addEventListener("click", func)
}


// SPRITE INTERACTIONS
funcs.isIntersecting = function (sprite) {

}