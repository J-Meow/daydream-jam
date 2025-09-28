"use strict"
const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
const log = console.log
var cameraScale = 4
var enableDebug = true // Shift must be held as well

/**
 * @typedef {object} Player
 * @property {number} x X-coordinate of player.
 * @property {number} y Y-coordinate of player.
 * @property {number} dx Delta difference between frames
 * @property {number} dx Y-coordinate of player.
 * @property {number} oldX Old x-coordinate of player.
 * @property {number} oldY Old y-coordinate of player.
 * @property {number} speed Speed when moving left or right.
 * @property {number} jumpHeight Height of jump.
 */

/**
 * @typedef {object} Item
 * @property {string} type A single character representing the thing type stored actively. (Can be a coin, solid block, etc..)
 * @property {number} id A unique identifier for the thing.
 * @property {number} x The x-coordinate of the thing.
 * @property {number} y The y-coordinate of the thing.
 * @property {object} data The y-coordinate of the thing.
 */

/**
 * @typedef {object} Level
 * @property {string} name Name of level.
 * @property {Item[]} data Data of level.
 * @property {number} keys Keys mapping to sprites.
 * @property {Item[]} items Additional items that might need to be added to the object. This, for example, can used to add objects in partial coordinates.
 * @property {function(Item): void} addFunc Modify how certain objects are created at runtime (from the map, not items).
 * @property {string} map ASCII art map data.
 */

/**
 * @typedef {object} Game
 * @property {number} w Canvas width.
 * @property {number} h Canvas height.
 * @property {string[]} keysHeld Array holding keys held
 * @property {string[]} keysDown Array holding keys just pressed (cleared after each update)
 * @property {string[]} keysUp Array holding keys just released (cleared after each update)
 * @property {{player: Player}} data Object containing data that needs to be saved.
 * @property {number} x The x-coordinate of the sprite.
 * @property {number} y The y-coordinate of the sprite.
 * @property {HTMLCanvasElement} canvas Game canvas.
 * @property {CanvasRenderingContext2D} ctx Canvas context.
 * @property {Record<string, {src: string, spriteW: number, spriteH: number, imageW: number, imageH: number, ids: string[]}>} sheets Sprite sheet data.
 * @property {Level[]} levelData List of level data.
 * @property {Record<string, number>} consts A list of constants.
 */

/** @type {Player} The player. */
const player = {
    oldX: 0,
    oldY: 0,
    x: 0,
    y: 0,
    xVelocity: 0,
    yVelocity: 0
}

const camera = {
    xCenter: 0,
    yCenter: 15,
}

/** @type {Record<string, Function>} A big object of functions. */
var F = {}

/** @type {Game} The main game. */
const game = {
    w: 1920,
    h: 1080,
    keysHeld: [],
    keysDown: [],
    keysUp: [],
    data: {
        player: player,
    },
    canvas: canvas,
    ctx: ctx,
    sheets: {
        main: {
            src: "./static/assets/sprites/main.png",
            spriteW: 16,
            spriteH: 16,
            imageW: 16 * 3,
            imageH: 16,
            ids: ["player", "!", "?"],
        },
        tiles: {
            src: "./static/assets/sprites/tiles.png",
            spriteW: 16,
            spriteH: 16,
            imageW: 16 * 5,
            imageH: 16 * 5,
            ids: [
                "{",
                "^",
                "}",
                "S",
                "s",
                "[",
                "_",
                "]",
                "f",
                "$",
                "B",
                "b",
                "*",
                ":",
                "",
                "",
                "",
                "",
                ";",
                "",
                "",
                "",
                "",
                ",",
                "",
            ],
        },
    },
    levelData: [
        {
            name: "Main Level",
            keys: {
                P: "main/player",
                "{": "tiles/{",
                "^": "tiles/^",
                "}": "tiles/}",
                S: "tiles/S",
                s: "tiles/s",
                "[": "tiles/[",
                _: "tiles/_",
                "]": "tiles/]",
                f: "tiles/f",
                $: "tiles/$",
                B: "tiles/B",
                b: "tiles/b",
                "*": "tiles/*",
                ":": "tiles/:",
                ";": "tiles/;",
                ",": "tiles/,",
            },
            items: [{ type: "P", x: 0, y: 13.4 }],
            addFunc: function (obj) {
                // obj.
                return obj
            },
            map: `                    ^
                    ^
                    ^
                    ^
                    ^
                    ^
                    ^
                    ^
                    ^
                    ^
                    ^
                    ^
                    ^
                    ^
  $ $ $             ^
^^^^^^^^          ^^^

         $

          $
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`,
        },
    ],
    consts: {
        DOWN: 0,
        UP: 1,
    },
}
canvas.width = game.w
canvas.height = game.h

