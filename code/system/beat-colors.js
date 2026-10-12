function acolor (base, gain)
{
    let color={x:base, y:base, z:base};
    for(var i=1; i<=8; i++){
        color.x+=gain*beat[i]*bcolor(i).x;
        color.y+=gain*beat[i]*bcolor(i).y;
        color.z+=gain*beat[i]*bcolor(i).z;
    }
    return color;
}

//function that returns the color of the bullet depending on beatlayer on each stage/act
function bcolor(beatlayer){
    if (stagecount==0)
    {
        if (beatlayer==3){
            return {x: 255, y: 0, z: 255};
        }
        else if (beatlayer==2){
            return {x: 0, y: 255, z: 255};
        }
    }
    else if (stagecount==1)
    {
        if (actcount==1){
            if (beatlayer==2)
            {
                return {x: 255, y: 255, z: 0};
            }
            else if (beatlayer==4)
            {
                return {x: 255, y: 200, z: 20};
            }
        }
        else if (actcount==2){
            if (beatlayer==1)
            {
                return {x: 0, y: 255, z: 255};
            }
            else if (beatlayer==3)
            {
                return {x: 255, y: 0, z: 255};
            }
        }
    }
    else if (stagecount==2)
    {
        if (beatlayer==3){
            return {x: 255, y: 0, z: 255};
        }
        else if (beatlayer==4){
            return {x: 255, y: 255, z: 0};
        }
        else if (beatlayer==2){
            return {x: 0, y: 255, z: 255};
        }
        else if (beatlayer==1){
            return {x: 0, y: 0, z: 255};
        }
    }
    else if (stagecount==3)
    {
        if (beatlayer==2)
        {
            return {x: 255, y: 0, z:0};
        }
        else if (beatlayer==1)
        {
            return {x: 255, y: 255, z:0};
        }
    }

    else if (stagecount==4)
    {
        if (actcount==1)
        {
            if (beatlayer==3)
            {
                return {x: 0, y: 255, z:0};
            }
            else if (beatlayer==2)
            {
                return {x: 255, y: 255, z:0};
            }
        }
        else if (actcount==2 || actcount==3)
        {
            if (beatlayer==2)
            {
                return {x: 255, y: 0, z:0};
            }
            else if (beatlayer==3)
            {
                return {x: 0, y: 255, z:0};
            }
            else if (beatlayer==4)
            {
                return {x: 0, y: 0, z:255};
            }
            else if (beatlayer==1)
            {
                return {x: 255, y: 100, z:0};
            }
        }
        else if (actcount==4)
        {
            return {x: 0, y: 0, z: 255};
        }
    }
    else if (stagecount==5)
    {
        if (actcount==4)
        {
            if (scene<=18){
                if (beatlayer==1)
                {
                    return {x: 255, y: 0, z:0};
                }
                else if (beatlayer==2)
                {
                    return {x: 255, y: 150, z:0};
                }
                else if (beatlayer==3)
                {
                    return {x: 255, y: 255, z:0};
                }
                else if (beatlayer==4)
                {
                    return {x: 0, y: 255, z:0};
                }
                else if (beatlayer==5)
                {
                    return {x: 0, y: 255, z:255};
                }
                else if (beatlayer==6)
                {
                    return {x: 0, y: 0, z:255};
                }
                else if (beatlayer==7)
                {
                    return {x: 150, y: 0, z:255};
                }
                else if (beatlayer==8)
                {
                    return {x: 255, y: 0, z:255};
                }
            }
            if (scene>=19)
            {
                if (beatlayer==1)
                {
                    return {x: 255, y: 225, z:0};
                }
                else if (beatlayer==2)
                {
                    return {x: 255, y: 0, z:0};
                }
                else if (beatlayer==3)
                {
                    return {x: 255, y: 0, z:255};
                }
                else if (beatlayer==4)
                {
                    return {x: 0, y:255, z:255};
                }
            }
        }
        else{
            if (beatlayer==1)
            {
                return {x: 0, y: 100, z:255};
            }
            else if (beatlayer==2)
            {
                return {x: 255, y: 0, z:0};
            }
        }
    }
    return {x: 255, y: 255, z: 255};
}
