const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// Complete faculty dictionary from UIU Faculty Reviewer (all 23 pages of faculty_rating_02d14dde.pdf)
const facultyRatingsList = [
  { name: "A.H.M. Osama Haque", rating: 9.8, reviews: 65, teaching: 9.8, response: 9.9, workload: 9.7, clarity: 9.7, designation: "Lecturer" },
  { name: "Md. Tarek Hasan", rating: 9.9, reviews: 29, teaching: 9.9, response: 9.9, workload: 9.8, clarity: 9.8, designation: "Lecturer" },
  { name: "Sidratul Tanzila Tasmi", rating: 9.8, reviews: 31, teaching: 9.8, response: 9.9, workload: 9.8, clarity: 9.6, designation: "Lecturer" },
  { name: "Azizur Rahman Anik", rating: 9.7, reviews: 28, teaching: 9.8, response: 9.8, workload: 9.5, clarity: 9.7, designation: "Lecturer" },
  { name: "Khandokar Md. Rahat Hossain", rating: 9.9, reviews: 14, teaching: 9.8, response: 9.9, workload: 10.0, clarity: 10.0, designation: "Lecturer" },
  { name: "Hafijul Hoque Chowdhury", rating: 9.9, reviews: 13, teaching: 9.8, response: 9.9, workload: 9.9, clarity: 10.0, designation: "Lecturer" },
  { name: "Tasmin Sanjida", rating: 9.7, reviews: 21, teaching: 9.5, response: 9.9, workload: 9.6, clarity: 9.8, designation: "Lecturer" },
  { name: "Khushnur Binte Jahangir", rating: 9.8, reviews: 15, teaching: 9.7, response: 10.0, workload: 9.9, clarity: 9.7, designation: "Lecturer" },
  { name: "Md. Shafqat Talukder", rating: 9.6, reviews: 25, teaching: 9.6, response: 9.6, workload: 9.4, clarity: 9.6, designation: "Lecturer" },
  { name: "Md. Mushfiqul Haque Omi", rating: 9.7, reviews: 15, teaching: 9.9, response: 9.5, workload: 9.7, clarity: 9.8, designation: "Lecturer" },
  { name: "Dr. Mohammad Nurul Huda", rating: 9.6, reviews: 21, teaching: 9.7, response: 9.5, workload: 9.5, clarity: 9.5, designation: "Professor" },
  { name: "Mr. Syed Abu Ammar Muhammad Zarif", rating: 9.8, reviews: 12, teaching: 9.8, response: 9.9, workload: 9.8, clarity: 9.9, designation: "Lecturer" },
  { name: "Syed Abu Ammar Muhammad Zarif", rating: 9.8, reviews: 12, teaching: 9.8, response: 9.9, workload: 9.8, clarity: 9.9, designation: "Lecturer" },
  { name: "Abdullah Ibne Masud Mahi", rating: 9.5, reviews: 23, teaching: 9.5, response: 9.5, workload: 9.6, clarity: 9.4, designation: "Lecturer" },
  { name: "Sayem Shahad", rating: 9.6, reviews: 17, teaching: 9.6, response: 9.8, workload: 9.5, clarity: 9.6, designation: "Lecturer" },
  { name: "M. Fahmin Rahman", rating: 9.5, reviews: 21, teaching: 9.6, response: 9.5, workload: 9.4, clarity: 9.5, designation: "Lecturer" },
  { name: "Nabila Sultana", rating: 9.8, reviews: 11, teaching: 9.7, response: 9.8, workload: 9.6, clarity: 9.8, designation: "Instructor" },
  { name: "Nusaiba Zaman Manifa", rating: 9.4, reviews: 23, teaching: 9.5, response: 9.1, workload: 9.4, clarity: 9.5, designation: "Lecturer" },
  { name: "Md. Sajjad Hossain", rating: 10.0, reviews: 7, teaching: 9.9, response: 10.0, workload: 10.0, clarity: 10.0, designation: "Lecturer" },
  { name: "Anika Tasnim Rodela", rating: 9.2, reviews: 33, teaching: 9.2, response: 9.2, workload: 9.1, clarity: 9.2, designation: "Assistant Professor" },
  { name: "Md. Muhaiminul Islam Nafi", rating: 9.4, reviews: 14, teaching: 8.9, response: 9.7, workload: 9.6, clarity: 9.5, designation: "Lecturer" },
  { name: "Umama Rahman", rating: 9.2, reviews: 26, teaching: 9.4, response: 9.3, workload: 9.0, clarity: 9.2, designation: "Lecturer" },
  { name: "Charles Aunkan Gomes", rating: 9.2, reviews: 27, teaching: 9.3, response: 9.3, workload: 9.1, clarity: 9.1, designation: "Lecturer" },
  { name: "Kazi Abdun Noor", rating: 9.3, reviews: 14, teaching: 8.8, response: 9.4, workload: 9.6, clarity: 9.4, designation: "Lecturer" },
  { name: "Mahmudul Hasan", rating: 9.5, reviews: 9, teaching: 9.7, response: 9.6, workload: 9.3, clarity: 9.3, designation: "Lecturer" },
  { name: "Mohammad Johirul Islam", rating: 9.6, reviews: 7, teaching: 9.3, response: 9.9, workload: 9.9, clarity: 9.4, designation: "Lecturer" },
  { name: "Fahim Hafiz", rating: 9.1, reviews: 16, teaching: 9.4, response: 8.7, workload: 8.8, clarity: 9.4, designation: "Lecturer" },
  { name: "Taki Yashir", rating: 9.0, reviews: 19, teaching: 9.2, response: 9.0, workload: 8.9, clarity: 8.9, designation: "Lecturer" },
  { name: "Mohammad Mamun Elahi", rating: 9.2, reviews: 11, teaching: 9.0, response: 9.4, workload: 9.1, clarity: 9.4, designation: "Assistant Professor" },
  { name: "Miftahul Sheikh", rating: 10.0, reviews: 4, teaching: 10.0, response: 10.0, workload: 10.0, clarity: 10.0, designation: "Lecturer (part-time)" },
  { name: "S M Jishanul Islam", rating: 10.0, reviews: 4, teaching: 10.0, response: 10.0, workload: 10.0, clarity: 10.0, designation: "Part Time Faculty" },
  { name: "Muhammad Anwarul Azim", rating: 9.3, reviews: 9, teaching: 8.9, response: 9.7, workload: 9.1, clarity: 9.3, designation: "Lecturer" },
  { name: "Md. Siam", rating: 9.5, reviews: 6, teaching: 9.3, response: 9.7, workload: 9.5, clarity: 9.5, designation: "Lecturer" },
  { name: "Anindya Hoque", rating: 9.9, reviews: 4, teaching: 9.8, response: 10.0, workload: 9.8, clarity: 10.0, designation: "Lecturer" },
  { name: "Sahid Hossain Mustakim", rating: 9.5, reviews: 6, teaching: 9.3, response: 9.7, workload: 9.5, clarity: 9.3, designation: "Lecturer" },
  { name: "Nusrat Jahan Tithi", rating: 9.0, reviews: 14, teaching: 9.1, response: 8.6, workload: 9.3, clarity: 8.9, designation: "Assistant Professor" },
  { name: "Dr. Suman Ahmmed", rating: 9.2, reviews: 7, teaching: 9.4, response: 9.6, workload: 8.4, clarity: 9.4, designation: "Associate Professor" },
  { name: "Suman Ahmmed", rating: 9.2, reviews: 7, teaching: 9.4, response: 9.6, workload: 8.4, clarity: 9.4, designation: "Associate Professor" },
  { name: "Didarul Islam Didar", rating: 8.7, reviews: 22, teaching: 8.8, response: 9.0, workload: 8.5, clarity: 8.7, designation: "Lecturer" },
  { name: "Nahid Hossain", rating: 10.0, reviews: 3, teaching: 10.0, response: 10.0, workload: 10.0, clarity: 10.0, designation: "Assistant Professor" },
  { name: "SM Hasibul Hassan Rizvee", rating: 9.9, reviews: 3, teaching: 10.0, response: 10.0, workload: 9.7, clarity: 10.0, designation: "Lecturer" },
  { name: "S.M. Hasibul Hassan Rizvee", rating: 9.9, reviews: 3, teaching: 10.0, response: 10.0, workload: 9.7, clarity: 10.0, designation: "Lecturer" },
  { name: "Asif Abrar", rating: 8.8, reviews: 17, teaching: 8.7, response: 9.3, workload: 8.5, clarity: 8.5, designation: "Lecturer" },
  { name: "Md. Romizul Islam", rating: 8.7, reviews: 21, teaching: 8.5, response: 8.5, workload: 8.9, clarity: 8.8, designation: "Lecturer" },
  { name: "Md. Golam Hossain", rating: 9.4, reviews: 4, teaching: 9.3, response: 9.8, workload: 9.3, clarity: 9.5, designation: "Lecturer" },
  { name: "Aymaan Fyroz", rating: 9.0, reviews: 7, teaching: 9.3, response: 8.7, workload: 8.6, clarity: 9.4, designation: "Lecturer" },
  { name: "Rizvan Jawad Ruhan", rating: 9.4, reviews: 4, teaching: 8.8, response: 9.8, workload: 9.8, clarity: 9.3, designation: "Lecturer" },
  { name: "Mir Moynuddin Ahmed Shibly", rating: 9.7, reviews: 3, teaching: 10.0, response: 9.0, workload: 9.7, clarity: 10.0, designation: "Assistant Professor" },
  { name: "Asif Ahmed Utsa", rating: 8.6, reviews: 22, teaching: 8.7, response: 8.7, workload: 8.3, clarity: 8.6, designation: "Lecturer" },
  { name: "Siana Rizwan", rating: 8.6, reviews: 13, teaching: 8.2, response: 9.1, workload: 8.8, clarity: 8.2, designation: "Lecturer" },
  { name: "Novia Nurain", rating: 10.0, reviews: 2, teaching: 10.0, response: 10.0, workload: 10.0, clarity: 10.0, designation: "Lecturer" },
  { name: "Rakib Kibria", rating: 10.0, reviews: 2, teaching: 10.0, response: 10.0, workload: 10.0, clarity: 10.0, designation: "Lecturer" },
  { name: "Dr. Md. Abul Kashem Mia", rating: 9.4, reviews: 3, teaching: 9.7, response: 9.3, workload: 9.3, clarity: 9.3, designation: "Vice Chancellor / Professor" },
  { name: "Sherajul Arifin", rating: 8.7, reviews: 8, teaching: 8.6, response: 8.9, workload: 8.8, clarity: 8.5, designation: "Lecturer" },
  { name: "Tahia Hossain", rating: 8.8, reviews: 6, teaching: 8.3, response: 8.7, workload: 9.2, clarity: 9.0, designation: "Lecturer" },
  { name: "Dr. A.K.M. Muzahidul Islam", rating: 9.1, reviews: 3, teaching: 9.0, response: 9.7, workload: 8.0, clarity: 9.7, designation: "Professor" },
  { name: "Md. Anowarul Abedin", rating: 8.8, reviews: 4, teaching: 8.3, response: 9.3, workload: 8.8, clarity: 8.8, designation: "Assistant Professor" },
  { name: "Dr. Mohammad Shahriar Rahman", rating: 8.8, reviews: 3, teaching: 8.3, response: 8.3, workload: 9.3, clarity: 9.0, designation: "Professor" },
  { name: "Mohammad Shahriar Rahman", rating: 8.8, reviews: 3, teaching: 8.3, response: 8.3, workload: 9.3, clarity: 9.0, designation: "Professor" },
  { name: "Md. Taky Shaharair", rating: 10.0, reviews: 1, teaching: 10.0, response: 10.0, workload: 10.0, clarity: 10.0, designation: "Lecturer" },
  { name: "Sheikh Mohammed Al Hadi Elaf", rating: 10.0, reviews: 1, teaching: 10.0, response: 10.0, workload: 10.0, clarity: 10.0, designation: "Lecturer" },
  { name: "Mohammad Mirazur Rahman", rating: 9.0, reviews: 2, teaching: 9.0, response: 9.0, workload: 9.0, clarity: 9.0, designation: "Lecturer" },
  { name: "Rafid Nahiyan Farabi", rating: 8.5, reviews: 4, teaching: 8.5, response: 9.0, workload: 9.0, clarity: 7.5, designation: "Lecturer" },
  { name: "Mahir Amer Haque", rating: 9.5, reviews: 1, teaching: 10.0, response: 10.0, workload: 8.0, clarity: 10.0, designation: "Adjunct Lecturer" },
  { name: "Sajjad Ahmed Niloy", rating: 9.5, reviews: 1, teaching: 9.0, response: 10.0, workload: 9.0, clarity: 10.0, designation: "Lecturer (part-time)" },
  { name: "Shahil Yasar Haque", rating: 8.3, reviews: 4, teaching: 7.5, response: 9.0, workload: 8.5, clarity: 8.3, designation: "Instructor" },
  { name: "Mr. Syed Samin Sadaf", rating: 8.1, reviews: 6, teaching: 7.2, response: 8.7, workload: 8.8, clarity: 7.8, designation: "Lecturer" },
  { name: "Syed Samin Sadaf", rating: 8.1, reviews: 6, teaching: 7.2, response: 8.7, workload: 8.8, clarity: 7.8, designation: "Lecturer" },
  { name: "Dr. Al Sakib Khan Pathan", rating: 8.0, reviews: 13, teaching: 8.5, response: 8.5, workload: 7.2, clarity: 7.9, designation: "Professor" },
  { name: "Al-Sakib Khan Pathan", rating: 8.0, reviews: 13, teaching: 8.5, response: 8.5, workload: 7.2, clarity: 7.9, designation: "Professor" },
  { name: "Imran Hossain", rating: 8.0, reviews: 12, teaching: 7.2, response: 8.8, workload: 8.4, clarity: 7.7, designation: "Lecturer" },
  { name: "Md. Mehedi Hasan", rating: 8.1, reviews: 4, teaching: 7.5, response: 7.8, workload: 9.3, clarity: 8.0, designation: "Lecturer" },
  { name: "Md. Enamul Haque", rating: 8.1, reviews: 5, teaching: 8.2, response: 8.6, workload: 7.4, clarity: 8.0, designation: "Lecturer" },
  { name: "Dr. Nahid Ferdous Aurna", rating: 7.9, reviews: 13, teaching: 6.8, response: 8.9, workload: 8.0, clarity: 7.8, designation: "Assistant Professor" },
  { name: "Nahid Ferdous Aurna", rating: 7.9, reviews: 13, teaching: 6.8, response: 8.9, workload: 8.0, clarity: 7.8, designation: "Assistant Professor" },
  { name: "Noman Asif Aditya", rating: 7.8, reviews: 10, teaching: 8.1, response: 7.4, workload: 8.0, clarity: 7.9, designation: "Lecturer" },
  { name: "Abdullah Al Jobair", rating: 7.8, reviews: 6, teaching: 8.2, response: 8.5, workload: 7.3, clarity: 7.3, designation: "Lecturer" },
  { name: "K Shayekh Ebne Mizan", rating: 8.0, reviews: 1, teaching: 8.0, response: 8.0, workload: 8.0, clarity: 8.0, designation: "Lecturer" },
  { name: "Sayeem Been Zaman", rating: 7.7, reviews: 14, teaching: 8.4, response: 7.8, workload: 7.2, clarity: 7.5, designation: "Lecturer" },
  { name: "Tahsin Wahid", rating: 7.8, reviews: 4, teaching: 7.8, response: 7.8, workload: 7.8, clarity: 7.8, designation: "Lecturer" },
  { name: "Rubaiya Rahtin Khan", rating: 7.7, reviews: 14, teaching: 8.1, response: 7.4, workload: 7.2, clarity: 7.9, designation: "Assistant Professor" },
  { name: "Md. Tanvir Raihan", rating: 7.6, reviews: 11, teaching: 6.6, response: 8.1, workload: 8.8, clarity: 7.0, designation: "Lecturer" },
  { name: "Shekh Md. Saifur Rahman", rating: 7.6, reviews: 10, teaching: 7.4, response: 7.2, workload: 8.4, clarity: 7.3, designation: "Lecturer" },
  { name: "Sidratul Muntaha", rating: 7.5, reviews: 6, teaching: 7.5, response: 7.5, workload: 7.3, clarity: 7.7, designation: "Lecturer" },
  { name: "Md. Muhyminul Haque", rating: 7.4, reviews: 6, teaching: 7.7, response: 7.2, workload: 7.8, clarity: 7.0, designation: "Lecturer" },
  { name: "Mr. Nahin F. Siddiqui", rating: 6.8, reviews: 1, teaching: 3.0, response: 8.0, workload: 8.0, clarity: 8.0, designation: "Lecturer" },
  { name: "Nahin F. Siddiqui", rating: 6.8, reviews: 1, teaching: 3.0, response: 8.0, workload: 8.0, clarity: 8.0, designation: "Lecturer" },
  { name: "Jerin Hasan Priya", rating: 7.2, reviews: 4, teaching: 7.3, response: 7.3, workload: 6.8, clarity: 7.5, designation: "Lecturer" },
  { name: "Shoib Ahmed Shourav", rating: 7.4, reviews: 21, teaching: 7.4, response: 7.1, workload: 7.7, clarity: 7.3, designation: "Lecturer" },
  { name: "Saqif Kaisar", rating: 7.0, reviews: 3, teaching: 7.0, response: 7.0, workload: 7.0, clarity: 7.0, designation: "Lecturer" },
  { name: "Tahmid Mosaddeq", rating: 7.2, reviews: 8, teaching: 6.1, response: 8.0, workload: 8.0, clarity: 6.6, designation: "Lecturer" },
  { name: "Arnab Bhattacharjee", rating: 7.2, reviews: 13, teaching: 6.5, response: 7.4, workload: 7.9, clarity: 6.9, designation: "Lecturer" },
  { name: "Md. Benzir Ahmed", rating: 7.1, reviews: 21, teaching: 7.1, response: 6.6, workload: 7.3, clarity: 7.2, designation: "Assistant Professor" },
  { name: "Dr. Md. Shohrab Hossain", rating: 6.7, reviews: 5, teaching: 7.2, response: 6.6, workload: 6.4, clarity: 6.4, designation: "Professor" },
  { name: "Md. Shohrab Hossain", rating: 6.7, reviews: 5, teaching: 7.2, response: 6.6, workload: 6.4, clarity: 6.4, designation: "Professor" },
  { name: "Samin Sharaf Somik", rating: 7.0, reviews: 13, teaching: 7.2, response: 6.8, workload: 7.2, clarity: 6.7, designation: "Lecturer" },
  { name: "Sadia Islam", rating: 6.8, reviews: 8, teaching: 5.9, response: 7.3, workload: 7.4, clarity: 6.6, designation: "Assistant Professor" },
  { name: "Asnuva Tanvin", rating: 6.9, reviews: 24, teaching: 7.0, response: 6.8, workload: 7.1, clarity: 6.8, designation: "Lecturer" },
  { name: "Dr. Ohidujjaman", rating: 6.7, reviews: 12, teaching: 7.0, response: 7.4, workload: 7.1, clarity: 5.3, designation: "Assistant Professor" },
  { name: "Ohidujjaman", rating: 6.7, reviews: 12, teaching: 7.0, response: 7.4, workload: 7.1, clarity: 5.3, designation: "Assistant Professor" },
  { name: "Shihab Ahmed", rating: 6.7, reviews: 14, teaching: 6.3, response: 6.7, workload: 7.3, clarity: 6.5, designation: "Lecturer" },
  { name: "Iftekharul Abedeen", rating: 6.1, reviews: 5, teaching: 5.6, response: 6.0, workload: 7.0, clarity: 5.8, designation: "Lecturer" },
  { name: "Dr. Jannatun Noor Mukta", rating: 5.6, reviews: 3, teaching: 4.0, response: 6.3, workload: 5.0, clarity: 7.0, designation: "Associate Professor" },
  { name: "Jannatun Noor Mukta", rating: 5.6, reviews: 3, teaching: 4.0, response: 6.3, workload: 5.0, clarity: 7.0, designation: "Associate Professor" },
  { name: "Md. Shadman Aadeeb", rating: 6.5, reviews: 18, teaching: 7.1, response: 6.7, workload: 5.4, clarity: 6.8, designation: "Lecturer" },
  { name: "Abrar Mahmud", rating: 6.3, reviews: 12, teaching: 5.6, response: 6.8, workload: 7.0, clarity: 5.8, designation: "Lecturer" },
  { name: "Kazi Fahim Tahmid", rating: 4.0, reviews: 2, teaching: 3.0, response: 5.5, workload: 4.0, clarity: 3.5, designation: "Lecturer" },
  { name: "Farhan Anan Himu", rating: 5.9, reviews: 11, teaching: 6.0, response: 5.8, workload: 6.2, clarity: 5.5, designation: "Lecturer" },
  { name: "Rakib Ahsan", rating: 5.4, reviews: 6, teaching: 5.3, response: 5.5, workload: 5.5, clarity: 5.3, designation: "Lecturer" },
  { name: "Nabila Sabrin Sworna", rating: 6.0, reviews: 16, teaching: 5.4, response: 6.4, workload: 6.6, clarity: 5.8, designation: "Lecturer" },
  { name: "Mr. Md. Zunaid-Ul-Alam", rating: 4.9, reviews: 4, teaching: 4.3, response: 5.5, workload: 5.5, clarity: 4.3, designation: "Lecturer" },
  { name: "Md. Zunaid-Ul-Alam", rating: 4.9, reviews: 4, teaching: 4.3, response: 5.5, workload: 5.5, clarity: 4.3, designation: "Lecturer" },
  { name: "Tasmia Binte Sogir", rating: 5.1, reviews: 5, teaching: 3.6, response: 5.6, workload: 6.8, clarity: 4.4, designation: "Lecturer" },
  { name: "Sajid Ahmed Chowdhury", rating: 5.0, reviews: 5, teaching: 5.0, response: 5.0, workload: 5.0, clarity: 4.8, designation: "Lecturer" },
  { name: "Dr. Khondaker Abdullah Al Mamun", rating: 4.6, reviews: 4, teaching: 5.0, response: 3.8, workload: 4.0, clarity: 5.5, designation: "Professor" },
  { name: "Dr. Riasat Azim", rating: 5.7, reviews: 16, teaching: 5.8, response: 5.6, workload: 6.0, clarity: 5.6, designation: "Assistant Professor" },
  { name: "Riasat Azim", rating: 5.7, reviews: 16, teaching: 5.8, response: 5.6, workload: 6.0, clarity: 5.6, designation: "Assistant Professor" },
  { name: "Dr. Muhammad Nomani Kabir", rating: 4.9, reviews: 6, teaching: 3.0, response: 5.0, workload: 7.0, clarity: 4.5, designation: "Professor" },
  { name: "Muhammad Nomani Kabir", rating: 4.9, reviews: 6, teaching: 3.0, response: 5.0, workload: 7.0, clarity: 4.5, designation: "Professor" },
  { name: "Humaira Anzum Neha", rating: 5.8, reviews: 22, teaching: 5.6, response: 6.2, workload: 5.7, clarity: 5.6, designation: "Lecturer" },
  { name: "Rakibul Hasan Rafi", rating: 5.3, reviews: 11, teaching: 3.9, response: 6.9, workload: 6.3, clarity: 4.0, designation: "Lecturer" },
  { name: "Mobaswirul Islam", rating: 5.0, reviews: 9, teaching: 3.8, response: 5.8, workload: 5.8, clarity: 4.6, designation: "Lecturer" },
  { name: "Rahad Khan", rating: 4.7, reviews: 7, teaching: 4.9, response: 4.3, workload: 4.9, clarity: 4.7, designation: "Lecturer" },
  { name: "Md. Abid Hossain", rating: 5.1, reviews: 12, teaching: 4.8, response: 5.1, workload: 5.3, clarity: 5.0, designation: "Lecturer" },
  { name: "Md. Irfanur Rahman Rafio", rating: 4.5, reviews: 7, teaching: 3.3, response: 6.1, workload: 4.7, clarity: 3.9, designation: "Lecturer" },
  { name: "Amit Bin Tariqul", rating: 1.0, reviews: 2, teaching: 1.0, response: 1.0, workload: 1.0, clarity: 1.0, designation: "Lecturer" },
  { name: "Zaara Zabeen Arpa", rating: 1.0, reviews: 2, teaching: 1.0, response: 1.0, workload: 1.0, clarity: 1.0, designation: "Lecturer" },
  { name: "Minhajul Bashir", rating: 5.3, reviews: 24, teaching: 6.1, response: 5.0, workload: 5.1, clarity: 5.0, designation: "Lecturer" },
  { name: "Tanmoy Bipro Das", rating: 4.6, reviews: 9, teaching: 3.2, response: 4.2, workload: 6.7, clarity: 4.1, designation: "Lecturer" },
  { name: "Anudwaipaon Antu", rating: 4.8, reviews: 12, teaching: 4.8, response: 4.8, workload: 5.0, clarity: 4.5, designation: "Lecturer" },
  { name: "Shahriar Mahmud", rating: 4.1, reviews: 8, teaching: 4.1, response: 4.4, workload: 4.1, clarity: 3.9, designation: "Lecturer" },
  { name: "Md. Nafis Tahmid Akhand", rating: 4.7, reviews: 17, teaching: 4.9, response: 4.1, workload: 4.9, clarity: 4.7, designation: "Lecturer" },
  { name: "Dr. Md. Motaharul Islam", rating: 3.5, reviews: 7, teaching: 3.6, response: 3.9, workload: 2.9, clarity: 3.6, designation: "Professor" },
  { name: "Md. Motaharul Islam", rating: 3.5, reviews: 7, teaching: 3.6, response: 3.9, workload: 2.9, clarity: 3.6, designation: "Professor" },
  { name: "Mr. Hamudi Hasan Sonet", rating: 3.3, reviews: 7, teaching: 3.1, response: 3.6, workload: 3.4, clarity: 3.1, designation: "Senior Programmer" },
  { name: "Hamudi Hasan Sonet", rating: 3.3, reviews: 7, teaching: 3.1, response: 3.6, workload: 3.4, clarity: 3.1, designation: "Senior Programmer" },
  { name: "Dr. Dewan Md. Farid", rating: 2.3, reviews: 7, teaching: 2.3, response: 2.3, workload: 2.4, clarity: 2.3, designation: "Professor" },
  { name: "Dewan Md. Farid", rating: 2.3, reviews: 7, teaching: 2.3, response: 2.3, workload: 2.4, clarity: 2.3, designation: "Professor" },
  { name: "Dr. Hasan Sarwar", rating: 2.1, reviews: 8, teaching: 2.3, response: 2.1, workload: 2.0, clarity: 1.9, designation: "Professor" },
  { name: "Hasan Sarwar", rating: 2.1, reviews: 8, teaching: 2.3, response: 2.1, workload: 2.0, clarity: 1.9, designation: "Professor" },
  { name: "Fairoz Anika", rating: 2.7, reviews: 16, teaching: 2.6, response: 2.9, workload: 2.7, clarity: 2.6, designation: "Lecturer" },
  { name: "Pranta Biswas", rating: 2.0, reviews: 10, teaching: 1.9, response: 2.0, workload: 1.9, clarity: 2.1, designation: "Lecturer" },
  { name: "Sabah Ahmed", rating: 2.7, reviews: 18, teaching: 2.0, response: 2.6, workload: 3.6, clarity: 2.5, designation: "Lecturer" },
  { name: "Ashraful Islam Paran", rating: 7.0, reviews: 0, teaching: 7.0, response: 7.0, workload: 7.0, clarity: 7.0, designation: "Lecturer" },
  { name: "Dr. Abu Shafin Mohammad Mahdee Jameel", rating: 7.5, reviews: 0, teaching: 7.5, response: 7.5, workload: 7.5, clarity: 7.5, designation: "Assistant Professor" },
  { name: "Abu Shafin Mohammad Mahdee Jameel", rating: 7.5, reviews: 0, teaching: 7.5, response: 7.5, workload: 7.5, clarity: 7.5, designation: "Assistant Professor" },
  { name: "Dr. Md. Saiful Azad", rating: 8.5, reviews: 0, teaching: 8.5, response: 8.5, workload: 8.5, clarity: 8.5, designation: "Professor" },
  { name: "Md. Saiful Azad", rating: 8.5, reviews: 0, teaching: 8.5, response: 8.5, workload: 8.5, clarity: 8.5, designation: "Professor" },
  { name: "Dr. Md. Suzauddola", rating: 7.5, reviews: 0, teaching: 7.5, response: 7.5, workload: 7.5, clarity: 7.5, designation: "Assistant Professor" },
  { name: "Md. Suzauddola", rating: 7.5, reviews: 0, teaching: 7.5, response: 7.5, workload: 7.5, clarity: 7.5, designation: "Assistant Professor" },
  { name: "Dr. Sarwat Amin", rating: 7.5, reviews: 0, teaching: 7.5, response: 7.5, workload: 7.5, clarity: 7.5, designation: "Assistant Professor" },
  { name: "Sarwat Amin", rating: 7.5, reviews: 0, teaching: 7.5, response: 7.5, workload: 7.5, clarity: 7.5, designation: "Assistant Professor" },
  { name: "Md. Hasan Al Kayem", rating: 7.0, reviews: 0, teaching: 7.0, response: 7.0, workload: 7.0, clarity: 7.0, designation: "Lecturer" },
  { name: "Mohammad Ali", rating: 7.0, reviews: 0, teaching: 7.0, response: 7.0, workload: 7.0, clarity: 7.0, designation: "Lecturer & Software Programmer" },
  { name: "Mr. Tasinul Islam Ahon", rating: 7.0, reviews: 0, teaching: 7.0, response: 7.0, workload: 7.0, clarity: 7.0, designation: "Lecturer" },
  { name: "S.M. Kausar Parvej", rating: 7.5, reviews: 0, teaching: 7.5, response: 7.5, workload: 7.5, clarity: 7.5, designation: "Lecturer" },
  { name: "Sudipto Mondal", rating: 7.5, reviews: 0, teaching: 7.5, response: 7.5, workload: 7.5, clarity: 7.5, designation: "Lecturer" },
  { name: "Tasriad Ahmed Tias", rating: 7.5, reviews: 0, teaching: 7.5, response: 7.5, workload: 7.5, clarity: 7.5, designation: "Lecturer" }
];