var debug = false // Temp, based on if shift key is held
var data = game.data
const C = game.consts

/**
 * Adds the data to the level.
 * @param {Level} lvl
 */
F.addDataToLevel = function (lvl) {
    var items = lvl.items
    var keys = lvl.keys
    var map = lvl.map
    var data = []
    var id = 0
    var mapLines = map.split("\n")
    for (let i = 0; i < mapLines.length; i++) {
        var l = mapLines[i]
        for (let c = 0; c < l.length; c++) {
            var char = l[c]
            var m = keys[char]
            if (m) {
                data.push({ id: id++, type: char, x: c, y: i })
            }
        }
    }
    for (let i = 0; i < items.length; i++) {
        data.push(Object.assign({ id: i + id }, items[i]))
    }
    lvl.data = data
}
game.levelData.forEach(F.addDataToLevel) // Add data to each level

/**
 * Determines interaction with an Item.
 * @param {Item} item Item to interact with.
 */
F.itemInteraction = function (item) {
    var touchingPlayer = F.touchingPlayer(item)
    if (item.type === "P") {
        if (F.heldKey("ArrowRight") && !F.heldKey("ArrowLeft")) {
            player.xVelocity = 0.15 + 0.25 * player.xVelocity
        } else if (F.heldKey("ArrowLeft") && !F.heldKey("ArrowRight")) {
            player.xVelocity = -0.15 - 0.25 * player.xVelocity
        }
        player.px = player.x
        player.xVelocity *= 0.8
        player.py = player.y
        player.yVelocity += 0.008
        var items = activeLevel.data
        for (let i = 0; i < items.length; i++) {
            var item = items[i]
            if (item.type === "P" || item.type === "$") continue
            var collision = checkAABBCollision(player.x, player.y, 1, 1, item.x, item.y, 1, 1)
            if (collision === COLLISION_TOP) {
                player.yVelocity = 0
                if (game.keysDown.includes("ArrowUp")) {
                    player.yVelocity = -0.2
                }

            } else if (collision === COLLISION_LEFT || collision === COLLISION_RIGHT) {
                player.xVelocity = 0
            }
        }
        player.x += player.xVelocity
        player.y += player.yVelocity
        player.dx = player.xVelocity
        player.dy = player.yVelocity
    } else if (debug) {
        if (touchingPlayer) {
            ctx.strokeStyle = "orange"
            ctx.lineWidth = 2
            ctx.strokeRect(item.x * 16 + 1, item.y * 16 + 1, 22, 22)
        }
    }
}

// Rectangle to rectangle collision detection
// Define a structure or constants for the result
const COLLISION_NONE = 0
const COLLISION_TOP = 1
const COLLISION_BOTTOM = 2
const COLLISION_LEFT = 3
const COLLISION_RIGHT = 4
const COLLISION_ALL = 5 // Full overlap

function checkAABBCollision(
    x1, y1, w1, h1,        // Moving Rect 1 (e.g., Player)
    x2, y2, w2, h2,        // Static Rect 2 (e.g., Platform)
    deltaX, deltaY         // Velocity of Rect 1
) {
    // Center coordinates for Rect 1 and 2
    const center1X = x1 + w1 / 2
    const center1Y = y1 + h1 / 2
    const center2X = x2 + w2 / 2
    const center2Y = y2 + h2 / 2

    // Distance between centers
    const dx = center1X - center2X
    const dy = center1Y - center2Y

    // Sum of half-widths and half-heights
    const halfWidths = (w1 + w2) / 2
    const halfHeights = (h1 + h2) / 2

    // Check for collision
    if (Math.abs(dx) < halfWidths && Math.abs(dy) < halfHeights) {
        // Penetration depth on X and Y axes
        const overlapX = halfWidths - Math.abs(dx)
        const overlapY = halfHeights - Math.abs(dy)

        // The collision occurs on the axis with the *least* penetration.
        if (overlapX < overlapY) {
            // Collision is resolved on the X axis (Left or Right)

            // Use velocity to help disambiguate edge cases (optional but helpful)
            if (Math.abs(deltaX) > 0.1) {
                // Determine direction based on center offset (dx) and velocity (deltaX)
                // Use dx if velocity is not zero for robustness
                return (dx > 0) ? COLLISION_RIGHT : COLLISION_LEFT
            } else {
                // If no velocity, rely purely on center offset
                return (dx > 0) ? COLLISION_RIGHT : COLLISION_LEFT
            }
        } else {
            // Collision is resolved on the Y axis (Top or Bottom)

            // Use velocity to help disambiguate corner/edge cases
            if (deltaY !== 0) {
                // Determine direction based on center offset (dy) and velocity (deltaY)
                // If the player is moving UP (negative deltaY), they hit the BOTTOM of the platform.
                // If the player is moving DOWN (positive deltaY), they hit the TOP of the platform.

                // Note: Assuming positive Y is DOWN (common for computer graphics)
                return (dy > 0) ? COLLISION_BOTTOM : COLLISION_TOP
            } else {
                // If no velocity, rely purely on center offset
                return (dy > 0) ? COLLISION_BOTTOM : COLLISION_TOP
            }
        }
    }

    return COLLISION_NONE
}

