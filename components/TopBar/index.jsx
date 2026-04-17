import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

import './styles.css';
import { Link, useParams, useMatch } from 'react-router-dom';
import api from '../../lib/api';

function TopBar() {
  const { userId } = useParams();
  const matchProfile = useMatch('/users/:userId');
  const matchPhotos = useMatch('/users/:userId/photos');
  const [userInfo, setUserInfo] = useState(null);

  // fetch user info when the component mounts or when userId changes
  useEffect(() => {
    async function fetchUserInfo() {
      if (!userId) {
        setUserInfo(null);
        return;
      }

      try {
        const response = await api.get(`/user/${userId}`);
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }
    fetchUserInfo();
  }, [userId]);

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Link to="/">
          <Typography variant="h5" color="inherit">
            Paul Betzen
          </Typography>
        </Link>
        <div style={{ flexGrow: 1 }} />
        <Typography>
          {userInfo == null ? `Home` : `${userInfo.first_name} ${userInfo.last_name}'s ${matchProfile ? 'Profile' : matchPhotos ? 'Photos' : 'Page'}`}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
