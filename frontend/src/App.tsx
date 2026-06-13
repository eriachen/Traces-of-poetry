
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PoetryProvider } from './contexts/PoetryContext';
import { AnnotationProvider } from './contexts/AnnotationContext';
import { ActivityProvider } from './contexts/ActivityContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Map from './pages/Map';
import PoemDetail from './pages/PoemDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Study from './pages/Study';
import Class from './pages/Class';
import PoemEntry from './pages/PoemEntry';
import ResearchList from './pages/ResearchList';
import ResearchEditor from './pages/ResearchEditor';
import ClassTasks from './pages/ClassTasks';

function App() {
  return (
    <AuthProvider>
      <PoetryProvider>
        <ActivityProvider>
          <AnnotationProvider>
            <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<Map />} />
                <Route path="/poem/:id" element={<PoemDetail />} />
                <Route path="/poem-entry" element={<PoemEntry />} />
                <Route path="/class/:classId/map" element={<Map />} />
                <Route path="/class/:classId/poem-entry" element={<PoemEntry />} />
                <Route path="/research" element={<ResearchList />} />
                <Route path="/research/new" element={<ResearchEditor />} />
                <Route path="/class" element={<Class />} />
                <Route path="/class/:classId/tasks" element={<ClassTasks />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/study" element={<Study />} />
              </Routes>
            </Layout>
          </Router>
        </AnnotationProvider>
        </ActivityProvider>
      </PoetryProvider>
    </AuthProvider>
  );
}

export default App;
