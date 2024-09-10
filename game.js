const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const square_size = [10,10];
const FPS = 20;

var running_game = false;
var generation = 0;

// Create mouse state listeners
var mouseDown = 0;
document.body.onmousedown = function() { 
    ++mouseDown;
}
document.body.onmouseup = function() {
    --mouseDown;
}
// mouse pos
var mouse_pos = [0,0];
canvas.onmousemove = (event) => {
    mouse_pos = [event.clientX - 7, event.clientY - 8]
}

var game_map = [];

function reset_map() {
    generation = 0;
    let section = document.getElementById('count');
    section.innerHTML = "Generation: " + generation;

    let row = [];

    // Create map of random 1s && 0s
    for (let y=0; y < canvas.height / square_size[1]; y++) {
        row = [];
        for (let x=0; x < canvas.width / square_size[0]; x++) {
            row[x] = 0;
        }
        game_map[y] = row;
    }
}
reset_map();

function force_containment(axis, value) {
    if (axis == 0) {
        if (value < 0) {
            return game_map[0].length - 1;
        }
        else if (value >= game_map[0].length) {
            return 0;
        }
    }
    else if (axis == 1) {
        if (value < 0) {
            return game_map.length - 1;
        }
        else if (value >= game_map.length) {
            return 0;
        }
    }
    return value;
}

// draw function
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";

    for (let y in game_map) {
        for (let x in game_map[y]) {
            if (game_map[y][x] == 1) {
                ctx.fillRect(x * (square_size[0]), y * (square_size[1]), square_size[0]-1, square_size[1]-1);
            }
            else {
                ctx.fillStyle = "#EEEEEE";
                ctx.fillRect(x * (square_size[0]), y * (square_size[1]), square_size[0], square_size[1]);
                ctx.fillStyle = "white";
                ctx.fillRect(x * (square_size[0]), y * (square_size[1]), square_size[0]-1, square_size[1]-1);
                ctx.fillStyle = "black";
            }
        }
    }
}

// UPDATE FOR RUNNING GAME
function update() {
    let new_map = structuredClone(game_map);
    let old_map = game_map; // copy map
    let num_meighbors = 0;

    let section = document.getElementById('count');
    section.innerHTML = "Generation: " + generation;
    generation++

    for (let y in game_map) {
        for (let x in game_map[y]) {

            y = parseInt(y);
            x = parseInt(x);

            // check number of neighbors
            num_meighbors = 0;
            for (let local_y of [-1,0,1]) { // check all local squares
                for (let local_x of [-1,0,1]) {
                    if (!(local_x == 0 && local_y == 0)) { // if not original square
                        if (game_map[force_containment(1, y + local_y)][force_containment(0, x + local_x)] == 1) {
                            num_meighbors += 1;
                        }
                    }
                }
            }
            
            if (game_map[y][x] == 1) { // cell is alive
                if (num_meighbors < 2) { // underpopulation
                    new_map[y][x] = 0;
                }
                else if (num_meighbors > 3) { // overpopulation
                    new_map[y][x] = 0;
                }
            }
            else if (num_meighbors == 3) { // reproduction
                new_map[y][x] = 1;
            }
        }
    }
    return new_map;
}

function paused_update() { // while paused
    if (mouseDown) {
        let selected_x = Math.floor(mouse_pos[0] / square_size[0]);
        let selected_y = Math.floor(mouse_pos[1] / square_size[1]);
        
        if ((selected_y >= 0) && (selected_y < game_map.length) && // if within map boundries
            (selected_x >= 0) && (selected_x < game_map[0].length)) {
            if (game_map[selected_y][selected_x] == 0) {
                game_map[selected_y][selected_x] = 1
            }
        }
    }
}

function change_state() {
    let button = document.getElementById('startbut');
    if (running_game) {
        button.setAttribute("value", "Start");
    }
    else {
        button.setAttribute("value", "Pause");
    }

    running_game = !running_game;
}

// main function
async function main() {
    if (running_game) {
        await new Promise(r => setTimeout(r, 1000/FPS));
        game_map = update();
    }
    else {
        paused_update();
    }
    draw();
    requestAnimationFrame(main);
}

main();