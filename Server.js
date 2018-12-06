
var exp=require('express')
var node=exp();
var bp=require('body-parser');
node.use(bp.urlencoded({extended:true}));
node.use(exp.static("public"));
let s=require('./Admin_Server')

var stringify = require('node-stringify');
var mongo=require('mongoose');
mongo.connect("mongodb://localhost/MYPHARMACY");
//user details
var userschema=new mongo.Schema({
	name:String,
	email:String,
	password:String,
	medname:[],
	reason:[],
	quantity:[],
	comments:[],
	status:[]
   

	});
var users=mongo.model("users",userschema);
//medicinedetails
var medicineDetails=new mongo.Schema({
	name:String,
	mgQuant:String, //quant(int)+""+mg
	tablets:Number,
	description:String,
	expiryDate:String,
	date:String
})

var medDet=mongo.model("medDetails",medicineDetails);

//comments
var comments=new mongo.Schema({
	comment:String,
	name:String,
	id:String
});
var Comments=mongo.model("comments",comments);


var c=0;
var contact_message="";
var requestresponse="";
var comments;
var request=[];
var logged_in=false;
var correct="";
var present="";
var username="";
var email_exist=false;
var id=0;
//offline transition
node.get("/login",function(req,res){
	res.render("mainlogin.ejs",{correct:""});
})
node.get("",function(req,res){
	res.render("frontpage.ejs",{username:username,message:""});
})
node.get("/register",function(req,res){
	res.render("register.ejs",{email_exist:email_exist});
})
// logout


node.get("/logout",function(req,res){
	
	console.log(username+"<->"+logged_in);
	logged_in=false;
	id="";
	username="";
	console.log(username+"<->"+logged_in);
	res.render("frontpage.ejs",{username:"",message:""});
})
//feedback/comment section
node.get("/contact",function(req,res){

	Comments.find(function(e,x){
		res.render("contact.ejs",{logged_in:logged_in,comments:x,username:username,contact_message:""});
	});
	
	
})
//user request to admin
node.get("/request",function(req,res){
	if(logged_in==true){
		res.render("request.ejs",{username:username,requestresponse:""})
	}else{
	res.render("frontpage.ejs",{message:"You should be logged in to request",username:username});}
})
//show request requested by user
node.get("/myrequest",function(rq,rs){
var user_med;
var user_reason;
var user_res;
	users.find({_id:id},function(e,i){
		i.forEach(function(x){
			console.log(x["_id"]);
			rs.render("usersrequests.ejs",{y:x["medname"],z:x["reason"],z1:x["quantity"],z11:x["status"],username:username,id1:x["_id"]});
			 
		});
		
		
		
	})
	
	
})
//show med to users
node.get("/show",function(rq,rs){
	medDet.find({},function(e,i){
		rs.render("showmedicines.ejs",{username:username,y:i})
	})

});
node.post("/searchMed",function(req,res){
	if(req.body.name==""){
		medDet.find({},function(e,i){
		res.render("showmedicines.ejs",{username:username,y:i})
	})
	}
	else{
		var n=req.body.name.toUpperCase();
		console.log(n.length)
		var ns=[];
		medDet.find({},function(e,i){
		i.forEach(function(ee){
			var cn=ee.name;
			var c=0;
	
			for(var j=0;j<n.length;j++){
							if(n.charAt(j)==cn.charAt(j)){

					c++;
				}
			}
			
			if(c==n.length){
				
				ns.push(ee);
					}


		})	
		res.render("showmedicines.ejs",{username:username,y:ns})
		
	})
	}
})

