/**
 * Updated TypeScript interfaces for CatalogReleaseChart widget
 * This file defines the props interface based on the new XML configuration
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListActionValue, ListAttributeValue } from "mendix";

export interface CatalogReleaseChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    
    // Data Source Properties
    catalogData: ListValue;
    nameAttribute: ListAttributeValue<string>;
    retiredDateAttribute: ListAttributeValue<Date>;
    currentDateAttribute: ListAttributeValue<Date>;
    upcomingCodeAttribute: ListAttributeValue<string>;
    
    // General Properties
    chartTitle: string;
    enableLegend: boolean;
    
    // Chart Behavior Properties  
    onItemClick?: ActionValue;
    refreshInterval: number;
    
    // Appearance Properties
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
    
    // Data Source Properties (preview)
    catalogData: {} | { caption: string } | { type: string } | null;
    nameAttribute: string;
    retiredDateAttribute: string;
    currentDateAttribute: string;
    upcomingCodeAttribute: string;
    
    // General Properties (preview)
    chartTitle: string;
    enableLegend: boolean;
    
    // Chart Behavior Properties (preview)
    onItemClick: {} | null;
    refreshInterval: number | null;
    
    // Appearance Properties (preview)
    chartHeight: number | null;
    showToday: boolean;
}

// Interface for the processed industry data
export interface IndustryData {
    name: string;
    retired: Date;
    current: Date;
    upcoming: string;
}

// Interface for chart dimensions
export interface ChartDimensions {
    width: number;
    height: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}