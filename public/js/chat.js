const socket=io()

//Elements
const $messageForm =document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('#send')
const $locationButton= document.querySelector("#send-location")
const $messages=document.querySelector("#messages")
const getname=document.querySelector('#getname')


//Templates
const messageTemplate=document.querySelector("#message-template").innerHTML
const locationTemplate=document.querySelector("#location-template").innerHTML
const sidebarTemplate =document.querySelector('#sidebar-template').innerHTML

//options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix:true })

const autoscroll=()=>{
    //new message element
     const $newMessage=$messages.lastElementChild

       //height of the new message
     const newMessageStyles =getComputedStyle($newMessage)
     const newMessageMargin =parseInt(newMessageStyles.marginBottom)
     const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
         
     //visible height
     const visibleHeight=$messages.offsetHeight

     //Height of messages container
     const containerHeight=$messages.scrollHeight

     //how far have i scrolled

     const scrolloffset=$messages.scrollTop + visibleHeight

     if(containerHeight - newMessageHeight <= scrolloffset){
                 $messages.scrollTop = $messages.scrollHeight

     } 

}






socket.on("message",(message)=>{
    
    console.log(message.msg)
    let usname="You";
    if(message.username!=username.toLowerCase()){
             usname=message.username
             
    }
    const html = Mustache.render(messageTemplate,{
        message: message.msg.text,
        username:usname,
        createdAt: moment(message.msg.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

/////Location Of user

socket.on("LocationMessage",(message)=>{
    console.log(message.msg)
    let usname="You";
    if(message.username!=username.toLowerCase()){
             usname=message.username
             
    }
    const html=Mustache.render(locationTemplate,{
        url:message.msg.url,
        username:usname,
        createdAt:moment(message.msg.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})



//message-form

$(document).ready(function(){
        

        $("#emoji").click(function(){
            $("#div").show()
        })

    $("#div button").click(function(e){
        var idClicked = e.target.id;
        var id="#"+idClicked
        var value=$(id).html()
       var first= $("#input").val()
       $("#input").val(first+value)
       $("#input").focus()
    });

    $("#send").click(function(){
        $("#div").hide()
    })


})


     

$messageForm.addEventListener('submit',(e)=>{
    
    e.preventDefault();
   
    
    $messageFormButton.setAttribute('disabled','disabled')
  //disable
    const msg=e.target.elements.message.value
     if(msg===''){
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
         return;
     }
    socket.emit("sendMessage",msg,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        //enable
        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })

   
    

})

$locationButton.addEventListener('click',()=>{
    $locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser,')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        $locationButton.removeAttribute('disabled')
        socket.emit('sendlocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(msg)=>{
              console.log(msg)
        })
    })
   
})



socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})