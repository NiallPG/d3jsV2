# Catalog Release Chart

A Mendix widget that visualizes catalog release schedules across different industries using D3.js.

## Features
- Interactive timeline visualization showing retired, current, and upcoming catalog releases
- Data-driven from Mendix entities - no code changes needed to update dates
- Responsive design that adapts to container size
- Optional legend and today marker
- Clickable elements with configurable actions
- Auto-refresh capability

## Usage

### 1. Set up your domain model
Create an entity (e.g., `CatalogRelease`) with the following attributes:
- `Name` (String) - Industry/category name
- `RetiredDate` (DateTime) - When the catalog was retired
- `CurrentDate` (DateTime) - Current catalog date
- `UpcomingCode` (String) - Code for upcoming catalog (e.g., "2507" or "TBD")

### 2. Add the widget to a page
1. Drag the Catalog Release Chart widget onto your page
2. Configure the data source to point to your CatalogRelease entity
3. Map the attributes to the corresponding widget properties

### 3. Edit release dates
Simply update the dates in your Mendix application - no code changes required! The chart will automatically reflect the new dates when the page refreshes.

## Configuration

### Data Source
- **Catalog Release Data**: Connect to your list of catalog releases
- **Name/Retired Date/Current Date/Upcoming Code**: Map to your entity attributes

### General
- **Chart Title**: Customize the chart title
- **Show Legend**: Toggle the legend display

### Behavior
- **On Item Click**: Configure actions when users click chart elements
- **Auto Refresh Interval**: Set automatic refresh in seconds (0 = disabled)

### Appearance
- **Chart Height**: Set the chart height in pixels
- **Show Today Line**: Toggle the current date indicator

## Development

1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Make changes and test in your Mendix project