import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";
import { Toaster } from "@/components/ui/sonner";
import { startOfflineSync } from "@/lib/offline-sync";

function App() {
  useEffect(() => startOfflineSync(), []);

  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
