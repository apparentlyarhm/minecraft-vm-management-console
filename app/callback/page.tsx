import { Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";
import LoginSuccess from "./LoginSucess";


export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading login state..." />}>
      <LoginSuccess />
    </Suspense>
  );
}
