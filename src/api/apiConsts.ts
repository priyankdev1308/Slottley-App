export const GET = 'GET';
export const PUT = 'PUT';
export const POST = 'POST';
export const PATCH = 'PATCH';
export const DELETE = 'DELETE';

export const privacyPolicy = 'https://myfinancialtrading.com/privacy-policy';
export const termsCondition = 'https://myfinancialtrading.com/terms-of-service';
export const cashBackLink =
  'https://dashboard2.mau.tauromarkets.com/sign-up?cmp=2u7p3a2c&refid=10261';

export const api = {
  // NextLevelHub Service.php service names (passed as ?Service=<name>)
  login: 'login',
  registration: 'registration',
  logout: 'logout',
  // otp: '/auth/otp-enter', // old
  myProfile: '/auth/get-me',
  // register: '/student/create', // old
  getToken: '/auth/access-token',
  resendOtp: '/auth/otp-resend',
  otp: '/student/verify-account',
  editProfile: '/auth/update-profile',
  deleteAccount: 'deleteAccount',
  resetPassword: '/auth/reset-password',
  forgotPassword: 'forgotPassword',
  verifyForgotPassword: 'changePasswordWithVerifyCode',
  changePassword: 'changePassword',
  getActivityList: 'getActivityList',
  getGoalList: 'getGoalList',
  updateUserDetails: 'updateUserDetails',
  dailyNutritionTarget: 'dailyNutritionTarget',
  getDailyTargetAPI: 'getDailyTargetAPI',
  addMeals: 'addMeals',
  editMeals: 'editMeals',
  deleteMeals: 'deleteMeals',
  getTodayMealsHistory: 'getTodayMealsHistory',
  getMealHistory: 'getMealHistory',
  getUserDetails: 'getUserDetails',
  getDashboardDetails: 'getDashboardDetails',
  challengesComplete: 'challengesComplete',
  getLightspeedPurchases: 'getLightspeedPurchases',
  getLightspeedPurchaseDetail: 'getLightspeedPurchaseDetail',
  updateUserMedia: 'updateUserMedia',
  registerForIos: '/student/create-account',
  updateNewTag: 'auth/update-market-research',
  forgotOtpVerify: '/auth/reset-password-otp',
  // registerForIos: '/student/create-from-apple', // old

  // subscribe to lettter
  subscribeLetter: '/newsLatter/subscribe',

  //payment
  payment: '/payment/pay-again',
  updatePlan: '/payment/update-plan',
  paymentPortal: '/payment/portal-session',
  iosPayment: '/payment/verify-apple-subscription',
  checkIosStatus: '/payment/check-subscription-status',
  createAndSubscription: '/payment/create-subscription',
  updateAndSubscription: '/payment/update-subscription',

  //crypto-payment
  cryptoPayment: '/payment/coin-payment',
  stripePayment: '/payment/stripe-subscription',

  //liveVideo
  liveVideo: '/session-video/active',
  playVideo: '/stream/course/',

  //plans
  plans: '/payment/plans',

  // community
  community: '/community',
  marketResearch: '/post/market-research',

  //post
  createPost: '/post',
  getPost: '/post/single',
  getPostBySlug: '/post',
  post: '/post',
  likeDislike: '/comment/like/status-update',

  // comments
  addComment: '/comment/add-comment',
  addReplyComment: '/reply-comment/add',
  updateComment: '/comment/update-comment',
  deleteComment: '/comment/delete-comment',
  deleteReply: '/reply-comment/delete',
  updateReply: '/reply-comment/update',

  // course
  courses: '/courses',
  getVideoById: '/videos',

  // notification
  notification: '/notification',

  //report
  reportPost: '/report/report-post',
  reportComment: '/report/report-comment',
  reportReply: '/report/report-reply-comment',
};
