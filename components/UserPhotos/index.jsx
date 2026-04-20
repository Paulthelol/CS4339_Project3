import React from 'react';
import { Typography, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';

import api from '../../lib/api';
import './styles.css';

function UserPhotos() {
  const { userId } = useParams();

  const {
    data: sessionUser,
    isLoading: isAuthLoading,
    isError: authError,
  } = useQuery({
    queryKey: ['admin-me'],
    retry: false,
    queryFn: async () => {
      const response = await api.get('/admin/me');
      return response.data;
    },
  });

  const { data: userInfo, isLoading } = useQuery({
    queryKey: ['userInfo', userId],
    enabled: Boolean(userId) && Boolean(sessionUser),
    queryFn: async () => {
      const response = await api.get('/user/' + userId);
      return response.data;
    }
  });

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['userPhotos', userId],
    enabled: Boolean(userId) && Boolean(sessionUser),
    queryFn: async () => {
      const response = await api.get('/photosOfUser/' + userId);
      return response.data;
    }
  });

  return (
    <div>
      {isAuthLoading && (
        <Typography variant="body1">Checking session...</Typography>
      )}
      {authError && (
        <Typography variant="body1">Please log in to view photos.</Typography>
      )}
      {!isAuthLoading && !authError && (
      <>
      {photosLoading && photos?.length === 0 && (
        <Typography variant="body1">No photos found for this user.</Typography>
      )}
      <div>
        {/* display photos in a list */}
        {(photosLoading && isLoading) ? (
          <Typography variant="body1">Loading photos...</Typography>
        ) : (
          photos?.map((photo) => (
            <div key={photo._id} className="photo-item">
              <div className='photo-header'>
                <Typography variant="h6">{userInfo.first_name + ' ' + userInfo.last_name}</Typography>
                <Typography variant="body1">{new Date(photo.date_time).toLocaleString()}</Typography>
              </div>
            <img src={`/images/` + photo.file_name} alt={photo.file_name} className="photo-image" />
            <Typography variant="body1" className='comment-header'>Comments:</Typography>
            <Divider />
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
            </div>
        )))}
      </div>
      </>
      )}
    </div>
  );
}

export default UserPhotos;