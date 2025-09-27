"use strict"
const canvas = document.getElementsByTagName("canvas")[0]
const ctx = canvas.getContext("2d")
const log = console.log

// Main game objects
const player = {
    oldX: 0,
    oldY: 0,
    px: 0,
    py: 0,
}
const game = {
    w: 1600,
    h: 900,
    keysHeld: [],
    keysDown: [],
    keysUp: [],
    data: {
        player: player
    },
    funcs: {},
    canvas: canvas,
    ctx: ctx,
    currentSprites: [],
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
            // Note that each level in levelData gains a new property `data` containing an array of sprites.
            name: "Main Level",
            keys: { "P": "main/player" }, // These are the keys that convert a character in the map to a sprite; sprite interactions are handled in spriteInteraction
            items: [{ type: "P", x: 0, y: 0 }], // Additional items that might need to be added to the object. This, for example, can used to add objects in partial coordinates.
            addFunc: function (obj) {
                // Modify how certain objects are created at runtime (from the map, not items).
                // obj.
                return obj
            },
            map: `asdfasdfsadf`,
        },
    ],
    consts: {
        DOWN: 0,
        UP: 1,
    },
}
var data = game.data
var funcs = game.funcs
const C = game.consts

funcs.spriteInteraction = function (sprite) {
    var interactions = {
        intersecting: funcs.isIntersecting(sprite),
    }
    funcs.renderSprite("player", "main", 0, 0)
}

// Main updating
var frame = 0
funcs.render = function () {
    requestAnimationFrame(funcs.render)
}
funcs.update = function () {
    ctx.clearRect(0, 0, game.w, game.h)

    if (funcs.isDown("Escape")) {
        canvas.style.display = "none"
        document.getElementById("menu").style.display = "block"
        document.getElementById("about").style.display = "none"
        document.getElementById("settings").style.display = "none"
    } else {
        // logic
    }
    game.keysDown.length = 0
    game.keysUp.length = 0
    setTimeout(funcs.update, frame % 3 === 0 ? 34 : 33)
}
// Add SFX to all buttons
let clickSFX = new Audio("static/assets/sfx/click.wav")
clickSFX.volume = 0.5;

const buttons = document.querySelectorAll(".button");
buttons.forEach(button => {
        button.addEventListener('click', () => {
            clickSFX.play();
        });
    });

// Add button click events
document.addEventListener("DOMContentLoaded", function () {
    funcs.addClickEvent("playButton", () => {
        document.getElementById("menu").style.display = "none"
        canvas.removeAttribute("style")
    })
    funcs.addClickEvent("aboutButton", () => {
        document.getElementById("menu").style.display = "none"
        document.getElementById("about").style.display = "block"
    })
    funcs.addClickEvent("aboutBackButton", () => {
        document.getElementById("menu").style.display = "block"
        document.getElementById("about").style.display = "none"
    })
    funcs.addClickEvent("settingsButton", () => {
        document.getElementById("menu").style.display = "none"
        document.getElementById("settings").style.display = "block"
    })
    funcs.addClickEvent("settingsBackButton", () => {
        document.getElementById("menu").style.display = "block"
        document.getElementById("settings").style.display = "none"
    })
    funcs.addClickEvent("musicAndSoundsButton", () => {
        document.getElementById("settings").style.display = "none"
        document.getElementById("menu").style.display = "none"
        document.getElementById("musicAndSoundsSettings").style.display = "block"
    })
    funcs.addClickEvent("musicAndSoundsBackButton", () => {
        document.getElementById("settings").style.display = "block"
        document.getElementById("menu").style.display = "none"
        document.getElementById("musicAndSoundsSettings").style.display = "none"
    })
})

canvas.addEventListener("contextmenu", function (e) { e.preventDefault() })
