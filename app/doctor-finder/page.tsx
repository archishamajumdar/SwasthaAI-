'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Phone, Star, Clock, DollarSign, PhoneCall } from 'lucide-react'
import { apiRequest } from '@/lib/api'

interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  location: string
  distance: number
  experience: number
  availability: string
  consultationFee: number
  image: string
  verified: boolean
}

const LOCAL_HOSPITALS = [
  { name: 'Manipal Hospitals (AMRI)', location: 'Mukundapur', rating: '4.0', val: 718, phone: '08037324413', fees: '₹800 - ₹2300', specs: '82 Doctors' },
  { name: 'Manipal Hospitals (AMRI)', location: 'Dhakuria', rating: '4.5', val: 1323, phone: '08037324413', fees: '₹0 - ₹3000', specs: '58 Doctors' },
  { name: 'Medica Superspeciality', location: 'Mukundapur', rating: '5.0', val: 655, phone: '03366520000', fees: '₹0 - ₹1700', specs: '62 Doctors' },
  { name: 'AMRI Hospital', location: 'Mukundapur', rating: '5.0', val: 1081, phone: '03366800000', fees: '₹0 - ₹1000', specs: '10 Doctors' },
  { name: 'Genesis Hospital', location: 'Kasba', rating: '4.5', val: 49, phone: '03366043300', fees: '₹500 - ₹1300', specs: '28 Doctors' },
  { name: 'Desun Hospital', location: 'Kasba', rating: '3.5', val: 34, phone: '09051715171', fees: '₹0 - ₹1500', specs: '32 Doctors' },
  { name: 'Rabindranath Tagore Intl', location: 'Mukundapur', rating: '4.0', val: 94, phone: '18008903102', fees: '₹0 - ₹1200', specs: '24 Doctors' },
  { name: 'Peerless Hospital', location: 'Panchasayar', rating: '4.0', val: 42, phone: '03340111222', fees: '₹0 - ₹1100', specs: '47 Doctors' },
  { name: 'Future Healthcare And Diagnostics Centre', location: 'Kalikapur', rating: '4.0', val: 36, phone: '03324160000', fees: '₹200 - ₹1300', specs: '17 Doctors' },
  { name: 'IRIS Hospital', location: 'Baghajatin', rating: '3.5', val: 99, phone: '03366040000', fees: '₹0 - ₹2100', specs: '27 Doctors' },
]

const RUBY_CLINICS = [
  { name: 'Manipal Hospitals (AMRI)', location: 'Dhakuria', rating: '4.5', val: 1323, phone: '08037324413', fees: '₹0 - ₹3000', specs: '2 Int. Medicine Docs' },
  { name: 'Desun Hospital', location: 'Kasba', rating: '3.5', val: 34, phone: '09051715171', fees: '₹0 - ₹1500', specs: '4 Int. Medicine Docs' },
  { name: 'Genesis Hospital', location: 'Kasba', rating: '4.5', val: 49, phone: '03366043300', fees: '₹500 - ₹1300', specs: '1 Int. Medicine Doc' },
  { name: 'Manipal Hospitals (AMRI)', location: 'Mukundapur', rating: '4.0', val: 718, phone: '08037324413', fees: '₹800 - ₹2300', specs: '3 Int. Medicine Docs' },
  { name: 'Desun Hospitals', location: 'Ruby Park East', rating: 'New', val: 0, phone: '09051715171', fees: '₹0 - ₹1000', specs: '3 Int. Medicine Docs' },
  { name: 'Ruby General Hospital', location: 'Kasba', rating: '4.0', val: 212, phone: '03366022222', fees: '₹500 - ₹1000', specs: '1 Int. Medicine Doc' },
  { name: 'Lenus Specialty Clinic', location: 'Kalikapur', rating: '4.5', val: 56, phone: '03324160000', fees: '₹2000', specs: '1 Int. Medicine Doc' },
  { name: 'Surakhsha Diabetic Clinic', location: 'Kasba', rating: '3.5', val: 13, phone: '03366040000', fees: '₹1500', specs: '1 Int. Medicine Doc' },
  { name: 'Radiance Medical Services', location: 'Dhakuria', rating: 'New', val: 0, phone: '03366040000', fees: '₹500', specs: '1 Int. Medicine Doc' },
  { name: 'South Heart Clinic', location: 'Kalikapur', rating: 'New', val: 0, phone: '03366040000', fees: '₹0 - ₹1000', specs: '1 Int. Medicine Doc' }
]

