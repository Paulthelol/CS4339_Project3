import React, { Fragment } from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import './styles.css';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

function UserList() {
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

  const { data: userList = [], isLoading, error } = useQuery({
    queryKey: ['userList'],
    enabled: Boolean(sessionUser),
    queryFn: async () => {
      const response = await api.get('/user/list');
      return response.data;
    }
  });

  return (
    <div>
      <List component="nav">
        {isAuthLoading ? (
          <Typography variant="body1">Checking session...</Typography>
        ) : authError ? (
          <Typography variant="body1">Please log in to view users.</Typography>
        ) : isLoading ? (
          <Typography variant="body1">Loading users...</Typography>
        ) : error ? (
          <Typography variant="body1">Error loading users.</Typography>
        ) : (
          !Array.isArray(userList) || userList.length === 0 ? (
            <Typography variant="body1">No users found.</Typography>
          ) : (
            userList.map((user) => (
              <Fragment key={user._id}>
                <Divider />
                <div className={user._id === userId ? 'UserListElement--active' : 'UserListElement'}>
                  <Link to={`/users/${user._id}`} >
                    <ListItem>
                      <ListItemText primary={user.first_name + ' ' + user.last_name} />
                    </ListItem>
                  </Link>
                </div>
                <Divider />
              </Fragment>
            ))
          )
        )}
      </List>
    </div>
  );
}

export default UserList;