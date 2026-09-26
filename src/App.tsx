import { NavLink, Outlet, useSearchParams } from "react-router-dom";

const routes = [
  { to: "/", label: "Single event", end: true },
  { to: "/seat-picker", label: "Seat picker", end: false },
  { to: "/season", label: "Season tickets", end: false },
  { to: "/events", label: "Multiple events", end: false },
  { to: "/best-available", label: "Best available", end: false },
  { to: "/control-room", label: "Control room", end: false },
];

export default function App() {
  // Add ?embed=1 to any route to show only the example itself, without the
  // navigation and the route heading, for use inside an iframe.
  const [searchParams] = useSearchParams();
  const embed = searchParams.get("embed") === "1";

  return (
    <div className={embed ? "page embed" : "page"}>
      {embed ? null : (
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
      )}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
