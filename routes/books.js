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
    res.redirect("/books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("books/new-book", { book, errors: error.errors, title: "New Book" });
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }    
  }
}));

/* Important: the routes below must come after the simple named routes */


/* GET: view an individual book */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('books/view-book', { book, title: book.title }); 
  } else {
    res.render('books/page-not-found', { id: req.params.id });
  }
}));

/* GET: the form to edit a book */
router.get('/:id/edit', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('books/update-book', { book, title: book.title }); 
  } else {
    res.render('books/page-not-found', { id: req.params.id });
  }
}));

/* POST: the form to edit a book */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let book;
  console.log ("req.params.id: " + req.params.id);
  console.log ("req.body: " + req.body);
  try {
    book = await Book.update(req.body, { where: { id: req.params.id }});
    res.redirect("/books");
  } catch (error) {
    console.log("POST Edit Error: ", error);
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      res.render("books/update-book", { book, errors: error.errors, title: book.title });
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }    
  }
}));

/* GET: the form to delete a book */
router.get('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('books/delete-book', { book, title: book.title }); 
  } else {
    res.render('books/page-not-found', { id: req.params.id });
  }
}));

/* POST: delete a book */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    res.render('books/page-not-found', { id: req.params.id });
  }
}));




module.exports = router;
