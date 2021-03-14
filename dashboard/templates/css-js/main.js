let if_started = false



function start_alert(letters){
if(if_started === true) return;
var alert = document.getElementById("body")
  let element = document.createElement("div");
element.setAttribute("class", "alert")	
element.innerHTML = `<span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
  ${letters}`
alert.appendChild(element);
if_started = true
setTimeout(() =>{
element.parentNode.removeChild(element)
if_started = false
}, 3000)
}

function start_done(letters){
if(if_started === true) return;
var alert = document.getElementById("body")
  let element = document.createElement("div");
element.setAttribute("class", "alert-done")	
element.innerHTML = `<span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
  ${letters}`
alert.appendChild(element);
if_started = true
setTimeout(() =>{
element.parentNode.removeChild(element)
if_started = false
}, 3000)
}




var support_server = document.getElementById("support_join");

support_server.addEventListener("click", function() {
support_server.innerText = `Please Wait`;
fetch("api/join-support").then(response => response.json()).then(dreams => {
if(dreams.status !== true) {
support_server.innerHTML  = `<i class="fas fa-user-times"></i> Failed`;
start_alert(`Failed to join the server the error: ` + dreams.message)
}else{
support_server.innerHTML  = ` Done`
start_done(`Check your Discord Account and you will find the server`)
}
setTimeout(()=>{
support_server.innerHTML  = `<i class="fas fa-cog" id="support_server_text"></i> Support`
} , 3000)
})
});


