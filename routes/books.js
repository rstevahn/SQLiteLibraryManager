// jshint esversion: 9
var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next);
    } catch(error){
      res.status(500).send(error);
    }
  };
}

/* GET the table of books */
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({order: [['title', 'ASC']]});
  res.render('books/index', { books, title: 'Library Manager' });
}));

/* GET a new book form */
router.get('/new', (req, res) => {
  res.render('books/new-book', { book: {}, title: 'New Book' });
});

/* POST a new book */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + article.id);
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("books/new-book", { book, errors: error.errors, title: "New Book" });
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }    
  }
}));

/* GET an individual book */
/* Important: this route must be below the other simple named routes */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('books/update-book', { book, title: book.title }); 
  } else {
    res.sendStatus(404);
  }
}));




module.exports = router;
