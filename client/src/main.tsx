import React from "react";
import ReactDOM from "react-dom/client";
import { Global } from "./routes/Global/index.tsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Login } from "./routes/Login.tsx";
import { ItemsProvider } from "./contexts/ItemsProvider.tsx";
import { Header } from "./components/Header/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Header />,
    children: [
      {
        path: "/",
        element: <Global />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ItemsProvider>
      <div className="container">
        <RouterProvider router={router} />
      </div>
    </ItemsProvider>
  </React.StrictMode>
);
