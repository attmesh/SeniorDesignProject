var player;

const LOCALSTORAGE_ACCESS_TOKEN_KEY = 'spotify-audio-analysis-playback-token';
const LOCALSTORAGE_ACCESS_TOKEN_EXPIRY_KEY = 'spotify-audio-analysis-playback-token-expires-in';
const accessToken = localStorage.getItem(LOCALSTORAGE_ACCESS_TOKEN_KEY);
if(!accessToken || parseInt(localStorage.getItem(LOCALSTORAGE_ACCESS_TOKEN_EXPIRY_KEY)) < Date.now()) {
  window.location = '/';
}

let deviceId = '';


function playSong(id) {
    let query = '/tracks?id=' + id;
    return fetch(query).then(e => e.json()).then(data => {
        //draw(data);
        fetch(`https://api.spotify.com/v1/me/player/play${deviceId && `?device_id=${deviceId}`}`, {
            method: "PUT",
            body: JSON.stringify({"uris": [`spotify:track:${id}`]}),
            headers: {
            'Authorization': `Bearer ${accessToken}`
            }
        }).catch(e => console.error(e));
    });
}

function pauseSong() {
    player.pause().then(() => {
        console.log('Paused!');
    });
}

function resumeSong() {
    player.resume().then(() => {
        console.log('Resumed!');
      });
}

function onSpotifyPlayerAPIReady() {
  player = new Spotify.Player({
    name: 'Int Elligence; Player',
    getOauthToken: function (callback) { callback(accessToken); },
    volume: 0.8
  });

  // Ready
  player.on('ready', function (data) {
    deviceId = data.device_id;
    setTimeout(() => {
      fetch('https://api.spotify.com/v1/me/player', {
        method: "PUT",
        body: JSON.stringify({
          device_ids:[
            data.device_id
          ],
          play: false
        }),
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }).catch(e => console.error(e));
    }, 100);
  });
  // Connect to the player!
  player.connect();
}


document.querySelector("#thunder").addEventListener("click", () => {
    playSong('57bgtoPSgt236HzfBOd8kj');
});

document.querySelector("#pause").addEventListener("click", () => {
    pauseSong();
});

document.querySelector("#resume").addEventListener("click", () => {
    resumeSong();
});

document.querySelector("#sunflower").addEventListener("click", () => {
    playSong('42cgYL0K9ut6meaFqJZWI8')
});

document.querySelector("#thunderAtChorus").addEventListener("click", () => {
    // playSong('57bgtoPSgt236HzfBOd8kj');

    player.seek(111 * 1000).then(() => {
        console.log('Changed position!');
      });
});



var myGamePiece;
var myPortal;
var mySunflower;                // play song from the beginning
var myPlayFromHalf;             // play song from the halfway point
var myPause;                    // pause song
var myResume;                   // resume song
var canvasWidth = 960;
var canvasHeight = 540;

function startGame() {
    // do-while loop preventing myGamePiece and myPortal
    // from spawning in conflicting areas a.k.a already touching:
    do {
        myGameArea.key = false;
        var randX = getRandomInt(50, 930);
        var randY = getRandomInt(30, 510);
        myGamePiece = new component(30, 30, "orange", randX, randY);

        var randX = getRandomInt(50, 930);
        var randY = getRandomInt(30, 510);
        myPortal = new component(30, 30, "darkturquoise", randX, randY);

        mySunflower = new component(30, 30, "gold", 10, 10);

        myPlayFromHalf = new component(30, 30, "khaki", 10, 70);

        myResume = new component(30, 30, "green", 10, 130);

        myPause = new component(30, 30, "red", 10, 190);

    // don't worry about crashing with buttons on the left because
    // getRandomInt for X coordinate accounts for an interval of 40
    // to make sure they myGamePiece and myPortal don't spawn near them:
    } while (myGamePiece.touch(myPortal));

    myGameArea.start();
}

