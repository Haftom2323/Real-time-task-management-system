import React from 'react';

const NotificationBadge: React.FC = () => {
  // Use custom hook to get unread notifications count
  return (
    <span>
      Notifications {/* <Badge count={unreadCount} /> */}
    </span>
  );
};

export default NotificationBadge;