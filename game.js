$(function(){
    var canvas = $("canvas");
    var Box = Backbone.Model.extend({
        defaults: {
            x: 0,
            y: 0,
            w: 25,
            h: 50,
            color: "#FF9000",
            linewidth: 3
            // don't define a default id, that leads to strange behaviors
        }
    });

    var BoxSet = Backbone.Collection.extend({
        model:Box
    });

    var BoxView = Backbone.View.extend({
        test: "Hoi",

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
        initialize: function() {
            this.listenTo(this.collection, "all", this.render);
        },

        render: function() {
            var canvas = this.el, ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            console.debug("Render CTX", ctx);
            this.collection.each(function(model) {
                var view = new BoxView({ctx: ctx, model: model});
                view.render();
            })
        }
    });
    var player = new Box({x: 0, y: 450, color: 'magenta'});
    var c = new BoxSet();
    c.add(player);
    c.add(new Box({x: 150, y: 150}));
    c.add(new Box({x: 10, y: 10}));

    var v = new SetView({
        el: canvas[0],
        collection : c
    });
    v.render();
    var counter = 0;
    /* Henk Jan */
    $(document).keydown(function(e){
        switch(e.which){

            case 37: //links
            case 65: //a
                player.set({x: player.get("x") - 25});
                break;
            case 38: //boven
            case 87: //u
                player.set({y: player.get("y") - 25});
                break;
            case 39: //rechts
            case 68: //d
                player.set({x: player.get("x") + 25});
                break;
            case 40: //down
            case 83: //s
                player.set({y: player.get("y") + 25});
                break;
        }
    });


    /* Sander */


});