const GARIA_HOSPITALS = [
  { name: 'Rabindranath Tagore Surgical Centre', location: 'Garia', rating: '5.0', val: 92, phone: '18008903102', fees: '₹0 - ₹10000', specs: '9 Doctors' },
  { name: 'Suraksha Diagnostics', location: 'Garia', rating: '4.5', val: 125, phone: '03366040000', fees: '₹400 - ₹1000', specs: '10 Doctors' },
  { name: 'Peerless Hospital', location: 'Panchasayar', rating: '4.0', val: 42, phone: '03340111222', fees: '₹0 - ₹1100', specs: '47 Doctors' },
  { name: 'BRWS Hospital & Clinic', location: 'Naktala', rating: '4.0', val: 18, phone: '03324160000', fees: '₹500 - ₹1500', specs: '3 Doctors' },
  { name: 'Dr. Agarwal\'s Eye Hospital', location: 'Panchasayar', rating: '5.0', val: 33, phone: '03366043300', fees: '₹500', specs: '3 Doctors' },
  { name: 'Bhagirathi Neotia Woman & Child Care', location: 'Ramkrishna Park', rating: '4.5', val: 61, phone: '03340405000', fees: '₹800 - ₹1500', specs: '4 Doctors' },
  { name: 'The Ivory Dental', location: 'Panchasayar', rating: '4.5', val: 35, phone: '09051715171', fees: '₹500', specs: '2 Doctors' },
  { name: 'Peerless Hospitex', location: 'Jatindra Nath Road', rating: '4.0', val: 40, phone: '03340111222', fees: '₹500 - ₹1500', specs: '40 Doctors' },
  { name: 'IRIS Hospital', location: 'Baghajatin', rating: '3.5', val: 99, phone: '03366040000', fees: '₹0 - ₹2100', specs: '27 Doctors' },
  { name: 'Future Healthcare', location: 'Jadavpur', rating: '4.0', val: 16, phone: '03324160000', fees: '₹0 - ₹1300', specs: '19 Doctors' }
]

const BELEGHATA_HOSPITALS = [
  { name: 'Techno India Dama Healthcare', location: 'Beliaghata', rating: '3.5', val: 120, phone: '03323633363', fees: '₹0 - ₹4100', specs: '105 Doctors' },
  { name: 'Apollo Multispeciality Hospital', location: 'Salt Lake', rating: '3.5', val: 610, phone: '18605001066', fees: '₹0 - ₹2000', specs: '113 Doctors' },
  { name: 'Manipal Hospital Broadway', location: 'Salt Lake', rating: '4.0', val: 711, phone: '08037324413', fees: '₹800 - ₹2000', specs: '66 Doctors' },
  { name: 'Infectious Diseases & B.G. Hospital', location: 'Beliaghata', rating: 'New', val: 0, phone: '03323531122', fees: 'Free', specs: '4 Doctors' },
  { name: 'Divine Nursing Home', location: 'Beliaghata', rating: 'New', val: 0, phone: '03322002200', fees: '₹0 - ₹2000', specs: '7 Doctors' },
  { name: 'Divine Poly Clinic', location: 'Beliaghata', rating: '5.0', val: 25, phone: '03322002200', fees: '₹700 - ₹1500', specs: '2 Doctors' },
  { name: 'HCG Cancer Centre', location: 'New Town', rating: 'New', val: 0, phone: '08037324413', fees: '₹0 - ₹750', specs: '11 Doctors' },
  { name: 'ASG Eye Hospital', location: 'Lake Town', rating: '3.5', val: 40, phone: '03366043300', fees: '₹400 - ₹500', specs: '5 Doctors' },
  { name: 'Apollo Gleneagles Cancer Hospital', location: 'Salt Lake', rating: '3.0', val: 117, phone: '18605001066', fees: '₹400 - ₹1200', specs: '32 Doctors' },
  { name: 'RB Diagnostic', location: 'Kankurgachi', rating: '5.0', val: 172, phone: '03366040000', fees: '₹600 - ₹1000', specs: '9 Doctors' }
]

const TOLLYGUNGE_HOSPITALS = [
  { name: 'Manipal Hospitals (AMRI)', location: 'Dhakuria', rating: '4.5', val: 1323, phone: '08037324413', fees: '₹0 - ₹3000', specs: '58 Doctors' },
  { name: 'Suraksha Diagnostics', location: 'Tollygunge', rating: '3.5', val: 12, phone: '03366040000', fees: '₹0 - ₹1500', specs: '49 Doctors' },
  { name: 'EEDF Hospital', location: 'Jodhpur Park', rating: '4.0', val: 9, phone: '03340050000', fees: '₹200 - ₹900', specs: '9 Doctors' },
  { name: 'Sri Aravindo Sevakendra', location: 'Jodhpur Park', rating: '3.5', val: 63, phone: '03324160000', fees: '₹200 - ₹700', specs: '5 Doctors' },
  { name: 'Apollo Clinic', location: 'Lake Gardens', rating: '3.5', val: 22, phone: '18605001066', fees: '₹400 - ₹1300', specs: '12 Doctors' },
  { name: 'The Lions North Calcutta Hospital', location: 'Tollygunge', rating: 'New', val: 0, phone: '03324734353', fees: '₹0 - ₹800', specs: '14 Doctors' },
  { name: 'ASG Eye Hospital', location: 'Tollygunge', rating: '2.5', val: 18, phone: '03366043300', fees: '₹500', specs: '3 Doctors' },
  { name: 'Hearing Plus', location: 'Lake Gardens', rating: 'New', val: 0, phone: '03324160000', fees: '₹500', specs: '4 Doctors' },
  { name: 'Cosmetic & Plastic Surgery Centre', location: 'Madar Tala', rating: 'New', val: 0, phone: '03324160000', fees: 'Varies', specs: '1 Doctor' },
  { name: 'Mental Health Research Centre', location: 'Jodhpur Gardens', rating: 'New', val: 0, phone: '03324160000', fees: 'Varies', specs: '1 Doctor' }
]

