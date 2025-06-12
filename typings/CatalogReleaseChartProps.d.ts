/**
 * This file was generated from CatalogReleaseChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, ListValue, ListAttributeValue } from "mendix";

export interface CatalogReleaseChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    catalogData: ListValue;
    nameAttribute: ListAttributeValue<string>;
    retiredDateAttribute: ListAttributeValue<Date>;
    currentDateAttribute: ListAttributeValue<Date>;
    upcomingCodeAttribute: ListAttributeValue<string>;
    chartTitle: string;
    enableLegend: boolean;
    useDarkMode: boolean;
    onItemClick?: ActionValue;
    refreshInterval: number;
    chartHeight: number;
    showToday: boolean;
}

export interface CatalogReleaseChartPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    catalogData: {} | { caption: string } | { type: string } | null;
    nameAttribute: string;
    retiredDateAttribute: string;
    currentDateAttribute: string;
    upcomingCodeAttribute: string;
    chartTitle: string;
    enableLegend: boolean;
    useDarkMode: boolean;
    onItemClick: {} | null;
    refreshInterval: number | null;
    chartHeight: number | null;
    showToday: boolean;
}
