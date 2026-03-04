import type { TranslationKey } from "./en"

export const kk: Record<TranslationKey, string> = {
  // Splash
  "splash.tagline": "Сіздің ақылды көлік тұрағы көмекшіңіз",

  // Login
  "login.welcomeBack": "Қош келдіңіз",
  "login.signInToAccount": "Аккаунтыңызға кіріңіз",
  "login.email": "Эл. пошта",
  "login.password": "Құпия сөз",
  "login.emailPlaceholder": "your@email.com",
  "login.passwordPlaceholder": "Құпия сөзді енгізіңіз",
  "login.forgotPassword": "Құпия сөзді ұмыттыңыз ба?",
  "login.loggingIn": "Кіру...",
  "login.login": "Кіру",
  "login.noAccount": "Аккаунтыңыз жоқ па? ",
  "login.signUp": "Тіркелу",

  // Signup
  "signup.createAccount": "Аккаунт құру",
  "signup.fillDetails": "Бастау үшін мәліметтерді толтырыңыз",
  "signup.fullName": "Толық аты-жөні",
  "signup.fullNamePlaceholder": "Иван Иванов",
  "signup.email": "Эл. пошта",
  "signup.emailPlaceholder": "your@email.com",
  "signup.phone": "Телефон нөмірі",
  "signup.phonePlaceholder": "+7 (777) 000-0000",
  "signup.carNumber": "Көлік нөмірі",
  "signup.carNumberPlaceholder": "ABC-1234",
  "signup.password": "Құпия сөз",
  "signup.passwordPlaceholder": "Құпия сөз жасаңыз",
  "signup.creatingAccount": "Аккаунт құрылуда...",
  "signup.create": "Аккаунт құру",
  "signup.haveAccount": "Аккаунтыңыз бар ма? ",
  "signup.login": "Кіру",

  // OTP
  "otp.title": "Растау коды",
  "otp.subtitle": "Телефоныңызға 6 санды код жібердік",
  "otp.resend": "Қайта жіберу",
  "otp.next": "Келесі",

  // Home / Nav
  "nav.explore": "Карта",
  "nav.history": "Тарих",
  "nav.settings": "Параметрлер",
  "nav.profile": "Профиль",
  "home.searchPlaceholder": "Алматыда тұрақ іздеу...",
  "home.noSpotsFound": "Тұрақ орындары табылмады",
  "home.spots": "орын",

  // Car Park Details
  "carpark.title": "Тұрақ мәліметтері",
  "carpark.loading": "Жүктелуде...",
  "carpark.notFound": "Тұрақ орны табылмады.",
  "carpark.goBack": "Артқа",
  "carpark.price": "Баға",
  "carpark.available": "Бос орын",
  "carpark.selectDuration": "Ұзақтығын таңдаңыз",
  "carpark.hours": "Сағат",
  "carpark.minutes": "Минут",
  "carpark.options": "Опциялар",
  "carpark.coveredParking": "Жабық тұрақ",
  "carpark.coveredDesc": "Ауа райынан қорғалған",
  "carpark.evCharging": "EV зарядтау",
  "carpark.evDesc": "Электрокөлік зарядтау қолжетімді",
  "carpark.estimatedTotal": "Болжалды сома",
  "carpark.enterNow": "Қазір кіру",
  "carpark.reserveAnother": "Басқа уақытқа броньдау",

  // Booking Payment
  "bookingPayment.title": "Орын броньдау",
  "bookingPayment.parkingDuration": "Тұрақ ұзақтығы",
  "bookingPayment.duration": "Ұзақтық",
  "bookingPayment.priceSummary": "Баға жиынтығы",
  "bookingPayment.parkingFee": "Тұрақ ақысы",
  "bookingPayment.serviceFee": "Сервис ақысы",
  "bookingPayment.total": "Жиыны",
  "bookingPayment.paymentMethod": "Төлем әдісі",
  "bookingPayment.visaEnding": "Visa **** 4242",
  "bookingPayment.expires": "Мерзімі 12/28",
  "bookingPayment.change": "Өзгерту",
  "bookingPayment.processing": "Өңделуде...",
  "bookingPayment.bookSpace": "Броньдау",

  // Booking Confirmation
  "bookingConfirm.title": "Броньдау расталды",
  "bookingConfirm.subtitle": "Тұрақ орныңыз брондалды",
  "bookingConfirm.scanAtEntrance": "Кіреберісте сканерлеңіз",
  "bookingConfirm.bookingId": "Броньдау ID",
  "bookingConfirm.details": "Броньдау мәліметтері",
  "bookingConfirm.parking": "Тұрақ",
  "bookingConfirm.duration": "Ұзақтық",
  "bookingConfirm.totalPrice": "Жалпы баға",
  "bookingConfirm.goHome": "Басты бетке оралу",

  // End Parking
  "endParking.title": "Тұрақты аяқтау",
  "endParking.readyToLeave": "Кетуге дайынсыз ба?",
  "endParking.summary": "Тұрақ сеансыңыздың жиынтығы",
  "endParking.parkingLocation": "Тұрақ орны",
  "endParking.timeSpent": "Уақыт",
  "endParking.totalPrice": "Жалпы баға",
  "endParking.paid": "Төленді",
  "endParking.completing": "Аяқталуда...",
  "endParking.exitComplete": "Шығу және аяқтау",
  "endParking.noSession": "Белсенді тұрақ сеансы табылмады.",
  "endParking.goBack": "Артқа",

  // Parking History
  "history.title": "Тұрақ сеанстары",
  "history.signInPrompt": "Тұрақ тарихын көру үшін кіріңіз.",
  "history.goToLogin": "Кіру",
  "history.loadingBookings": "Броньдаулар жүктелуде...",
  "history.activeSession": "Белсенді сеанс",
  "history.reserved": "Брондалған",
  "history.completed": "Аяқталған",
  "history.goHome": "Басты бетке оралу",

  // Payment Method
  "payment.title": "Төлем әдісі",
  "payment.cardHolder": "Карта иесі",
  "payment.expires": "Мерзімі",
  "payment.addNewCard": "Жаңа карта қосу",
  "payment.cardNumber": "Карта нөмірі",
  "payment.cardNumberPlaceholder": "0000 0000 0000 0000",
  "payment.expiryDate": "Жарамдылық мерзімі",
  "payment.expiryPlaceholder": "АА/ЖЖ",
  "payment.cvv": "CVV",
  "payment.cvvPlaceholder": "123",
  "payment.makePayment": "Төлеу",

  // Profile
  "profile.title": "Менің профилім",
  "profile.signInPrompt": "Профильді көру үшін кіріңіз.",
  "profile.goToLogin": "Кіру",
  "profile.loading": "Жүктелуде...",
  "profile.fullName": "Толық аты-жөні",
  "profile.email": "Эл. пошта",
  "profile.phone": "Телефон нөмірі",
  "profile.carNumber": "Көлік нөмірі",
  "profile.saving": "Сақталуда...",
  "profile.save": "Сақтау",

  // Settings
  "settings.title": "Параметрлер",
  "settings.paymentMethod": "Төлем әдісі",
  "settings.account": "Аккаунт",
  "settings.language": "Тіл",
  "settings.termsOfUse": "Пайдалану шарттары",
  "settings.privacyPolicy": "Құпиялылық саясаты",
  "settings.logOut": "Шығу",
  "settings.chooseLanguage": "Тілді таңдаңыз",

  // Common
  "common.loading": "Жүктелуде...",
  "common.goBack": "Артқа",
}
