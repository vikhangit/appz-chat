
import moment from 'moment'
export const numberWithCommas = (x: any) => {
  return x.toLocaleString();
  // let t1 = Math.round(x);
  // return t1.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

export const status = [
  {
    value: 0,
    name: 'Chờ xử lý',
  },
  {
    value: 1,
    name: 'Đã duyệt',
  },
  {
    value: 2,
    name: 'Đã chuyển tiền',
  },
  {
    value: -1,
    name: 'Đã bị huỷ',
  },
]

export const months = [
  {
    value: 1,
    description: 'Tháng 1'
  },
  {
    value: 2,
    description: 'Tháng 2'
  },
  {
    value: 3,
    description: 'Tháng 3'
  },
  {
    value: 4,
    description: 'Tháng 4'
  },
  {
    value: 5,
    description: 'Tháng 5'
  },
  {
    value: 6,
    description: 'Tháng 6'
  },
  {
    value: 7,
    description: 'Tháng 7'
  },
  {
    value: 8,
    description: 'Tháng 8'
  },
  {
    value: 9,
    description: 'Tháng 9'
  },
]

export const getYears = () => {
  let toYear = moment().year();
  let fromYear = toYear - 50;
  
  let years = [];
  for(let i = toYear; i > fromYear; i--) {
    years.push({
      value: i,
      description: i
    });
  }

  return years;
}

export const years = getYears();


export const salaries = [
  {
    value: 0,
    description: 'Dưới 3 triệu'
  },
  {
    value: 1,
    description: '3 - 5 triệu'
  },
  {
    value: 2,
    description: '5 - 7 triệu'
  },
  {
    value: 3,
    description: '7 - 10 triệu'
  },
  {
    value: 4,
    description: '10 - 12 triệu'
  },
  {
    value: 5,
    description: '12 - 15 triệu'
  },
  {
    value: 6,
    description: '15 - 20 triệu'
  },
  {
    value: 7,
    description: '20 - 25 triệu'
  },
  {
    value: 8,
    description: '25 - 30 triệu'
  },
  {
    value: 9,
    description: 'Trên 30 triệu'
  },
  {
    value: 99,
    description: 'Thoả thuận'
  },
]
export const getSalary = (value: any) => {
  const item = salaries.find(item => item.value === value);
  return item;
}

export const years_of_working = [
  {
    value: 0,
    description: 'Mới tốt nghiệp/chưa có kinh nghiệm'
  },
  {
    value: 1,
    description: '1 năm'
  },
  {
    value: 2,
    description: '2 năm'
  },
  {
    value: 3,
    description: '3 năm'
  },
  {
    value: 4,
    description: '4 năm'
  },
  {
    value: 5,
    description: '5 năm'
  },
  {
    value: 6,
    description: '5 - 7 năm'
  },
  {
    value: 7,
    description: '7 - 10 năm'
  },
  {
    value: 8,
    description: '10 - 12 năm'
  },
  {
    value: 9,
    description: '12 - 15 năm'
  },
  {
    value: 10,
    description: '15 - 20 năm'
  },
  {
    value: 99,
    description: 'Trên 20 năm'
  },
]
export const getYearOfWorking = (value: any) => {
  const item = years_of_working.find(item => item.value === value);
  return item;
}

export const skills_rate = [
  {
    value: 0,
    description: 'Người mới'
  },
  {
    value: 1,
    description: 'Người mới bắt đầu'
  },
  {
    value: 2,
    description: 'Có kinh nghiệm'
  },
  {
    value: 3,
    description: 'Có nhiều kinh nghiệm'
  },
  {
    value: 4,
    description: 'Chuyên gia'
  },
]
export const getSkillRate = (value: any) => {
  const item = skills_rate.find(item => item.value === value);
  return item;
}

export const dateRanges = [
  {
    value: 0,
    description: '24 giờ qua'
  },
  {
    value: 1,
    description: '7 ngày qua'
  },
  {
    value: 2,
    description: '14 ngày qua'
  },
  {
    value: 3,
    description: '30 ngày qua'
  },
]
export const getDateRange = (value: any) => {
  const item = dateRanges.find(item => item.value === value);
  return item;
}

export const otoTypes= {
  "1": {
    name: "Dưới 6 chỗ ngồi - 480.700 VND",
    price: 480700
  },
  "2": {
    name: "Từ 6 đến 11 chỗ ngồi - 873.400 VND",
    price: 873400
  },
  "3": {
    name: "Xe bán tải (pickup) - 480.700 VND",
    price: 480700
  },
  "4": {
    name: "Xe tải VAN - 480.700 VND",
    price: 480700
  },
  "5": {
    name: "Dưới 6 chỗ ngồi - 831.600 VND",
    price: 831600
  },
  "6": {
    name: "7 chỗ ngồi - 1.188.000 VND",
    price: 1188000
  },
  "7": {
    name: "8 chỗ ngồi - 1.378.300 VND",
    price: 1378300
  },
  "8": {
    name: "Xe bán tải (pickup) - 1.026.300 VND",
    price: 1026300
  },
  "9": {
    name: "Xe tải VAN - 1.026.300 VND",
    price: 1026300
  },
  "10": {
    name: "Xe chở hàng dưới 3 tấn - 938.300 VND",
    price: 938300
  },
  "11": {
    name: "Xe chở hàng từ 3 đến 8 tấn - 1.826.000 VND",
    price: 1826000
  },
}

export const contractStatus= {
  "0": {
    name: "Đang xữ lý",
  },
  "1": {
    name: "Đã thành hợp đồng",
  },
}

export const vnpResponseCodes= {
  "00": {
    name: "Giao dịch thành công",
  },
  "07": {
    name: "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
  },
  "09": {
    name: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
  },
  "10": {
    name: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
  },
  "11": {
    name: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
  },
  "12": {
    name: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
  },
  "13": {
    name: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
  },
  "24": {
    name: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
  },
  "51": {
    name: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
  },
  "65": {
    name: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
  },
  "75": {
    name: "Ngân hàng thanh toán đang bảo trì.",
  },
  "79": {
    name: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
  },
  "99": {
    name: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
  },
}