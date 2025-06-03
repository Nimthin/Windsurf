import React from 'react';
import { motion } from 'framer-motion';
import * as BiIcons from 'react-icons/bi';

interface InstagramEngagementCardProps {
  instagramEngagementRate: number;
  competitorInstagramEngagementRate: number;
  selectedCompetitor: string;
  cardVariants: any;
}

const InstagramEngagementCard: React.FC<InstagramEngagementCardProps> = ({
  instagramEngagementRate,
  competitorInstagramEngagementRate,
  selectedCompetitor,
  cardVariants
}) => {
  return (
    <motion.div
      custom={3}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300 ease-out"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Engagement Rate (Insta)</p>
          <h3 className="text-3xl font-bold text-nordstrom-blue mt-1">{(instagramEngagementRate * 100).toFixed(2)}%</h3>
        </div>
        <BiIcons.BiTrendingUp className="text-3xl text-nordstrom-blue/70 dark:text-nordstrom-blue/60" />
      </div>
      <div className="mt-4 text-xs text-gray-600 dark:text-gray-300">
        <div className="flex justify-between">
          <p>Nordstrom</p>
          <p className="font-medium">{(instagramEngagementRate * 100).toFixed(2)}%</p>
        </div>
        <div className="flex justify-between mt-1">
          <p>{selectedCompetitor}</p>
          <p className="font-medium">{(competitorInstagramEngagementRate * 100).toFixed(2)}%</p>
        </div>
        {instagramEngagementRate > 0 && competitorInstagramEngagementRate > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p>
              {instagramEngagementRate > competitorInstagramEngagementRate 
                ? `Nordstrom has ${((instagramEngagementRate - competitorInstagramEngagementRate) * 100).toFixed(2)}% higher engagement.`
                : instagramEngagementRate < competitorInstagramEngagementRate
                  ? `${selectedCompetitor} has ${((competitorInstagramEngagementRate - instagramEngagementRate) * 100).toFixed(2)}% higher engagement.`
                  : 'Equal engagement rates.'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InstagramEngagementCard;
