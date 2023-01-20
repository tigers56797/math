var Vector = function (x,y){
  this.x = x
  this.y = y
}
Vector.prototype.add=function(v){
  return new Vector(this.x+v.x,this.y+v.y)
}
Vector.prototype.length=function(){
  return Math.sqrt(this.x*this.x+this.y*this.y)
}
Vector.prototype.set=function(v){
  this.x=v.x
  this.y=v.y
}
Vector.prototype.equal=function(v){
  return (this.x==v.x && this.y==v.y)
}
Vector.prototype.clone=function(){
  return new Vector(this.x,this.y)
}
Vector.prototype.mul=function(s){
  return new Vector(this.x*s,this.y*s)
}

var Snake = function(){
  this.body = []
  this.maxLength = 5
  this.head = new Vector(0,0)
  this.speed = new Vector(1,0)
  this.direction="Right"
  this.setDirection(this.direction)
}
Snake.prototype.update = function(){
  let newHead = this.head.add(this.speed)
  this.body.push( this.head) 
  this.head = newHead
  while(this.body.length>this.maxLength){
    this.body.shift()
  }
}
Snake.prototype.setDirection = function(dir){
  let target
  if (dir=="Up"){
    target = new Vector(0,-1)
  }
  if (dir=="Down"){
    target = new Vector(0,1)
  }
  if (dir=="Left"){
    target = new Vector(-1,0)
  }
  if (dir=="Right"){
    target = new Vector(1,0)
  }
  if (target.equal(this.speed)==false && target.equal(this.speed.mul(-1))==false){
    this.speed=target
  }
}
Snake.prototype.checkBoundary = function(gameWidth){
  let xInRange= 0<=this.head.x && this.head.x < gameWidth
  let yInRange= 0<=this.head.y && this.head.y < gameWidth
  return xInRange && yInRange
}

var Game = function(){
  this.bw=12
  this.bs=2
  this.gameWidth=40
  this.speed = 30
  this.snake = new Snake()
  this.foods = []
  this.generateFood()
  this.init()
  this.start = false
}
Game.prototype.init = function(){
  this.canvas = document.getElementById("mycanvas")
  this.canvas.width=this.bw*this.gameWidth + this.bs * (this.gameWidth-1)
  this.canvas.height=this.canvas.width
  this.ctx = this.canvas.getContext("2d")
  this.render()
  setTimeout(()=>{this.update()},1000/this.speed)
}
Game.prototype.startGame = function(){
  this.start=true
  $(".panel").hide()
  this.snake = new Snake()
  this.playSound("C#5",-20)
  this.playSound("E5",-20,200)
}
Game.prototype.endGame = function(){
  this.start=false
  $("h2").text("Score: "+ (this.snake.body.length-5)*10)
  $(".panel").show()
  this.playSound("A3")
  this.playSound("E2",-10,200)
  this.playSound("A2",-10,400)
}
Game.prototype.getPositon=function(x,y){
  return new Vector(
    x*this.bw+(x-1)*this.bs,
    y*this.bw+(y-1)*this.bs
  )
}
Game.prototype.drawBlock=function(v,color,offset){
  this.ctx.fillStyle=color
  let pos = this.getPositon(v.x,v.y)
  this.ctx.fillRect(pos.x,pos.y,this.bw,this.bw)  
}
Game.prototype.drawEffect = function(x,y){
  let r = 2
  let pos = this.getPositon(x,y)
  let _this = this
  let effect = ()=>{
    r++
    _this.ctx.strokeStyle = "rgba(255,0,0,"+(100-r)/100+")"
    _this.ctx.beginPath()
    _this.ctx.arc(pos.x+_this.bw/2,pos.y+_this.bw/2, 20*Math.log(r/2),0,Math.PI*2)
    _this.ctx.stroke()
    
    if (r<100){
      requestAnimationFrame(effect)
    }
  }
  requestAnimationFrame(effect)
}
Game.prototype.render=function(){
  this.ctx.fillStyle = "rgba(0,0,0,0.3)"
  this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
  for(let x=0;x<this.gameWidth;x++){
    for(let y=0;y<this.gameWidth;y++){
       this.drawBlock(new Vector(x,y),"rgba(255,255,255,0.03)")
    }
  }
  this.snake.body.forEach((sp,i)=>{
     this.drawBlock(sp,"white")
  })
  this.foods.forEach(sp=>{
     this.drawBlock(sp,"red")
  })
  requestAnimationFrame(()=>{this.render()})
}
Game.prototype.generateFood = function(){
  let x = Math.floor(Math.random()*this.gameWidth)
  let y = Math.floor(Math.random()*this.gameWidth)
  this.foods.push(new Vector(x,y))
  this.drawEffect(x,y)
  this.playSound("E5",-20)
  this.playSound("A5",-20,200)
}
Game.prototype.update = function(){
  if (this.start){
    this.playSound("A2",-20)
    this.snake.update() 
    this.foods.forEach((food,i)=>{
      if (this.snake.head.equal(food)){
        this.snake.maxLength++
        this.foods.splice(i,1)
        this.generateFood()
      }
    })
    this.snake.body.forEach(sp=>{
      if (sp.equal(this.snake.head)){
        console.log("collide body")
        this.endGame()
      }   
    })
    if (this.snake.checkBoundary(this.gameWidth)==false){
      this.endGame()
    }
  }
  this.speed = Math.sqrt(this.snake.body.length)+5
  setTimeout(()=>{this.update()},parseInt(1000/this.speed))
}
Game.prototype.playSound = function(note,volume,when){
  setTimeout(function(){
    var synth = new Tone.Synth().toMaster();     
    synth.volume.value= volume || -12;
    synth.triggerAttackRelease(note, "8n");
  },when || 0)
}

var game = new Game()
$(window).keydown(function(evt){
  console.log(evt.key)
  game.snake.setDirection(evt.key.replace("Arrow",""))
})