async function generateData() {
  const buf = fs.readFileSync("/app/applet/public/assets/aistudio/Class_Routine_with_faculty_assign_Fall_2026_aa9b96e7.pdf");
  const parser = new PDFParse(new Uint8Array(buf));
  const res = await parser.getText();

  const lines = [];
  res.pages.forEach(p => {
    p.text.split("\n").forEach(l => {
      const trimmed = l.trim();
      if (/^\d+\s+(BSCSE|BSDS)/.test(trimmed)) lines.push(trimmed);
    });
  });

  const parsedSections = [];
  const coursesMap = new Map();

  lines.forEach((line, index) => {
    // Normalization for special cases
    let cleanLine = line.replace(/Laboratory\t/g, "Laboratory ");
    cleanLine = cleanLine.replace(/Mr\. Angkon Deb Mr\. Angkon Deb(\d+)/, "Mr. Angkon Deb Mr. Angkon Deb $1");

    // Match credit at end
    const creditMatch = cleanLine.match(/\s+(\d+)$/);
    const credit = creditMatch ? parseInt(creditMatch[1], 10) : 3;
    let mainPart = creditMatch ? cleanLine.slice(0, creditMatch.index).trim() : cleanLine;

    // Match sl, program, courseCode
    const prefixMatch = mainPart.match(/^(\d+)\s+(BSCSE|BSDS)\s+([A-Z]{2,4}\s+\d{4}[A-Z]?)\s+/);
    if (!prefixMatch) {
      console.log("Could not match prefix on line:", line);
      return;
    }

    const sl = parseInt(prefixMatch[1], 10);
    const program = prefixMatch[2];
    const courseCode = prefixMatch[3].trim();
    let afterPrefix = mainPart.slice(prefixMatch[0].length).trim();

    // Time & Days regex
    // Theory: Sat Tue 08:30:AM - 09:50:AM 08:30:AM - 09:50:AM
    // Lab: Sun 11:11:AM - 01:40:PM -
    const timeMatch = afterPrefix.match(/(\b(?:Sat\s+Tue|Sun\s+Wed|Sat|Sun|Mon|Tue|Wed)\b)\s+(\d{2}:\d{2}:[AP]M\s*-\s*\d{2}:\d{2}:[AP]M)\s+(\d{2}:\d{2}:[AP]M\s*-\s*\d{2}:\d{2}:[AP]M|-)/);

    let titleAndSec = "";
    let days = "";
    let time1 = "";
    let time2 = "";
    let facultyRaw = "";

    if (timeMatch) {
      titleAndSec = afterPrefix.slice(0, timeMatch.index).trim();
      days = timeMatch[1].trim();
      time1 = timeMatch[2].replace(/:AM/g, " AM").replace(/:PM/g, " PM");
      time2 = timeMatch[3].replace(/:AM/g, " AM").replace(/:PM/g, " PM");
      facultyRaw = afterPrefix.slice(timeMatch.index + timeMatch[0].length).trim();
    } else {
      titleAndSec = afterPrefix;
    }

    // Faculty initial extraction
    let facultyName = facultyRaw;
    let facultyInitial = "";
    const lastSpace = facultyRaw.lastIndexOf(" ");
    if (lastSpace !== -1) {
      facultyName = facultyRaw.slice(0, lastSpace).trim();
      facultyInitial = facultyRaw.slice(lastSpace + 1).trim();
    }

    // Separate Title from Section and Room
    // Example: "Computer Architecture A 328 328" -> Title: "Computer Architecture", Section: "A", Room: "Rm 328"
    // Example: "Structured Programming Language Laboratory A 422 (Computer Lab)" -> Title: "Structured Programming Language Laboratory", Sec: "A", Room: "422 (Computer Lab)"
    let title = titleAndSec;
    let section = "A";
    let room = "";

    // Regex to extract section and rooms from end of titleAndSec
    // e.g. section letter or code (A, B, AA, J (SI 339), F (if required), etc.) + rooms
    const secRoomMatch = titleAndSec.match(/(.*?)\s+([A-Z0-9]+(?:\s*\([^)]+\))?)\s+(\d{3}(?:\s*\([^)]+\))?|\d{3})\s*(\d{3}(?:\s*\([^)]+\))?|\d{3})?$/i);
    if (secRoomMatch) {
      title = secRoomMatch[1].trim();
      section = secRoomMatch[2].trim();
      const r1 = secRoomMatch[3].trim();
      const r2 = secRoomMatch[4] ? secRoomMatch[4].trim() : "";
      room = r1 === r2 || !r2 ? (r1.includes("Lab") ? r1 : `Rm ${r1}`) : `${r1} / ${r2}`;
    } else {
      // Try fallback regex
      const fallbackMatch = titleAndSec.match(/(.*?)\s+([A-Z]{1,2}(?:\s*\([^)]+\))?)\s+(.*)$/);
      if (fallbackMatch) {
        title = fallbackMatch[1].trim();
        section = fallbackMatch[2].trim();
        room = fallbackMatch[3].trim();
      }
    }

    const isLab = credit === 1 || title.toLowerCase().includes("laboratory") || title.toLowerCase().includes("lab");

    const sectionObj = {
      id: `${courseCode}_${section}_${sl}`,
      sl,
      program,
      courseCode,
      title,
      section,
      days,
      time1,
      time2: time2 === "-" ? null : time2,
      displayTime: days + ": " + time1 + (room ? ` (${room})` : ""),
      room,
      facultyName: facultyName || "TBA",
      facultyInitial,
      credit,
      isLab
    };

    parsedSections.push(sectionObj);

    if (!coursesMap.has(courseCode)) {
      coursesMap.set(courseCode, {
        code: courseCode,
        title: title.replace(/Laboratory/i, "Lab").trim(),
        fullTitle: title,
        credit,
        program,
        isLab,
        sections: []
      });
    }
    coursesMap.get(courseCode).sections.push(sectionObj);
  });

  const coursesList = Array.from(coursesMap.values());

  // Ensure data directories
  fs.mkdirSync(path.join(__dirname, '../src/data'), { recursive: true });

  fs.writeFileSync(
    path.join(__dirname, '../src/data/allSections.json'),
    JSON.stringify(parsedSections, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, '../src/data/allCourses.json'),
    JSON.stringify(coursesList, null, 2)
  );

  fs.writeFileSync(
    path.join(__dirname, '../src/data/facultyRatings.json'),
    JSON.stringify(facultyRatingsList, null, 2)
  );

  console.log(`Successfully generated data files!`);
  console.log(`Total sections: ${parsedSections.length}`);
  console.log(`Total unique courses: ${coursesList.length}`);
  console.log(`Total faculty members: ${facultyRatingsList.length}`);
}

generateData().catch(console.error);
