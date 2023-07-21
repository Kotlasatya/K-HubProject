import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Dropzone from 'react-dropzone';
import Plot from 'react-plotly.js';
import './App.css';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filteredData, setFilteredData] = useState(null); // State to store the filtered data
  const [selectedChart, setSelectedChart] = useState(''); // State to store the selected chart type
  const [fileUploaded, setFileUploaded] = useState(false); // State to track if the file is uploaded

  const handleFileUpload = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    setFileUploaded(true);

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

      // Remove columns with all null values
      const filteredData = excelData.filter((item) => !Object.values(item).every((value) => value === null));

      // Set the filtered data to the state
      setFilteredData(filteredData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleChartButtonClick = (chartType) => {
    setSelectedChart(chartType);
  };

  const renderCharts = () => {
    if (fileUploaded && filteredData) {
      const columns = Object.keys(filteredData[0]);
      const traces = columns.map((column) => ({
        x: filteredData.map((item) => item[column]),
        y: filteredData.map((item) => item[column]),
        type: 'scatter', // Use 'scatter' for line charts and scatter plots
        mode: 'lines+markers', // Show lines and markers for line charts and scatter plots
        name: column,
      }));

      const barTraces = columns.map((column) => ({
        x: columns,
        y: filteredData.map((item) => item[column]),
        type: 'bar',
        name: column,
      }));

      const lineTraces = columns.map((column) => ({
        x: filteredData.map((item) => item[column]),
        y: filteredData.map((item) => item[column]),
        type: 'line',
        name: column,
      }));

      const pieTrace = {
        labels: columns,
        values: columns.map((column) => filteredData.length),
        type: 'pie',
        name: 'Pie Chart',
      };

      const histogramTraces = columns.map((column) => ({
        x: filteredData.map((item) => item[column]),
        type: 'histogram',
        name: column,
      }));

      const threeDTraces = columns.map((column) => ({
        x: filteredData.map((item) => item[column]),
        y: filteredData.map((item) => item[column]),
        z: filteredData.map((item) => item[column]),
        mode: 'markers',
        type: 'scatter3d',
        name: column,
      }));

      return (
        <>
          <div className="chart-buttons">
            <button className={`chart-button${selectedChart === 'line' ? ' active' : ''}`} onClick={() => handleChartButtonClick('line')}>Line Chart</button>
            <button className={`chart-button${selectedChart === 'scatter' ? ' active' : ''}`} onClick={() => handleChartButtonClick('scatter')}>Scatter Plot</button>
            <button className={`chart-button${selectedChart === 'bar' ? ' active' : ''}`} onClick={() => handleChartButtonClick('bar')}>Bar Chart</button>
            <button className={`chart-button${selectedChart === 'pie' ? ' active' : ''}`} onClick={() => handleChartButtonClick('pie')}>Pie Chart</button>
            <button className={`chart-button${selectedChart === 'histogram' ? ' active' : ''}`} onClick={() => handleChartButtonClick('histogram')}>Histogram Chart</button>
            <button className={`chart-button${selectedChart === '3d' ? ' active' : ''}`} onClick={() => handleChartButtonClick('3d')}>3D Chart</button>
          </div>
          {filteredData && (
            <>
              {selectedChart === 'line' && <Plot data={lineTraces} layout={{ title: 'Line Charts' }} />}
              {selectedChart === 'scatter' && <Plot data={traces} layout={{ title: 'Scatter Plots' }} />}
              {selectedChart === 'bar' && <Plot data={barTraces} layout={{ title: 'Bar Charts', barmode: 'group' }} />}
              {selectedChart === 'pie' && <Plot data={[pieTrace]} layout={{ title: 'Pie Chart' }} />}
              {selectedChart === 'histogram' && <Plot data={histogramTraces} layout={{ title: 'Histogram Chart' }} />}
              {selectedChart === '3d' && <Plot data={threeDTraces} layout={{ title: '3D Chart', scene: { xaxis: { title: 'X Axis' }, yaxis: { title: 'Y Axis' }, zaxis: { title: 'Z Axis' } } }} />}
            </>
          )}
        </>
      );
    }
  };

  return (
    <div className="container">
      <h1 className="title">Project K-Hub</h1>
      <Dropzone onDrop={handleFileUpload}>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            {!fileUploaded && <p>Drag and drop an Excel file here, or click to select one.</p>}
            {uploadedFile && <p className="file-info">Uploaded File: {uploadedFile.name}</p>}
          </div>
        )}
      </Dropzone>
      {fileUploaded && renderCharts()}
    </div>
  );
}

export default App;
