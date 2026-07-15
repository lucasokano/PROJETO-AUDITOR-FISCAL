import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Discipline } from "./pages/Discipline";
import { Home } from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/disciplina/:disciplineId"
            element={<Discipline />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;