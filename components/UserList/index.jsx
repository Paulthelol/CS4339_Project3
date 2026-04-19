import React, { useEffect, Fragment } from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import './styles.css';
import api from '../../lib/api';
import { useQuery } from '@tanstack/react-query';

function UserList() {
  const { userId } = useParams();

  const { data: userList, isLoading, error } = useQuery({
    queryKey: ['userList'],
    queryFn: async () => {
      const response = await api.get('/user/list');
      return response.data;
    }
  });

  return (
    <div>
      <List component="nav">
        {isLoading ? (
          <Typography variant="body1">Loading users...</Typography>
        ) : (
          {/* display the list of users, with a link to each user's detail page */ },
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
        )}
      </List>
    </div>
  );
}

export default UserList;
