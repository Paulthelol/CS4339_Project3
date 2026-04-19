import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import './styles.css';
import { Link, useParams, useMatch } from 'react-router-dom';
import api from '../../lib/api';

function TopBar() {
  const { userId } = useParams();
  const matchProfile = useMatch('/users/:userId');
  const matchPhotos = useMatch('/users/:userId/photos');

  const { data: userInfo, isLoading, error } = useQuery({
    queryKey: ['details', userId],
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
        {isLoading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : error ? (
          <Typography variant="body1">Error loading user info.</Typography>
        ) : (
        <Typography>
          {userInfo == null ? `Home` : `${userInfo.first_name} ${userInfo.last_name}'s ${matchProfile ? 'Profile' : matchPhotos ? 'Photos' : 'Page'}`}
        </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
