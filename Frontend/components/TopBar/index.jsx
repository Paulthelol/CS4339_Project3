import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useMatch } from 'react-router-dom';
import uploadImage from '../../lib/cloudinary';

import api from '../../lib/api';
import './styles.css';

function TopBar() {
  const { userId } = useParams();
  const matchProfile = useMatch('/users/:userId');
  const queryClient = useQueryClient();
  const matchPhotos = useMatch('/users/:userId/photos');
  const [openUploadModal, setOpenUploadModal] = React.useState(false);
  const [modalState, setModalState] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState(null);

  // Fetch session user to determine if logged in and get name for display
  const {
    data: sessionUser,
    isLoading: isAuthLoading,
    isError: authError,
  } = useQuery({
    queryKey: ['admin-me'],
    retry: false,
    queryFn: async () => {
      setOpenUploadModal(false);
      setModalState("");
      setSelectedFile(null);
      const response = await api.get('/admin/me');
      return response.data;
    },
  });

  // Fetch user info for display in topbar (e.g. "John Doe's Profile")
  const { data: userInfo, isLoading, userError } = useQuery({
    queryKey: ['details', userId],
    enabled: Boolean(userId) && Boolean(sessionUser),
    queryFn: async () => {
      setOpenUploadModal(false);
      setModalState("");
      setSelectedFile(null);
      const response = await api.get('/user/' + userId);
      return response.data;
    }
  });

  // Mutation for uploading an image to Cloudinary and then saving the URL to our backend
  const uploadImageMutation = useMutation({
    mutationFn: async (file) => {
      setModalState("Loading...");
      const url = await uploadImage(file);
      return url;
    },
    onSuccess: (url) => {
      api.post('/photos', { url })
        .then((response) => {
          console.log('Photo uploaded successfully:', response.data);

          queryClient.invalidateQueries({ queryKey: ['userPhotos', userId] });

          setOpenUploadModal(false);
          setModalState("");
          setSelectedFile(null);
        })
        .catch((error) => {
          console.error('Error uploading photo:', error);
          setModalState("Error");
        });
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      setModalState("Error");
    },
  });

  return (
    <>
      {/* Main Topbar Content */}
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
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
          ) : userError ? (
            <Typography variant="body1">Error loading user info.</Typography>
          ) : (
            <div className="topbar-content">
              <div>
                <Link to="/">
                  <Typography variant="h5" color="inherit">
                    {sessionUser ? `${sessionUser.first_name} ${sessionUser.last_name}` : 'Home'}
                  </Typography>
                </Link>
                <Typography variant="body1">
                  {sessionUser && (
                    <Typography onClick={() => setOpenUploadModal(!openUploadModal)}>Upload Photo</Typography>
                  )}
                </Typography>
              </div>
              <div>
                <Typography fontWeight="bold">
                  {userInfo == null ? `Home` : `${userInfo.first_name} ${userInfo.last_name}'s ${matchProfile ? 'Profile' : matchPhotos ? 'Photos' : 'Page'}`}
                </Typography>
                <a href="/logout"><Typography variant="body1">Logout</Typography></a>
              </div>
            </div>

          )}
        </Toolbar>
      </AppBar>

      {/* Image Picker Modal */}
      {openUploadModal && (
        <div className="upload-modal">
          <Typography variant="h5" className="upload-modal-title">Select an image to upload</Typography>
          <div>
            {modalState === "Loading..." ? (
              <Typography variant="body1">Uploading...</Typography>
            ) : modalState !== "" ? (
              <>
                <Typography variant="body1">Error uploading image. Please try again.</Typography>
                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </>
            ) : (
              <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
            )}
          </div>
          <div className="upload-modal-buttons">
            <button className="modal-button" onClick={() => uploadImageMutation.mutate(selectedFile)}>Submit</button>
            <button className="modal-button" onClick={() => {
              setOpenUploadModal(false);
              setSelectedFile(null);
              }}>Close
            </button>
          </div>
        </div>
       )}
    </>
  );
}

export default TopBar;