//__________________________________
//register and store in db
node.post("/register",function(req,res){
	var email1=req.body.email;
	var userdata=[{name:req.body.name,
				   email:req.body.email,
				  password:req.body.pass}];
	users.find({"email":email1},function(e,i){
		if(i!="")
			{console.log(i);
			email_exist=false;
			res.render("register.ejs",{email_exist:true});
			}
		else{
			users.create(userdata,function(e,i){
				res.render("frontpage.ejs",{username:username,message:""});
			});
			
		};
	});
	
});
//login
node.post("/login",function(req,res){


var c=0;
var mail=req.body.email;
var password=req.body.pass;
if(mail=="admin@admin" && password=="pass"){
			res.render("admin.ejs");
		}
users.find({"email":mail},function(e,u){
	users.find({"password":password},function(ee,uu){
		
	if(u=="" || uu==""){
		res.render("mainlogin.ejs",{correct:"Incorrect username or password"});
	}
	else{
		users.find({
			$or:[
			{"email":mail}
			]
			},function(e,i){
			i.forEach(function(it){
				 username=(it["name"]);
				  id=it["_id"];
			})
			console.log(id+"<->"+username);
			logged_in=true;

			res.render("frontpage.ejs",{username:username,message:""});	
			});}	
		
	});})
});
//currentLoggedINperson

//__________________________________________________________________________________

//contact
node.post("/contact",function(req,res){
	contact_message="";
	if(logged_in==true)
	{	

var comment1=req.body.comment;
users.update({_id:id},{$push:{comments:comment1}},function(ee,ii){
			
			Comments.create({comment:comment1,name:username,id:id});
				})					
			
}

	

else if(req.body.email==""){
var comment1=req.body.comment;
Comments.create({comment:comment1,name:"Anonymous",id:"Anonymous"});
			
		}
else{
	var mail=req.body.email;
	var comment1=req.body.comment;
	var name;
	var id;
	
	users.find({email:mail},function(e,i){
		if(i.length==0){
			if(logged_in==true){
				contact_message=username+" you cannot comment from someone's email ID";
			}else{
			contact_message="Email not found";
			}
		}else{
		i.forEach(function(ii){
		id=ii._id;
		name=ii.name;	
		});
	Comments.create({comment:comment1,name:name,id:id});
		}
		
	})
	
}
console.log(c);

Comments.find(function(e,x){
		res.render("contact.ejs",{logged_in:logged_in,comments:x,username:username,contact_message:contact_message});

	})

});


//___________________________________________________________________________________
//request
node.post("/request",function(req,res){
		 
	users.update({_id:id},{$push:{medname:req.body.medicine}},function(ee,ii){
			console.log(ii)})
	users.update({_id:id},{$push:{reason:req.body.reason}},function(ee,ii){
			console.log(ii)})
	users.update({_id:id},{$push:{quantity:req.body.quantity+" ."}},function(ee,ii){
			console.log(ii)})
		users.update({_id:id},{$push:{status:"Pending"}},function(ee,ii){
			console.log(ii)})
		
	res.render("request.ejs",{username:username,requestresponse:"Your request has been recorded"})
})


//____________________________________________________________________________________
//admin
node.get("/5227946440369f7",function(req,res){
	res.render("admin.ejs");
})
node.get("/Admin_moduser_request",function(req,res){
	users.find({},function(e,i){
			res.render("Admin_moduser_request.ejs",{y:i});
	})})
	

node.get("/:id/:pos",function(req,res){
	var pos=req.params.pos;
	console.log("--->>"+pos)
	var id=req.params.id;
	console.log("--->>"+id)
	users.find({_id:id},function(e,i){
				i.forEach(function(ii){
				console.log(ii["status"][pos]);
				})
				i.forEach(function(ii){
				ii["status"][pos]="updated"
				})
				i.forEach(function(ii){
				console.log(ii["status"][pos]);
				})
				
			users.find({},function(e,i1){
			res.render("Admin_moduser_request.ejs",{y:i1});
	})	
			
	})

})
node.get("/addmed",function(req,res){
	users.find({},function(e,i){
			res.render("addmedicines_admin.ejs");
	})})

node.post("/admed",function(req,res){

	var meddata=[{
		name:req.body.medicine.toUpperCase(),
		mgQuant:req.body.quantity,
		tablets:req.body.tablets,
		description:req.body.reason,
		expiryDate:req.body.expiry,
		date:req.body.date
	}];
	medDet.create(meddata,function(e,i){
		console.log(i);
		res.render("admin.ejs");
	})
})




//________________________---
node.listen(201);

