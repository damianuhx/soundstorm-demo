



// Updates the values and meters shown by the in-game HUD.
function varupdate(variable){
    if (variable=='score'){
        this.text='+'+score+'';
        while (this.text.length<12)
        {
            this.text=' ' + this.text;
        }
    }
    if (variable=='scoretotal'){
        this.text=scoretotal+'';
        while (this.text.length<12)
        {
            this.text=' ' + this.text;
        }
    }
    if (variable=='trystock'){
        this.text=trystock+'';
        while (this.text.length<12)
        {
            this.text=this.text+' ';
        }
    }
    else if (variable=='life'){
        if (this.index<=lifestock-1){
            this.scale.x=0.5*(1+beat[0]*0.2);
            this.scale.y=0.5*(1+beat[0]*0.2);
            this.alpha=0.7;
        }
        else if (this.index<lifestock) {

            this.scale.x=0.5*(lifestock-this.index)*(1+beat[0]*0.2);
            this.scale.y=0.5*(lifestock-this.index)*(1+beat[0]*0.2);
            this.alpha=0.3;
        }
        else {
            this.scale.x=0;
            this.scale.y=0;
            this.alpha=0;
        }
    }
    else if (variable=='laser'){
        this.clear();
        if (laserstock<1)
        {
            this.beginFill(0xA7FFF9, 0.8);
            this.drawRect(3, -3, 14, (-194*(laserstock)));
            this.endFill();
            this.beginFill(0x000000, 0.3);
            this.drawRect(0, 0, 20, -200);
            this.endFill();
        }
        if (laserstock>=1)
        {
            this.lineStyle(3, 0x000000, 1);
            this.beginFill(0xA7FFF9);
            this.drawRect(0, 0, 20, -200);
            this.endFill();
        }
    }
    else if (variable=='combovalue'){
        this.clear();
        this.x=herox-50;
        this.y=heroy+50;
        remember.combovalue/difficulty.maxcombovalue
        if (remember.combovalue>0)
        if (remember.combovalue>difficulty.maxcombovalue){
            remember.combovalue=difficulty.maxcombovalue;
        }
        if (remember.combovalue>0)
        {
            this.beginFill(0xA7FFF9, 0.8);
            this.drawRect(3, 3,  (97*(remember.combovalue/difficulty.maxcombovalue)), 14,);
            this.endFill();
            this.beginFill(0x000000, 0.3);
            this.drawRect(0, 0, 100, 20, );
            this.endFill();
        }
    }
}
