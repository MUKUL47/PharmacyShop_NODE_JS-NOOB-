function f(){


$("#delete").click(function(){
$("#message").text("CLICK ON BELOW MESSAGE TO DELETE MEDICINE");
$("#med").click(function(){
	$(this).parent().fadeOut();
	$(this).remove();
	console.log(data);
})
});
$("#edit").click(function(){
$("#message").text("DOUBLE CLICK ON THE TEXT TO EDIT");
});
}
