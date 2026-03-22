const Post = require('../models/Post');
const { successResponse, errorResponse } = require('../utils/response');


const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ isPublic: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    return successResponse(res, posts, 'Posts fetched successfully');
  } catch (error) {
    next(error);
  }
};


const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar');

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    return successResponse(res, post, 'Post fetched successfully');
  } catch (error) {
    next(error);
  }
};


const getPostsByUser = async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    return successResponse(res, posts, 'User posts fetched successfully');
  } catch (error) {
    next(error);
  }
};


const createPost = async (req, res, next) => {
  try {
    const { title, description, achievementType, level, isPublic, userId } =
      req.body;

    if (!title || !achievementType || !userId) {
      return errorResponse(
        res,
        'Title, achievement type and userId are required',
        400
      );
    }

    const imageUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : null;

    const post = await Post.create({
      title,
      description,
      achievementType,
      level: level ? Number(level) : null,
      isPublic: isPublic !== undefined ? isPublic : true,
      image: imageUrl,
      user: userId,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'user',
      'name avatar'
    );

    return successResponse(res, populatedPost, 'Post created successfully', 201);
  } catch (error) {
    next(error);
  }
};


const updatePost = async (req, res, next) => {
  try {
    const { title, description, achievementType, level, isPublic } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    const imageUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : post.image;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: title || post.title,
        description: description || post.description,
        achievementType: achievementType || post.achievementType,
        level: level ? Number(level) : post.level,
        isPublic: isPublic !== undefined ? isPublic : post.isPublic,
        image: imageUrl,
      },
      { new: true, runValidators: true }
    ).populate('user', 'name avatar');

    return successResponse(res, updatedPost, 'Post updated successfully');
  } catch (error) {
    next(error);
  }
};


const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    await Post.findByIdAndDelete(req.params.id);

    return successResponse(res, null, 'Post deleted successfully');
  } catch (error) {
    next(error);
  }
};


const likePost = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return successResponse(
      res,
      { likes: post.likes.length, isLiked: !isLiked },
      isLiked ? 'Post unliked' : 'Post liked'
    );
  } catch (error) {
    next(error);
  }
};


const addComment = async (req, res, next) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return errorResponse(res, 'userId and text are required', 400);
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    post.comments.push({ user: userId, text });
    await post.save();

    const updatedPost = await Post.findById(req.params.id).populate(
      'comments.user',
      'name avatar'
    );

    return successResponse(
      res,
      updatedPost.comments,
      'Comment added successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  getPostsByUser,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
};