import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Brand, InstagramPost, TikTokPost, SocialPlatform } from '../../types';
import EmptyChartFallback from '../common/EmptyChartFallback';
import { useSocialData } from '../../context/SocialDataContext';
import { generateUnifiedHashtagChart } from '../../utils/chartUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type HashtagSectionProps = {
  platform: SocialPlatform;
  selectedBrands: Brand[];
  // The 'posts' prop is not directly used as generateUnifiedHashtagChart expects full SocialData structure
};

const HashtagSection: React.FC<HashtagSectionProps> = ({
  platform,
  selectedBrands,
}) => {
  const { darkMode, socialData: contextSocialData } = useSocialData();

  const hasData = useMemo(() => {
    if (!contextSocialData) return false;
    return selectedBrands.some(brand => {
      const brandInstaData = contextSocialData.instagram[brand]?.posts || [];
      const brandTiktokData = contextSocialData.tiktok[brand]?.posts || [];
      return brandInstaData.length > 0 || brandTiktokData.length > 0;
    });
  }, [selectedBrands, contextSocialData]);

  const unifiedChartData = useMemo(() => {
    if (!hasData || !contextSocialData) return { labels: [], datasets: [] };
    return generateUnifiedHashtagChart(
      contextSocialData.instagram,
      contextSocialData.tiktok,
      selectedBrands,
      platform
    );
  }, [hasData, contextSocialData, selectedBrands, platform]);

  const chartOptions = useMemo((): ChartOptions<'bar'> => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x' as const, // Vertical grouped bar chart
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: darkMode ? 'rgba(255, 255, 255, 0.8)' : undefined,
            font: {
              family: 'Inter, sans-serif',
            }
          }
        },
        title: {
          display: false, // No main title for this sub-chart
        },
        tooltip: {
          backgroundColor: darkMode ? '#051424' : '#FFFFFF',
          titleColor: darkMode ? 'rgba(255, 255, 255, 0.9)' : '#191919',
          bodyColor: darkMode ? 'rgba(255, 255, 255, 0.8)' : '#191919',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          titleFont: { family: 'Inter, sans-serif' },
          bodyFont: { family: 'Inter, sans-serif' },
          // Default tooltips for grouped bar should show brand (dataset label) and value.
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Top Hashtags', // X-axis title
            color: darkMode ? 'rgba(255, 255, 255, 0.9)' : undefined,
            font: {
              family: 'Inter, sans-serif',
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
            font: {
              family: 'Inter, sans-serif',
            }
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Frequency Count', // Y-axis title
            color: darkMode ? 'rgba(255, 255, 255, 0.9)' : undefined,
            font: {
              family: 'Inter, sans-serif',
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : undefined,
            font: {
              family: 'Inter, sans-serif',
            }
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 6, // Rounded bars
        }
      }
    };
  }, [darkMode]);

  return (
    <div>
      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
        Top 5 hashtags used by selected brands on {platform}, showing frequency for each brand.
      </p>
      <div className={`p-4 rounded-lg shadow ${darkMode ? 'bg-gray-700/30' : 'bg-white'}`}>
        <div className="h-96 md:h-[450px]"> {/* Increased height for better readability of grouped bars */}
          {!hasData || !unifiedChartData.labels || unifiedChartData.labels.length === 0 ? (
            <EmptyChartFallback message={`No ${platform} hashtag data available for the selected brands.`} />
          ) : (
            <Bar data={unifiedChartData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HashtagSection;
