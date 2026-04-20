import React, { useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom/client';
import { Grid, Typography, Paper } from '@mui/material';
import {
  createBrowserRouter, RouterProvider, Outlet, useParams, Navigate, useNavigate,
} from 'react-router-dom';

import './styles/main.css';
import TopBar from './components/TopBar';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import UserPhotos from './components/UserPhotos';
import LoginRegister from './components/LoginRegister';
import api from './lib/api';
import './lib/mockSetup';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

function Home() {
  return (
    <div className="main-welcome-banner">
      <Typography variant="h2">Welcome to the PhotoShare App!</Typography>
      <Typography variant="body1" style={{ marginTop: '1em' }}>
        Please select a user from the list on the left to view their details and photos.
      </Typography>
    </div>
  );
}

const queryClient = new QueryClient();

function UserDetailRoute() {
  const { userId } = useParams();
  // eslint-disable-next-line no-console
  console.log('UserDetailRoute: userId is:', userId);
  return <UserDetail userId={userId} />;
}

function UserPhotosRoute() {
  const { userId } = useParams();
  return <UserPhotos userId={userId} />;
}

function Root() {
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar />
        </Grid>
        <div className="main-topbar-buffer" />
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            <UserList />
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Outlet />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

function UserLayout() {
  return <Outlet />;
}

function RequireAuth({ children }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['admin-me'],
    retry: false,
    queryFn: async () => {
      const res = await api.get('/admin/me');
      return res.data;
    },
  });

  if (isLoading) {
    return <Typography variant="body1">Checking authentication...</Typography>;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Logout() {
  const navigate = useNavigate();
  const queryClientRef = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await api.post('/admin/logout');
    },
    onSuccess: () => {
      queryClientRef.setQueryData(['admin-me'], null);
      queryClientRef.invalidateQueries({ queryKey: ['admin-me'] });
      navigate('/login', { replace: true });
    },
    onError: () => {
      // If session already expired, still send user to login screen.
      queryClientRef.setQueryData(['admin-me'], null);
      queryClientRef.invalidateQueries({ queryKey: ['admin-me'] });
      navigate('/login', { replace: true });
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <Typography variant="body1">
      {isPending ? 'Signing out...' : 'Redirecting to login...'}
    </Typography>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <Home /> },

      { path: 'login', element: <LoginRegister /> },
      { path: 'logout', element: <Logout /> },

      {
        path: 'users',
        element: (
          <RequireAuth>
            <UserList />
          </RequireAuth>
        ),
      },

      {
        path: 'users/:userId',
        element: (
          <RequireAuth>
            <UserLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <UserDetailRoute /> },
          { path: 'photos', element: <UserPhotosRoute /> },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('photoshareapp'));
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
