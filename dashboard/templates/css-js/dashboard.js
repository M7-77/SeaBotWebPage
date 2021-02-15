let guildID = document.baseURI.split("/").reverse()[0]
localStorage.setItem("guildID", guildID);


let if_started = false
let set = null


fetch("/api/settings/" + guildID).then(response => response.json()).then(settings => {
set = settings
let prefix_em = document.getElementById("settings-prefix");
prefix_em.setAttribute("value" ,settings.prefix)
prefix_em.addEventListener("update", event => {
set.prefix = prefix_em.value
});
})



function check(){

let settings = {
prefix:document.getElementById("settings-prefix").value
}
let able = false
for(let data of Object.keys(set)){
if(set[data] !== settings[data]) able= true
}
if(able === true) {
var alert = document.getElementById("body")
  let element = document.createElement("div");
element.setAttribute("class", "alert-done")	
element.innerHTML = `<span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
  Save`
alert.appendChild(element);
if_started = element

}else{
if(if_started !== false) {
if_started.parentNode.removeChild(if_started)
if_started = false
}
}



}