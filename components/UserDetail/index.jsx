import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Button, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import api from '../../lib/api';
import './styles.css';

function UserDetail() {
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
  
  const { data: userDetail, isLoading, error } = useQuery({
    queryKey: ['details', userId],
    enabled: Boolean(userId) && Boolean(sessionUser),
    queryFn: async () => {
      const response = await api.get('/user/' + userId);
      return response.data;
    }
  });

  return (
    <div className="userDetail-container">
      {isAuthLoading ? (
        <Typography variant="h2" className="userDetail-title">
           Checking session...
        </Typography>
      ) : authError ? (
        <Typography variant="h2" className="userDetail-title">Please log in.</Typography>
      ) : isLoading ? (
        <Typography variant="h2" className="userDetail-title">
           Loading user details...
        </Typography>
      ) : error ? (
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
