// jshint esversion: 9

// Book Routes


// globals

var express = require('express');
var router = express.Router();
const Book = require('../models').Book;
const { Op } = require('sequelize');
let books; // the current list of books, initialized when we first render our index
const booksPerPage = 10; // for pagination
let numberOfBooks = 0; // we will query for this
let offset = 0; // for pagination
let searchTerm = null; // the search POST route will set this, the index GET route will reset it

// helper functions

// Async handler function to wrap each route

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
  let where = {};
  if (searchTerm) { // set up the where clause for the query
    where = { // collation was set up in the model to be case insensitive. This will match anything containing the search term.
      [Op.or]: [
        {title: {
          [Op.substring]: searchTerm
          }
        },
        {author: {
          [Op.substring]: searchTerm
          }
        },
        {genre: {
          [Op.substring]: searchTerm
          }
        },
        {year: {
          [Op.substring]: searchTerm
          }
        }
      ]
    };
  }
  const query = { // our query
    order: [['title', 'ASC']], // sort by ascending book title
    limit: booksPerPage, // pagination limit
    offset, // start with this item
    where // include search query if applicable (will be empty if not)
  };
  const results = await Book.findAndCountAll(query);
  numberOfBooks = results.count; // total number of results
  books = results.rows; // the results
  if (numberOfBooks) {
    res.render('books/index', 
                { books, 
                  title: 'Library Manager',
                  pages:  Math.ceil(numberOfBooks / booksPerPage),
                  numberOfBooks,
                  searchTerm
                });
   
  } else {
    res.render('books/no-results', { searchTerm });
  }
  searchTerm = null; // reset the search term
}));

/* GET the first page of books (Home) */
router.get('/home', (req, res) => {
  offset = 0;
  res.redirect('/');
});

/* GET the previous page of books (Prev) */
router.get('/prev', (req, res) => {
  if (offset > 0) {
    offset -= booksPerPage;
  }
  res.redirect('/');
});

/* GET the next page of books (Next) */
router.get('/next', (req, res) => {
  const lastOffset = Math.floor(numberOfBooks / booksPerPage) * booksPerPage;
  if (offset < lastOffset) {
    offset += booksPerPage;
  }
  res.redirect('/');
});
  
/* GET the last page of books (End) */
router.get('/end', (req, res) => {
  const lastOffset = Math.floor(numberOfBooks / booksPerPage) * booksPerPage;
  offset = lastOffset;
  res.redirect('/');
});

/* POST a new search */
router.post('/search', asyncHandler(async (req, res) => {
  searchTerm = req.body.search; // store the search term
  offset = 0; // reset the offset
  res.redirect('/'); // redirect
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
      book = await Book.build(req.body); // validation error, display the error
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
  try {
    book = await Book.update(req.body, { where: { id: req.params.id }});
    res.redirect("/books");
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body); // validation error, display the error
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