const BARANAGAR_HOSPITALS = [
  { name: 'Binayak Multispeciality Hospital', location: 'Dumdum', rating: '5.0', val: 35, phone: '03366040000', fees: '₹250 - ₹1000', specs: '8 Doctors' },
  { name: 'N.I.O.H Hospital', location: 'Bonhooghly', rating: 'New', val: 0, phone: '03340050000', fees: '₹500', specs: '1 Doctor' },
  { name: 'Sahid Khudiram Bose Hospital', location: 'Belgharia', rating: 'New', val: 0, phone: '03322002200', fees: '₹0 - ₹600', specs: '6 Doctors' },
  { name: 'Khudiram Hospital', location: 'Belgharia', rating: 'New', val: 0, phone: '03322002200', fees: '₹300', specs: '1 Doctor' },
  { name: 'Naba Jiban Hospital Private Limited', location: 'Shyambazar', rating: 'New', val: 0, phone: '03325642233', fees: '₹300', specs: '1 Doctor' }
]

const DUMDUM_HOSPITALS = [
  { name: 'Meditrust Diagnostic Centre', location: 'Dumdum', rating: 'New', val: 0, phone: '03325642233', fees: '₹800', specs: '1 Doctor' },
  { name: 'Binayak Multispeciality Hospital', location: 'Dumdum', rating: '5.0', val: 35, phone: '03340050000', fees: '₹250 - ₹1000', specs: '8 Doctors' },
  { name: 'Birati Municipal Hospital', location: 'Dumdum', rating: 'New', val: 0, phone: '03323531122', fees: '₹600', specs: '1 Doctor' },
  { name: 'Dum Dum Medical Centre', location: 'Dumdum', rating: 'New', val: 0, phone: '03340050000', fees: '₹350 - ₹2000', specs: '5 Doctors' },
  { name: 'Renaissance Hospital', location: 'Teghoria', rating: '4.5', val: 18, phone: '03322002200', fees: 'Varies', specs: '6 Doctors' },
  { name: 'Ils Hospital', location: 'Nagerbazar', rating: 'New', val: 0, phone: '03366040000', fees: '₹700 - ₹800', specs: '6 Doctors' },
  { name: 'Charnock Hospital', location: 'Teghoria', rating: '5.0', val: 69, phone: '18605001066', fees: '₹300 - ₹1650', specs: '21 Doctors' }
]

const BELGACHIA_HOSPITALS = [
  { name: 'HCG Cancer Centre', location: 'New Town', rating: 'New', val: 0, phone: '08037324413', fees: '₹0 - ₹750', specs: '11 Doctors' },
  { name: 'North City Hospital', location: 'Ultadanga', rating: '4.5', val: 89, phone: '03340050000', fees: 'Varies', specs: '32 Doctors' },
  { name: 'Care Hospital', location: 'Ultadanga', rating: '4.0', val: 14, phone: '03323531122', fees: '₹800', specs: '1 doctor' },
  { name: 'Dafodil Nursing Home', location: 'Lake Town', rating: 'New', val: 0, phone: '03323531122', fees: '₹0 - ₹1000', specs: '12 Doctors' },
  { name: 'Naba Jiban Hospital', location: 'Shyambazar', rating: 'New', val: 0, phone: '03325642233', fees: '₹300 - ₹400', specs: '2 Doctors' }
]

const SHYAMBAZAR_HOSPITALS = [
  { name: 'ASG Eye Hospital', location: 'Lake Town', rating: '3.5', val: 40, phone: '03366043300', fees: '₹400 - ₹500', specs: '5 Doctors' },
  { name: 'Sanjeevani Hospital', location: 'Shyambazar', rating: '3.5', val: 29, phone: '03325557675', fees: '₹500 - ₹750', specs: '2 Doctors' },
  { name: 'Naba Jiban Hospital', location: 'Shyambazar', rating: 'New', val: 0, phone: '03325642233', fees: '₹300 - ₹400', specs: '2 Doctors' },
  { name: 'Hearing Plus', location: 'Shyambazar', rating: 'New', val: 0, phone: '03324160000', fees: '₹500', specs: '4 Doctors' },
  { name: 'GD Hospital & Diabetic Institute', location: 'Taltala', rating: '4.0', val: 28, phone: '03330903090', fees: 'Varies', specs: '15 Doctors' }
]

