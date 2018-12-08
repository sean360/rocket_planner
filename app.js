const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//   Connection URL
const url = 'mongodb://localhost:27017';

//   Database Name
const dbName = 'todoListDB';

//  connect to database
mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true });

/*
*Create the list item and also declare the default list items to insert into the database if nothing exists
 */

//  create our schema
const itemsSchema = {
  name: String
};

//  create our Modal
const Item = mongoose.model('Item', itemsSchema);

//  create Item using our model
const todoOne = new Item({
  name: 'Welcome to your todo list'
});

const todoTwo = new Item({
  name: 'Hit the + icon to add and item'
});

const todoThree = new Item({
  name: '<-- Tick an item to delete it'
});

const defaultItems = [todoOne, todoTwo, todoThree];

/*
*END SECTION ***************************************************************************************
 */

/*
*Create the list i and also declare the default list items to insert into the database if nothing exists
 */

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

app.get('/', (req, res) => {

  Item.find({}, (err, itemsFound) => {

    if (itemsFound.length > 0) {
      res.render('list', { listTitle: 'Today', newListItems: itemsFound });
    } else {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log(`Test Data has been inserted`);
        }
      });
      res.redirect('/');
    }

  });

});

app.get('/:customListName', (req, res) => {

  //  get the custom list name created by the user
  const customListName = _.capitalize(req.params.customListName)  ;

  List.findOne({ name: customListName }, (err, foundlist) => {

    if (!err) {

      if (!foundlist) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();

        res.redirect('/' + customListName);
      } else {

        res.render('list', { listTitle: foundlist.name, newListItems: foundlist.items });

      }

    }

  });

  //   list.save();

});



//  POST ROUTE FOR NEW ITEM
app.post('/', (req, res) => {

  //  get value of new item and list
  const itemName = req.body.newItem;
  const listName = req.body.list;

  //   create model
  const item = new Item({
    name: itemName
  });

  if (listName === 'Today'){
    //  save to db and redirect
  item.save();
  res.redirect('/');
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      if (!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listName);
      }
    });
  }

});

//  POST ROUTE TO DELETE ITEM
app.post('/delete', (req, res) => {
  const listItemID = req.body.itemID;
  const listName = req.body.listName;

  if (listName === 'Today'){

    Item.findOneAndDelete({ _id: listItemID }, (err) => {
      if (!err) {
        res.redirect('/');
      }
    });

  } else {
    List.findOneAndUpdate({name: listName}, 
      {$pull: {items: {_id: listItemID}}}, 
      (err, foindList) => {
        if (!err){
          res.redirect('/' + listName);
        }
    });
  }

});

app.get('/work', function (req, res) {
  res.render('list', { listTitle: 'Work List', newListItems: workItems });
});

app.get('/about', function (req, res) {
  res.render('about');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});
