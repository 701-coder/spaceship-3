var canvas=document.getElementById('mycanvas');
var ctx=canvas.getContext('2d');
var ww=window.innerWidth;
var wh=window.innerHeight;
var bw=3000;
var bh=3000;
var mbw=500;
var mbh=500;
var dbw=0.3;
var dbh=0.3;
var sx=0;
var sy=0;
var sx0=sx;
var sy0=sy;
var enemy_num=49;
var score=0;
canvas.width=ww;
canvas.height=wh;
ctx.translate(ww/2, wh/2);
ctx.scale(1, -1);

let toPi=Math.PI/180;

class Bullet{
	constructor(args){
		let def={
			x: 0,
			y: 0,
			r: 30,
			deg: 0,
			v: 12,
            time: 0,
            hp: 15,
            dhp: 1
		}
		Object.assign(def, args);
		Object.assign(this, def);
	}
	draw(){
		ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
		ctx.arc(0, 0, this.r, 0, 2*Math.PI);
		ctx.fillStyle='white';
		ctx.fill();
        ctx.restore();
	}
	update(){
        ++this.time;
		this.x+=this.v*Math.cos(this.deg);
        this.y+=this.v*Math.sin(this.deg);
	}
    dead(){
        if(this.time>180||this.hp<=0){
            return true;
        }
        return false;
    }
}

class Ship{
	constructor(args){
		let def={
			x: 0,
			y: 0,
			r: 30,
			deg: 0,
			dx: 0,
			dy: 0,
            bullet: [],
            time: 0,
            kind: 0,
            v: 480,
            hp: 70,
            mhp: 20,
            rhp: 0.03,
            dhp: 3,
            reload: 60,
            bhp: 10,
            bdhp: 1,
            bv: 12
		};
		Object.assign(def, args);
		Object.assign(this, def);
	}
    Kind(){
        this.kind=0;
        this.r=30;
    }
	draw(){
		ctx.save();
        ctx.translate(this.x, this.y);
		ctx.rotate(this.deg);
		ctx.shadowBlur=20;
		ctx.shadowColor='rgba(255, 255, 255, 1)';
		ctx.fillStyle='rgba(255, 255, 255, 1)';
		ctx.fillRect(-this.r/4, -this.r*2, this.r/2, this.r);
		ctx.beginPath();
		ctx.arc(0, 0, this.r, 0, 2*Math.PI);
		ctx.strokeStyle='rgba(255, 255, 255, 1)';
		ctx.lineWidth=12;
		ctx.stroke();
		ctx.lineWidth=5;
		ctx.beginPath();
		for(var i=0; i<3; ++i){
			ctx.moveTo(0, 0);
			ctx.lineTo(0, Math.min(-this.r*this.hp/this.mhp, 0));
			ctx.rotate(Math.PI*2/3);
		}
		ctx.stroke();
		ctx.restore();
        if(this.bullet.length>0){
            this.bullet.forEach(b=>b.draw());
        }
	}
	update(){
        if(this.kind===0&&Math.random()>0.995){
            let x=Math.random()*bw*6-bw*3;
            let y=Math.random()*bh*6-bh*3;
            this.deg=Math.atan2(x-this.x, this.y-y);
            this.dx=this.v*Math.sin(this.deg);
            this.dy=-this.v*Math.cos(this.deg);
        }
		if(this.kind===1){
            let x=mousePos.x-ww/2;
            let y=-mousePos.y+wh/2;
            this.dx=x/Math.sqrt(x*x+y*y)*this.v;
		    this.dy=y/Math.sqrt(x*x+y*y)*this.v;
            this.deg=Math.atan2(this.dx, -this.dy);
        }
        if(this.kind===2){
            let x=ship.x-this.x;
            let y=ship.y-this.y;
            this.dx=x/Math.sqrt(x*x+y*y)*this.v;
		    this.dy=y/Math.sqrt(x*x+y*y)*this.v;
            this.deg=Math.atan2(this.dx, -this.dy);
            this.x+=this.dx/120;
            this.y+=this.dy/120;
        }
        if(this.kind!==2){
            this.x=Math.min(bw, Math.max(-bw, this.x+this.dx/120));
            this.y=Math.min(bh, Math.max(-bh, this.y+this.dy/120));
        }
        if(this.kind===1){
            sx=this.x;
            sy=this.y;
        }
        ++this.time;
        if(this.time%this.reload===0){
            let b=new Bullet({
                r: this.r/4,
                deg: this.deg-90*toPi,
                x: this.x+Math.cos(this.deg-90*toPi)*this.r*2,
                y: this.y+Math.sin(this.deg-90*toPi)*this.r*2,
                hp: this.bhp,
                dhp: this.bdhp
            });
            this.bullet.push(b);
        }
        if(this.kind!==1){
            if(touch(this, ship)){
                this.hp-=ship.dhp;
                ship.hp-=this.dhp;
            }
            for(var i=0; i<ship.bullet.length; ++i){
                if(touch(this, ship.bullet[i])){
                    this.hp-=ship.bullet[i].dhp;
                    ship.bullet[i].hp-=this.dhp;
                    break;
                }
            }
        }
        if(this.kind===1){
            for(var i=0; i<ships.length; ++i){
                for(var j=0; j<ships[i].bullet.length; ++j){
                    if(touch(this, ships[i].bullet[j])){
                        this.hp-=ships[i].bullet[j].dhp;
                        ships[i].bullet[j].hp-=this.dhp;
                        break;
                    }
                }
            }
        }
        this.hp=Math.min(this.hp+this.rhp, this.mhp);
	}
    upddead(){
        if(this.bullet.length>0){
            this.bullet.forEach(b=>b.update());
            for(var i=0; i<this.bullet.length; ++i){
                if(this.bullet[i].dead()){
                    this.bullet.splice(i, 1);
                }
            }
        }
    }
    dead(){
        if(this.hp>0){
            return false;
        }
        return true;
    }
}

