import { Routes, Route } from 'react-router-dom';
import { publicRoutes, protectedRoutes, adminRoutes, vendorRoutes } from './data';

function AppRouter() {
  return (
    <Routes>
      {[...publicRoutes, ...protectedRoutes].map((route) => (
        <Route key={route.path} path={route.path} element={route.element}>
          {route.children?.map((child) => (
            <Route key={child.path} index={child.path === ''} path={child.path || undefined} element={child.element} />
          ))}
        </Route>
      ))}
      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element}>
          {route.children?.map((child) => (
            <Route key={child.path} index={child.path === ''} path={child.path || undefined} element={child.element} />
          ))}
        </Route>
      ))}
      {vendorRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element}>
          {route.children?.map((child) => (
            <Route key={child.path} index={child.path === ''} path={child.path || undefined} element={child.element} />
          ))}
        </Route>
      ))}
    </Routes>
  );
}

export default AppRouter;
