import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { CatalogReleaseChartContainerProps } from "../typings/CatalogReleaseChartProps";

import "./ui/CatalogReleaseChart.css";

export function CatalogReleaseChart({ sampleText }: CatalogReleaseChartContainerProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText ? sampleText : "World"} />;
}
