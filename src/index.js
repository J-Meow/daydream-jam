"use strict"
const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
const log = console.log
var enableDebug = true // Shift must be held as well

/**
 * @typedef {object} Player
 * @property {number} x X-coordinate of player.
 * @property {number} y Y-coordinate of player.
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
 */

/**
 * @typedef {object} Level
 * @property {string} name Name of level.
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
    speed: 0.1
}

/** @type {Record<string, Function>} A big object of functions. */
var F = {}

/** @type {Game} The main game. */
const game = {
    w: 1600,
    h: 900,
    keysHeld: [],
    keysDown: [],
    keysUp: [],
    data: {
        player: player
    },
    canvas: canvas,
    ctx: ctx,
    sheets: {
        main: {
            src: "./static/assets/sprites/main.png",
            spriteW: 24,
            spriteH: 24,
            imageW: 96,
            imageH: 24,
            ids: ["player", "coin", "!", "?"],
        },
    },
    levelData: [
        {
            name: "Main Level",
            keys: { "P": "main/player", "$": "main/coin" },
            items: [{ type: "P", x: 0, y: 0.4 }],
            addFunc: function (obj) {
                // obj.
                return obj
            },
            map: ` $$$`,
        },
    ],
    consts: {
        DOWN: 0,
        UP: 1
    },
}

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
        var speed = player.speed
        player.x += F.heldKey("ArrowLeft") ? -speed : (F.heldKey("ArrowRight") ? speed : 0)
    } else if (debug) {
        if (touchingPlayer) {
            ctx.strokeStyle = "orange"
            ctx.lineWidth = 2
            console.log(item.x * 24, item.y * 24)
            ctx.strokeRect(item.x * 24 + 1, item.y * 24 + 1, 22, 22)
        }
    }
}

// Main updating
var frame = 0
/**
 * Main rendering function.
 */
F.render = function () {
    requestAnimationFrame(F.render)
}
/**
 * Updates and handles logic
 */
F.update = function () {
    ctx.clearRect(0, 0, game.w, game.h)

    debug = enableDebug && F.heldKey("Shift")
    if (F.heldKey("Escape")) {
        canvas.style.display = "none"
        document.getElementById("menu").removeAttribute("style")
        document.getElementById("about").style.display = "none"
        document.getElementById("settings").style.display = "none"
    } else {
        // logic
        var lvl = game.levelData[0]
        var items = lvl.data
        for (let i = 0; i < items.length; i++) {
            var item = items[i]
            var type = item.type
            var split = lvl.keys[type].split("/")
            F.itemInteraction(item)
            if (type !== "P") F.renderSprite(split[0], split[1], item.x * 24, item.y * 24)
        }
        F.renderSprite("main", "player", player.x * 24, player.y * 24)
    }
    game.keysDown.length = 0
    game.keysUp.length = 0
    setTimeout(F.update, frame % 3 === 0 ? 34 : 33)
}

// Add events to buttons
!(function () {
    let clickSFX = new Audio("static/assets/sfx/click.wav")
    clickSFX.volume = 0.5
    Array.from(document.getElementsByTagName("button")).forEach(button => { button.onclick = () => clickSFX.cloneNode().play() })

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
    })

    canvas.addEventListener("contextmenu", function (e) { e.preventDefault() })
})()