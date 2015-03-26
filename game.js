$(function(){
    var canvas = $("canvas");
    
    var GameController = Backbone.Model.extend({
        initialize: function(){
            this.loops = [];
        },
        start: function(){
            this.ticker = 0;
            this.interval = setInterval(function(controller){
                ++controller.ticker;
                for(var i = 0; i < controller.loops.length; i++ )
                    controller.loops[i](controller.ticker);
            }, 16, this);
        },
        running: function(){
            return this.interval != undefined;
        },
        stop: function(){
            if(this.interval){
                clearInterval(this.interval);
                this.interval = undefined;
            }
        },
        register: function(func){
            if(typeof func == "function")
                this.loops.push(func);
            else
                console.error("Tried to register a non-function");
        }
    });
    var GC = new GameController();
    console.debug(GC);
    var Box = Backbone.Model.extend({
        defaults: {
            x: 0,
            y: 0,
            w: 25,
            h: 25,
            color: "#FF9000",
            linewidth: 3,
            alive: true
            // don't define a default id, that leads to strange behaviors
        }
    });

    var BoxSet = Backbone.Collection.extend({
        model:Box
    });

    var BoxView = Backbone.View.extend({
        render: function() {
            var model = this.model, ctx = this.ctx;

            ctx.fillStyle = model.get("color");
            ctx.globalAlpha = 0.4;
            ctx.fillRect(
                model.get("x"), model.get("y"),
                model.get("w"), model.get("h")
            );

            ctx.globalAlpha = 1;
            ctx.strokeStyle = model.get("strokeColor") || model.get("color");
            ctx.lineWidth = model.get("linewidth");
            ctx.strokeRect(
                model.get("x"), model.get("y"),
                model.get("w"), model.get("h")
            );
        },
        initialize: function(params){
            this.ctx = params.ctx;
        }
    });

    var ScoreModel = Backbone.Model.extend({
        defaults: {
            CurrentScore: 0,
            PosX: 0,
            PosY: 0
        }
    });
    var ScoreView = Backbone.View.extend({
        render: function () {
            var model = this.model, ctx = this.ctx;
            ctx.font = "48px serif";
            ctx.fillStyle = this.textColor;
            ctx.globalAlpha = 0.7;
            ctx.lineWidth = 1;
            ctx.fillText("Score: " + model.get("CurrentScore"), 10, 50);
        },
        initialize: function (params) {
            this.ctx = params.ctx;
            this.textColor = canvas.attr("text-color");
        }
    });
    

    var SetView= Backbone.View.extend({
        initialize: function(args) {
            this.shotCollection = args.shotCollection;
            this.listenTo(this.collection, "all", this.render);
            this.listenTo(this.shotCollection, "all", this.render);
            this.scoreView = args.scoreView;
            this.ctx =  this.el.getContext("2d");
        },

        render: function() {
            if(this.lastRender && (this.lastRender + 5) > new Date().getTime()) return;
            var ctx = this.ctx;
            ctx.clearRect(0, 0, this.el.width, this.el.height);
            this.collection.each(function(model) {
                if (!model.view) model.view = new BoxView({ ctx: ctx, model: model });
                model.view.render();
            });
            this.shotCollection.each(function(model){
                if(!model.view) model.view = new ShotView({ctx: ctx, model:model});
                model.view.render();
            });
            if (!this.scoreView.view) this.scoreView.view = new ScoreView({ ctx: ctx, model: this.scoreView });
            this.scoreView.view.render();

            this.lastRender = new Date().getTime();
        }
    });

    var player = new Box({x: 487, y: 237, color: 'magenta', strokeColor: 'blue'});
    function inBounds(from, to, value){
        if(value > to) return to;
        if(from > value) return from;
        return value;
    }

    GC.register(function(){
        if(player.moveX)
            player.set("x", inBounds(0, 975, player.get("x") + player.moveX));
        if(player.moveY)
            player.set("y", inBounds(0, 475, player.get("y") + player.moveY));
    });
    var c = new BoxSet();
    c.add(player);
    c.add(new Box({x: 150, y: 150}));
    c.add(new Box({ x: 10, y: 10 }));


    function intersectRect(obj1, obj2) {
        var r1 = {left: obj1.get("x"), top: obj1.get("y")};
        r1.right = r1.left + obj1.get("w");
        r1.bottom = r1.top + obj1.get("h");
        var r2 = {left: obj2.get("x"), top: obj2.get("y")};
        r2.right = r2.left + obj2.get("w");
        r2.bottom = r2.top + obj2.get("h");
        return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
    }
    GC.register(function(){
        var playerX = player.get("x"),
            playerY = player.get("y");
        c.each(function(obj){
            if(obj == player) return;
            var x = obj.get("x"),
                y = obj.get("y"),
                moved = false;
            if(x != playerX){
                if(x > playerX)
                    obj.set("x", --x);
                else
                    obj.set("x", ++x);
                moved = true;
            }
            if(y != playerY){
                if(y > playerY)
                    obj.set("y", --y);
                else
                    obj.set("y", ++y);
                moved = true;
            }
            if(moved && intersectRect(player, obj)){
                GC.stop();
                var restart = confirm("Game over!\nScore: " + Score.get("CurrentScore") + "\n\nWil je een nieuw spel starten?");
                if(restart)
                    restartGame();
            }
        });
    });

    /* Henk Jan */

    $(document).keydown(function (e) {
        switch(e.which){
            case 37: //links
            case 65: //a
                player.moveX = -1;

                break;
            case 38: //boven
            case 87: //u
                player.moveY = -1;
                break;
            case 39: //rechts
            case 68: //d
                player.moveX = 1;

                break;
            case 40: //down
            case 83: //s
                player.moveY = 1;
                break;
        }
    });
    $(document).keyup(function(e){
        switch(e.which){
            case 37: //links
            case 65: //a
                if(player.moveX == -1)
                    player.moveX = undefined;
                break;
            case 38: //boven
            case 87: //u
                if(player.moveY == -1)
                    player.moveY = undefined;
                break;
            case 39: //rechts
            case 68: //d
                if(player.moveX == 1)
                    player.moveX = undefined;;

                break;
            case 40: //down
            case 83: //s
                if(player.moveY == 1)
                    player.moveY = undefined;
                break;
        }
    });
    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    // voeg een vijand toe aan een willekeurige plek in het scherm
    function addEnemy() {
        var spawnPosition = getRandomInt(1, 5);
        var color = getRandomColor();
        var randomStrokeColor = getRandomColor();
        switch (spawnPosition) {
            case (1): // spawn enemy boven in het scherm
                var tempX = getRandomInt(0, 1000);
                c.add(new Box({ x: tempX, y: -25, color: color, strokeColor: randomStrokeColor }));
                break;
            case (2): // spawn enemy onder in het scherm
                var tempX = getRandomInt(0, 1000);
                c.add(new Box({ x: tempX, y: 525, color: color, strokeColor: randomStrokeColor }));
                break;
            case (3): //spawn enemy links in het scherm
                var tempY = getRandomInt(0, 500)
                c.add(new Box({ x: -25, y: tempY, color: color, strokeColor: randomStrokeColor }));
                break;
            case (4): // spawn enemy rechts in het scherm
                var tempY = getRandomInt(0, 500)
                c.add(new Box({ x: 1025, y: tempY, color: color, strokeColor: randomStrokeColor }));
                break;
        }
    }
    

    function restartGame(){
        c.reset();
        player.set({x: 487, y: 237});
        Score.set("CurrentScore", 0);
        enemySpawnRate = 300;
        c.add(player);
        addEnemy();
        addEnemy();
        GC.start();
    }

    // Standaard spawn rate van vijanden
    var enemySpawnRate = 300;
    GC.register(function (tick) {
        if (tick % enemySpawnRate == 0) {
            addEnemy();
            // Haal 4% van de spawnrate af bij elke spawn van een vijand
            enemySpawnRate = Math.round(enemySpawnRate / 50 * 48);
            console.debug("spawnrate",enemySpawnRate);
        }

    });
    

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }


    function movePlayer(direction) {
        player.set({ x: player.get("x") - 25 });
    }


    /* Sander */
    var Shot = Backbone.Model.extend({
        defaults: {
            fromX: 0,
            fromY: 0,
            toX: 0,
            toY: 0
        }
    });

    var ShotSet = Backbone.Collection.extend({
        model:Shot
    });

    var ShotView = Backbone.View.extend({
        render: function() {
            var model = this.model, ctx = this.ctx;
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "blue";
            ctx.moveTo(model.get("fromX"), model.get("fromY"));
            ctx.lineTo(model.get("toX"), model.get("toY"));
            ctx.closePath();
            ctx.stroke();
        },
        initialize: function(params){
            this.ctx = params.ctx;
        }
    });
    var shots = new ShotSet();
    var Score = new ScoreModel();
    var v = new SetView({
        el: canvas[0],
        collection : c,
        shotCollection: shots,
        scoreView: Score
    });
    v.render();
    var AudioElement = function(src){
        this.src = src;
    };
    AudioElement.prototype = {
        defaultElement: undefined,
        src: undefined,
        play: function(){
              if(!this.defaultElement){
                  var audio =  this.createElement();
                  this.defaultElement = audio[0];
                  $(document.body).append(this.defaultElement);
              }else{
                  if(this.defaultElement.paused) this.defaultElement.play();
                  else $(document.body).append(this.createElement().on("ended", function(){$(this).remove()}));
              }
        },
        createElement: function(){
            return  $("<audio/>").attr("src", this.src).attr("autoplay", "");
        }
    };
    var shootAudio = new AudioElement("Javascriptgame/laser.mp3");
    canvas.on("click", function(e){
        if(!GC.running()) return;
        var shot = new Shot({
            fromX: player.get("x") + 12.5,
            fromY: player.get("y") + 12.5,
            toX: e.offsetX || e.pageX - canvas.offset().left,
            toY: e.offsetY || e.pageY - canvas.offset().top
        });
        console.debug("Shot", shot);
        shootAudio.play();
        shots.add(shot);

        // Check collisie
        checkCollision(shot, c);

        setTimeout(function(){
            shots.remove(shot);
        }, 50)
    });

    function checkCollision(shot, c) {

        try {
            var toX = shot.get("toX"),
                toY = shot.get("toY");
            c.each(function (obj) {
                // Kijk of de speler zich zelf schiet
                if (obj == player) {
                    return;
                }
                // kijk of het object er nog is
                if (obj != null) {
                    // pak alle x en y coordinaten van het object
                    var x = obj.get("x"),
                        y = obj.get("y"),
                        w = obj.get("w"),
                        h = obj.get("h");
                    if(
                        toX >= x && (x + w) >= toX &&
                        toY >= y && (y + h) >= toY
                    ){
                        // als het object geraakt is, verwijder het
                        // en throw een error zodat hij de functie afbreekt
                        c.remove(obj);

                        Score.set("CurrentScore", Score.get("CurrentScore") + 1);
                        throw "Raak";
                    }
                }
            });
        }
        catch (e) {
        }
    }

    GC.start();
    canvas.css({
        cursor:"url(Javascriptgame/cursor.png) 32 32, auto",
        'user-select': "none",
        '-webkit-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none'
    });
    var parent = canvas.parent();
    $(window).on("resize",function(){
       if(parent.width() <  canvas.width()){
           canvas.css("margin-left", "0");
       }else{
            canvas.css("margin-left", ((parent.width() - canvas.width()) / 2) + "px");
       }

    });
    $(window).trigger("resize");
});
