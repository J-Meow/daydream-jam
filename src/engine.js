// Sprite, key, and spriteInteraction called functions are stuffed here


// KEYS
F.handleKey = function ({ key, repeat }, type) {
    if (type === C.DOWN) {
        if (repeat) {
            // ignore
        } else {
            F.addKey(key)
        }
    } else if (type === C.UP) {
        F.removeKey(key)
    }
}
F.heldKey = game.keysHeld.includes.bind(game.keysHeld)
F.isDown = game.keysDown.includes.bind(game.keysDown)
F.isUp = game.keysUp.includes.bind(game.keysUp)
F.addKey = function (key) {
    if (!game.keysDown.includes(key)) {
        game.keysDown.push(key)
    }
    if (!game.keysHeld.includes(key)) {
        game.keysHeld.push(key)
        return true
    }
    return false
}
F.removeKey = function (key) {
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

document.addEventListener("keydown", e => F.handleKey(e, C.DOWN))
document.addEventListener("keyup", e => F.handleKey(e, C.UP))
document.addEventListener("blur", e => {
    game.keysHeld.length = 0
    game.keysDown.length = 0
    game.keysUp.length = 0
})


// SPRITES/RENDERING
F.renderSprite = function (sheet, name, x, y, size, rotation) {
    const s = game.sheets[sheet]
    if (s == null) {
        throw new RangeError(sheet == null ? "Sheet not specified" : "Sheet not found: " + sheet)
    }
    const index = s.ids.indexOf(name)
    if (index === -1) {
        throw new RangeError(name == null ? "Name not specified" : "Name not found in sheet " + sheet + ": " + name)
    }
    ctx.save()
    var scale = size || 1
    ctx.translate(Math.floor(x), Math.floor(y))
    ctx.scale(scale, scale)
    if (rotation !== 0) ctx.rotate(rotation)
    const sw = s.spriteW, sh = s.spriteH
    const cols = s.imageW / sw
    const sx = Math.floor((index % cols) * sw)
    const sy = Math.floor(Math.floor(index / cols) * sh)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(s.img, sx, sy, sw, sh, 0, 0, sw, sh)
    if (debug) {
        ctx.strokeStyle = "red"
        ctx.lineWidth = 1
        ctx.strokeRect(0.5, 0.5, sw - 1, sh - 1)
    }
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
                F.update()
                F.render()
            }
        }
        sheet.img.onerror = e => {
            console.warn(e)
        }
        sheet.img.src = sheet.src
    })
})

F.drawText = function (text, size = 24) {
    ctx.font = size + "px serif"
    // ctx.textBaseline="bottom"
    ctx.fillText(text, 10, 50)
}


// MISC
F.addClickEvent = function (id, func) {
    document.getElementById(id).addEventListener("click", func)
}


// SPRITE INTERACTIONS

/**
 * @param {Item} sprite
 */
F.touchingPlayer = function (sprite) {
    return Math.abs(sprite.x - player.x) < 1.000000001 && Math.abs(sprite.y - player.y) < 1.000000001
}