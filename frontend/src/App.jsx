import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import SessionBoundary from './components/auth/SessionBoundary'

function App() {
  return (
      <BrowserRouter>
        <SessionBoundary><AppRoutes /></SessionBoundary>
      </BrowserRouter>
  )
}

export default App
