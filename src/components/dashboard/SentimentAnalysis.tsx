import React, { useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2'; // Added Doughnut
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartOptions // Keep ChartOptions if new charts will use it
} from 'chart.js';
import { Brand, InstagramPost, TikTokPost } from '../../types';
import EmptyChartFallback from '../../components/common/EmptyChartFallback';
import { useSocialData } from '../../context/SocialDataContext'; // Added useSocialData

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler // Keep Filler if new Line chart might use fill
);

// Register the filler plugin for area charts
// This customFiller might not be needed if standard fill options are used for new charts.
// Keeping it for now as it doesn't harm.
ChartJS.register({
  id: 'customFiller',
  beforeDraw: (chart) => {
    // Add shadow to chart
    const ctx = chart.ctx;
    ctx.shadowColor = 'rgba(0,0,0,0.05)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  }
});

interface SentimentAnalysisProps {
  platform: 'Instagram' | 'TikTok';
  selectedBrands: Brand[];
  posts: Record<Brand, InstagramPost[] | TikTokPost[] | undefined>;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ platform, selectedBrands, posts }) => {
  const { darkMode } = useSocialData();

  const NORDSTROM_BLUE = '#004170';
  const NORDSTROM_BLUE_FILL = 'rgba(0, 65, 112, 0.1)';

  const SENTIMENT_COLORS = {
    positive: '#10B981', // Emerald 500
    neutral: '#9CA3AF',  // Gray 400
    negative: '#EF4444', // Red 500
    positiveHover: '#059669',
    neutralHover: '#6B7280',
    negativeHover: '#DC2626',
  };

  // Vibrant color palette - kept in case new charts need it, can be removed if not.
  const vibrantColors = [
    // Skipping blue as it's used for Nordstrom
    'rgba(219, 68, 55, 0.8)',    // Google Red
    'rgba(244, 180, 0, 0.8)',    // Google Yellow
    'rgba(15, 157, 88, 0.8)',    // Google Green
    'rgba(171, 71, 188, 0.8)',   // Purple
    'rgba(255, 112, 67, 0.8)',   // Deep Orange
    'rgba(3, 169, 244, 0.8)',    // Light Blue
    'rgba(0, 188, 212, 0.8)',    // Cyan
    'rgba(139, 195, 74, 0.8)',   // Light Green
    'rgba(255, 193, 7, 0.8)',    // Amber
    'rgba(121, 85, 72, 0.8)',    // Brown
    'rgba(96, 125, 139, 0.8)',   // Blue Grey
  ];
  
  // Removed: selectedBrandForSentiment, selectedBrandForVolume, selectedCompetitor, mainBrand states
  // Removed: All useMemo hooks for old chart data (sentimentDistributionByBrand, averageSentimentOverTimeByBrand, etc.)
  // Removed: calculateSentimentDistribution, calculateSentimentOverTime helper functions

  const hasData = useMemo(() => { // This might still be useful
    let totalPosts = 0;
    selectedBrands.forEach(brand => {
      totalPosts += (posts[brand]?.length || 0);
    });
    return totalPosts > 0;
  }, [selectedBrands, posts]);
  
  const checkAndFixTikTokData = useMemo(() => { // This might still be useful
    if (platform === 'TikTok') {
      let hasPosts = false;
      let hasSentiment = false;
      selectedBrands.forEach(brand => {
        const brandPosts = posts[brand] || [];
        if (brandPosts.length > 0) {
          hasPosts = true;
          if (brandPosts.some(post => 'sentimentScore' in post || 'sentimentLabel' in post)) {
            hasSentiment = true;
          }
        }
      });
      return hasPosts && !hasSentiment;
    }
    return false;
  }, [platform, selectedBrands, posts]);
  
  // Common chart options (can be refined for new charts later)
  const commonChartOptions: ChartOptions<'line'> | ChartOptions<'doughnut'> = { // Example, will need specific options for new charts
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: darkMode ? 'rgba(255, 255, 255, 0.8)' : '#333',
          padding: 10,
        }
      },
      tooltip: {
        titleColor: darkMode ? 'rgba(255, 255, 255, 0.9)' : undefined,
        bodyColor: darkMode ? 'rgba(255, 255, 255, 0.9)' : undefined,
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : undefined,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            const value = context.raw as number;
            const sum = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = sum > 0 ? ((value / sum) * 100).toFixed(1) + '%' : '0%';
            return `${label}${value} (${percentage})`;
          }
        }
      }
    }
  };

  // Removed pieOptions as it's not used for the new charts yet
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${percentage}% (${value})`;
          }
        }
      }
    },
  };

  // Removed pieOptions as it's not used for the new charts yet

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: darkMode ? 'rgba(255, 255, 255, 0.8)' : '#333',
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        titleColor: darkMode ? 'rgba(255, 255, 255, 0.9)' : undefined,
        bodyColor: darkMode ? 'rgba(255, 255, 255, 0.9)' : undefined,
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : undefined
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#333',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        // beginAtZero: true, // Sentiment can be negative, allow chart to determine scale
        title: {
          display: true,
          text: 'Avg. Sentiment Score',
          color: darkMode ? 'rgba(255, 255, 255, 0.9)' : '#333',
        },
        ticks: {
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : '#333',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const formatDateForGrouping = (dateInput: string | number | Date): string => {
    const date = typeof dateInput === 'number' && dateInput < 1E12 ? new Date(dateInput * 1000) : new Date(dateInput);
    if (isNaN(date.getTime())) {
      // console.warn("Invalid date input for formatDateForGrouping:", dateInput);
      return ''; // Or throw error, or return a specific marker
    }
    return date.toISOString().split('T')[0];
  };

  const formatDateForLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
     // Add timezone offset to ensure correct date when converting from UTC-like ISO string
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const comparativeAvgSentimentOverTimeData = useMemo(() => {
    if (!hasData) return { labels: [], datasets: [] };

    const dailyBrandSentiments: Record<string, Record<Brand, number[]>> = {};
    const allDates = new Set<string>();

    selectedBrands.forEach(brand => {
      const brandPosts = posts[brand] || [];
      brandPosts.forEach(post => {
        const timestamp = platform === 'Instagram'
          ? (post as InstagramPost).timestamp
          : (post as TikTokPost).createTime;
        const score = post.sentimentScore;

        if (timestamp && typeof score === 'number') {
          const dateKey = formatDateForGrouping(timestamp);
          if (!dateKey) return; // Skip if date is invalid

          allDates.add(dateKey);
          if (!dailyBrandSentiments[dateKey]) {
            dailyBrandSentiments[dateKey] = {} as Record<Brand, number[]>;
          }
          if (!dailyBrandSentiments[dateKey][brand]) {
            dailyBrandSentiments[dateKey][brand] = [];
          }
          dailyBrandSentiments[dateKey][brand].push(score);
        }
      });
    });

    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const chartLabels = sortedDates.map(formatDateForLabel);
    const chartDatasets = [];

    const nordstromBrandString = 'Nordstrom' as Brand; // Ensure 'Nordstrom' is treated as Brand type
    const nordstromIndex = selectedBrands.indexOf(nordstromBrandString);

    if (selectedBrands.includes(nordstromBrandString)) {
      const nordstromData = sortedDates.map(date => {
        const scores = dailyBrandSentiments[date]?.[nordstromBrandString];
        return scores && scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      });
      chartDatasets.push({
        label: 'Nordstrom',
        data: nordstromData,
        borderColor: NORDSTROM_BLUE,
        backgroundColor: NORDSTROM_BLUE_FILL,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      });
    }

    let colorIdx = 0;
    selectedBrands.forEach(brand => {
      if (brand === nordstromBrandString) return;

      const brandData = sortedDates.map(date => {
        const scores = dailyBrandSentiments[date]?.[brand];
        return scores && scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      });

      const color = vibrantColors[colorIdx % vibrantColors.length];
      chartDatasets.push({
        label: brand,
        data: brandData,
        borderColor: color.replace('0.8', '1'),
        backgroundColor: color.replace('0.8', '0.1'),
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      });
      colorIdx++;
    });

    return { labels: chartLabels, datasets: chartDatasets };
  }, [platform, selectedBrands, posts, hasData, vibrantColors, darkMode]); // darkMode for options re-calc if needed


  if (!hasData && !checkAndFixTikTokData) {
    return (
      // Root div styling is removed as it will be handled by the parent in DashboardOverview.tsx
      <div>
        {/* Title is now handled by DashboardOverview.tsx */}
        <EmptyChartFallback message={`No ${platform} data available for sentiment analysis`} />
      </div>
    );
  }

  return (
    // Root div styling is removed as it will be handled by the parent in DashboardOverview.tsx
    <div>
      {/* Title is now handled by DashboardOverview.tsx, descriptive paragraph can remain or be moved */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Sentiment analysis of {platform} posts for selected brands based on post text/captions.
      </p>
      
      {checkAndFixTikTokData ? (
        <div className="p-6 text-center bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            <strong>Note:</strong> TikTok sentiment analysis requires text data to be properly loaded. 
            Please ensure your TikTok data includes captions or text content.
          </p>
        </div>
      ) : (
        // New placeholder structure for two charts
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Comparative Average Sentiment Score Over Time */}
          <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Comparative Average Sentiment Score Over Time
            </h3>
            <div className="h-80">
              {comparativeAvgSentimentOverTimeData.labels.length > 0 ? (
                <Line data={comparativeAvgSentimentOverTimeData} options={lineChartOptions} />
              ) : (
                <EmptyChartFallback message="No time-series sentiment data available for selected brands." />
              )}
            </div>
          </div>

          {/* Placeholder for New Chart 2: Sentiment Distribution Comparison */}
          <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Sentiment Distribution (Nordstrom vs. Competitors)
            </h3>
            <div className="h-auto"> {/* Adjusted height to auto, individual donuts will have fixed height */}
              {sentimentDistributionData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {sentimentDistributionData.map(brandData => (
                    <div key={brandData.brandName} className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
                      <h4 className="text-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{brandData.brandName}</h4>
                      <div className="w-full h-56"> {/* Fixed height for each donut chart container */}
                        <Doughnut data={brandData.chartData} options={doughnutChartOptions} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                   <EmptyChartFallback message="No sentiment distribution data available." />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
                <Select
                  labelId="volume-competitor-select-label"
                  id="volume-competitor-select"
                  value={selectedCompetitor}
                  onChange={(e: SelectChangeEvent) => setSelectedCompetitor(e.target.value as Brand)}
                  label="Competitor Brand"
                >
                  {selectedBrands.filter(brand => brand !== mainBrand).map(brand => (
  const sentimentDistributionData = useMemo(() => {
    if (!hasData) return [];

    return selectedBrands.map(brand => {
      const brandPosts = posts[brand] || [];
      let positiveCount = 0;
      let neutralCount = 0;
      let negativeCount = 0;

      brandPosts.forEach(post => {
        const score = post.sentimentScore;
        if (typeof score === 'number') {
          if (score > 0) positiveCount++;
          else if (score < 0) negativeCount++;
          else neutralCount++;
        } else if (post.sentimentLabel) { // Fallback to label if score is not present
          if (post.sentimentLabel === 'positive') positiveCount++;
          else if (post.sentimentLabel === 'negative') negativeCount++;
          else neutralCount++;
        }
      });

      return {
        brandName: brand,
        chartData: {
          labels: ['Positive', 'Neutral', 'Negative'],
          datasets: [{
            data: [positiveCount, neutralCount, negativeCount],
            backgroundColor: [
              SENTIMENT_COLORS.positive,
              SENTIMENT_COLORS.neutral,
              SENTIMENT_COLORS.negative,
            ],
            hoverBackgroundColor: [
              SENTIMENT_COLORS.positiveHover,
              SENTIMENT_COLORS.neutralHover,
              SENTIMENT_COLORS.negativeHover,
            ],
            borderColor: darkMode ? '#374151' : '#FFFFFF', // gray-800 for dark, white for light
            borderWidth: 2,
          }]
        }
      };
    }).filter(data => data.chartData.datasets[0].data.some(d => d > 0)); // Only include if there's some data
  }, [platform, selectedBrands, posts, hasData, darkMode]);


  if (!hasData && !checkAndFixTikTokData) {
    return (
      // Root div styling is removed as it will be handled by the parent in DashboardOverview.tsx
      <div>
        {/* Title is now handled by DashboardOverview.tsx */}
        <EmptyChartFallback message={`No ${platform} data available for sentiment analysis`} />
      </div>
    );
  }

  return (
    // Root div styling is removed as it will be handled by the parent in DashboardOverview.tsx
    <div>
      {/* Title is now handled by DashboardOverview.tsx, descriptive paragraph can remain or be moved */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Sentiment analysis of {platform} posts for selected brands based on post text/captions.
      </p>

      {checkAndFixTikTokData ? (
        <div className="p-6 text-center bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            <strong>Note:</strong> TikTok sentiment analysis requires text data to be properly loaded.
            Please ensure your TikTok data includes captions or text content.
          </p>
        </div>
      ) : (
        // New placeholder structure for two charts
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Comparative Average Sentiment Score Over Time */}
          <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Comparative Average Sentiment Score Over Time
            </h3>
            <div className="h-80">
              {comparativeAvgSentimentOverTimeData.labels.length > 0 ? (
                <Line data={comparativeAvgSentimentOverTimeData} options={lineChartOptions} />
              ) : (
                <EmptyChartFallback message="No time-series sentiment data available for selected brands." />
              )}
            </div>
          </div>

          {/* Chart 2: Sentiment Distribution Comparison */}
          <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg shadow">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Sentiment Distribution Comparison
            </h3>
            <div className="h-auto"> {/* Adjusted height to auto, individual donuts will have fixed height */}
              {sentimentDistributionData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {sentimentDistributionData.map(brandData => (
                    <div key={brandData.brandName} className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
                      <h4 className="text-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{brandData.brandName}</h4>
                      <div className="w-full h-56"> {/* Fixed height for each donut chart container */}
                        <Doughnut data={brandData.chartData} options={doughnutChartOptions} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                   <EmptyChartFallback message="No sentiment distribution data available." />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysis;
