export const en = {
  // Splash
  "splash.tagline": "Your smart parking assistant",

  // Login
  "login.welcomeBack": "Welcome Back",
  "login.signInToAccount": "Sign in to your account",
  "login.email": "Email",
  "login.password": "Password",
  "login.emailPlaceholder": "your@email.com",
  "login.passwordPlaceholder": "Enter password",
  "login.forgotPassword": "Forgot password?",
  "login.loggingIn": "Logging in...",
  "login.login": "Login",
  "login.noAccount": "Don't have an account? ",
  "login.signUp": "Sign Up",

  // Signup
  "signup.createAccount": "Create Account",
  "signup.fillDetails": "Fill in the details to get started",
  "signup.fullName": "Full Name",
  "signup.fullNamePlaceholder": "John Doe",
  "signup.email": "Email",
  "signup.emailPlaceholder": "your@email.com",
  "signup.phone": "Phone Number",
  "signup.phonePlaceholder": "+7 (777) 000-0000",
  "signup.carNumber": "Car Number",
  "signup.carNumberPlaceholder": "ABC-1234",
  "signup.password": "Password",
  "signup.passwordPlaceholder": "Create password",
  "signup.creatingAccount": "Creating account...",
  "signup.create": "Create Account",
  "signup.haveAccount": "Already have an account? ",
  "signup.login": "Login",

  // OTP
  "otp.title": "Verification Code",
  "otp.subtitle": "We've sent a 6-digit code to your phone",
  "otp.resend": "Resend code",
  "otp.next": "Next",

  // Home / Nav
  "nav.explore": "Explore",
  "nav.history": "History",
  "nav.settings": "Settings",
  "nav.profile": "Profile",
  "home.searchPlaceholder": "Search parking in Almaty...",
  "home.noSpotsFound": "No parking spots found",
  "home.spots": "spots",

  // Car Park Details
  "carpark.title": "Car Park Details",
  "carpark.loading": "Loading...",
  "carpark.notFound": "Parking spot not found.",
  "carpark.goBack": "Go Back",
  "carpark.price": "Price",
  "carpark.available": "Available",
  "carpark.selectDuration": "Select Duration",
  "carpark.hours": "Hours",
  "carpark.minutes": "Minutes",
  "carpark.options": "Options",
  "carpark.coveredParking": "Covered Parking",
  "carpark.coveredDesc": "Protected from weather",
  "carpark.evCharging": "EV Charging",
  "carpark.evDesc": "Electric vehicle charging available",
  "carpark.estimatedTotal": "Estimated Total",
  "carpark.enterNow": "Enter Now",
  "carpark.reserveAnother": "Reserve for Another Time",

  // Booking Payment
  "bookingPayment.title": "Book Space",
  "bookingPayment.parkingDuration": "Parking Duration",
  "bookingPayment.duration": "Duration",
  "bookingPayment.priceSummary": "Price Summary",
  "bookingPayment.parkingFee": "Parking Fee",
  "bookingPayment.serviceFee": "Service Fee",
  "bookingPayment.total": "Total",
  "bookingPayment.paymentMethod": "Payment Method",
  "bookingPayment.visaEnding": "Visa ending in 4242",
  "bookingPayment.expires": "Expires 12/28",
  "bookingPayment.change": "Change",
  "bookingPayment.processing": "Processing...",
  "bookingPayment.bookSpace": "Book Space",

  // Booking Confirmation
  "bookingConfirm.title": "Booking Confirmed",
  "bookingConfirm.subtitle": "Your parking space is reserved",
  "bookingConfirm.scanAtEntrance": "Scan at entrance",
  "bookingConfirm.bookingId": "Booking ID",
  "bookingConfirm.details": "Booking Details",
  "bookingConfirm.parking": "Parking",
  "bookingConfirm.duration": "Duration",
  "bookingConfirm.totalPrice": "Total Price",
  "bookingConfirm.goHome": "Go Back to Home Screen",

  // End Parking
  "endParking.title": "End Parking",
  "endParking.readyToLeave": "Ready to leave?",
  "endParking.summary": "Here's your parking session summary",
  "endParking.parkingLocation": "Parking Location",
  "endParking.timeSpent": "Time Spent",
  "endParking.totalPrice": "Total Price",
  "endParking.paid": "Paid",
  "endParking.completing": "Completing...",
  "endParking.exitComplete": "Exit and Complete Parking",
  "endParking.noSession": "No active parking session found.",
  "endParking.goBack": "Go Back",

  // Parking History
  "history.title": "Parking Sessions",
  "history.signInPrompt": "Sign in to see your parking history.",
  "history.goToLogin": "Go to Login",
  "history.loadingBookings": "Loading bookings...",
  "history.activeSession": "Active Session",
  "history.reserved": "Reserved",
  "history.completed": "Completed",
  "history.goHome": "Go Back to Home Screen",

  // Payment Method
  "payment.title": "Payment Method",
  "payment.cardHolder": "Card Holder",
  "payment.expires": "Expires",
  "payment.addNewCard": "Add New Card",
  "payment.cardNumber": "Card Number",
  "payment.cardNumberPlaceholder": "0000 0000 0000 0000",
  "payment.expiryDate": "Expiry Date",
  "payment.expiryPlaceholder": "MM/YY",
  "payment.cvv": "CVV",
  "payment.cvvPlaceholder": "123",
  "payment.makePayment": "Make Payment",

  // Profile
  "profile.title": "My Profile",
  "profile.signInPrompt": "Sign in to view your profile.",
  "profile.goToLogin": "Go to Login",
  "profile.loading": "Loading...",
  "profile.fullName": "Full Name",
  "profile.email": "Email",
  "profile.phone": "Phone Number",
  "profile.carNumber": "Car Number",
  "profile.saving": "Saving...",
  "profile.save": "Save",

  // Settings
  "settings.title": "Settings",
  "settings.paymentMethod": "Payment Method",
  "settings.account": "Account",
  "settings.language": "Language",
  "settings.termsOfUse": "Terms of Use",
  "settings.privacyPolicy": "Privacy Policy",
  "settings.logOut": "Log Out",
  "settings.chooseLanguage": "Choose Language",

  // Common
  "common.loading": "Loading...",
  "common.goBack": "Go Back",
} as const

export type TranslationKey = keyof typeof en
