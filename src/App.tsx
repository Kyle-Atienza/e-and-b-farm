import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/router";
import { Toaster } from "@/components/ui/toast";

function App() {
  return (
    <Toaster>
      <RouterProvider router={router} />
    </Toaster>
  );
}

export default App;
