import { BrowserRouter, Routes, Route } from "react-router-dom";
import IndexPage from "./views/indexPage";
import FavoritesPage from "./views/favoritesPage";
import Layout from "./layouts/Layout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<IndexPage />} index/>
          <Route path="/favorites" element={<FavoritesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
