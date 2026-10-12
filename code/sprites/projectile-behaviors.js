// Behaviors used only by the legacy bullet builder.
function pulseBulletf(beatlayer) {
    if (this.scale.x >= 1) {
        this.scale.x = 1+0.3*beat[beatlayer];
        this.scale.y = 1+0.3*beat[beatlayer];
    }
}

function limitProjectileSpeedf(maximumSpeed) {
    var speed = Math.sqrt(
        this.speedX * this.speedX + this.speedY * this.speedY
    );

    if (speed > maximumSpeed) {
        this.speedX /= speed / maximumSpeed;
        this.speedY /= speed / maximumSpeed;
    }
}

function emitBulletFlashf(beatlayer, subtype) {
    if (this.scale.x > 0.8) {
        if (beat[beatlayer] > 0) {
            create(0, "shotflash", this.x, this.y, {
                color: this.excolor,
                subtype: subtype,
                beatlayer: beatlayer,
                speedX: this.rotation,
            });
            create(0, "preflash", this.x, this.y, {
                color: this.excolor,
                subtype: subtype,
                beatlayer: beatlayer,
                speedX: this.rotation,
            });
        }
        if (prebeat2[beatlayer].length > 0) {
            set.preflash(this.x, this.y, beatlayer, {
                color: this.excolor,
                subtype: subtype,
                rotation: this.rotation,
            });
        }
        if (prebeat[beatlayer] > 0) {
            create(0, "preflash", this.x, this.y, {
                kind: "outer",
                color: this.excolor,
                subtype: subtype,
                beatlayer: beatlayer,
                speedX: this.rotation,
            });
        }
    }
}
