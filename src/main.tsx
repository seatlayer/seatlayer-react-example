import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import { SingleEventRoute } from "./routes/SingleEventRoute";
import { SeatPickerRoute } from "./routes/SeatPickerRoute";
import { SeasonRoute } from "./routes/SeasonRoute";
import { EventsRoute } from "./routes/EventsRoute";
import { BestAvailableRoute } from "./routes/BestAvailableRoute";
import { ControlRoomRoute } from "./routes/ControlRoomRoute";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<SingleEventRoute />} />
          <Route path="seat-picker" element={<SeatPickerRoute />} />
          <Route path="season" element={<SeasonRoute />} />
          <Route path="events" element={<EventsRoute />} />
          <Route path="best-available" element={<BestAvailableRoute />} />
          <Route path="control-room" element={<ControlRoomRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
