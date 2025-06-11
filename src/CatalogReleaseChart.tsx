import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { CatalogReleaseChartContainerProps } from "../typings/CatalogReleaseChartProps";
import { ValueStatus } from "mendix";
import * as d3 from "d3";

import "./ui/CatalogReleaseChart.css";

interface IndustryData {
    name: string;
    retired: Date;
    current: Date;
    upcoming: string;
}

export function CatalogReleaseChart(props: CatalogReleaseChartContainerProps): ReactElement {
    const {
        name,
        catalogData,
        nameAttribute,
        retiredDateAttribute,
        currentDateAttribute,
        upcomingCodeAttribute,
        chartTitle,
        enableLegend,
        onItemClick,
        refreshInterval,
        chartHeight,
        showToday
    } = props;

    const chartRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: chartHeight });
    const [industries, setIndustries] = useState<IndustryData[]>([]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: width,
                    height: chartHeight
                });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, [chartHeight]);

    // Process data from Mendix data source
    useEffect(() => {
        if (catalogData && catalogData.status === ValueStatus.Available && catalogData.items) {
            const processedIndustries: IndustryData[] = catalogData.items
                .map(item => {
                    try {
                        const name = nameAttribute.get(item);
                        const retiredDate = retiredDateAttribute.get(item);
                        const currentDate = currentDateAttribute.get(item);
                        const upcomingCode = upcomingCodeAttribute.get(item);

                        // Validate that all required data is available
                        if (name.status !== ValueStatus.Available ||
                            retiredDate.status !== ValueStatus.Available ||
                            currentDate.status !== ValueStatus.Available ||
                            upcomingCode.status !== ValueStatus.Available) {
                            return null;
                        }

                        return {
                            name: name.value || "",
                            retired: retiredDate.value || new Date(),
                            current: currentDate.value || new Date(),
                            upcoming: upcomingCode.value || "TBD"
                        };
                    } catch (error) {
                        console.error("Error processing catalog data item:", error);
                        return null;
                    }
                })
                .filter((item): item is IndustryData => item !== null)
                .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

            setIndustries(processedIndustries);
        } else {
            setIndustries([]);
        }
    }, [catalogData, nameAttribute, retiredDateAttribute, currentDateAttribute, upcomingCodeAttribute]);

    // Auto-refresh functionality
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                if (catalogData && catalogData.reload) {
                    catalogData.reload();
                }
            }, refreshInterval * 1000);

            return () => clearInterval(interval);
        }
    }, [refreshInterval, catalogData]);

    // Render chart
    useEffect(() => {
        if (!chartRef.current || dimensions.width === 0 || industries.length === 0) return;

        // Clear any existing chart
        d3.select(chartRef.current).selectAll("*").remove();

        // Responsive margins based on container width
        const margin = {
            top: 80,
            right: dimensions.width < 800 ? 100 : 150,
            bottom: 40,
            left: dimensions.width < 800 ? 120 : 180
        };
        
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        // Create SVG with viewBox for better scaling
        const svg = d3.select(chartRef.current)
            .append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Time scale
        const timeScale = d3.scaleTime()
            .domain([new Date(2022, 7, 1), new Date(2025, 11, 31)])
            .range([0, width]);

        // Y scale for industries
        const yScale = d3.scaleBand()
            .domain(industries.map(d => d.name))
            .range([0, height])
            .padding(0.3);

        // Add timeline dates
        const timelineDates = [
            new Date(2022, 7, 1),
            new Date(2023, 2, 1),
            new Date(2023, 9, 1),
            new Date(2024, 3, 1),
            new Date(2024, 10, 1),
            new Date(2025, 4, 1),
            new Date(2025, 11, 1)
        ];

        // Draw main timeline
        svg.append("line")
            .attr("class", "timeline-line")
            .attr("x1", 0)
            .attr("y1", -40)
            .attr("x2", width)
            .attr("y2", -40);

        // Add timeline markers and labels
        timelineDates.forEach(date => {
            const x = timeScale(date);
            
            svg.append("circle")
                .attr("cx", x)
                .attr("cy", -40)
                .attr("r", 4)
                .attr("fill", "#2c5282");
            
            svg.append("text")
                .attr("class", "date-text")
                .attr("x", x)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .text(d3.timeFormat("%b-%y")(date));
        });

        // Add today's date (if enabled)
        if (showToday) {
            const today = new Date();
            const todayX = timeScale(today);
            
            // Today's vertical line
            svg.append("line")
                .attr("class", "today-line")
                .attr("x1", todayX)
                .attr("y1", -40)
                .attr("x2", todayX)
                .attr("y2", height);
            
            // Today's circle
            svg.append("circle")
                .attr("class", "today-circle")
                .attr("cx", todayX)
                .attr("cy", -40)
                .attr("r", 8);
            
            // Today's date label
            svg.append("text")
                .attr("class", "today-text")
                .attr("x", todayX)
                .attr("y", -65)
                .attr("text-anchor", "middle")
                .text(d3.timeFormat("%-m/%-d/%Y")(today));
        }

        // Adjust font sizes for smaller screens
        const fontSize = dimensions.width < 800 ? "12px" : "14px";

        // Draw industry rows
        industries.forEach((industry) => {
            const y = yScale(industry.name)! + yScale.bandwidth() / 2;
            
            // Industry name
            svg.append("text")
                .attr("class", "industry-text")
                .attr("x", -10)
                .attr("y", y + 5)
                .attr("text-anchor", "end")
                .style("font-size", fontSize)
                .text(industry.name);
            
            // Industry line
            svg.append("line")
                .attr("class", "industry-line")
                .attr("x1", 0)
                .attr("y1", y)
                .attr("x2", width)
                .attr("y2", y);
            
            // Continuity line between retired and current
            if (industry.retired && industry.current) {
                const retiredX = timeScale(industry.retired);
                const currentX = timeScale(industry.current);
                
                svg.append("line")
                    .attr("class", "continuity-line")
                    .attr("x1", retiredX)
                    .attr("y1", y)
                    .attr("x2", currentX)
                    .attr("y2", y);
            }
            
            // Future continuity line from current to upcoming
            let upcomingXPos = width + 20;
            
            if (industry.upcoming !== "TBD") {
                const year = parseInt("20" + industry.upcoming.substring(0, 2));
                const month = parseInt(industry.upcoming.substring(2, 4)) - 1;
                const upcomingDate = new Date(year, month, 1);
                
                if (upcomingDate <= timeScale.domain()[1]) {
                    upcomingXPos = timeScale(upcomingDate);
                } else {
                    upcomingXPos = width;
                }
            } else {
                upcomingXPos = width + 20;
            }
            
            if (industry.current) {
                const currentX = timeScale(industry.current);
                let lineEndX = upcomingXPos;
                
                if (industry.upcoming === "TBD") {
                    lineEndX = width;
                } else {
                    const upcomingDate = new Date(parseInt("20" + industry.upcoming.substring(0,2)), 
                                                parseInt(industry.upcoming.substring(2,4))-1,1);
                    if (upcomingDate > timeScale.domain()[1]) {
                        lineEndX = width;
                    } else {
                        lineEndX = timeScale(upcomingDate);
                    }
                }

                svg.append("line")
                    .attr("class", "future-continuity-line")
                    .attr("x1", currentX)
                    .attr("y1", y)
                    .attr("x2", lineEndX)
                    .attr("y2", y);
            }
            
            // Retired marker (diamond)
            if (industry.retired) {
                const retiredX = timeScale(industry.retired);
                const retiredMarker = svg.append("rect")
                    .attr("class", "retired-marker")
                    .attr("x", retiredX - 10)
                    .attr("y", y - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("rx", 10)
                    .attr("transform", `rotate(45 ${retiredX} ${y})`)
                    .style("cursor", onItemClick ? "pointer" : "default");

                if (onItemClick) {
                    retiredMarker.on("click", () => onItemClick.execute());
                }
            }
            
            // Current marker (diamond)
            if (industry.current) {
                const currentX = timeScale(industry.current);
                const currentMarker = svg.append("rect")
                    .attr("class", "current-marker")
                    .attr("x", currentX - 10)
                    .attr("y", y - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("rx", 10)
                    .attr("transform", `rotate(45 ${currentX} ${y})`)
                    .style("cursor", onItemClick ? "pointer" : "default");

                if (onItemClick) {
                    currentMarker.on("click", () => onItemClick.execute());
                }
            }
            
            // Upcoming box - adjusted positioning
            let boxX = upcomingXPos;
            if (industry.upcoming !== "TBD") {
                const year = parseInt("20" + industry.upcoming.substring(0, 2));
                const month = parseInt(industry.upcoming.substring(2, 4)) - 1;
                const upcomingDate = new Date(year, month, 1);
                if (upcomingDate <= timeScale.domain()[1]) {
                    boxX = timeScale(upcomingDate) - 30;
                } else {
                    boxX = width - 70;
                }
            } else {
                boxX = width - 70;
            }

            const upcomingBox = svg.append("rect")
                .attr("class", "upcoming-box")
                .attr("x", boxX)
                .attr("y", y - 15)
                .attr("width", 60)
                .attr("height", 30)
                .attr("rx", 4)
                .style("cursor", onItemClick ? "pointer" : "default");
            
            if (onItemClick) {
                upcomingBox.on("click", () => onItemClick.execute());
            }
            
            svg.append("text")
                .attr("class", "upcoming-text")
                .attr("x", boxX + 30)
                .attr("y", y + 5)
                .style("font-size", fontSize)
                .text(industry.upcoming);
        });
    }, [dimensions, industries, showToday, onItemClick]);

    // Loading state
    if (!catalogData || catalogData.status === ValueStatus.Loading) {
        return (
            <div className={`catalog-release-chart ${name}`} ref={containerRef}>
                <div className="chart-container">
                    <h1 className="chart-title">{chartTitle}</h1>
                    <div className="loading-message">Loading catalog data...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (catalogData.status === ValueStatus.Unavailable) {
        return (
            <div className={`catalog-release-chart ${name}`} ref={containerRef}>
                <div className="chart-container">
                    <h1 className="chart-title">{chartTitle}</h1>
                    <div className="error-message">Unable to load catalog data. Please check your data source configuration.</div>
                </div>
            </div>
        );
    }

    // No data state
    if (!catalogData.items || catalogData.items.length === 0) {
        return (
            <div className={`catalog-release-chart ${name}`} ref={containerRef}>
                <div className="chart-container">
                    <h1 className="chart-title">{chartTitle}</h1>
                    <div className="no-data-message">No catalog data available. Please add catalog release schedules to see the chart.</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`catalog-release-chart ${name}`} ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <div className="chart-container">
                <h1 className="chart-title">{chartTitle}</h1>
                
                {enableLegend && (
                    <div className="legend">
                        <div className="legend-item">
                            <svg className="legend-symbol" viewBox="0 0 20 20">
                                <rect x="2" y="2" width="16" height="16" rx="50%" className="retired-marker"/>
                            </svg>
                            <span>Retired Catalog</span>
                        </div>
                        <div className="legend-item">
                            <svg className="legend-symbol" viewBox="0 0 20 20">
                                <rect x="2" y="2" width="16" height="16" rx="50%" className="current-marker"/>
                            </svg>
                            <span>Current Catalog</span>
                        </div>
                        <div className="legend-item">
                            <svg className="legend-symbol" viewBox="0 0 20 20">
                                <rect x="2" y="2" width="16" height="16" rx="2" className="upcoming-box"/>
                            </svg>
                            <span>Upcoming Catalog</span>
                        </div>
                        {showToday && (
                            <div className="legend-item">
                                <svg className="legend-symbol" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="5" className="today-circle"/>
                                </svg>
                                <span>Today's Date</span>
                            </div>
                        )}
                    </div>
                )}
                
                <div ref={chartRef} id="chart" style={{ width: '100%' }}></div>
            </div>
        </div>
    );
}