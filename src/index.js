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
    yVelocity: 0,
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
            items: [],
            addFunc: function (obj) {
                // obj.
                return obj
            },
            map: `
     P              {^}
  $ $ $             [_]
{^^^^^^}        {^^^^^^^}

         $

          S
        {^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`,
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
        // Save old position
        player.px = player.x
        player.py = player.y

        // Apply more consistent horizontal movement
        if (
            (F.heldKey("ArrowRight") || F.heldKey("d") || F.heldKey("D")) &&
            !F.heldKey("ArrowLeft") &&
            !F.heldKey("a") &&
            !F.heldKey("A")
        ) {
            player.xVelocity = Math.min(0.15, player.xVelocity + 0.03)
        } else if (
            (F.heldKey("ArrowLeft") || F.heldKey("a") || F.heldKey("A")) &&
            !F.heldKey("ArrowRight") &&
            !F.heldKey("d") &&
            !F.heldKey("D")
        ) {
            player.xVelocity = Math.max(-0.15, player.xVelocity - 0.03)
        } else {
            // Apply friction when no keys pressed
            player.xVelocity *= 0.6
        }

        // Apply gravity
        player.yVelocity += 0.01

        var items = activeLevel.data
        var checkedItems = items.filter(
            (item) => item.type !== "P" && item.type !== "$",
        )

        player.y += player.yVelocity
        var isOnGround = false
        for (let i = 0; i < checkedItems.length; i++) {
            var item = checkedItems[i]
            if (
                checkAABBCollision(
                    player.x,
                    player.y,
                    1,
                    1,
                    item.x,
                    item.y,
                    1,
                    1,
                )
            ) {
                if (item.type === "S") {
                    if (player.yVelocity > 0) {
                        player.y = item.y - 1
                        player.yVelocity = -0.35
                    }
                } else {
                    if (player.yVelocity > 0) {
                        player.y = item.y - 1
                        player.yVelocity = 0
                        isOnGround = true
                    } else if (player.yVelocity < 0) {
                        player.y = item.y + 1
                        player.yVelocity = 0
                    }
                }
            }
        }

        player.x += player.xVelocity
        for (let i = 0; i < checkedItems.length; i++) {
            var item = checkedItems[i]
            if (
                checkAABBCollision(
                    player.x,
                    player.y,
                    1,
                    1,
                    item.x,
                    item.y,
                    1,
                    1,
                )
            ) {
                if (player.xVelocity > 0) {
                    // Moving right
                    player.x = item.x - 1
                    player.xVelocity = 0
                } else if (player.xVelocity < 0) {
                    // Moving left
                    player.x = item.x + 1
                    player.xVelocity = 0
                }
            }
        }

        console.log(game.keysHeld)
        if (
            isOnGround &&
            (F.heldKey("ArrowUp") ||
                F.heldKey("w") ||
                F.heldKey("W") ||
                F.heldKey(" "))
        ) {
            player.yVelocity = -0.3 // jump
        }

        player.dx = player.x - player.px
        player.dy = player.y - player.py

        if (player.y > 30) {
            F.loadLevel(0)
        }
    } else if (debug) {
        if (touchingPlayer) {
            ctx.strokeStyle = "orange"
            ctx.lineWidth = 2
            ctx.strokeRect(item.x * 16 + 1, item.y * 16 + 1, 22, 22)
        }
    }
}

const COLLISION_NONE = 0
const COLLISION_TOP = 1
const COLLISION_BOTTOM = 2
const COLLISION_LEFT = 3
const COLLISION_RIGHT = 4
const COLLISION_ALL = 5 // Full overlap

/**
 * Performs swept AABB collision detection to handle fast-moving objects.
 * @param {number} x Current X position of moving rect
 * @param {number} y Current Y position of moving rect
 * @param {number} w Width of moving rect
 * @param {number} h Height of moving rect
 * @param {number} vx X velocity of moving rect
 * @param {number} vy Y velocity of moving rect
 * @param {number} sx Static rect X position
 * @param {number} sy Static rect Y position
 * @param {number} sw Static rect width
 * @param {number} sh Static rect height
 * @returns {{hit: boolean, time: number, normal: {x: number, y: number}}} Collision result
 */
