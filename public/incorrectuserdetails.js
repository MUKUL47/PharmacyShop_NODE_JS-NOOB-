//incorrect password/username
function incorrect(){
$("#incorrectdetails").html("Incorrect email or password");
$("#incorrectdetails").css("color","red");
}
function send(){
$("#incorrectdetails").html("");
}