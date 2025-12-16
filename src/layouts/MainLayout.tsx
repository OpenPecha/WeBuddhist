import { Outlet } from "react-router-dom";
import NavigationBar from "../routes/navbar/NavigationBar";
import Footer from "../routes/footer/Footer";

export const MainLayout = () => (
  <>
    <NavigationBar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
);
