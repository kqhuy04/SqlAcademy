import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PrivateRoute, PublicOnlyRoute } from './guards';

// Code-Splitting: Lazy load all pages on demand
const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const CaseListPage = lazy(() => import('@/pages/CaseListPage').then((m) => ({ default: m.CaseListPage })));
const CaseDetailPage = lazy(() => import('@/pages/CaseDetailPage').then((m) => ({ default: m.CaseDetailPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const CertificatePage = lazy(() => import('@/pages/CertificatePage').then((m) => ({ default: m.CertificatePage })));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })));
const TutorialListPage = lazy(() => import('@/pages/TutorialListPage').then((m) => ({ default: m.TutorialListPage })));
const TutorialWorkspacePage = lazy(() => import('@/pages/TutorialWorkspacePage').then((m) => ({ default: m.TutorialWorkspacePage })));
const SqlWikiPage = lazy(() => import('@/pages/SqlWikiPage').then((m) => ({ default: m.SqlWikiPage })));
const PostListPage = lazy(() => import('@/pages/PostListPage').then((m) => ({ default: m.PostListPage })));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage').then((m) => ({ default: m.PostDetailPage })));
const PostEditorPage = lazy(() => import('@/pages/PostEditorPage').then((m) => ({ default: m.PostEditorPage })));
const AdminPostModerationPage = lazy(() => import('@/pages/AdminPostModerationPage').then((m) => ({ default: m.AdminPostModerationPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-noir-parchment p-8 select-none">
    <div className="w-10 h-10 rounded-full border-[3px] border-noir-border border-t-noir-blood animate-spin mb-3 shadow-sm" />
    <span className="font-typewriter text-xs text-noir-inkMuted tracking-widest uppercase font-bold">
      DECIPHERING CONFIDENTIAL DOSSIER...
    </span>
  </div>
);

const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{Component}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<LandingPage />),
  },
  {
    path: '/tutorials',
    element: withSuspense(<TutorialListPage />),
  },
  {
    path: '/tutorials/:moduleId/:lessonId',
    element: withSuspense(<TutorialWorkspacePage />),
  },
  {
    path: '/wiki',
    element: withSuspense(<SqlWikiPage />),
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        {withSuspense(<LoginPage />)}
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        {withSuspense(<RegisterPage />)}
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PublicOnlyRoute>
        {withSuspense(<ResetPasswordPage />)}
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/cases',
    element: withSuspense(<CaseListPage />),
  },
  {
    path: '/cases/:id',
    element: (
      <PrivateRoute>
        {withSuspense(<CaseDetailPage />)}
      </PrivateRoute>
    ),
  },
  {
    path: '/posts',
    element: withSuspense(<PostListPage />),
  },
  {
    path: '/posts/new',
    element: (
      <PrivateRoute>
        {withSuspense(<PostEditorPage />)}
      </PrivateRoute>
    ),
  },
  {
    path: '/posts/edit/:id',
    element: (
      <PrivateRoute>
        {withSuspense(<PostEditorPage />)}
      </PrivateRoute>
    ),
  },
  {
    path: '/posts/:slug',
    element: withSuspense(<PostDetailPage />),
  },
  {
    path: '/admin/posts',
    element: (
      <PrivateRoute>
        {withSuspense(<AdminPostModerationPage />)}
      </PrivateRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        {withSuspense(<ProfilePage />)}
      </PrivateRoute>
    ),
  },
  {
    path: '/certificate',
    element: (
      <PrivateRoute>
        {withSuspense(<CertificatePage />)}
      </PrivateRoute>
    ),
  },
  {
    path: '/leaderboard',
    element: withSuspense(<LeaderboardPage />),
  },
  {
    path: '/404',
    element: withSuspense(<NotFoundPage />),
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
