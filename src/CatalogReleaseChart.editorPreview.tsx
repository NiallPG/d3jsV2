import { ReactElement, createElement } from "react";
import { CatalogReleaseChartPreviewProps } from "../typings/CatalogReleaseChartProps";

export function preview({ chartTitle }: CatalogReleaseChartPreviewProps): ReactElement {
    return (
        <div style={{ 
            padding: "20px", 
            textAlign: "center", 
            backgroundColor: "#f5f5f5",
            border: "1px dashed #ccc",
            borderRadius: "4px"
        }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#2c5282" }}>{chartTitle || "Catalog Release Chart"}</h3>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                Configure data source in properties panel
            </p>
        </div>
    );
}

export function getPreviewCss(): string {
    // This function returns the CSS for the preview component.
    // It is used to style the preview in the Mendix Studio Pro.
    return require("./ui/CatalogReleaseChart.css");
}