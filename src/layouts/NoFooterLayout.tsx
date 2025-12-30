import { Outlet } from "react-router-dom";
import NavigationBar from "../routes/navbar/NavigationBar";

export const NoFooterLayout = () => (
  <>
    <NavigationBar />
    <main>
      <Outlet />
    </main>
  </>
);