function sweptAABB(x, y, w, h, vx, vy, sx, sy, sw, sh) {
    // Early exit if no velocity
    if (vx === 0 && vy === 0) {
        // We don't consider initial overlap as collision
        // This allows the player to move when starting in an overlapping state
        return { hit: false, time: 1, normal: { x: 0, y: 0 } }
    }

    // Expand the static rect by the moving rect's dimensions
    const expandedX = sx - w
    const expandedY = sy - h
    const expandedW = sw + w
    const expandedH = sh + h

    // Ray-AABB intersection
    let tNear = -Infinity
    let tFar = Infinity
    let normal = { x: 0, y: 0 }

    // X-axis
    if (vx === 0) {
        if (x < expandedX || x > expandedX + expandedW) {
            return { hit: false, time: 1, normal: { x: 0, y: 0 } }
        }
    } else {
        const t1 = (expandedX - x) / vx
        const t2 = (expandedX + expandedW - x) / vx
        const tMin = Math.min(t1, t2)
        const tMax = Math.max(t1, t2)

        if (tMin > tNear) {
            tNear = tMin
            normal = { x: vx > 0 ? -1 : 1, y: 0 }
        }
        tFar = Math.min(tFar, tMax)
    }

    // Y-axis
    if (vy === 0) {
        if (y < expandedY || y > expandedY + expandedH) {
            return { hit: false, time: 1, normal: { x: 0, y: 0 } }
        }
    } else {
        const t1 = (expandedY - y) / vy
        const t2 = (expandedY + expandedH - y) / vy
        const tMin = Math.min(t1, t2)
        const tMax = Math.max(t1, t2)

        if (tMin > tNear) {
            tNear = tMin
            normal = { x: 0, y: vy > 0 ? -1 : 1 }
        }
        tFar = Math.min(tFar, tMax)
    }

    // Check if intersection exists
    if (tNear > tFar || tFar < 0 || tNear > 1) {
        return { hit: false, time: 1, normal: { x: 0, y: 0 } }
    }

    // Improved collision detection to avoid detecting "just touching" as collisions
    const epsilon = 0.001 // Larger epsilon to better ignore touching edges

    // If we're already nearly touching (very small time to collision)
    if (tNear <= epsilon) {
        // Get the projected position after movement
        const projectedX = x + vx
        const projectedY = y + vy

        // Only consider this a collision if we're actually trying to move INTO the object
        // and not just moving parallel or away from it
        const dotProduct = normal.x * vx + normal.y * vy

        if (dotProduct >= 0) {
            // We're not moving toward the object, so ignore this collision
            return { hit: false, time: 1, normal: { x: 0, y: 0 } }
        }

        // Special case for vertical movement and jumps
        if (Math.abs(normal.y) > 0 && Math.abs(vy) > 0.1) {
            // Allow jumping when just touching the ground
            if (normal.y > 0 && vy < 0) {
                return { hit: false, time: 1, normal: { x: 0, y: 0 } }
            }
        }
    }

    // Valid collision detected
    return { hit: true, time: Math.max(0, tNear), normal }
}

/**
 * Legacy collision check for backward compatibility.
 */
function checkAABBCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2) {
        const overlapX = Math.min(x1 + w1 - x2, x2 + w2 - x1)
        const overlapY = Math.min(y1 + h1 - y2, y2 + h2 - y1)

        if (overlapX < overlapY) {
            return x1 + w1 / 2 < x2 + w2 / 2 ? COLLISION_RIGHT : COLLISION_LEFT
        } else {
            return y1 + h1 / 2 < y2 + h2 / 2 ? COLLISION_BOTTOM : COLLISION_TOP
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
    ctx.scale(cameraScale, cameraScale)
    for (let i = 0; i < items.length; i++) {
        var item = items[i]
        var type = item.type
        var split = lvl.keys[type].split("/")
        if (type !== "P") {
            F.renderSprite(
                split[0],
                split[1],
                (item.x + item.dx * timeDiff * 0.06) * 16,
                (item.y + item.dy * timeDiff * 0.06) * 16,
            )
        }
    }
    F.renderSprite(
        "main",
        "player",
        (player.x + 0 * timeDiff) * 16,
        (player.y + 0 * timeDiff) * 16,
    )
    ctx.restore()
    requestAnimationFrame(F.render)
}
/**
 * Updates and handles logic
 */
F.update = function () {
    debug = enableDebug && F.heldKey("Shift")
    camera.xCenter = camera.xCenter + (player.x - camera.xCenter) * 0.2
    camera.yCenter = camera.yCenter + (player.y - camera.yCenter) * 0.2
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
        let splashAnimationPlayed = false
        if (enableDebug) {
            splashAnimationPlayed = true
            document.getElementById("splash").style.display = "none"
        }
        function startSplashAnimation() {
            if (splashAnimationPlayed) return
            splashAnimationPlayed = true
            document.getElementById("splash").classList.add("animating")
            setTimeout(() => {
                document.getElementById("splash").style.display = "none"
            }, 3000)
        }
        F.addClickEvent("splash", () => {
            startSplashAnimation()
        })
        addEventListener("keydown", startSplashAnimation)
        if (enableDebug) {
            document.getElementById("playButton").click()
        }
    })

    canvas.addEventListener("contextmenu", function (e) {
        e.preventDefault()
    })
})()