const MGROAD_HOSPITALS = [
  { name: 'ASG Eye Hospital', location: 'Lake Town', rating: '3.5', val: 40, phone: '03366043300', fees: '₹400 - ₹500', specs: '5 Doctors' },
  { name: 'GD Hospital & Diabetic Institute', location: 'Taltala', rating: '4.0', val: 28, phone: '03330903090', fees: 'Varies', specs: '15 Doctors' },
  { name: 'Vision Care Hospital', location: 'Mukundapur', rating: '5.0', val: 68, phone: '08037324413', fees: 'Varies', specs: '21 Doctors' },
  { name: 'SVS Marwari Hospital', location: 'Raja Ram Mohan Sarani', rating: '4.0', val: 10, phone: '03322414901', fees: '₹40 - ₹200', specs: '4 Doctors' },
  { name: 'Medical College and Hospital', location: 'College Square', rating: 'New', val: 0, phone: '03322414901', fees: '₹250 - ₹500', specs: '3 Doctors' }
]

const PARKSTREET_HOSPITALS = [
  { name: 'Samaritan Clinic', location: 'Bhawanipore', rating: '4.0', val: 107, phone: '03322872321', fees: '₹1000 - ₹2500', specs: '64 Doctors' },
  { name: 'Institute of Neurosciences', location: 'Park Street', rating: '5.0', val: 49, phone: '03322872321', fees: 'Varies', specs: '18 Doctors' },
  { name: 'Bhagirathi Neotia Woman & Child Care', location: 'Park Street', rating: '4.5', val: 114, phone: '03322872321', fees: 'Varies', specs: '16 Doctors' },
  { name: 'Mercy Hospital', location: 'Park Street', rating: 'New', val: 0, phone: '03322872321', fees: '₹500 - ₹700', specs: '2 Doctors' },
  { name: 'Oliva Skin & Hair Clinic', location: 'Park Street', rating: '5.0', val: 269, phone: '03322872321', fees: '₹900', specs: '7 Doctors' },
  { name: 'Nightingale Hospital', location: 'Shakespeare Sarani', rating: '4.0', val: 29, phone: '03322872321', fees: 'Varies', specs: '15 Doctors' },
  { name: 'Nova IVF Fertility Hospital', location: 'Camac Street', rating: '5.0', val: 397, phone: '03322872321', fees: 'Varies', specs: '7 Doctors' }
]

const KALIGHAT_HOSPITALS = [
  { name: 'Manipal Hospitals (AMRI)', location: 'Dhakuria', rating: '4.5', val: 1323, phone: '08037324413', fees: 'Varies', specs: '58 Doctors' },
  { name: 'Samaritan Clinic', location: 'Bhawanipore', rating: '4.0', val: 107, phone: '03322872321', fees: '₹1000 - ₹2500', specs: '64 Doctors' },
  { name: 'ASG Eye Hospital', location: 'Tollygunge', rating: '2.5', val: 18, phone: '03366043300', fees: '₹500', specs: '3 Doctors' },
  { name: 'Fortis Hospital and Kidney Institute', location: 'Rash Behari Avenue', rating: '3.0', val: 79, phone: '03322872321', fees: 'Varies', specs: '42 Doctors' },
  { name: 'Shradha Health Care', location: 'New Alipore', rating: '4.5', val: 86, phone: '03322872321', fees: '₹200 - ₹600', specs: '13 Doctors' }
]

const LOCATION_HOSPITALS: Record<string, { title: string; items: any[] }> = {
  Santoshpur: { title: "Top Hospitals Validated in Santoshpur Area", items: LOCAL_HOSPITALS },
  Ruby: { title: "Top Clinics Validated in Ruby Park East Area", items: RUBY_CLINICS },
  Garia: { title: "Top Hospitals Validated in Garia Area", items: GARIA_HOSPITALS },
  Beleghata: { title: "Top Hospitals Validated in Beleghata Area", items: BELEGHATA_HOSPITALS },
  Tollygunge: { title: "Top Hospitals Validated in Tollygunge Area", items: TOLLYGUNGE_HOSPITALS },
  Baranagar: { title: "Top Hospitals Validated in Baranagar Area", items: BARANAGAR_HOSPITALS },
  Dumdum: { title: "Top Hospitals Validated in Dumdum Area", items: DUMDUM_HOSPITALS },
  Belgachia: { title: "Top Hospitals Validated in Belgachia Area", items: BELGACHIA_HOSPITALS },
  Shyambazar: { title: "Top Hospitals Validated in Shyambazar Area", items: SHYAMBAZAR_HOSPITALS },
  'MG Road': { title: "Top Hospitals Validated in MG Road Area", items: MGROAD_HOSPITALS },
  'Park Street': { title: "Top Hospitals Validated in Park Street Area", items: PARKSTREET_HOSPITALS },
  Kalighat: { title: "Top Hospitals Validated in Kalighat Area", items: KALIGHAT_HOSPITALS }
}

