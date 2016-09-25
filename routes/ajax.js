var express = require('express');
var router = express.Router();
//multer中间件 用来接收formdata的

var multer  = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + file.originalname.slice(-4))
  }
})

var upload = multer({ storage: storage })
/* GET ajax page. */
router.get('/',upload.any(), function(req, res, next) {
	 // res.render('index', { title: 'Express' });
  // res.send('Got a GET request');
  
  res.send({so: 'fan',data:req.query});
});
router.post('/',upload.any(), function(req, res, next) {
  // res.send('Got a POST request');
  console.log('req.files', req.files);
  console.log('req.body', req.body);
  res.send({so: 'fan',data:req.body});
});
router.delete('/', function(req, res, next) {
  res.send('Got a DELETE request');
});
router.head('/', function(req, res, next) {
  res.send('Got a HEAD request');
});

module.exports = router;
