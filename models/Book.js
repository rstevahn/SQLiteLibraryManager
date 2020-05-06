// jshint esversion: 9
'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Book extends Sequelize.Model {}
  Book.init({
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
          notEmpty: { msg: '"Title" is required'},
          notNull: { msg: '"Title" is required'}
      }
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: '"Author" is required'},
        notNull: { msg: '"Author" is required'}
      }
    },
    genre: Sequelize.STRING, // optional
    year: {
      type: Sequelize.INTEGER,
      validate: {
        is: {args: /^[0-9]+$/i, msg: '"Year" must be a numeric year'}, // regex for unsigned integers only
        min: {args: 1000, msg: '"Year" must be 1000 or greater'},
        max: {args: 2050, msg: '"Year" must be less than 2051'}
      }
    }
  }, { sequelize });

  return Book;
};
