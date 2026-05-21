import { useEffect } from "react";

export default function Test() {
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then(console.log)
      .catch(console.error);
  }, []);

  return <div>Check console</div>;
}
