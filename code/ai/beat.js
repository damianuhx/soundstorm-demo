ai.pulse = function (beatlayer) {
    if (this.scale.x>=1){
        this.scale.x=1+0.3*beat[beatlayer];
        this.scale.y=1+0.3*beat[beatlayer];
    }
}