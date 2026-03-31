import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`bg-white/5 animate-pulse rounded-2xl ${className}`}></div>
  );
};

export default Skeleton;
