-- Initial Seed Data for Shet Samarthan

INSERT INTO app_users (id, full_name, full_name_mr, email, password, phone, location, village, district, farm_area, primary_crop, soil_type)
VALUES (1, 'Ramesh Patil', 'रमेश पाटील', 'ramesh.patil@shetsamarthan.in', '$2a$10$w8.oA1r4f4fN64X5a7bFzeT/99oU1a1y', '+91 98220 12345', 'Pune, Maharashtra', 'Haveli', 'Pune', 2.4, 'Tomato & Sugarcane', 'Black Soil (Regur)');

INSERT INTO farms (id, user_id, farm_name, farm_area, crop_type, soil_type, irrigation_type, health_score, status)
VALUES (1, 1, 'Shivaji Agricultural Farm', 2.4, 'Tomato & Sugarcane', 'Black Soil (Regur)', 'Drip Irrigation', 86, 'Healthy');

INSERT INTO suppliers (id, name, name_mr, category, category_label, category_mr, address, address_mr, phone, rating, reviews_count, distance_km, lat, lng, verified, license_no)
VALUES 
(1, 'Mahalaxmi Krishi Seva Kendra', 'महालक्ष्मी कृषी सेवा केंद्र', 'fertilizers', 'Fertilizers & Seeds', 'रासायनिक खते व बियाणे', 'Market Yard, Gultekdi, Pune, Maharashtra 411037', 'मार्केट यार्ड, गुलटेकडी, पुणे, महाराष्ट्र ४११०३७', '+91 98221 44552', 4.8, 142, 3.2, 18.4985, 73.8672, true, 'MH-PUN-AGR-44210'),
(2, 'Nisarga Jaivik & Organic Agro', 'निसर्ग सेंद्रिय कृषी भांडार', 'manure', 'Organic Manure & Bio-fertilizers', 'सेंद्रिय खत व जिवाणू खते', 'Hadapsar Saswad Road, Pune, Maharashtra 411028', 'हडपसर-सासवड रोड, पुणे, महाराष्ट्र ४११०२८', '+91 97632 88910', 4.9, 98, 5.8, 18.5089, 73.9259, true, 'MH-ORG-BIO-10822'),
(3, 'Kisan Vikas Agro Agency', 'किसान विकास ॲग्रो एजन्सी', 'medicines', 'Crop Protection & Medicines', 'पीक संरक्षण व औषधे', 'Old Pune-Mumbai Highway, Khed Shivapur, Pune', 'पुणे-सातारा हायवे, खेड शिवापूर, पुणे', '+91 94220 33891', 4.7, 115, 8.4, 18.3541, 73.8569, true, 'MH-PUN-CP-89211'),
(4, 'Sahyadri Seed Corporation & Nursery', 'सह्याद्री सिड्स कॉर्पोरेशन व रोपवाटिका', 'seeds', 'Certified Hybrid Seeds', 'प्रमाणित संकरित बियाणे', 'Station Road, Khed / Rajgurunagar, Maharashtra 410505', 'स्टेशन रोड, खेड / राजगुरूनगर, महाराष्ट्र ४१०५०५', '+91 98811 55670', 4.6, 84, 12.1, 18.8558, 73.9056, true, 'MH-SEED-CERT-33019'),
(5, 'Drip King Irrigation & Agri Machinery', 'ड्रिप किंग ठिबक सिंचन व कृषी यंत्रसामग्री', 'irrigation', 'Drip Irrigation & Pumps', 'ठिबक सिंचन व सोलर पंप', 'MIDC Bhosari, Pune, Maharashtra 411026', 'एमआयडीसी भोसरी, पुणे, महाराष्ट्र ४११०२६', '+91 99234 77112', 4.8, 160, 9.5, 18.6279, 73.8443, true, 'MH-IRR-GOV-77182'),
(6, 'Dadar Krishi Bajar Kendra', 'दादर कृषी बाजार केंद्र', 'fertilizers', 'Fertilizers & Hybrid Seeds', 'खते व संकरित बियाणे', 'Near Flower Market, Senapati Bapat Marg, Dadar West, Mumbai 400028', 'फूल बाजाराजवळ, सेनापती बापट मार्ग, दादर पश्चिम, मुंबई ४०००२८', '+91 98201 55432', 4.8, 178, 1.8, 19.0178, 72.8478, true, 'MH-MUM-AGR-10294'),
(7, 'APMC Vashi Agri Mart & Bio-Fertilizers', 'एपीएमसी वाशी कृषी मॉल व जैविक खते', 'manure', 'Organic Manure & Bio-Fertilizers', 'सेंद्रिय खत व जिवाणू खते', 'APMC Grain Market Sector 19, Vashi, Navi Mumbai 400703', 'एपीएमसी मार्केट सेक्टर १९, वाशी, नवी मुंबई ४००७०३', '+91 98190 77621', 4.9, 215, 3.5, 19.0771, 73.0033, true, 'MH-NVM-ORG-55102'),
(8, 'Borivali Kisan Seva & Nursery', 'बोरिवली किसान सेवा व रोपवाटिका', 'seeds', 'Certified Seeds & Saplings', 'प्रमाणित बियाणे व रोपे', 'SV Road, Near Station, Borivali West, Mumbai 400092', 'एसव्ही रोड, स्टेशनजवळ, बोरिवली पश्चिम, मुंबई ४०००९२', '+91 98205 33419', 4.7, 130, 4.2, 19.2307, 72.8567, true, 'MH-MUM-SEED-88219'),
(9, 'Andheri Crop Protection Agency', 'अंधेरी पीक संरक्षण केंद्र', 'medicines', 'Crop Medicines & Sprayers', 'पीक औषधे व फवारणी यंत्रे', 'Andheri-Kurla Road, Chakala, Andheri East, Mumbai 400093', 'अंधेरी-कुर्ला रोड, चकाला, अंधेरी पूर्व, मुंबई ४०००९३', '+91 98332 99401', 4.8, 112, 5.0, 19.1136, 72.8697, true, 'MH-MUM-CP-33120'),
(10, 'Thane Zilla Krishi Udyog Kendra', 'ठाणे जिल्हा कृषी उद्योग केंद्र', 'fertilizers', 'Fertilizers & Machinery', 'खते व कृषी यंत्रे', 'Station Road, Jambli Naka, Thane West 400601', 'स्टेशन रोड, जांभळी नाका, ठाणे पश्चिम ४००६०१', '+91 98218 66209', 4.8, 164, 7.8, 19.1860, 72.9754, true, 'MH-THN-AGR-44012'),
(11, 'Panvel Shetkari Sahakari Khata & Seeds', 'पनवेल शेतकरी सहकारी खरेदी-विक्री संघ', 'seeds', 'Paddy Seeds & Agri Inputs', 'भात बियाणे व शेती साहित्य', 'Shivaji Chowk, Old Panvel, Raigad 410206', 'शिवाजी चौक, जुने पनवेल, रायगड ४१०२०६', '+91 98224 88120', 4.9, 190, 8.5, 18.9894, 73.1175, true, 'MH-RAI-COOP-99120');

