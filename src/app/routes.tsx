import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { Dashboard } from "./pages/Dashboard";
import { Studio } from "./pages/Studio";
import { Library } from "./pages/Library";
import { Settings } from "./pages/Settings";
import { ScoreConverter } from "./pages/ScoreConverter";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "studio", Component: Studio },
      { path: "library", Component: Library },
      { path: "settings", Component: Settings },
      { path: "score-converter", Component: ScoreConverter },
    ],
  },
]);
