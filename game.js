$(function(){
    var canvas = $("canvas");
    var Box = Backbone.Model.extend({
        defaults: {
            x: 0,
            y: 0,
            w: 25,
            h: 25,
            color: "#FF9000",
            linewidth: 3,
            alive: true,
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
            ctx.strokeStyle = model.get("color");
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

    var SetView= Backbone.View.extend({
        initialize: function(args) {
            this.shotCollection = args.shotCollection;
            this.listenTo(this.collection, "all", this.render);
            this.listenTo(this.shotCollection, "all", this.render);
            this.ctx =  this.el.getContext("2d");
        },

        render: function() {
            if(this.lastRender && (this.lastRender + 5) > new Date().getTime()) return;
            console.log("Redrawing", this);
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
            this.lastRender = new Date().getTime();
        }
    });
    var player = new Box({x: 0, y: 450, color: 'magenta'});
    var c = new BoxSet();
    c.add(player);
    c.add(new Box({x: 150, y: 150}));
    c.add(new Box({ x: 10, y: 10 }));

    var counter = 0;
    /* Henk Jan */

    $(document).keydown(function (e) {
        switch(e.which){
            case 37: //links
            case 65: //a
                player.set({x: player.get("x") - 10});
                
                break;
            case 38: //boven
            case 87: //u
                player.set({y: player.get("y") - 10});
                break;
            case 39: //rechts
            case 68: //d
                player.set({ x: player.get("x") + 10 });
                
                break;
            case 40: //down
            case 83: //s
                player.set({y: player.get("y") + 10});
                break;
        }
    });


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
            console.log("Rendering shot");
            var model = this.model, ctx = this.ctx;
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "yellow";
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
    var v = new SetView({
        el: canvas[0],
        collection : c,
        shotCollection: shots
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
        var shot = new Shot({fromX: player.get("x") + 12.5, fromY: player.get("y") + 12.5, toX:e.offsetX, toY:e.offsetY});
        shootAudio.play();
        shots.add(shot);
        // Check collisie 
        checkCollision(shot, c);

        setTimeout(function(){
            shots.remove(shot);
        }, 100)
    });


    function checkCollision(shot, c) {
        //console.debug("piew", shot);
        //console.debug("shot x", shot.get("toX"));
        //console.debug("shot y", shot.get("toY"));

        c.each(function (obj) {
            for (x = 0; x < 25; x++) {
                for (y = 0; y < 25; y++) {
                    if ((obj.get("x") + x == shot.get("toX")) && (obj.get("y") + y == shot.get("toY"))) {
                        console.debug("Raak");
                    }   
                }
            }
        });

        
    }
    
    
});
