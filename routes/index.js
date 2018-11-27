const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  // res.send('Hey! It works!');
  res.render('hello')
});

router.get('/reverse/:name', (req, res) => {
  const input = req.params.name
  const reversed = input.split('').reverse().join('')
  res.send(reversed)
})

module.exports = router;
