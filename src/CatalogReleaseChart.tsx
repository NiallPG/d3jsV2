import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { CatalogReleaseChartContainerProps } from "../typings/CatalogReleaseChartProps";
import * as d3 from "d3";

import "./ui/CatalogReleaseChart.css";

export function CatalogReleaseChart({ name }: CatalogReleaseChartContainerProps): ReactElement {
    const chartRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                // Set responsive dimensions
                setDimensions({
                    width: width,
                    height: Math.min(600, width * 0.5) // Maintain aspect ratio, max 600px height
                });
            }
        };

        // Initial size
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Also observe container size changes
        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current || dimensions.width === 0) return;

        // Clear any existing chart
        d3.select(chartRef.current).selectAll("*").remove();

        // Data structure
        const industries = [
            { name: "Aerospace & Defense", retired: new Date(2023, 10, 1), current: new Date(2024, 11, 1), upcoming: "2506" },
            { name: "Automotive", retired: new Date(2023, 2, 1), current: new Date(2024, 5, 1), upcoming: "TBD" },
            { name: "Battery", retired: new Date(2025, 0, 1), current: new Date(2025, 4, 1), upcoming: "2507" },
            { name: "CP&R", retired: new Date(2024, 8, 1), current: new Date(2024, 11, 1), upcoming: "TBD" },
            { name: "Electronics", retired: new Date(2025, 2, 1), current: new Date(2025, 4, 1), upcoming: "2508" },
            { name: "Energy & Utilities", retired: new Date(2024, 8, 1), current: new Date(2025, 1, 1), upcoming: "2505" },
            { name: "Heavy Equipment", retired: new Date(2023, 5, 1), current: new Date(2023, 5, 1), upcoming: "TBD" },
            { name: "Industrial Machinery", retired: new Date(2025, 2, 1), current: new Date(2025, 5, 1), upcoming: "2509" },
            { name: "Marine", retired: new Date(2024, 2, 1), current: new Date(2024, 2, 1), upcoming: "TBD" },
            { name: "Medical Devices", retired: new Date(2024, 9, 1), current: new Date(2025, 0, 1), upcoming: "TBD" },
            { name: "Pharmaceuticals", retired: new Date(2024, 10, 1), current: new Date(2025, 2, 1), upcoming: "2506" },
            { name: "Semiconductor Devices", retired: new Date(2024, 1, 1), current: new Date(2024, 4, 1), upcoming: "TBD" }
        ];

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

        // Add today's date
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
                svg.append("rect")
                    .attr("class", "retired-marker")
                    .attr("x", retiredX - 10)
                    .attr("y", y - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("rx", 10)
                    .attr("transform", `rotate(45 ${retiredX} ${y})`);
            }
            
            // Current marker (diamond)
            if (industry.current) {
                const currentX = timeScale(industry.current);
                svg.append("rect")
                    .attr("class", "current-marker")
                    .attr("x", currentX - 10)
                    .attr("y", y - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("rx", 10)
                    .attr("transform", `rotate(45 ${currentX} ${y})`);
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
                    // Place TBD and future dates at the edge but within bounds
                    boxX = width - 70; // Adjusted to keep box within chart area
                }
            } else {
                boxX = width - 70; // Keep TBD boxes within the chart area
            }

            svg.append("rect")
                .attr("class", "upcoming-box")
                .attr("x", boxX)
                .attr("y", y - 15)
                .attr("width", 60)
                .attr("height", 30)
                .attr("rx", 4);
            
            svg.append("text")
                .attr("class", "upcoming-text")
                .attr("x", boxX + 30)
                .attr("y", y + 5)
                .style("font-size", fontSize)
                .text(industry.upcoming);
        });
    }, [dimensions]);

    return (
        <div className={`catalog-release-chart ${name}`} ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <div className="chart-container">
                <h1 className="chart-title">Catalog Release Schedule</h1>
                
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
                    <div className="legend-item">
                        <svg className="legend-symbol" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="5" className="today-circle"/>
                        </svg>
                        <span>Today's Date</span>
                    </div>
                </div>
                
                <div ref={chartRef} id="chart" style={{ width: '100%' }}></div>
            </div>
        </div>
    );
}