function touch(obj1, obj2){
    if((obj1.x-obj2.x)*(obj1.x-obj2.x)+(obj1.y-obj2.y)*(obj1.y-obj2.y)<(obj1.r+obj2.r)*(obj1.r+obj2.r)){
        return true;
    }
    return false;
}

var ship;
var ships=[];

function init(){
    ship=new Ship({
        kind: 1,
        r: 50,
        hp: 100,
        mhp: 100,
        reload: 15,
        bhp: 10,
        bdhp: 2
    });
    for(var i=0; i<enemy_num; ++i){
        deg=Math.random()*2*Math.PI;
        let ship2=new Ship({
            x: Math.random()*bw*2-bw,
            y: Math.random()*bh*2-bh,
            deg: deg,
            dx: 200*Math.sin(deg),
            dy: -200*Math.cos(deg),
        });
        ships.push(ship2);
    }
}
var con_time=0;
function update(){
    bw=Math.max(bw-dbw, mbw);
    bh=Math.max(bh-dbh, mbh);
	ship.update();
    ships.forEach(ship2=>ship2.update());
    ship.upddead();
    ships.forEach(ship2=>ship2.upddead());
    for(var i=0; i<ships.length; ++i){
        if(ships[i].dead()){
            ships.splice(i, 1);
        }
    }
    ctx.translate(sx0-sx, sy0-sy);
    sx0=sx;
    sy0=sy;
}
function draw(){
	ctx.fillStyle='rgba(0, 29, 46, 0.5)';
	ctx.fillRect(-bw-ww, -bh-wh, (bw+ww)*2, (bh+wh)*2);
	
	//grid
	let span=50;
	ctx.beginPath();
	for(var i=0; i<=bw; i+=span){
		ctx.moveTo(i, -bh);
		ctx.lineTo(i, bh);
        ctx.moveTo(-i, -bh);
        ctx.lineTo(-i, bh);
	}
	for(var i=0; i<=bh; i+=span){
		ctx.moveTo(-bw, i);
		ctx.lineTo(bw, i);
        ctx.moveTo(-bw, -i);
        ctx.lineTo(bw, -i);
	}
	ctx.strokeStyle='rgba(255, 255, 255, 0.2)';
	ctx.stroke();
	
	//ship
	ship.draw();
    ships.forEach(ship2=>ship2.draw());

    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1, -1);
    ctx.font='30px Arial';
    ctx.fillStyle='white';
    score=Math.max(score, enemy_num-ships.length);
    ctx.fillText('x:'+Math.round(sx)+' y: '+Math.round(sy)+' score: '+score, -ww/2+10, -wh/2+33);
    if(ships.length===0&&con_time<120){
        ++con_time;
        ctx.fillStyle='red';
        ctx.fillText('Congradulation!', -108, 10);
    }
    if(ships.length===0&&119<con_time&&con_time<240){
        ++con_time;
        ctx.fillStyle='red';
        ctx.fillText('Arena closed: No player can join', -220, 10);
    }
    if(con_time===240){
        for(var i=0; i<6; ++i){
            var ship3=new Ship({
                r: 100,
                kind: 2,
                hp: 1000000007,
                dhp: 1000000007,
                mhp: 1000000007,
                bhp: 1000000007,
                bdhp: 1000000007,
                reload: 15
            });
            ships.push(ship3);
        }
        var bww=Math.max(bw*3, 3000), bhh=Math.max(bh*3, 3000);
        ships[0].x=-bww; ships[0].y=-bhh; ships[1].x=-bww; ships[1].y=0;
        ships[2].x=-bww; ships[2].y=bhh; ships[3].x=bww; ships[3].y=-bhh;
        ships[4].x=bww; ships[4].y=0; ships[5].x=bww; ships[5].y=bhh;
        con_time=241;
    }
    if(ship.hp<=0){
        clearInterval(update);
        ctx.fillStyle='red';
        ctx.fillText('You\'re dead!', -72, 10);
        return;
    }
    ctx.restore();
	requestAnimationFrame(draw);
}
init();
let fps=60;
setInterval(update, 1000/fps);
requestAnimationFrame(draw);

var mousePos={
	x: 0,
	y: 0
};

canvas.addEventListener('mousemove', function(evt){
	mousePos.x=evt.x;
	mousePos.y=evt.y;
})