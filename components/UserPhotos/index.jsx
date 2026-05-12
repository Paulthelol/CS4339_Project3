import React, { useState } from 'react';
import { Typography, Divider } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

// Thumbs Up for like button
import { FaThumbsUp } from 'react-icons/fa';

import './styles.css';

function UserPhotos() {
  const { userId } = useParams();
  const [commentText, setCommentText] = useState([]);

  const queryClient = useQueryClient();

  // Load info of the user
  const { data: userInfo, isLoading, error: userInfoError } = useQuery({
    queryKey: ['userInfo', userId],
    queryFn: async () => {
      const response = await api.get('/user/' + userId);
      return response.data;
    }
  });

  // Load photos
  const { data: photos, isLoading: photosLoading, error: photosError } = useQuery({
    queryKey: ['userPhotos', userId],
    queryFn: async () => {
      const response = await api.get('/photosOfUser/' + userId);
      return response.data;
    }
  });

  // Add comment
  const mutation = useMutation({
    mutationFn: async ({photoId, comment}) => {
      const response = await api.post('/commentsOfPhoto/' + photoId, { comment });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhotos', userId] });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
    }
  });

  function handleAddComment(photoId, comment) {
    mutation.mutate({ photoId, comment });
    setCommentText({ ...commentText, [photoId]: '' });
  }

  // Gets the user's id to check for likes
  const { data: currentUser } = useQuery({
  queryKey: ['admin-me'],
  retry: false,
  queryFn: async () => {
    const response = await api.get('/admin/me');
    return response.data;
  },
});

  // Like photo
  const likeMutation = useMutation({
    mutationFn: async (photoId) => {
      const response = await api.post(`/photos/${photoId}/like`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhotos', userId] });
    },
    onError: (error) => {
      console.error('Error liking photo:', error);
    }
  });

  function handleKeyDown(e, photoId, comment) {
    if (e.key === 'Enter') {
      handleAddComment(photoId, comment);
    }
  }

  return (
    <div>
      {photosLoading && photos?.length === 0 && (
        <Typography variant="body1">No photos found for this user.</Typography>
      )}
      <div>
        {/* display photos in a list */}
        {isLoading ? (
          <Typography variant="body1">Loading photos...</Typography>
        ) : (userInfoError || photosError) ? (
          <Typography variant="body1">Error loading photos.</Typography>
        ) : (
          photos?.map((photo) => (
            <div key={photo._id} className="photo-item">
              <div className='photo-header'>
                <Typography variant="h6">{userInfo.first_name + ' ' + userInfo.last_name}</Typography>
                <Typography variant="body1">{new Date(photo.date_time).toLocaleString()}</Typography>
              </div>
              <img src={ photo.file_name} alt={photo.file_name} className="photo-image" />
              <div className='photo-likes'>
                <Typography variant="body1">{photo.likes.length} {photo.likes.length === 1 ? 'like' : 'likes'}</Typography>
                <button className='likeButton' onClick={() => likeMutation.mutate(photo._id)}>
                  <FaThumbsUp className={photo.likes.includes(currentUser._id) ? 'liked' : 'unliked'}/>
                </button>
              </div>
              <Typography variant="body1" className='comment-header'>Comments:</Typography>
            <div />
            {!photo.comments && <Typography variant="body1" className="comment">No comments found for this photo.</Typography>}

            {/* display comments for the photo */}
            {photo.comments && photo.comments.map((commentObj) => (
              <div key={commentObj._id}>
                <div className="comment">
                  <Link to={`/users/${commentObj.user._id}`} className="comment-userLink">
                    <Typography variant="h6">{commentObj.user.first_name + ' ' + commentObj.user.last_name}</Typography>
                  </Link>
                  <Typography variant="body1">{new Date(commentObj.date_time).toLocaleString()}</Typography>
                  <Typography variant="body1">{commentObj.comment}</Typography>
                </div>
                <Divider />
              </div> 
            ))}

            {/* Comment Box */}
            <div className='commentBox'>
              <input onKeyDown={(e) => handleKeyDown(e, photo._id, commentText[photo._id])} type="text" value={commentText[photo._id] || ''} onChange={(e) => setCommentText({ ...commentText, [photo._id]: e.target.value })} placeholder="Add a comment..." className="commentInput" />
              <button onClick={() => handleAddComment(photo._id, commentText[photo._id])} className='commentButton'>Add Comment</button>
            </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UserPhotos;