import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";
import { startOfflineSync } from "@/lib/offline-sync";

function App() {
  useEffect(() => startOfflineSync(), []);

  return <RouterProvider router={router} />;
}

export default App;
