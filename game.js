$(function(){
    var canvas = $("canvas"),
        ctx = canvas[0].getContext("2d");
    canvas.on("click", function(e){
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();   
    });
});