/** @type {Level} */
var activeLevel = null
F.loadLevel = function (id) {
    activeLevel = game.levelData[id]
    var items = activeLevel.items
    for (let i = 0; i < items.length; i++) {
        var item = items[i]
        if (item.type === "P") {
            player.x = item.x
            player.y = item.y
            camera.xCenter = player.x
            camera.yCenter = player.y
        }
    }
}

F.loadLevel(0)

// Main updating
var lastTime = Date.now()
var frame = 0
/**
 * Main rendering function.
 */
F.render = function () {
    ctx.clearRect(0, 0, game.w, game.h)
    var lvl = activeLevel
    var items = lvl.data
    ctx.save()
    ctx.translate(
        Math.floor(-camera.xCenter * 16 * cameraScale + game.w / 2),
        Math.floor(-camera.yCenter * 16 * cameraScale + game.h / 2),
    )
    var timeDiff = Date.now() - lastTime
    for (let t = 0; t < timeDiff; t++) {
        camera.xCenter = camera.xCenter + (player.x - camera.xCenter) * 0.01
        camera.yCenter = camera.yCenter + (player.y - camera.yCenter) * 0.01
    }
    ctx.scale(cameraScale, cameraScale)
    for (let i = 0; i < items.length; i++) {
        var item = items[i]
        var type = item.type
        var split = lvl.keys[type].split("/")
        if (type !== "P") {
            F.renderSprite(split[0], split[1], (item.x + item.dx * timeDiff * 0.06) * 16, (item.y + item.dy * timeDiff * 0.06) * 16)
        }
    }
    F.renderSprite("main", "player", (player.x + player.dx / 60 * timeDiff) * 16, (player.y + player.dy / 60 * timeDiff) * 16)
    ctx.restore()
    requestAnimationFrame(F.render)
}
/**
 * Updates and handles logic
 */
F.update = function () {
    debug = enableDebug && F.heldKey("Shift")
    if (F.heldKey("Escape")) {
        canvas.style.display = "none"
        document.getElementById("menu").removeAttribute("style")
        document.getElementById("about").style.display = "none"
        document.getElementById("settings").style.display = "none"
    } else {
        // logic
        var lvl = activeLevel
        var items = lvl.data
        for (let i = 0; i < items.length; i++) {
            var item = items[i]
            item.px = item.x
            item.py = item.y
            F.itemInteraction(item)
            if (item.type !== "P") {
                item.dx = item.x - item.px
                item.dy = item.y - item.py
            }
        }
    }
    lastTime = Date.now()
    game.keysDown.length = 0
    game.keysUp.length = 0
    setTimeout(F.update, frame % 3 === 0 ? 16 : 17)
}

// Add events to buttons
!(function () {
    let clickSFX = new Audio("static/assets/sfx/click.wav")
    clickSFX.volume = 0.5
    Array.from(document.getElementsByTagName("button")).forEach((button) => {
        button.onclick = () => clickSFX.cloneNode().play()
    })

    document.addEventListener("DOMContentLoaded", function () {
        F.addClickEvent("playButton", () => {
            document.getElementById("menu").style.display = "none"
            canvas.removeAttribute("style")
        })
        F.addClickEvent("aboutButton", () => {
            document.getElementById("menu").style.display = "none"
            document.getElementById("about").removeAttribute("style")
        })
        F.addClickEvent("aboutBackButton", () => {
            document.getElementById("menu").removeAttribute("style")
            document.getElementById("about").style.display = "none"
        })
        F.addClickEvent("settingsButton", () => {
            document.getElementById("menu").style.display = "none"
            document.getElementById("settings").removeAttribute("style")
        })
        F.addClickEvent("settingsBackButton", () => {
            document.getElementById("menu").removeAttribute("style")
            document.getElementById("settings").style.display = "none"
        })
        if (enableDebug) {
            document.getElementById("playButton").click()
        }
    })

    canvas.addEventListener("contextmenu", function (e) {
        e.preventDefault()
    })
})()
