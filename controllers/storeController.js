const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      next(null, true)
    } else {
      next({ message: `That filetype isn't allowed!` }, false)
    }
  }
}

exports.homePage = (req, res) => {
  // flash examples
  // req.flash('error', 'Something went wrong')
  // req.flash('error', 'OH NO!!!')
  // req.flash('error', '<strong>something went strong</strong>')
  // req.flash('info', 'Some knowledge')
  // req.flash('warning', 'Something went somewhere')
  // req.flash('success', 'Something went right')
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

// exports.createStore = (req, res) => {
//   const store = new Store(req.body);
//   store
//     .save()
//     .then(store => {
//       return Store.find();
//     })
//     .then(stores => {
//       res.render('storeList', { stores: stores });
//     })
//     .catch(err => {
//       throw Error(err);
//     });
// };

exports.upload = multer(multerOptions).single('photo')

exports.resize = async (req, res, next) => {
  if(!req.file) {
    next()
    return
  }
  console.log(req.file)
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`
  // resize the image
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`.public/uploads/${req.body.photo}`)
  next()
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully Created ${store.name}, Care to leave a review?`)
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. query db for list of stores
  const stores = await Store.find()
  res.render('stores', { title: 'Stores', stores})
}

exports.editStore = async (req, res) => {
  // find the store given the ID
  const store = await Store.findOne({ _id: req.params.id })
  // check if user is owner of store entry

  // render out the edit form so the user can make changes
  res.render('editStore', { title: `Edit ${store.name}`, store })
}

exports.updateStore = async (req, res) => {
  // set location as point
  req.body.location.type = 'Point'
  // find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // returns the new store instead of the old store
    runValidators: true // force model to validate
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores.${store.slug}">View Store >></a>`)
  res.redirect(`/stores/${store._id}/edit`)
}