const STATIC_DOCTORS = [
  { id: 'ap1', name: 'Dr Ramna Banerjee', specialty: 'Gynaecologist', rating: 4.8, reviews: 725, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 24, availability: 'Available Tomorrow', consultationFee: 1500, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap2', name: 'Dr. Rupashree Dasgupta', specialty: 'Gynaecologist', rating: 4.5, reviews: 375, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 26, availability: 'Available Tomorrow', consultationFee: 1500, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap3', name: 'Dr. Tarun Jindal', specialty: 'Urologist', rating: 4.7, reviews: 150, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 14, availability: 'Available Today', consultationFee: 1500, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap4', name: 'Dr. Prof Col Pradyot Sarkar', specialty: 'Psychiatrist', rating: 4.3, reviews: 200, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 40, availability: 'Available Today', consultationFee: 1200, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap5', name: 'Dr Shaikat Gupta', specialty: 'Oncologist', rating: 4.3, reviews: 100, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 35, availability: 'Available Tomorrow', consultationFee: 2500, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap6', name: 'Dr. Srabani Ghosh Zoha', specialty: 'Dermatologist', rating: 4.1, reviews: 475, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 32, availability: 'Available Today', consultationFee: 2000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap7', name: 'Dr. Hirak Mazumder', specialty: 'General Physician', rating: 4.5, reviews: 100, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 33, availability: 'Available Today', consultationFee: 2000, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap8', name: 'Dr. Subhasish Ghosh', specialty: 'Pulmonologist', rating: 4.5, reviews: 125, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 35, availability: 'Available Tomorrow', consultationFee: 1500, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap9', name: 'Dr. Sujoy Majumdar', specialty: 'Endocrinologist', rating: 4.5, reviews: 100, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 35, availability: 'Available Tomorrow', consultationFee: 1500, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap10', name: 'Dr Sanjay Bhaumik', specialty: 'Neurologist', rating: 4.6, reviews: 150, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 25, availability: 'Available Tomorrow', consultationFee: 1500, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap11', name: 'Dr. Indraneel Saha', specialty: 'Dermatologist', rating: 4.4, reviews: 200, location: 'Dr Utsa Basu Clinic', distance: 1.0, experience: 10, availability: 'Available Today', consultationFee: 550, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap12', name: 'Dr. Sreeparna Roy', specialty: 'Gynaecologist', rating: 4.5, reviews: 150, location: 'Dr Utsa Basu Clinic', distance: 1.0, experience: 8, availability: 'Available Today', consultationFee: 500, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap13', name: 'Dr. Naveed Ahmed', specialty: 'Paediatrician', rating: 4.5, reviews: 100, location: 'Doctor Pharma', distance: 2.0, experience: 10, availability: 'Available Today', consultationFee: 625, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap14', name: 'Dr. Abhilasha Kumar', specialty: 'Gynaecologist', rating: 4.3, reviews: 275, location: 'Abhilasha Clinic', distance: 2.0, experience: 30, availability: 'Available Today', consultationFee: 950, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap15', name: 'Dr. Sonalika Mondal', specialty: 'Psychiatrist', rating: 4.5, reviews: 25, location: 'Dr. Sonalika Mondal Clinic', distance: 3.0, experience: 9, availability: 'Available tomorrow', consultationFee: 1000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap16', name: 'Dr. Monika Meena', specialty: 'Gynaecologist', rating: 4.5, reviews: 100, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 12, availability: 'Available Today', consultationFee: 1000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap17', name: 'Dr. Gautam Dhar Choudhury', specialty: 'Rheumatologist', rating: 4.7, reviews: 125, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 18, availability: 'Available Today', consultationFee: 1200, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap18', name: 'Dr. Kushal Nag', specialty: 'Orthopaedician', rating: 4.4, reviews: 100, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 20, availability: 'Available Today', consultationFee: 1700, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap19', name: 'Dr Debanjali Sinha', specialty: 'Rheumatologist', rating: 4.4, reviews: 50, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 15, availability: 'Available Today', consultationFee: 1200, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap20', name: 'Dr. Saibal Moitra', specialty: 'Pulmonologist', rating: 4.7, reviews: 150, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 20, availability: 'Available Today', consultationFee: 1000, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap21', name: 'Dr Nikhat Shamim', specialty: 'General Physician', rating: 4.2, reviews: 20, location: 'Holistic Health Clinic', distance: 1.0, experience: 4, availability: 'Available Tomorrow', consultationFee: 450, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap22', name: 'Dr Sumita Ghosh', specialty: 'Diabetologist', rating: 4.9, reviews: 75, location: 'Modern Clinic', distance: 1.0, experience: 21, availability: 'Available Today', consultationFee: 1000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap23', name: 'Ms. Malabika Datta', specialty: 'Dietician', rating: 4.2, reviews: 25, location: 'Dr Utsa Basu Clinic', distance: 1.0, experience: 17, availability: 'Available Today', consultationFee: 800, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap24', name: 'Dr. Utsa Basu', specialty: 'Diabetologist', rating: 4.8, reviews: 400, location: 'Dr Utsa Basu Clinic', distance: 1.0, experience: 14, availability: 'Available Today', consultationFee: 1000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap25', name: 'Dr. Mijanur Rahaman Mondal', specialty: 'General Physician', rating: 4.8, reviews: 25, location: 'Dr Utsa Basu Clinic', distance: 1.0, experience: 3, availability: 'Available Today', consultationFee: 500, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap26', name: 'Ms. Soma Saha', specialty: 'Dietician', rating: 4.4, reviews: 50, location: 'Dr Utsa Basu Clinic', distance: 1.0, experience: 17, availability: 'Available Today', consultationFee: 375, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap27', name: 'Dr. Subha Chakraborty', specialty: 'General Physician', rating: 4.3, reviews: 80, location: 'MED Aid Clinic', distance: 2.0, experience: 13, availability: 'Available Today', consultationFee: 875, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap28', name: 'Dr. Saurabh Gupta', specialty: 'Dentist', rating: 4.5, reviews: 100, location: 'Being Dentist', distance: 2.0, experience: 12, availability: 'Available Today', consultationFee: 500, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap29', name: 'Dr. Nisha Pathak', specialty: 'Dentist', rating: 4.3, reviews: 40, location: 'The Dentique', distance: 3.0, experience: 10, availability: 'Available Today', consultationFee: 600, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap30', name: 'Dr. Nirmalya Mukherjee', specialty: 'Dentist', rating: 4.3, reviews: 30, location: 'The Dentique', distance: 3.0, experience: 10, availability: 'Available Today', consultationFee: 600, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap31', name: 'Ms. Ananya Bhattacharya', specialty: 'Dietician', rating: 4.1, reviews: 60, location: 'Abundance with Ananya', distance: 3.0, experience: 22, availability: 'Available Today', consultationFee: 2499, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap32', name: 'Dr. Bhaskar Mukhopadhyay', specialty: 'Diabetologist', rating: 4.2, reviews: 40, location: 'MEDICURE', distance: 3.0, experience: 20, availability: 'Available Today', consultationFee: 600, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap33', name: 'Ms Prerana Solanki', specialty: 'Dietician', rating: 4.7, reviews: 50, location: 'Nutridiction', distance: 3.0, experience: 11, availability: 'Available Today', consultationFee: 2000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap34', name: 'Dr. M S Haque', specialty: 'Diabetologist', rating: 4.2, reviews: 30, location: 'MS Haque Clinic', distance: 3.0, experience: 40, availability: 'Available Today', consultationFee: 1200, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap35', name: 'Dr. Asique Perwaiz', specialty: 'General Physician', rating: 4.1, reviews: 10, location: 'MS Haque Clinic', distance: 3.0, experience: 7, availability: 'Available Today', consultationFee: 1200, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap36', name: 'Dr. Ankit Chaurasia', specialty: 'Paediatrician', rating: 4.5, reviews: 40, location: 'Cure Kidz Child Care', distance: 3.0, experience: 10, availability: 'Available Today', consultationFee: 563, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap37', name: 'Dr Anuradha Bose', specialty: 'Dentist', rating: 4.4, reviews: 80, location: 'Apollo Dental Clinic', distance: 3.0, experience: 26, availability: 'Available Today', consultationFee: 600, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap38', name: 'Dr. Ayan Chakraborty', specialty: 'Dentist', rating: 4.2, reviews: 40, location: 'Apollo Dental Clinic', distance: 3.0, experience: 13, availability: 'Available Today', consultationFee: 600, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap39', name: 'Dr. Ritam Chandra Pati', specialty: 'Dentist', rating: 4.1, reviews: 20, location: 'Apollo Dental Clinic', distance: 3.0, experience: 8, availability: 'Available Today', consultationFee: 600, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap40', name: 'Dr. Sayan Gupta', specialty: 'General Physician', rating: 4.5, reviews: 90, location: 'North City Hospital', distance: 3.0, experience: 19, availability: 'Available Today', consultationFee: 700, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap41', name: 'Ms Saira Islam', specialty: 'Physiotherapist', rating: 4.3, reviews: 30, location: 'GSPR Pain Relief Clinic', distance: 3.0, experience: 9, availability: 'Available Today', consultationFee: 500, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap42', name: 'Dr. Vibekananda Majumdar', specialty: 'Dermatologist', rating: 4.6, reviews: 140, location: 'Dr. Vibekananda Majumdar\'s Clinic', distance: 3.0, experience: 48, availability: 'Available Today', consultationFee: 1400, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap43', name: 'Dr. Sneha Tickoo', specialty: 'Gynaecologist', rating: 4.4, reviews: 60, location: 'Dr. Sneha tickoo', distance: 3.0, experience: 13, availability: 'Available Today', consultationFee: 1000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap44', name: 'Ms. Chetu Singhi', specialty: 'Dietician', rating: 4.8, reviews: 100, location: 'Diet2fit Chetu Singhi', distance: 3.0, experience: 20, availability: 'Available Today', consultationFee: 3000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap45', name: 'Dr. Adhish Basu', specialty: 'Plastic Surgeon', rating: 4.6, reviews: 25, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 24, availability: 'Available Today', consultationFee: 2000, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap46', name: 'Dr. Dharmendra Kumar Rai', specialty: 'Oncologist', rating: 4.3, reviews: 15, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 9, availability: 'Available Today', consultationFee: 1000, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap47', name: 'Dr. Archana Ranade', specialty: 'Oncologist', rating: 4.7, reviews: 125, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 26, availability: 'Available Today', consultationFee: 1500, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap48', name: 'Dr. Rajeev Sharan', specialty: 'Oncologist', rating: 4.3, reviews: 20, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 25, availability: 'Available Today', consultationFee: 1000, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap49', name: 'Dr. Shaoni Dhole Sanyal', specialty: 'Oncologist', rating: 4.2, reviews: 10, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 6, availability: 'Available Today', consultationFee: 1000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap50', name: 'Dr. Sandip Ganguly', specialty: 'Oncologist', rating: 4.4, reviews: 15, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 15, availability: 'Available Today', consultationFee: 1300, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap51', name: 'Dr. Major Ranajoy Dutta', specialty: 'General Physician', rating: 4.5, reviews: 15, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 15, availability: 'Available today', consultationFee: 1200, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap52', name: 'Dr. Niharendu Ghara', specialty: 'Paediatrician', rating: 4.5, reviews: 15, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 32, availability: 'Available Today', consultationFee: 1500, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap53', name: 'Dr Chanda Chowdhury', specialty: 'Gynaecologist', rating: 4.4, reviews: 200, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 23, availability: 'Available Today', consultationFee: 1200, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap54', name: 'Dr. Amit Choraria', specialty: 'Oncologist', rating: 4.3, reviews: 10, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 18, availability: 'Available Today', consultationFee: 1000, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap55', name: 'Dr. Pooja Banerjee', specialty: 'Nephrologist', rating: 4.9, reviews: 375, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 12, availability: 'Available Today', consultationFee: 1500, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap56', name: 'Dr. Avinash Dutt Sharma', specialty: 'General Physician', rating: 4.4, reviews: 80, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 22, availability: 'Available Today', consultationFee: 1100, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap57', name: 'Dr Litan Naha Biswas', specialty: 'General Physician', rating: 4.3, reviews: 50, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 11, availability: 'Available Today', consultationFee: 1000, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap58', name: 'Dr Mukti Mukherjee', specialty: 'General Physician', rating: 4.3, reviews: 40, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 12, availability: 'Available Today', consultationFee: 1000, image: '👩‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap59', name: 'Dr Debmalya Bhattacharyya', specialty: 'General Physician', rating: 4.2, reviews: 30, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 9, availability: 'Available Today', consultationFee: 1200, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap60', name: 'Dr. Sandip Kumar Bhattacharya', specialty: 'General Physician', rating: 4.6, reviews: 100, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 25, availability: 'Available Today', consultationFee: 1500, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap61', name: 'Prof. Dr. Suvadip Chakrabarti', specialty: 'General Physician', rating: 4.4, reviews: 60, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 16, availability: 'Available Today', consultationFee: 1200, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap62', name: 'Dr. Srinjoy Saha', specialty: 'General Physician', rating: 4.4, reviews: 50, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 16, availability: 'Available Today', consultationFee: 1700, image: '👨‍⚕️', verified: true, phone: '08040245807' },
  { id: 'ap63', name: 'Dr. Joydeep Ghosh', specialty: 'General Physician', rating: 4.3, reviews: 40, location: 'Apollo Multispeciality Hospitals', distance: 3.0, experience: 17, availability: 'Available Today', consultationFee: 1000, image: '👨‍⚕️', verified: true, phone: '08040245807' }
]

export default function DoctorFinderPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('Santoshpur')

  const locations = [
    'Santoshpur', 'Ruby', 'Garia', 'Beleghata', 'Tollygunge',
    'Baranagar', 'Dumdum', 'Belgachia', 'Shyambazar', 'MG Road', 'Park Street', 'Kalighat'
  ]

  const specialties = [
    'All',
    'Cardiologist',
    'Endocrinologist',
    'Neurologist',
    'Ophthalmologist',
    'Dermatologist',
    'Gynaecologist',
    'Psychiatrist',
    'General Physician',
    'Pulmonologist',
    'Paediatrician',
    'Urologist',
    'Dentist',
    'Dietician',
    'Oncologist',
    'Diabetologist',
    'Rheumatologist',
    'Nephrologist'
  ]

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const data = await apiRequest(`/recommend-doctors?disease=${selectedSpecialty}&location=${selectedLocation}`)
      
      const mappedDoctors: Doctor[] = (data.doctors || []).map((d: any, idx: number) => ({
        id: idx.toString(),
        name: d.name,
        specialty: d.specialty || data.specialist_type,
        rating: d.rating || 4.5,
        reviews: 200 + Math.floor(Math.random() * 300),
        location: d.hospital || 'Private Clinic',
        distance: parseFloat(d.distance) || parseFloat((1 + Math.random() * 5).toFixed(1)),
        experience: parseInt(d.exp) || 15,
        availability: 'Available Today',
        consultationFee: 800 + Math.floor(Math.random() * 700),
        image: '👨‍⚕️',
        verified: true,
        phone: '08040245807'
      }))

      // Filter fallbacks based on supporting specialty or select All
      const fallbackMatches = STATIC_DOCTORS.filter(d => 
        selectedSpecialty === 'All' || d.specialty === selectedSpecialty
      )

      setDoctors([...mappedDoctors, ...fallbackMatches])
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
      // On failure, load full fallbacks matching specialty
      setDoctors(STATIC_DOCTORS.filter(d => selectedSpecialty === 'All' || d.specialty === selectedSpecialty))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [selectedSpecialty, selectedLocation])

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpecialty =
      selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="w-full bg-background p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Doctors</h1>
          <p className="text-muted-foreground">
            Discover specialized healthcare professionals near you based on your needs
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8 border border-border">
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by doctor name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {specialties.map((specialty) => (
              <Button
                key={specialty}
                variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSpecialty(specialty)}
              >
                {specialty}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium pt-2 text-muted-foreground mr-2">Nearby Areas:</span>
            {locations.map((loc) => (
              <Button
                key={loc}
                variant={selectedLocation === loc ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedLocation(loc)}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {loc}
              </Button>
            ))}
          </div>
        </Card>

        {/* Dynamic Location Directory Block */}
        {LOCATION_HOSPITALS[selectedLocation] && (
          <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <PhoneCall className="w-6 h-6 text-blue-500" />
              {LOCATION_HOSPITALS[selectedLocation].title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {LOCATION_HOSPITALS[selectedLocation].items.map((h, i) => (
                <div key={i} className="bg-background border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                   <div className="flex justify-between items-start gap-4">
                     <div className="flex-1">
                       <h4 className="font-bold text-[15px] text-foreground leading-tight">{h.name}</h4>
                       <p className="text-[13px] text-muted-foreground mt-1.5">{h.location} • {h.specs}</p>
                       <div className="flex items-center gap-4 mt-3">
                         <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded flex items-center gap-1">
                           <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {h.rating} {h.val > 0 ? `(${h.val})` : ''}
                         </span>
                         <span className="text-xs text-muted-foreground font-medium">{h.fees}</span>
                       </div>
                     </div>
                     <div className="flex flex-col items-center gap-1.5 shrink-0 z-10">
                       <a href={`tel:${h.phone}`} className="bg-blue-500 hover:bg-blue-600 text-white p-3.5 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md" title="Call directly">
                         <PhoneCall className="w-5 h-5" />
                       </a>
                       <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Call Now</span>
                     </div>
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctors List */}
        <div className="space-y-4">
          {filteredDoctors.map((doctor, idx) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="p-6 border border-border hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{doctor.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-foreground">{doctor.name}</h3>
                        {doctor.verified && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{doctor.specialty}</p>

                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold">{doctor.rating}</span>
                          <span className="text-xs text-muted-foreground">({doctor.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {doctor.experience} years exp.
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{doctor.location}</span>
                          <span className="text-muted-foreground">({doctor.distance} km)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <Clock className="w-4 h-4" />
                          {doctor.availability}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Booking Section */}
                  <div className="md:border-l border-border md:pl-6 flex flex-col justify-between">
                    <div className="text-right mb-4">
                      <div className="flex items-center justify-end gap-1 mb-1">
                        <Badge variant="secondary" className="px-1.5 py-0.5 text-black bg-blue-50 dark:bg-blue-900/30 dark:text-blue-100 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                          Consultation Fee
                        </Badge>
                      </div>
                      <div className="flex items-center justify-end gap-1 mb-1">
                        <span className="text-2xl font-bold text-foreground">₹{(doctor as any).consultationFee}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">per consultation</p>
                    </div>

                    <div className="space-y-2">
                       {(doctor as any).phone ? (
                         <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                           <a href={`tel:${(doctor as any).phone}`}>Book Now</a>
                         </Button>
                       ) : (
                         <Button className="w-full">Book Appointment</Button>
                       )}
                      <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <Card className="p-12 text-center border border-border">
            <p className="text-muted-foreground mb-4">No doctors found matching your criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedSpecialty('All')
              }}
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
