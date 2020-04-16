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

/* GET an individual book */
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render('books/book', { book, title: book.title }); 
  } else {
    res.sendStatus(404);
  }
}));

/* GET a new book form. */
router.get('/new', (req, res) => {
  res.render('books/new', { book: {}, title: 'New Book' });
});




module.exports = router;
