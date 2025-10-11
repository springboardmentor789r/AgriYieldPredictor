import React, { useState, useRef } from 'react';
import { Card, Button, Spinner, Table } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './TimeSeries.css';

interface TimeSeriesData {
  date: string;
  value: number;
}

const TimeSeries: React.FC = () => {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // Skip header row if exists
        const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;
        
        const processedData = lines.slice(startIndex).map(line => {
          const [date, value] = line.split(',');
          return {
            date: date.trim(),
            value: Number(value.trim()) || 0
          };
        });

        setData(processedData);
      } catch (err) {
        setError('Error reading the file. Please make sure it has "date,value" format.');
        console.error('File read error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading the file. Please try again.');
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  // Chart data
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Time Series Data',
        data: data.map(item => item.value),
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78, 115, 223, 0.05)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#4e73df',
        pointBorderColor: '#4e73df',
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#4e73df',
        pointHoverBorderColor: '#4e73df',
        pointHitRadius: 10,
        pointBorderWidth: 2,
        fill: true
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 7
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          maxTicksLimit: 5
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Time Series Analysis</h1>
        <div>
          <Button 
            variant="primary" 
            size="sm" 
            className="shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload fa-sm me-2"></i>
                Upload Data
              </>
            )}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            style={{ display: 'none' }}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">Time Series Chart</h6>
            </Card.Header>
            <Card.Body>
              <div className="chart-area" style={{ height: '400px' }}>
                {data.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-chart-line fa-4x text-gray-300 mb-3"></i>
                    <p className="text-gray-500">Upload your data to see the time series visualization</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-4">
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">Data Preview</h6>
            </Card.Header>
            <Card.Body>
              {data.length > 0 ? (
                <div className="table-responsive">
                  <Table bordered className="small">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th className="text-end">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 10).map((row, i) => (
                        <tr key={i}>
                          <td>{row.date}</td>
                          <td className="text-end">{row.value.toFixed(2)}</td>
                        </tr>
                      ))}
                      {data.length > 10 && (
                        <tr>
                          <td colSpan={2} className="text-center small">
                            ... and {data.length - 10} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-table fa-3x text-gray-300 mb-3"></i>
                  <p className="text-gray-500">No data to display</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimeSeries;