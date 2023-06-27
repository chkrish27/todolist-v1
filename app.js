const express = require("express");

const bodyparser = require("body-parser");

const mongoose = require("mongoose");

const app= express();

const _=require("lodash");

app.use(bodyparser.urlencoded({extended: true}));

app.use(express.static("public"));


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-venkat:Venkat27vsk@cluster0.5jgmai4.mongodb.net/todolistDB');
}

const ItemSchema ={
    Name :String
};
const Item= mongoose.model("Item",ItemSchema);

const item1= new Item({
   Name:"Welcome to your toDoList"
});
const item2= new Item({
    Name:"Hit the + button to add an item."
 });
const item3= new Item({
    Name:"<-- Hit this to delete an item."
});

 const Defaultitem = [item1,item2,item3];

 const listSchema={
   Name: String,
   items: [ItemSchema]
 };
 
 const List=mongoose.model("List",listSchema);

app.set('view engine','ejs');
app.get("/",async(req,res)=>
{
  const found = await Item.find({ });
  if(found.length=== 0){
    try {
      Item.insertMany(Defaultitem);
        console.log("Successfully saved default items to DB.");
      } catch (err) {
        console.log(err);
      }
      res.redirect("/");
    }
    else{
    res.render("lists",{listtitle:"Today",newListItem:found});
    }
});

app.get("/:customListName",async(req,res)=>{
  const customListName=_.capitalize(req.params.customListName);
  
  const exist = await List.findOne({Name: customListName});

  if(!exist)
  {
    const list=new List({
      Name:customListName,
      items: Defaultitem
    });
    list.save();
    res.redirect("/"+customListName);
  }
  else
  {
    res.render("lists",{listtitle:exist.Name,newListItem:exist.items});
  }
  
});

app.post("/",async(req,res)=>
{
    var itemName = req.body.nexttodo;
    const listName = req.body.list;

    const item = new Item({
      Name: itemName
    });
    if(listName==="Today")
    {
      item.save();
      res.redirect("/");
    }
    else{
      const foundlist = await List.findOne({Name:listName});
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);

    }
    
});

app.post("/delete",function(req,res)
{
  const listName=req.body.listName;
  const deleted = req.body.checkbox;
  if(listName==="Today")
  {
  async function deleteDocumentById(id) {
    try {
      const deletedDocument = await Item.findByIdAndDelete(id);
      console.log("successfull deleted Itme:"+deletedDocument);
    } catch (err) {
      console.log(err);
    }
  }
  deleteDocumentById(deleted);
  res.redirect("/");
}else{
  async function removeElementFromArray() {
    try {
      const updatedDocument = await List.findOneAndUpdate(
        { Name:listName},
        { $pull: { items: {_id:deleted}}},
        { new: true }
      );
      console.log(updatedDocument);
      res.redirect("/"+listName);
    } catch (err) {
      console.log(err);
    }
  }
  removeElementFromArray();
}
 
});

const PORT = process.env.PORT || 3000;

// your code

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
