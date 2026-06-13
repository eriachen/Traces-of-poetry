import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useActivity } from './ActivityContext';

interface Annotation {
  id: string;
  poemId: string;
  userId: string;
  content: string;
  isPublic: boolean;
  startPos: number;
  endPos: number;
  createdAt: string;
  poem?: {
    id: string;
    title: string;
    author: string;
  };
}

interface AnnotationContextType {
  annotations: Annotation[];
  loading: boolean;
  loadUserAnnotations: (userId: string) => Promise<void>;
  loadPoemAnnotations: (poemId: string) => Promise<void>;
  addAnnotation: (poemId: string, userId: string, content: string, isPublic: boolean) => Promise<Annotation>;
  updateAnnotation: (annotationId: string, content: string, isPublic: boolean) => Promise<Annotation>;
  deleteAnnotation: (annotationId: string) => Promise<void>;
  getAnnotationsByPoem: (poemId: string) => Annotation[];
  totalUserAnnotations: number;
  clearAnnotations: () => void;
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export const AnnotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { recordActivity } = useActivity();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    setCurrentUserId(null);
  }, []);

  const loadUserAnnotations = useCallback(async (userId: string) => {
    // 如果是同一个用户，不需要重新加载（除非是空的）
    if (currentUserId === userId && annotations.length > 0) {
      return;
    }
    
    try {
      setLoading(true);
      setCurrentUserId(userId);
      const response = await fetch(`http://localhost:3001/api/annotations/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data);
      } else {
        setAnnotations([]);
      }
    } catch (error) {
      console.error('Failed to load annotations:', error);
      setAnnotations([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, annotations.length]);

  const loadPoemAnnotations = useCallback(async (poemId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/annotations/poem/${poemId}`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(prev => [
          ...prev.filter(a => a.poemId !== poemId),
          ...data
        ]);
      }
    } catch (error) {
      console.error('Failed to load poem annotations:', error);
    }
  }, []);

  const addAnnotation = useCallback(async (
    poemId: string,
    userId: string,
    content: string,
    isPublic: boolean
  ): Promise<Annotation> => {
    const response = await fetch('http://localhost:3001/api/annotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        poemId,
        userId,
        content,
        isPublic
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add annotation');
    }

    const newAnnotation = await response.json();
    setAnnotations(prev => [...prev, newAnnotation]);
    recordActivity('annotation');
    return newAnnotation;
  }, [recordActivity]);

  const updateAnnotation = useCallback(async (
    annotationId: string,
    content: string,
    isPublic: boolean
  ): Promise<Annotation> => {
    const response = await fetch(`http://localhost:3001/api/annotations/${annotationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        isPublic
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update annotation');
    }

    const updatedAnnotation = await response.json();
    setAnnotations(prev => prev.map(a => 
      a.id === annotationId ? updatedAnnotation : a
    ));
    return updatedAnnotation;
  }, []);

  const deleteAnnotation = useCallback(async (annotationId: string) => {
    const response = await fetch(`http://localhost:3001/api/annotations/${annotationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete annotation');
    }

    setAnnotations(prev => prev.filter(a => a.id !== annotationId));
  }, []);

  const getAnnotationsByPoem = useCallback((poemId: string) => {
    return annotations.filter(a => a.poemId === poemId);
  }, [annotations]);

  const totalUserAnnotations = annotations.length;

  // 监听用户变化，自动清空和重新加载
  useEffect(() => {
    if (user?.id) {
      // 如果用户变化了，加载新用户的数据
      if (currentUserId !== user.id) {
        clearAnnotations();
        loadUserAnnotations(user.id);
      }
    } else {
      // 如果没有用户，清空数据
      clearAnnotations();
    }
  }, [user?.id, currentUserId, clearAnnotations, loadUserAnnotations]);

  return (
    <AnnotationContext.Provider value={{
      annotations,
      loading,
      loadUserAnnotations,
      loadPoemAnnotations,
      addAnnotation,
      updateAnnotation,
      deleteAnnotation,
      getAnnotationsByPoem,
      totalUserAnnotations,
      clearAnnotations
    }}>
      {children}
    </AnnotationContext.Provider>
  );
};

export const useAnnotation = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotation must be used within an AnnotationProvider');
  }
  return context;
};
