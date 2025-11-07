import "./App.scss";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import Navbar from "./components/Navbar/Navbar";
import InfoButton from "./components/InfoButton/InfoButton";

export default function App() {
    return (
        <Router /*basename="/meleedle"*/>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:category" element={<CategoryPage />} />
            </Routes>
            <InfoButton />
        </Router>
    );
}
