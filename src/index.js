const express=require("express")
const app=express()
const socketio=require("socket.io")
const Filter= require("bad-words")
const {generateMessage,generateLocationMessage} = require("./utils/messages")
const {addUser,removeUser,getUser,getUsersInRoom}= require("./utils/users")

const http=require("http")
const port=process.env.PORT||3000

const path=require("path")
const server=http.createServer(app)
const io=socketio(server)

const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

let count=0;

io.on('connection',(socket)=>{
     console.log("New webSocket connection")
           
     socket.on('join',({username,room},callback)=>{
          const {error,user}= addUser({id:socket.id,username,room})

          if(error){
              return callback(error)
          }

          socket.join(user.room)
          
          

          socket.emit('message',{msg:generateMessage('Welcome!'),username:"You"})
          // except socket
          socket.broadcast.to(user.room).emit('message',{msg:generateMessage(`${user.username} has joined! `)})
          io.to(user.room).emit('roomData',{
              room:user.room,
              users:getUsersInRoom(user.room)
          })
        
          callback()
          //io.to(room).emit ->ina specific room
          //socket.broadcast.to.emit
     })

     
     socket.on('sendMessage',(message,callback)=>{
         
         const filer=new Filter()

         if(filer.isProfane(message)){
             return callback('Profanity is not allowed')
         }
         const user=getUser(socket.id)

         io.emit("message",{
             msg:generateMessage(message),
              username:user.username})
         callback();
     })

     

     socket.on('disconnect',()=>{
        const user= removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message',{msg:generateMessage(`${user.username} has left!`)})
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
     })

     socket.on('sendlocation',(coords,callback)=>{
        const user=getUser(socket.id)
          io.emit('LocationMessage',{msg:generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`),username:user.username})
          callback("Location shared!")
     })

    

})
server.listen(port,()=>{
    console.log("We are on port :",port)
})