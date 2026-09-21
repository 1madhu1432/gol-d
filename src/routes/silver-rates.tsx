import { createFileRoute } from "@tanstack/react-router";
import { MetalRatesPage } from "./gold-rates";

export const Route = createFileRoute("/silver-rates")({
  component: SilverRatesPage,
});

function SilverRatesPage() {
  return <MetalRatesPage metal="Silver" />;
}
