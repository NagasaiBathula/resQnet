export interface StateData {
  state: string;
  districts: string[];
}

export const INDIA_LOCATIONS: StateData[] = [
  {
    state: "Maharashtra",
    districts: ["Mumbai", "Pune", "Thane", "Nagpur", "Nashik", "Aurangabad", "Kolhapur", "Solapur"],
  },
  {
    state: "Tamil Nadu",
    districts: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore"],
  },
  {
    state: "Delhi",
    districts: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
  },
  {
    state: "Karnataka",
    districts: ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davangere", "Ballari"],
  },
  {
    state: "West Bengal",
    districts: ["Kolkata", "Darjeeling", "Howrah", "Hooghly", "Asansol", "Siliguri", "Kharagpur"],
  },
  {
    state: "Telangana",
    districts: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam"],
  },
  {
    state: "Andhra Pradesh",
    districts: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kakinada", "Kurnool"],
  },
  {
    state: "Gujarat",
    districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Jamnagar"],
  },
  {
    state: "Rajasthan",
    districts: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar"],
  },
  {
    state: "Kerala",
    districts: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Kannur"],
  },
];
