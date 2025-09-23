import React, { useEffect } from 'react';
import { Container, Center, Loader, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconAlertTriangle } from '@tabler/icons';

const OAuthCallback: React.FC = () => {
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      showNotification({
        color: "red",
        title: "Authentication failed",
        message: "There was an error signing you in with Google. Please try again.",
        icon: <IconAlertTriangle size={16} />,
        autoClose: 5000,
      });
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Add access token to user object
        const userWithToken = {
          ...user,
          accessToken: token
        };

        // Store user data and token
        localStorage.setItem("user", JSON.stringify(userWithToken));
        localStorage.setItem("role", "user");

        showNotification({
          color: "teal",
          title: "Signed in successfully",
          message: "You have been signed in with Google successfully. Redirecting...",
          icon: <IconCheck size={16} />,
          autoClose: 2000,
        });

        // Get the redirect URL
        const redirectUrl = localStorage.getItem("preOAuthRedirect") || "/";
        localStorage.removeItem("preOAuthRedirect");

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);

      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        showNotification({
          color: "red",
          title: "Authentication error",
          message: "There was an error processing your authentication. Please try again.",
          icon: <IconAlertTriangle size={16} />,
          autoClose: 5000,
        });
        
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } else {
      showNotification({
        color: "red",
        title: "Authentication incomplete",
        message: "Authentication data is missing. Please try signing in again.",
        icon: <IconAlertTriangle size={16} />,
        autoClose: 5000,
      });
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }
  }, []);

  return (
    <Container size={420} my={40}>
      <Center>
        <div style={{ textAlign: 'center' }}>
          <Loader size="xl" />
          <Text mt="md" color="dimmed">
            Processing authentication...
          </Text>
        </div>
      </Center>
    </Container>
  );
};

export default OAuthCallback;