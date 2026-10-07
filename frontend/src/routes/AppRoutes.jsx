import { Routes, Route } from 'react-router-dom'

function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<h1>Dashboard</h1>} />

        <Route
            path="/phong"
            element={<h1>Quan ly phong</h1>}
        />

        <Route
            path="/nguoi-thue"
            element={<h1>Quan ly nguoi thue</h1>}
        />

        <Route
            path="/hop-dong"
            element={<h1>Quan ly hop dong</h1>}
        />
      </Routes>
  )
}

export default AppRoutes