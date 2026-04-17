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

function UserList() {
  const [userList, setUserList] = React.useState([]);
  const [mounted, setMounted] = React.useState(false);
  const { userId } = useParams();

  // fetch the list of users when the component mounts
  useEffect(() => {
    async function fetchUserList() {
      try {
        const response = await api.get('/user/list');
        setUserList(response.data);
      } catch (error) {
        console.error('Error fetching user list:', error);
      } finally {
        setMounted(true);
      }
    }
    fetchUserList();
  }, []);

  return (
    <div>
      <List component="nav">
        {!mounted ? (
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
