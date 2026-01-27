import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthProvider';
import { BranchProvider } from './app/providers/BranchProvider';
import { PermissionProvider } from './app/providers/PermissionProvider';
import AppRoutes from './app/routes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BranchProvider>
        <PermissionProvider>
          <Router>
            <AppRoutes />
          </Router>
        </PermissionProvider>
      </BranchProvider>
    </AuthProvider>
  );
}

export default App;
