import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartOptions
} from 'chart.js';
import { Brand, InstagramPost, TikTokPost, SocialPlatform } from '../../types';
import EmptyChartFallback from '../common/EmptyChartFallback';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type ReachSectionProps = {
  platform: SocialPlatform;
  selectedBrands: Brand[];
  posts: Record<Brand, (InstagramPost | TikTokPost)[]>;
};

const ReachSection: React.FC<ReachSectionProps> = ({ 
  platform, 
  selectedBrands, 
  posts 
}) => {
  // Vibrant color palette - more visible than pastel
  const vibrantColors = [
    'rgba(66, 133, 244, 0.8)',   // Google Blue
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

  // Check if we have data
  const hasData = useMemo(() => {
    return selectedBrands.some(brand => (posts[brand]?.length || 0) > 0);
  }, [selectedBrands, posts]);

  // Calculate total reach by brand
  const totalReachByBrand = useMemo(() => {
    const reachValues: number[] = [];
    
    selectedBrands.forEach(brand => {
      const brandPosts = posts[brand] || [];
      let totalReach = 0;
      
      brandPosts.forEach(post => {
        if (platform === 'Instagram') {
          const instagramPost = post as InstagramPost;
          // For Instagram, use impressions or reach if available, otherwise estimate based on followers and engagement
          const reach = instagramPost.reach || instagramPost.impressions || 0;
          totalReach += reach;
        } else {
          const tiktokPost = post as TikTokPost;
          // For TikTok, use views as reach
          totalReach += tiktokPost.views || 0;
        }
      });
      
      reachValues.push(totalReach);
    });

    return {
      labels: selectedBrands,
      datasets: [
        {
          label: `Total ${platform} Reach`,
          data: reachValues,
          backgroundColor: selectedBrands.map((_, i) => vibrantColors[i % vibrantColors.length]),
          borderColor: selectedBrands.map((_, i) => vibrantColors[i % vibrantColors.length].replace('0.8', '1')),
          borderWidth: 1,
        }
      ]
    };
  }, [selectedBrands, posts, platform, vibrantColors]);

  // Chart options
  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw as number;
            return `${context.dataset.label}: ${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return (value as number).toLocaleString();
          }
        }
      }
    }
  };

  return (
    // Removed styling from root div, title and description are now handled by DashboardOverview.tsx
    <div>
      <div className="grid grid-cols-1 gap-6">
        {/* Bar Chart - Instagram Reach by Brand */}
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow"> {/* Updated inner card style */}
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">{platform} Reach by Brand</h3> {/* Updated title style */}
          <div className="h-80">
            {!hasData ? (
              <EmptyChartFallback message="No reach data available" />
            ) : (
              <Bar data={totalReachByBrand} options={barOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReachSection;
