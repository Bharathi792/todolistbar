//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash');
mongoose.connect('mongodb+srv://Bharathi:test123@cluster0-t4hxg.mongodb.net/todolistDB',{useNewUrlParser: true, useUnifiedTopology:true });
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model('Item',itemsSchema);
var item1 = new Item (
  {
    name:"cook food"
  }
);
var item2 = new Item (
  {
    name: "eat food"
  }
);
var item3 = new Item (
  {
    name: "clean vessels"
  }
);
const defaultItems = [item1,item2,item3];
const listSchema = new mongoose.Schema (
  {
    name:String,
    items: [itemsSchema]
  }
);
const List = mongoose.model('List',listSchema);

app.get("/", function(req, res) {
  Item.find({},function (error,docs){
    if(docs.length == 0 ){
      Item.insertMany(defaultItems,function (error){
        if(error){
          console.log(error);
        }
        else {
          console.log("success");
        }
      });
    }
    res.render("list", {listTitle: "Today", newListItems: docs});
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.listTitle;
  var nItem = new Item (
    {
      name: itemName
    }
  );
  if(listTitle=="Today"){
     nItem.save();
     res.redirect("/");
  }

else{
  List.findOne({name:listTitle},function(err,foundList){
    foundList.items.push(nItem);
    foundList.save();

  res.redirect("/"+listTitle);
  })
}



});


app.post('/delete',function(req,res){
  const checkedItemId = req.body.checkBox ;
  const listTitle = req.body.listTitle;
  if(listTitle== "Today"){
  console.log(checkedItemId);
 Item.findByIdAndRemove(checkedItemId,function(err){
   if(err){
   console.log("error");
 }
 else {
   console.log("success");
 }});
 res.redirect("/");
}else{
  List.findOneAndUpdate({name:listTitle},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listTitle);
    }
  } );

}
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT);




app.get('/:customListName',function(req,res){
const customListName =_.capitalize(req.params.customListName)  ;
List.findOne({name:customListName},function(err,docu){
  if(docu){
      res.render("list", {listTitle: customListName, newListItems: docu.items});
  }

  else{
    const list = new List({
      name:customListName,
      items: defaultItems
    });
    list.save();

        res.render("list", {listTitle: customListName, newListItems: list.items});
  }
})
    });
