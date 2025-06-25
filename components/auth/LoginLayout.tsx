import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './Login';

export default function LoginLayout() {
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => {}} />} />
    </Routes>
  );
}
