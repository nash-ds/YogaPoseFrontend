
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Index from './pages/Index';
import YogaLibrary from './pages/YogaLibrary';
import PoseDetail from './pages/PoseDetail';
import Practice from './pages/Practice';
import History from './pages/History';
import Meditation from './pages/Meditation';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="yoga-app-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/library" element={<Layout><YogaLibrary /></Layout>} />
            <Route path="/poses/:poseId" element={<Layout><PoseDetail /></Layout>} />
            <Route path="/practice/:poseId" element={<Layout><Practice /></Layout>} />
            <Route path="/history" element={<Layout><History /></Layout>} />
            <Route path="/meditation" element={<Layout><Meditation /></Layout>} />
            <Route path="/progress" element={<Layout><Progress /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
