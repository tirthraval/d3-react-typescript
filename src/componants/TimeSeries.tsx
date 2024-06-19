import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import CreateLabel from "./CreateLabel";
export interface Props {
  series: string;
  timestamp: string;
  value: string;
  label: string;
}

interface DataPoint {
  series: string;
  timestamp: Date;
  value: number;
  label: string;
}

const TimeSeries = ({ data }: { data: Props[] }) => {
const [visible, setVisble] = useState<Boolean>(true)
  const svgRef = useRef<SVGSVGElement | null>(null);
  let newXScale: d3.ScaleTime<number, number>;
  let newYScale: d3.ScaleLinear<number, number>;
   

  useEffect(() => {
    const filterData = data.filter((d: Props) => d.series === "series_a");
    const transformData: DataPoint[] = filterData.map((d: Props) => ({
      series: d.series,
      timestamp: d3.isoParse(d.timestamp) as Date,
      value: parseFloat(d.value),
      label: d.label,
    }));
    const drawChart = () => {
      let selectedDataPoints: DataPoint[] = [];
      const margin = { top: 20, right: 20, bottom: 30, left: 70 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;
      d3.select(svgRef.current).selectAll("*").remove();
      const svg = d3
        .select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr(
          "height",
          height + margin.top + margin.bottom + height / 2 + margin.bottom
        )
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const filterDateArray = transformData.map((d) => d.timestamp);
      const dateDomain = d3.extent(filterDateArray) as [Date, Date];

      const xScale = d3.scaleTime().domain(dateDomain).range([0, width]);
      const xAxis = d3.axisBottom(xScale).ticks(7).tickSize(10);

      const gX = svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(filterData, (data) => +data.value) as number])
        .range([height, 0]);
      const gY = svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

      const line = d3
        .line<DataPoint>()
        .x((d) => xScale(d.timestamp))
        .y((d) => y(d.value));

      const path = svg
        .append("path")
        .datum(transformData)
        .attr("fill", "none")
        .attr("class", "line")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

      const svg2 = svg
        .append("g")
        .attr(
          "transform",
          `translate(0, ${height + margin.bottom + margin.top})`
        );

      const y2 = d3
        .scaleLinear()
        .domain([0, d3.max(transformData, (data) => +data.value) as number])
        .range([height / 2 - margin.bottom, margin.top]);
      const line2 = d3
        .line<DataPoint>()
        .x((d) => xScale(d.timestamp))
        .y((d) => y2(d.value));

      svg2
        .append("path")
        .datum(transformData)
        .attr("fill", "none")
        .attr("class", ".line2")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line2);

      svg2
        .append("g")
        .attr("transform", `translate(0, ${height / 2 - margin.bottom})`)
        .call(xAxis);
      const brush = d3
        .brushX()
        .extent([
          [0, 0],
          [width, height / 2 - margin.bottom],
        ])
        .on("brush", brushed)
        .on("end", brushended);
      const maxDate = d3.max(transformData, (d) => d.timestamp) as Date;
      const defaultBrushSelection = [
        xScale(maxDate) - width / 10,
        xScale(maxDate),
      ] as [number, number];
      svg2
        .append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, defaultBrushSelection);
      const brush1 = d3
        .brushX()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("end", clearBrush1);

      const Brush1G = svg.append("g").attr("class", "brush1").call(brush1);
      function brushed(event: any) {
        const selection = event.selection;
        if (selection) {
          const [x0, x1] = selection.map(xScale.invert);
          const newData = transformData.filter(
            (d) => d.timestamp >= x0 && d.timestamp <= x1
          );

          updateGraph(newData);
          svg.selectAll(".circle").remove();
        }
      }

      function brushended(event: any) {
        if (event.selection) {
          svg
            .selectAll(".circle")
            .data(selectedDataPoints)
            .enter()
            .append("circle")
            .attr("class", "circle4")
            .attr("cx", (d: DataPoint) => newXScale(d.timestamp))
            .attr("cy", (d: DataPoint) => newYScale(d.value))
            .attr("r", 2)
            .style("fill", "red");
        }
      }

      function clearBrush1(event: any) {
        if (event.selection) {
        //setVisble(true)
          const extent = event.selection;
          const [x0, x1] = extent.map(newXScale.invert);
          const selectedData = transformData.filter(
            (d: DataPoint) => d.timestamp >= x0 && d.timestamp <= x1
          );
        //   setSelectedDataPoints(prevPoints  => [...prevPoints, ...selectedData])
          selectedDataPoints = [...selectedDataPoints, ...selectedData];
          svg
            .selectAll(".circle")
            .data(selectedDataPoints)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", (d: DataPoint) => newXScale(d.timestamp))
            .attr("cy", (d: DataPoint) => newYScale(d.value))
            .attr("r", 2)
            .style("fill", "red");
          Brush1G.call(brush.move, null);
          svg2
            .selectAll(".circle")
            .data(selectedData)
            .enter()
            .append("circle")
            .attr("class", "circle1")
            .attr("cx", (d: DataPoint) => xScale(d.timestamp))
            .attr("cy", (d: DataPoint) => y2(d.value))
            .attr("r", 2)
            .style("fill", "red");
          Brush1G.call(brush.move, null);
        }
      }
      function updateGraph(zoomedData: DataPoint[]) {
        svg.selectAll(".circle4").remove();
        newXScale = d3
          .scaleTime()
          .domain(d3.extent(zoomedData, (d) => d.timestamp) as [Date, Date])
          .range([0, width]);
        newYScale = d3
          .scaleLinear()
          .domain([0, d3.max(zoomedData, (d) => +d.value) as number])
          .range([height, 0]);

        const newLine = d3
          .line<DataPoint>()
          .x((d) => newXScale(d.timestamp))
          .y((d) => newYScale(d.value));

        path.datum(zoomedData).transition().attr("d", newLine);
        gX.transition()
        .call(d3.axisBottom(newXScale).ticks(7).tickSize(10));

        gY.transition().call(d3.axisLeft(newYScale));
      }
    };

    drawChart();
  }, [data]);
  return (
    <div className="flex gap-4">
      <svg ref={svgRef}></svg>
      {visible && <CreateLabel/>}
    </div>
  );
};

export default TimeSeries;
