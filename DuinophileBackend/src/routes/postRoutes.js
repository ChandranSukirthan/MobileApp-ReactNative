const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getAllPosts,
  getPostById,
  getPostsByUser,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
} = require('../controllers/postController');

// GET all posts
router.get('/', getAllPosts);

// GET posts by user
router.get('/user/:userId', getPostsByUser);

// GET single post
router.get('/:id', getPostById);

// POST create post (with image upload)
router.post('/', upload.single('image'), createPost);

// PUT update post (with image upload)
router.put('/:id', upload.single('image'), updatePost);

// DELETE post
router.delete('/:id', deletePost);

// PUT like/unlike post
router.put('/:id/like', likePost);

// POST add comment
router.post('/:id/comment', addComment);

module.exports = router;