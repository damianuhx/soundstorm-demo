//make object lighter/darker by 'speed'
function lightf(speed, alpha=1)
{
    if (speed>0){
        if (this.light<alpha){
        this.light+=speed;
        }
    }
    else{
        if (this.light>alpha){
            this.light+=speed;
            }
    }
    
}



//sets lightning for the object
function lightset()
{
    this.tint=rgbToHex(this.light*this.red*255, this.light*this.green*255, this.light*this.blue*255);
}

function brightset()
{
    this.tint=rgbToHex(this.light*255, this.light*255, this.light*255);
}



//fades in (or out when speed is negative)
//speed is added every frame to alpha until alpha is 0 or 1
function fadein(speed, max=1, phasechange=false)
{
    if (speed>0)
    {
        if (this.alpha<max)
        {
            this.alpha+=speed;
        }

        if (phasechange && this.alpha>=max)
        {
            this.phase++;
            
        }
    }
    else if (speed<0)
    {
        if (this.alpha>1-max)
        {
            this.alpha+=speed;
        }
        if (phasechange && this.alpha<=1-max)
        {
            this.phase++;
         }
    }

    
}
