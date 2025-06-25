import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';

// mock axios
jest.mock('axios');

describe('App', () => {
  it('fetches APOD data and renders title', async () => {
    // fake data
    const fakeData = {
      title: "Test APOD Title",
      url: "https://example.com/test.jpg",
      explanation: "Test explanation.",
      media_type: "image",
    };

    // // mock axios.get 
    axios.get.mockResolvedValueOnce({ data: fakeData });
    axios.get.mockResolvedValueOnce({ data: fakeData});

    // render App
    render(<App />);

     await waitFor(() => {
      expect(screen.getByText('NASA Astronomy Picture of the Day')).toBeInTheDocument();
    });

     expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/apod/));
  });
});