var myGameArea = {
    // Creating 2d Canvas workspace:
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 10);    // Updates every 10ms
        // Recognize key press:
        window.addEventListener('keydown', function (e) {
            myGameArea.key = e.keyCode;
        })
        // Recognize key release:
        window.addEventListener('keyup', function (e) {
            myGameArea.key = false;
        })
        window.addEventListener("keydown", function (e) {
          if(e.keyCode = 32) {
            e.preventDefault();
          }
        })
    },

    // Clear function required so component doesn't
    // leave a "trail" behind while moving:
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // Stop game when myGamePiece touches myPortal:
    stop : function() {
        clearInterval(this.interval);
    }
}

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;

    // context/ctx: updating component's movements
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Sets new position according to updateGameArea():
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    this.touch = function(portal) {
        // mgp = myGamePiece
        var mgpLeft = this.x;
        var mgpTop = this.y;
        var mgpRight = this.x + (this.width);
        var mgpBottom = this.y + (this.height);

        // mpo = myPortal
        var mpoLeft = portal.x;
        var mpoTop = portal.y;
        var mpoRight = portal.x + (portal.width);
        var mpoBottom = portal.y + (portal.height);

        // check if any of the coordinates overlap:
        var touched = true;
        if ((mgpBottom < mpoTop) || (mgpTop > mpoBottom) || (mgpRight < mpoLeft) || (mgpLeft > mpoRight)) {
            touched = false;
        }
        return touched;
    }

    this.crash = function() {
        // mgp = myGamePiece
        var mgpLeft = this.x;
        var mgpTop = this.y;
        var mgpRight = this.x + (this.width);
        var mgpBottom = this.y + (this.height);

        var crashed = false;

        if ((mgpBottom > canvasHeight) || (mgpTop < 0) || (mgpRight > canvasWidth) || (mgpLeft < 0)) {
            crashed = true;

            // Moving box back to where it was
            // before crashing into the boundary:
            if (mgpBottom > canvasHeight) {
                myGamePiece.speedY = -4;
            } else if (mgpTop < 0) {
                myGamePiece.speedY = 4;
            } else if (mgpRight > canvasWidth) {
                myGamePiece.speedX = -4;
            } else if (mgpLeft < 0) {
                myGamePiece.speedX = 4;
            }

            // Update position (back to where it was):
            myGamePiece.newPos();
            myGamePiece.update();
        }

        return crashed;
    }
}

// Movement comes from this function.
// This is used by interval to update
// game area and component:
function updateGameArea() {
    // Check if myGamePiece touched portal.
    // Otherwise, update movement:

    breakMove : if (myGamePiece.touch(myPortal)) {
        // alert("Song Request!");
        playSong('57bgtoPSgt236HzfBOd8kj');
        console.log("thunderstruck");
        myGameArea.stop();
        startGame();

    } else if (myGamePiece.touch(mySunflower)) {         // touch mySunflower (gold)
        playSong('0RiRZpuVRbi7oqRdSMwhQY');
        console.log("sunflower");
        myGameArea.stop();
        startGame();

    } else if (myGamePiece.touch(myPlayFromHalf)) {     // touch myPlayFromHalf (khaki)
        player.seek(111 * 1000);
        console.log("song from  point");
        myGameArea.stop();
        startGame();

    } else if (myGamePiece.touch(myResume)) {          // touch myResume (green)
        resumeSong();
        console.log("resume");
        myGameArea.stop();
        startGame();

    } else if (myGamePiece.touch(myPause)) {          // touch myPause (red)
        pauseSong();
        console.log("pause");
        myGameArea.stop();
        startGame();

    } else if (myGamePiece.crash()) {
        // crash function took care trying to run past boudaries
        // console.log("Crash");
        break breakMove;

    } else {
        myGameArea.clear();
        myGamePiece.speedX = 0;
        myGamePiece.speedY = 0;
        if (myGameArea.key && myGameArea.key == 37) {myGamePiece.speedX = -4;}
        if (myGameArea.key && myGameArea.key == 39) {myGamePiece.speedX = 4;}
        if (myGameArea.key && myGameArea.key == 38) {myGamePiece.speedY = -4;}
        if (myGameArea.key && myGameArea.key == 40) {myGamePiece.speedY = 4;}
        myGamePiece.newPos();
        myGamePiece.update();       // display myGamePiece
        myPortal.update();          // display myPortal
        mySunflower.update();       // display mySunflower
        myPlayFromHalf.update();    // display myPlayFromHalf
        myResume.update();          // display myResume
        myPause.update();           // display myPause
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

startGame();
