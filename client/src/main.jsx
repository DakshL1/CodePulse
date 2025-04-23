import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';

createRoot(document.getElementById('root')).render(
  <Auth0Provider
  domain="dev-qujsfo3sx3ytffs5.us.auth0.com"
  clientId="eAAxOKJyEsNY5PrnYeX5fWbXbkhDXJSy"
  authorizationParams={{
    redirect_uri: window.location.origin
  }}>
    <Router>
      <App />
    </Router>
  </Auth0Provider>,
)
