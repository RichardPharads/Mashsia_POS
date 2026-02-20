import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from './component/LoadingSkeleton';

const LazyComponent = lazy(() => import('./LazyComponent'));
function App() {
  const navigate = useNavigate();
  return (
    <Routes>
      
      <Route path="/" element={<div>
        <h1>Hello</h1>
       
      </div>} />

      <Route path="/lazy" element={
        <ErrorBoundary FallbackComponent={() => <div>Something went wrong.</div>}>
          <Suspense fallback={<LoadingSkeleton />}>
            <LazyComponent />
          </Suspense>
        </ErrorBoundary>
      } />


    </Routes>

  
    

  )
}

export default App