"use strict"
const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
const log = console.log
var cameraScale = 4
var enableDebug = false // Shift must be held as well

/**
 * @typedef {object} Player
 * @property {number} x X-coordinate of player.
 * @property {number} y Y-coordinate of player.
 * @property {number} dx Delta difference between frames
 * @property {number} dx Y-coordinate of player.
 * @property {number} px Old x-coordinate of player.
 * @property {number} px Old y-coordinate of player.
 * @property {number} xVelocity X-velocity.
 * @property {number} yVelocity Y-velocity.
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
    hasBeenStarted: false,
    keysHeld: [],
    keysDown: [],
    keysUp: [],
    data: {
        player: player,
        lives: 5,
        frictionLevel: 0.9,
        speedChange: 0.03,
        maxSpeed: 0.15,
        gravity: 0.01,
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
            ids: ["player1", "player2", "", "!", "?"],
        },
        tiles: {
            src: "./static/assets/sprites/tiles.png",
            spriteW: 16,
            spriteH: 16,
            imageW: 16 * 5,
            imageH: 16 * 6,
            ids: [
                "topLeft3x3",
                "topMiddle3x3",
                "topRight3x3",
                "purpleS", // Purple spring
                "blueS", // Blue spring
                "middleLeft3x3",
                "middleMiddle3x3",
                "middleRight3x3",
                "flag",
                "coin",
                "bottomLeft3x3",
                "bottomMiddle3x3",
                "bottomRight3x3",
                "wallTop",
                "verticalTop",
                "button",
                "buttonPressed",
                "small1x1",
                "wallMiddle",
                "verticalMiddle",
                "left1x3",
                "middle1x3",
                "right1x3",
                "wallBottom",
                "verticalBottom",
                "spike",
                "heart",
            ],
        },
    },
    levelData: [
        {
            name: "Main Level",
            keys: {
                P: "main/player1",
                p: "main/player2",
                "!": "main/!",
                "?": "main/?",
                "{": "tiles/topLeft3x3",
                "^": "tiles/topMiddle3x3",
                "}": "tiles/topRight3x3",
                S: "tiles/purpleS", // Purple spring
                s: "tiles/blueS", // Blue spring
                "(": "tiles/middleLeft3x3",
                0: "tiles/middleMiddle3x3",
                ")": "tiles/middleRight3x3",
                f: "tiles/flag",
                $: "tiles/coin",
                "[": "tiles/bottomLeft3x3",
                _: "tiles/bottomMiddle3x3",
                "]": "tiles/bottomRight3x3",
                1: "tiles/wallTop",
                u: "tiles/verticalTop",
                B: "tiles/button",
                b: "tiles/buttonPressed",
                "*": "tiles/small1x1",
                2: "tiles/wallMiddle",
                m: "tiles/verticalMiddle",
                ",": "tiles/left1x3",
                ".": "tiles/middle1x3",
                "/": "tiles/right1x3",
                3: "tiles/wallBottom",
                t: "tiles/verticalBottom",
                v: "tiles/spike",
            },
            items: [
                {
                    type: "B",
                    x: 10,
                    y: 9,
                    click: function () {
                        alert(1)
                    },
                },
            ],
            addFunc: function (obj) {
                // obj.
                return obj
            },
            map: `                    {^}
     P              000
                    000
{^^^^^^}            000^}
[______]            [___]                  ^
                    vv                     0
                                           0
                                           0
                                           0
                                           0
        {^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^}   0
        [______________________________0   0
                                       0   0
                                       0   0
                                       0   0
                                       0   0
                                       0   0
                                       0   0
                                       0   0
                                       0   0
                                       0   0
                                       0   0
                                       0   0    {^}
                                       0   0    000
                                       0   [_______
                                       0       vv
                                       0   
                                       0   
                                       0^^^^^^^^^^^
                                       [___________
`,
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
    var addFunc = lvl.addFunc
    var mapLines = map.split("\n")
    for (let i = 0; i < mapLines.length; i++) {
        var l = mapLines[i]
        for (let c = 0; c < l.length; c++) {
            var char = l[c]
            var m = keys[char]
            if (m) {
                data.push(addFunc({ id: id++, type: char, x: c, y: i }))
            }
        }
    }
    for (let i = 0; i < items.length; i++) {
        data.push(Object.assign({ id: i + id }, items[i]))
    }
    lvl.data = data
}
game.levelData.forEach(F.addDataToLevel) // Add data to each level

F.die = function () {
    document.getElementById("deathSFX").play()
    data.lives--
    F.loadLevel(0)
}

F.itemInteraction = function (item) {
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
            player.xVelocity = Math.min(
                data.maxSpeed,
                player.xVelocity + data.speedChange,
            )
        } else if (
            (F.heldKey("ArrowLeft") || F.heldKey("a") || F.heldKey("A")) &&
            !F.heldKey("ArrowRight") &&
            !F.heldKey("d") &&
            !F.heldKey("D")
        ) {
            player.xVelocity = Math.max(
                -data.maxSpeed,
                player.xVelocity - data.speedChange,
            )
        } else {
            // Apply friction when no keys pressed
            player.xVelocity *= data.frictionLevel
        }

        // Apply gravity
        player.yVelocity += data.gravity

        var items = activeLevel.data
        var checkedItems = items.filter(
            (item) =>
                item.type !== "P" &&
                item.type !== "b" &&
                item.type !== "takencoin" &&
                item.type !== "?" &&
                item.type !== "!",
        )

        player.y += player.yVelocity
        var isOnGround = false
        for (let i = 0; i < checkedItems.length; i++) {
            var item = checkedItems[i]
            if (item.type === "v") {
                if (
                    checkAABBCollision(
                        player.x + 0.15,
                        player.y + 0.2,
                        0.7,
                        0.8,
                        item.x + 0.25,
                        item.y,
                        0.5,
                        0.4,
                    )
                ) {
                    F.die()
                }
                if (
                    checkAABBCollision(
                        player.x + 0.15,
                        player.y + 0.2,
                        0.7,
                        0.8,
                        item.x + 0.25,
                        -9999999999999,
                        0.5,
                        999999999999999,
                    )
                ) {
                    item.falling = 0.05
                }
                if (item.falling) {
                    item.y += item.falling
                    item.falling = (item.falling + 0.02) * 0.95
                }
                continue
            }
            if (
                item.type === "B" &&
                checkAABBCollision(
                    player.x + 0.15,
                    player.y + 0.2,
                    0.7,
                    0.8,
                    item.x + 0.25,
                    item.y + 0.9,
                    0.5,
                    0.1,
                )
            ) {
                player.yVelocity = -0.05
                if (item.click) {
                    item.click()
                }
                item.type = "b"
            }
            if (
                item.type.toLowerCase() !== "b" &&
                checkAABBCollision(
                    player.x + 0.15,
                    player.y + 0.2,
                    0.7,
                    0.8,
                    item.x,
                    item.y,
                    1,
                    1,
                )
            ) {
                if (item.type === "S") {
                    if (player.yVelocity > 0) {
                        document.getElementById("regularJumpPadSFX")
                        player.y = item.y - 1
                        player.yVelocity = -0.35
                    }
                } else if (item.type === "$") {
                    item.type = "takencoin"
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
                item.type.toLowerCase() !== "b" &&
                item.type.toLowerCase() !== "$" &&
                item.type.toLowerCase() !== "takencoin" &&
                item.type.toLowerCase() !== "v" &&
                checkAABBCollision(
                    player.x,
                    player.y,
                    1,
                    1,
                    item.x,
                    item.y,
                    1,
                    1,
                ) &&
                item.type != "buttonPressed"
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

        if (
            isOnGround &&
            (F.heldKey("ArrowUp") ||
                F.heldKey("w") ||
                F.heldKey("W") ||
                F.heldKey(" "))
        ) {
            document.getElementById("jumpSFX").play()
            player.yVelocity = -0.3 // jump
        }

        player.dx = player.x - player.px
        player.dy = player.y - player.py
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
    // F.addDataToLevel(activeLevel)
    var items = activeLevel.data
    if (data.lives & 1) {
        // player 2
        data = Object.assign(data, {
            frictionLevel: 0.95,
            speedChange: 0.04,
            maxSpeed: 0.15,
            gravity: 0.01,
        })
    } else {
        // player 1
        data = Object.assign(data, {
            frictionLevel: 0.98,
            speedChange: 0.03,
            maxSpeed: 0.3,
            gravity: 0.015,
        })
    }
    player.xVelocity = 0
    player.yVelocity = 0
    for (let i = 0; i < items.length; i++) {
        var item = items[i]
        if (item.type === "P") {
            player.px = player.x = item.x
            player.py = player.y = item.y
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
    if (player.y < 24) {
        ctx.fillStyle = "#ccf"
        ctx.globalAlpha = 1 - (Math.min(24, Math.max(player.y, 12)) - 12) / 12
        ctx.fillRect(0, 0, game.w, game.h)
        ctx.globalAlpha = 1
        document.getElementById("aboveGroundLoop").volume =
            1 - (Math.min(24, Math.max(player.y, 12)) - 12) / 12
        document.getElementById("caveLoop").volume =
            (Math.min(24, Math.max(player.y, 12)) - 12) / 12
    } else {
        document.getElementById("aboveGroundLoop").volume = 0
        document.getElementById("caveLoop").volume = 1
    }
    var lvl = activeLevel
    var items = lvl.data
    ctx.save()
    ctx.translate(
        Math.floor(-camera.xCenter * 16 * cameraScale + game.w / 2),
        Math.floor(-camera.yCenter * 16 * cameraScale + game.h / 2),
    )
    var time = Date.now()
    var timeDiff = time - lastTime
    ctx.scale(cameraScale, cameraScale)
    for (let i = 0; i < items.length; i++) {
        var item = items[i]
        var type = item.type
        if (type == "takencoin") {
            continue
        }
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
        "player" + (data.lives & 1 ? 2 : 1),
        (player.x + 0 * timeDiff) * 16,
        (player.y + 0 * timeDiff) * 16,
    )
    ctx.restore()
    F.drawText("X: " + player.x.toFixed(3) + " | Y: " + player.y.toFixed(3), 30)
    if (data.lives > 0)
        F.renderSprite(
            "tiles",
            "heart",
            30,
            30 + Math.sin(time / (120 - data.lives * 10)) * (12 - data.lives),
            5,
        )
    if (data.lives > 1)
        F.renderSprite(
            "tiles",
            "heart",
            120,
            30 +
                Math.sin((time + 500) / (150 - data.lives * 10)) *
                    (10 - data.lives),
            5,
        )
    if (data.lives > 2)
        F.renderSprite(
            "tiles",
            "heart",
            210,
            30 + Math.sin((time + 1000) / (300 - data.lives * 25)) * 6,
            5,
        )
    if (data.lives > 3)
        F.renderSprite(
            "tiles",
            "heart",
            300,
            30 + Math.sin((time + 1500) / 425) * 5,
            5,
        )
    if (data.lives > 4)
        F.renderSprite(
            "tiles",
            "heart",
            390,
            30 + Math.sin((time + 3200) / 650) * 4,
            5,
        )
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
        return
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
        if (player.y > 40) {
            F.die()
        }
    }
    lastTime = Date.now()
    game.keysDown.length = 0
    game.keysUp.length = 0
    setTimeout(F.update, frame % 3 === 0 ? 16 : 17)
}

// Add events to buttons
!(function () {
    let clickSFX = document.getElementById("clickSFX")
    Array.from(document.getElementsByTagName("button")).forEach((button) => {
        button.onclick = () => clickSFX.play()
    })

    document.addEventListener("DOMContentLoaded", function () {
        F.addClickEvent("playButton", () => {
            document.getElementById("menu").style.display = "none"
            canvas.removeAttribute("style")
            F.update()
            if (game.hasBeenStarted) return
            game.hasBeenStarted = true
            document.getElementById("menuThemeIntro").pause()
            document.getElementById("menuThemeLoop").pause()
            document.getElementById("aboveGroundLoop").play()
            document.getElementById("caveLoop").volume = 0
            document.getElementById("caveLoop").play()
            document.getElementById("intenseLoop").volume = 0
            document.getElementById("intenseLoop").play()
        })
        F.addClickEvent("aboutButton", () => {
            document.getElementById("menu").style.display = "none"
            document.getElementById("about").removeAttribute("style")
        })
        F.addClickEvent("aboutBackButton", () => {
            document.getElementById("menu").removeAttribute("style")
            document.getElementById("about").style.display = "none"
        })
        // F.addClickEvent("settingsButton", () => {
        //     document.getElementById("menu").style.display = "none"
        //     document.getElementById("settings").removeAttribute("style")
        // })
        // F.addClickEvent("settingsBackButton", () => {
        //     document.getElementById("menu").removeAttribute("style")
        //     document.getElementById("settings").style.display = "none"
        // })
        // F.addClickEvent("settingsBackButton", () => {
        //     document.getElementById("menu").removeAttribute("style")
        //     document.getElementById("settings").style.display = "none"
        // })
        let splashAnimationPlayed = false
        if (enableDebug) {
            splashAnimationPlayed = true
            document.getElementById("splash").style.display = "none"
        }
        function startSplashAnimation() {
            if (splashAnimationPlayed) return
            splashAnimationPlayed = true
            document.getElementById("menuThemeIntro").play()
            document
                .getElementById("menuThemeIntro")
                .addEventListener("ended", () => {
                    document.getElementById("menuThemeLoop").play()
                })
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
