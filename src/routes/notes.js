const express = require("express");
const { send } = require("express/lib/response");
const router = express.Router();

const Note = require('../models/Note');

const { isAuthenticated } = require('../helpers/auth');

router.get("/notes/add", isAuthenticated, (req, res) => {
  res.render("notes/new-note");
});

router.post("/notes/new-note", isAuthenticated, async (req, res) => {
  const { title, description } = req.body;
  const errors = [];
  if (!title) {
    errors.push({ text: "Por favor inserte un título" });
  }
  if (!description) {
    errors.push({ text: "Por favor inserte una descripción" });
  }
  if (errors.length > 0) {
    res.render("notes/new-note", {
      errors,
      title,
      description,
    });
  } else {
   
    const newNote = new Note({title,description});
    newNote.user = req.user.id;
    await newNote.save();
    req.flash('success_msg','Note Added Successfully')
    res.redirect("/notes");
  }
});

router.get("/notes", isAuthenticated, async (req, res) => {
    
    const notes = await Note.find({user: req.user.id}).lean().sort({date: 'desc'});
    
    res.render('notes/all-notes', { notes });

});

router.get('/notes/edit/:id', isAuthenticated, async (req,res)=>{
    const note = await Note.findById(req.params.id).lean();
    res.render('notes/edit-notes', {note});
});


router.put('/notes/edit-note/:id', async (req,res)=>{
    const { title, description } = req.body;
    console.log(req.body);
    await Note.findByIdAndUpdate(req.params.id,{title,description});
    req.flash('success_msg','Note Updated Successfully')
    res.redirect('/notes');

});

router.delete('/notes/delete/:id', isAuthenticated,  async (req,res)=>{
    console.log(req.params.id);
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg','Note Deleted Successfully')
    res.redirect('/notes');
});


module.exports = router;
