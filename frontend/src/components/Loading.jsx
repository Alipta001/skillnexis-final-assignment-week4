import { LoaderCircle } from "lucide-react";

export default function Loading({ label = "Loading..." }) {
  return (
    <div className="page-message">
      <LoaderCircle className="spin" size={23} />
      <span>{label}</span>
    </div>
  );
}
