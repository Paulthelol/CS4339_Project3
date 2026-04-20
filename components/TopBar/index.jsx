import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useMatch } from 'react-router-dom';

import api from '../../lib/api';
import './styles.css';

function TopBar() {
  const { userId } = useParams();
  const matchProfile = useMatch('/users/:userId');
  const matchPhotos = useMatch('/users/:userId/photos');

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

  const { data: userInfo, isLoading, error } = useQuery({
    queryKey: ['details', userId],
    enabled: Boolean(userId) && Boolean(sessionUser),
    queryFn: async () => {
      const response = await api.get('/user/' + userId);
      return response.data;
    }
  });

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Link to="/">
          <Typography variant="h5" color="inherit">
            Paul Betzen
          </Typography>
        </Link>
        <div style={{ flexGrow: 1 }} />
        {isAuthLoading ? (
          <Typography variant="body1">Checking session...</Typography>
        ) : authError ? (
          <a href="/login">
            <Typography variant="body1">
              Login/Register
            </Typography>
          </a>
        ) : isLoading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : error ? (
          <Typography variant="body1">Error loading user info.</Typography>
        ) : (
          <div>
            <Typography fontWeight="bold">
              {userInfo == null ? `Home` : `${userInfo.first_name} ${userInfo.last_name}'s ${matchProfile ? 'Profile' : matchPhotos ? 'Photos' : 'Page'}`}
            </Typography>
            <a href="/logout"><Typography variant="body1">Logout</Typography></a>
          </div>

        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
