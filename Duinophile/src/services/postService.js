import api from './api';

// Get all public posts
export const getAllPosts = async () => {
  const response = await api.get('/api/posts');
  return response.data;
};

// Get posts by user
export const getPostsByUser = async userId => {
  const response = await api.get(`/api/posts/user/${userId}`);
  return response.data;
};

// Get single post
export const getPostById = async postId => {
  const response = await api.get(`/api/posts/${postId}`);
  return response.data;
};

// Create post with image
export const createPost = async postData => {
  const formData = new FormData();
  formData.append('title', postData.title);
  formData.append('description', postData.description || '');
  formData.append('achievementType', postData.achievementType);
  formData.append('level', postData.level?.toString() || '');
  formData.append('isPublic', postData.isPublic ? 'true' : 'false');
  formData.append('userId', postData.userId);

  if (postData.image) {
    formData.append('image', {
      uri: postData.image.uri,
      type: postData.image.type || 'image/jpeg',
      name: postData.image.fileName || 'photo.jpg',
    });
  }

  const response = await api.post('/api/posts', formData, {
    timeout: 120000,
  });
  return response.data;
};

// Update post
export const updatePost = async (postId, postData) => {
  const formData = new FormData();
  formData.append('title', postData.title);
  formData.append('description', postData.description ?? '');
  formData.append('achievementType', postData.achievementType);
  formData.append(
    'level',
    postData.level != null && postData.level !== ''
      ? String(postData.level)
      : '',
  );
  formData.append(
    'isPublic',
    postData.isPublic !== false ? 'true' : 'false',
  );

  if (postData.image) {
    formData.append('image', {
      uri: postData.image.uri,
      type: postData.image.type || 'image/jpeg',
      name: postData.image.fileName || 'photo.jpg',
    });
  }

  const response = await api.put(`/api/posts/${postId}`, formData, {
    timeout: 120000,
  });
  return response.data;
};

// Delete post
export const deletePost = async postId => {
  const response = await api.delete(`/api/posts/${postId}`);
  return response.data;
};

// Like/Unlike post
export const likePost = async (postId, userId) => {
  const response = await api.put(`/api/posts/${postId}/like`, { userId });
  return response.data;
};

// Add comment
export const addComment = async (postId, userId, text) => {
  const response = await api.post(`/api/posts/${postId}/comment`, {
    userId,
    text,
  });
  return response.data;
};

// User services
export const createUser = async userData => {
  const response = await api.post('/api/users', userData);
  return response.data;
};

export const getUserById = async userId => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/api/users/${userId}`, userData);
  return response.data;
};