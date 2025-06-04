define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/text!D3CatalogChart/template/D3CatalogChart.html"
], function (declare, _WidgetBase, _TemplatedMixin, domClass, domConstruct, widgetTemplate) {
    "use strict";

    return declare("D3CatalogChart.widget.D3CatalogChart", [_WidgetBase, _TemplatedMixin], {
        templateString: widgetTemplate,

        // DOM elements
        chartContainerNode: null,
        chartNode: null, // This will be the div where D3 mounts the SVG

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            domClass.add(this.domNode, "mx-widget-d3-catalog-chart"); // Add class for CSS scoping
            this._setupChart();
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            // If you need to react to data changes, do it here.
            // For this static chart, we can optionally re-render or do nothing.
            // this._setupChart(); // Uncomment if you want to redraw on context change
            if (callback) {
                callback();
            }
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
            // Clean up D3 chart, event handlers, etc.
            if (this.chartNode) {
                domConstruct.empty(this.chartNode);
            }
        },

        _setupChart: function () {
            // Ensure D3 is loaded (it should be, via externalResources in XML)
            if (typeof d3 === 'undefined') {
                logger.error(this.id + ": D3 is not loaded. Make sure it's included in the widget XML or page.");
                return;
            }

            // Clear previous chart if any
            if (this.chartNode) {
                 domConstruct.empty(this.chartNode);
            } else {
                // This is a fallback if template is not used or chartNode is not defined in template
                // For the template provided in the prompt, this.chartNode should be defined.
            }

            // Original D3.js code adapted for Mendix widget structure

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

            // Chart dimensions
            const margin = { top: 80, right: 150, bottom: 40, left: 180 };
            const width = 1200 - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;

            // Create SVG - selecting the chartNode from the template
            const svg = d3.select(this.chartNode) // Use this.chartNode from the template
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
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
            const today = new Date(); // Dynamically set to current date
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
                .text(d3.timeFormat("%-m/%-d/%Y")(today)); // Dynamically format the date string

            // Draw industry rows
            industries.forEach((industry, i) => {
                const y = yScale(industry.name) + yScale.bandwidth() / 2;
                
                // Industry name
                svg.append("text")
                    .attr("class", "industry-text")
                    .attr("x", -10)
                    .attr("y", y + 5) // Adjusted for better alignment
                    .attr("text-anchor", "end")
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
                let upcomingXPos = width + 20; // Default position for TBD, ensures it's off-chart unless calculated
                let showUpcomingBox = true;

                if (industry.upcoming !== "TBD") {
                    const year = parseInt("20" + industry.upcoming.substring(0, 2));
                    const month = parseInt(industry.upcoming.substring(2, 4)) - 1; // JS months 0-indexed
                    const upcomingDate = new Date(year, month, 1);

                    if (upcomingDate <= timeScale.domain()[1]) { // Check if date is within chart's time domain
                        upcomingXPos = timeScale(upcomingDate);
                    } else {
                        // If date is beyond the chart, place it at the edge or handle as TBD visually
                        // For now, we'll still draw it at the calculated position if it's far right,
                        // but the continuity line needs to be capped.
                         upcomingXPos = width; // Cap at the end of the chart for line drawing
                    }
                } else {
                    upcomingXPos = width + 20; // Explicitly place TBD box outside the main chart drawing area to the right
                }
                
                if (industry.current) {
                    const currentX = timeScale(industry.current);
                    let lineEndX = upcomingXPos;
                    if (industry.upcoming === "TBD" || timeScale(new Date(parseInt("20" + industry.upcoming.substring(0,2)), parseInt(industry.upcoming.substring(2,4))-1,1)) > timeScale.domain()[1]){
                         lineEndX = width; // Cap line at the chart edge for TBD or future dates
                    } else {
                        lineEndX = timeScale(new Date(parseInt("20" + industry.upcoming.substring(0,2)), parseInt(industry.upcoming.substring(2,4))-1,1))
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
                        .attr("rx", 10) // For rounded corners to simulate diamond with rotation
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
                
                // Upcoming box - position adjusted for clarity
                let boxX = upcomingXPos;
                if (industry.upcoming !== "TBD") {
                     const year = parseInt("20" + industry.upcoming.substring(0, 2));
                     const month = parseInt(industry.upcoming.substring(2, 4)) - 1;
                     const upcomingDate = new Date(year, month, 1);
                     if (upcomingDate <= timeScale.domain()[1]) {
                        boxX = timeScale(upcomingDate) -30 ; // Center the box on the date if within domain
                     } else {
                        boxX = width + 20; // Place it off chart if date is beyond domain
                     }
                } else {
                    boxX = width + 20; // Place TBD box off chart
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
                    .attr("x", boxX + 30) // Center text in the box
                    .attr("y", y + 5)      // Vertically align text in the box
                    .text(industry.upcoming);
            });
        }
    });
}); 