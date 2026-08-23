import { RouterProvider } from "react-router";
import { router } from "./routes";
import { NavigationMenu } from "./components/NavigationMenu";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <NavigationMenu />
    </>
  );
}