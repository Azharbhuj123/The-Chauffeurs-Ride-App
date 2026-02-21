export const COLORS = {
  success: '#189237',
  error: '#FF3A2F',
  warning: '#EEAF32',
  info: '#3498db',
};

export const error_msg = {
  color: 'red',
  fontSize: 12,
  marginTop: 0,
  marginBottom: 5,
  marginLeft: 10,
  fontWeight: '600',
  fontFamily: 'Poppins-Regular',
};

export const no_found = {
  textAlign: 'center',
  color: '#9CA3AF',
  fontSize: 14,
  marginVertical: 16,
  fontStyle: 'italic',
  alignItems: 'center',
  justifyContent: 'center',
};

export const CANCEL_REASONS = {
  User: [
    { id: 1, reason: 'Driver took too long to arrive' },
    { id: 2, reason: 'Change of plans' },
    { id: 3, reason: 'Booked another ride' },
    { id: 4, reason: 'Incorrect pickup location' },
    { id: 5, reason: 'Other reason' },
  ],
  Driver: [
    { id: 1, reason: 'Passenger was unresponsive' },
    { id: 2, reason: 'Passenger took too long to arrive' },
    { id: 3, reason: 'Incorrect drop-off location' },
    { id: 4, reason: 'Vehicle issue or emergency' },
    { id: 5, reason: 'Other reason' },
  ],
};


export const vehicle_class = [
  { label: "Hatchback", value: "Hatchback" },
  { label: "Sedan", value: "Sedan" },
  { label: "SUV", value: "SUV" },
  { label: "Van / MPV", value: "Van / MPV" },
  { label: "XL / Large", value: "XL / Large" },
  { label: "Luxury Sedan", value: "Luxury Sedan" },
  { label: "Prestige Sedan", value: "Prestige Sedan" },
  { label: "Luxury SUV", value: "Luxury SUV" },
  { label: "Electric (EV)", value: "Electric (EV)" },
  { label: "Motorbike", value: "Motorbike" },
  { label: "Auto Rickshaw", value: "Auto Rickshaw" },
  { label: "Chauffeur Class", value: "Chauffeur Class" },
];

export const category_class = [
  { label: "Luxury", value: "Luxury" },
  { label: "Business", value: "Business" },
  { label: "Economy", value: "Economy" },
];


export const monthly_filter = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];



export const GOOGLE_MAP_API_KEY = 'AIzaSyAO096xo1HoduYAuLsAwrHkNUNRedReQkQ';

export const formatAPIDate = (date) => {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatAPITime = date => {
  if (!date) return '';
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};



  // Helper for 24h formatting
  // 24h Formatter: Returns "HH:mm" or placeholder
  export const  format24h = date => {
    if (!date) return 'Select time';
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };
  export const  formatDate = date => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US'); // MM/DD/YYYY
  };





    export const formatDate2 = (date) => {
    return date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
      : '';
  };
  
    export const formatTime = (time) => {
    return time
      ? `${String(time.getHours()).padStart(2,'0')}:${String(time.getMinutes()).padStart(2,'0')}`
      : '';
  };