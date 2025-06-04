import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { CatalogReleaseChartPreviewProps } from "../typings/CatalogReleaseChartProps";

export function preview({ sampleText }: CatalogReleaseChartPreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/CatalogReleaseChart.css");
}
