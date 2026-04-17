import React, { useState, useEffect } from 'react';
import { Typography, Divider } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function UserPhotos() {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // fetch photos of the user when the component mounts or when userId changes
  useEffect(() => {
    async function fetchUserPhotos() {
      try {
        const response = await api.get('/photosOfUser/' + userId);
        setPhotos(response.data);
      } catch (error) {
        console.error('Error fetching user photos:', error);
      }
    }

    async function fetchUserInfo() {
      try {
        const response = await api.get('/user/' + userId);
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }

    fetchUserPhotos();
    fetchUserInfo();
    setMounted(true);
  }, [userId]);

  return (
    <div>
      {mounted && photos.length === 0 && (
        <Typography variant="body1">No photos found for this user.</Typography>
      )}
      <div>
        {/* display photos in a list */}
        {photos.map((photo) => (
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
        ))}
      </div>
    </div>
  );
}

export default UserPhotos;