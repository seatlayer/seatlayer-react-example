import { NavLink, Outlet } from "react-router-dom";

const routes = [
  { to: "/", label: "Single event", end: true },
  { to: "/seat-picker", label: "Seat picker", end: false },
  { to: "/season", label: "Season tickets", end: false },
  { to: "/events", label: "Multiple events", end: false },
  { to: "/best-available", label: "Best available", end: false },
  { to: "/control-room", label: "Control room", end: false },
];

export default function App() {
  return (
    <div className="page">
      <nav className="nav" aria-label="Examples">
        {routes.map((route) => (
          <NavLink
            key={route.to}
            to={route.to}
            end={route.end}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {route.label}
          </NavLink>
        ))}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
