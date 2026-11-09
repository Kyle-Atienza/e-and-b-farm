import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
