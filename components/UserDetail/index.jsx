import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Button, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import api from '../../lib/api';

import './styles.css';

function UserDetail() {
  const { userId } = useParams();
  const [userDetail, setUserDetail] = useState(null);
  const [noUser, setNoUser] = useState(false);

  // fetch user details when the component mounts or when userId changes
  useEffect(() => {
    async function fetchUserDetail() {
      if (!userId) {
        setUserDetail(null);
        return;
      }

      try {
        const response = await api.get('/user/' + userId);
        setUserDetail(response.data);
        setNoUser(false);
      } catch (error) {
        console.error('Error fetching user detail:', error);
        setNoUser(true);
      }
    }
    fetchUserDetail();
  }, [userId]);

  return (
    <div className="userDetail-container">
      {noUser ? (
        <Typography variant="h2" className="userDetail-title">User not found.</Typography>
      ) : (
        <>
          <Typography variant="h2" className="userDetail-title">
            {userDetail ? userDetail.first_name + ' ' + userDetail.last_name : 'Loading user details...'}
          </Typography>
          <Typography variant="body1" className="userDetail-row">
            {userDetail ? `Location: ${userDetail.location}` : 'Loading user details...'}
          </Typography>
          <Typography variant="body1" className="userDetail-row">
            {userDetail ? `Description: ${userDetail.description}` : 'Loading user details...'}
          </Typography>
          <Typography variant="body1" className="userDetail-row">
            {userDetail ? `Occupation: ${userDetail.occupation}` : 'Loading user details...'}
          </Typography>
          <Link to={`/users/${userId}/photos`} className="userDetail-actionLink">
            <Button variant="contained" color="primary">
              View Photos
            </Button>
          </Link>
        </>
      )}
    </div>

  );
}



export default UserDetail;
