-- MySQL Insert Statements (created using AI from exported.json)

-- Set a default password for all users
SET @default_password = '123';

-- Initialize ID counters (these are for reference, actual IDs are hardcoded below)
SET @student_id_counter = 10000;
SET @professor_id_counter = 100;



INSERT INTO user (id, username, password, name, surname, email, landline, mobile, role) VALUES
(0, 'secretaryuser', @default_password, 'Secretary', 'Upatras', 'secretary@upatras.gr', 2610357844, 6945978467, 'secretary');

INSERT INTO secretary (id) VALUES
(0);

-- Insert statements for the 'user' and 'student' tables
INSERT INTO user (id, username, password, name, surname, email, landline, mobile, role) VALUES
(10000, 'makismakopoulos', @default_password, 'Makis', 'Makopoulos', '104333999@students.upatras.gr', 2610333000, 6939096979, 'student'),
(10001, 'johnlennon', @default_password, 'John', 'Lennon', 'st10434000@upnet.gr', 2610123456, 6970001112, 'student'),
(10002, 'petrosverikokos', @default_password, 'Petros', 'Verikokos', 'st10434001@upnet.gr', 2610778899, 6970001112, 'student'),
(10003, 'testname', @default_password, 'test', 'name', 'st10434002@upnet.gr', 2610123456, 6912345678, 'student'),
(10004, 'robertsmith', @default_password, 'Robert', 'Smith', 'st10434003@upnet.gr', 2610251989, 6902051989, 'student'),
(10005, 'rextyrannosaurus', @default_password, 'Rex', 'Tyrannosaurus', 'st10434004@upnet.gr', 2610432121, 6911231234, 'student'),
(10006, 'paulmescal', @default_password, 'Paul', 'Mescal ', 'st10434005@upnet.gr', NULL, NULL, 'student'),
(10007, 'pedropascal', @default_password, 'Pedro', 'Pascal', 'st10434006@upnet.gr', NULL, NULL, 'student'),
(10008, 'davidgilmour', @default_password, 'David', 'Gilmour', 'st10434007@upnet.gr', NULL, NULL, 'student'),
(10009, 'lanadelrey', @default_password, 'Lana', 'Del Rey ', 'st10434008@upnet.gr', NULL, NULL, 'student'),
(10010, 'stevienicks', @default_password, 'Stevie', 'Nicks', 'st10434009@upnet.gr', 56, 67, 'student'),
(10011, 'margaretqualley', @default_password, 'Margaret', 'Qualley', 'st10434010@upnet.gr', 67, 90, 'student'),
(10012, 'miagoth', @default_password, 'Mia', 'Goth', 'st10434011@upnet.gr', NULL, NULL, 'student'),
(10013, 'florencepugh', @default_password, 'Florence ', 'Pugh', 'st10434012@upnet.gr', 5, 2, 'student'),
(10014, 'pjharvey', @default_password, 'PJ ', 'Harvey', 'st10434013@upnet.gr', 56, 43, 'student'),
(10015, 'penelopecruz', @default_password, 'Penélope', 'Cruz', 'st10434014@upnet.gr', 5, 4, 'student'),
(10016, 'emmastone', @default_password, 'Emma', 'Stone', 'st10434015@upnet.gr', 2333333, 4455555, 'student'),
(10017, 'jennyvanou', @default_password, 'Jenny', 'Vanou', 'st10434016@upnet.gr', 9, 45, 'student'),
(10018, 'salmahayek', @default_password, 'Salma ', 'Hayek', 'st10434017@upnet.gr', 344, 221, 'student'),
(10019, 'juliedelpy', @default_password, 'Julie ', 'Delpy', 'st10434018@upnet.gr', 1223, 3455, 'student'),
(10020, 'giannisaggelakas', @default_password, 'Giannis', 'Aggelakas', 'st10434019@upnet.gr', 23, 45, 'student'),
(10021, 'eleutheriaarvanitaki', @default_password, 'Eleutheria ', 'Arvanitaki', 'st10434020@upnet.gr', 657, 345, 'student'),
(10022, 'marinapanou', @default_password, 'Marina', 'Spanou', 'st10434021@upnet.gr', 897, 354, 'student'),
(10023, 'renakoumioti', @default_password, 'Rena', 'Koumioti', 'st10434022@upnet.gr', 23557, 32453, 'student'),
(10024, 'charlotteaitchison', @default_password, 'Charlotte', 'Aitchison', 'st10434023@upnet.gr', 2610365365, 693653365, 'student'),
(10025, 'rhaenyratargaryen', @default_password, 'Rhaenyra', 'Targaryen', 'st10434024@upnet.gr', 2610101010, 6910101010, 'student'),
(10026, 'bendover', @default_password, 'Ben', 'Dover', 'st10434025@upnet.gr', 2584694587, 5841852384, 'student'),
(10027, 'mariospapadakis', @default_password, 'Marios', 'Papadakis', 'st10434026@upnet.gr', 302105562567, 306975562567, 'student'),
(10028, 'nicholashoult', @default_password, 'Nicholas ', 'Hoult', 'st10434027@upnet.gr', 436, 46478, 'student'),
(10029, 'joohyuknam', @default_password, 'Joo Hyuk', 'Nam', 'st10434028@upnet.gr', 2610443568, 6978756432, 'student'),
(10030, 'nikospeletie', @default_password, 'Nikos', 'Peletie', 'st10434029@upnet.gr', 2104593844, 6987655433, 'student'),
(10031, 'nikoskoukos', @default_password, 'Nikos', 'Koukos', 'st10434030@upnet.gr', 210553985, 6946901012, 'student'),
(10032, 'mariafouseki', @default_password, 'Maria', 'Fouseki', 'st10434031@upnet.gr', 2109993719, 6923144642, 'student'),
(10033, 'nikoskorobos', @default_password, 'Nikos ', 'Korobos', 'st10434032@upnet.gr', 2279036758, 6948308576, 'student'),
(10034, 'mariatogia', @default_password, 'Maria', 'Togia', 'st10434033@upnet.gr', 2100393022, 6953782102, 'student'),
(10035, 'giorgosmenegakis', @default_password, 'Giorgos', 'Menegakis', 'st10434034@upnet.gr', 2610485796, 6934527125, 'student'),
(10036, 'trakisgiannakopoulos', @default_password, 'Trakis', 'Giannakopoulos', 'st10434035@upnet.gr', 2610381393, 6028371830, 'student'),
(10037, 'chriskouvadis', @default_password, 'Chris', 'Kouvadis', 'st10434036@upnet.gr', 2610995999, 6947937524, 'student'),
(10038, 'pafloutsoukaskarai', @default_password, 'pafloutsou', 'kaskarai', 'st10434037@upnet.gr', 2610978423, 6935729345, 'student'),
(10039, 'billydiesel', @default_password, 'Billy', 'Diesel', 'st10434038@upnet.gr', 2101234567, 6912345678, 'student'),
(10040, 'tomeofmadness', @default_password, 'Tome', 'of Madness', 'st10434039@upnet.gr', 2610654321, 6969966996, 'student'),
(10041, 'fortnite', @default_password, 'fort', 'nite', 'st10434040@upnet.gr', 2610747474, 6988112233, 'student'),
(10042, 'zeusikosaleptos', @default_password, 'Zeus', 'Ikosaleptos', 'st10434041@upnet.gr', 2109090901, 6900008005, 'student'),
(10043, 'agcook', @default_password, 'AG', 'Cook', 'st10434042@upnet.gr', 2121212121, 1212121212, 'student'),
(10044, 'mariamahmood', @default_password, 'Maria', 'Mahmood', 'st10434043@upnet.gr', 2108452666, 6980081351, 'student'),
(10045, 'kostaspoupis', @default_password, 'Kostas', 'Poupis', 'st10434044@upnet.gr', 222609123, 698452154, 'student'),
(10046, 'hughjass', @default_password, 'Hugh', 'Jass', 'st10434045@upnet.gr', 69696969, 696969420, 'student'),
(10047, 'xontropigouinaki', @default_password, 'Xontro ', 'Pigouinaki', 'st10434046@upnet.gr', 6913124205, 4747859625, 'student'),
(10048, 'marianikolaou', @default_password, 'Maria', 'Nikolaou', 'st10434047@upnet.gr', 2109278907, 6945533213, 'student'),
(10049, 'elenifotiou', @default_password, 'Eleni', 'Fotiou', 'st10434048@upnet.gr', 2108745645, 6978989000, 'student'),
(10050, 'xarafanouriou', @default_password, 'Xara', 'Fanouriou', 'st10434049@upnet.gr', 2108724324, 6945622222, 'student'),
(10051, 'nikospanagiotou', @default_password, 'Nikos', 'Panagiotou', 'st10434050@upnet.gr', 2107655555, 6941133333, 'student'),
(10052, 'petrosdaidalos', @default_password, 'Petros', 'Daidalos', 'st10434051@upnet.gr', 2108534566, 6976644333, 'student'),
(10053, 'giannisioannou', @default_password, 'Giannis', 'Ioannou', 'st10434052@upnet.gr', 2107644999, 6976565655, 'student'),
(10054, 'tsilidoghouse', @default_password, 'Tsili', 'Doghouse', 'st10434053@upnet.gr', 2610420420, 6999999999, 'student'),
(10055, 'marialenaantoniou', @default_password, 'Marialena', 'Antoniou', 'st10434054@upnet.gr', 2105678901, 6935678901, 'student'),
(10056, 'ioannispanagiotou', @default_password, 'Ioannis', 'Panagiotou', 'st10434055@upnet.gr', 2610123456, 6981234567, 'student'),
(10057, 'georgekaramalis', @default_password, 'George', 'Karamalis', 'st10434056@upnet.gr', 2410456789, 6974567890, 'student'),
(10058, 'kyriakospapapetrou', @default_password, 'Kyriakos', 'Papapetrou', 'st10434057@upnet.gr', 2106789012, 6956789012, 'student'),
(10059, 'mariakp', @default_password, 'Maria', 'Kp', 'st10434058@upnet.gr', 2610555555, 6932323232, 'student'),
(10060, 'nikospapadopoulos', @default_password, 'Nikos', 'papadopoulos', 'st10434059@upnet.gr', 2691045092, 69090909, 'student'),
(10061, 'giannismolotof', @default_password, 'Giannis ', 'Molotof', 'st10434060@upnet.gr', 2610254390, 6943126767, 'student'),
(10062, 'sagdyznuts', @default_password, 'Sagdy', 'Znuts', 'st10434061@upnet.gr', 123456789, 123456789, 'student'),
(10063, 'marypoppins', @default_password, 'Mary', 'Poppins', 'st10434062@upnet.gr', 2613456089, 6980987654, 'student'),
(10064, 'tinkerbell', @default_password, 'Tinker', 'Bell', 'st10434063@upnet.gr', 2456034567, 6987543345, 'student'),
(10065, 'lillybloom', @default_password, 'Lilly', 'Bloom', 'st10434064@upnet.gr', 2610435988, 6987555433, 'student'),
(10066, 'giorgosmasouras', @default_password, 'GIORGOS', 'MASOURAS', 'st10434065@upnet.gr', 694837204, 210583603, 'student'),
(10067, 'kendricknunn', @default_password, 'KENDRICK', 'NUNN', 'st10434066@upnet.gr', 6982736199, 6906443321, 'student'),
(10068, 'depechemode', @default_password, 'Depeche', 'Mode', 'st10434067@upnet.gr', 1234567890, 1234567770, 'student'),
(10069, 'namesurname', @default_password, 'name', 'surname', 'st10434068@upnet.gr', 222, 2223, 'student'),
(10070, 'nikoskosmopoulos', @default_password, 'Nikos', 'Kosmopoulos', 'st10434069@upnet.gr', 2109241993, 6978722312, 'student'),
(10071, 'arispoupis', @default_password, 'Aris', 'Poupis', 'st10434070@upnet.gr', 2105858858, 6935358553, 'student'),
(10072, 'gerrybanana', @default_password, 'gerry', 'banana', 'st10434071@upnet.gr', 6947830287, 2610987632, 'student'),
(10073, 'grekotsiparthenios', @default_password, 'grekotsi', 'parthenios', 'st10434072@upnet.gr', 6947910234, 2610810763, 'student'),
(10074, 'mochimon', @default_password, 'Mochi', 'Mon', 'st10434073@upnet.gr', 2610550406, 6967486832, 'student'),
(10075, 'nikolaosserraios', @default_password, 'Nikolaos', 'Serraios', 'st10434074@upatras.gr', 2610456632, 6975849305, 'student'),
(10076, 'xaralambosmp', @default_password, 'Xaralampos', 'Mparmaksizoglou', 'st10434075@upnet.gr', 2109995555, 6912345678, 'student'),
(10077, 'kyriakospareena', @default_password, 'kyriakos', 'pareena', 'st10434076@upnet.gr', 2214567809, 6972861212, 'student'),
(10078, 'tortelinodiagrafino', @default_password, 'Tortelino', 'Diagrafino', 'st10434077@upnet.gr', 2101312000, 6913121312, 'student'),
(10079, 'mariadb', @default_password, 'Maria', 'Db', 'st10434078@upnet.gr', 2610123456, 6912345678, 'student'),
(10080, 'bombardrirocrocodilo', @default_password, 'Bombardriro', 'Crocodilo', 'st10434079@upnet.gr', 2681012345, 6909876543, 'student'),
(10081, 'balerinacappucinna', @default_password, 'Balerinna ', 'Cappucinna', 'st10434080@upnet.gr', 2610729878, 6983615882, 'student'),
(10082, 'ntinoskonstantinos', @default_password, 'Ntinos', 'Konstantinos', 'st10434081@upnet.gr', 2610222222, 6988888888, 'student'),
(10083, 'xarageorgiou', @default_password, 'Xara', 'Georgiou', 'st10434082@upnet.gr', 261000000, 6933333333, 'student'),
(10084, 'marioskonstantinou', @default_password, 'Marios', 'Konstantinou', 'st10434083@upnet.gr', 2610777777, 6944444444, 'student'),
(10085, 'minaminopoulou', @default_password, 'Mina', 'Minopoulou', 'st10434084@upnet.gr', 261044444, 699999999, 'student'),
(10086, 'sakisrouvas', @default_password, 'Sakis', 'Rouvas', 'st10434085@upnet.gr', 66666666, 66666666, 'student'),
(10087, 'shinjiikari', @default_password, 'Shinji', 'Ikari', 'st10434086@upnet.gr', 366666666, 8012345678, 'student'),
(10088, 'alexistsipras', @default_password, 'Alexis', 'tsipras', 'st10434087@upnet.gr', 6978215130, 6978215130, 'student'),
(10089, 'tasoskolokotronhs', @default_password, 'Tasos', 'kolokotronhs', 'st10434088@upnet.gr', 26578953, 6978584575, 'student'),
(10090, 'minasminaroglou', @default_password, 'Minas ', 'Minaroglou', 'st10434089@upnet.gr', 465352358, 698713245, 'student'),
(10091, 'lapolizia', @default_password, 'La', 'Polizia', 'st10434090@upnet.gr', 4673596, 55464852, 'student'),
(10092, 'manousosdlabiras', @default_password, 'manousos', 'Dlabiras', 'st10434091@upnet.gr', 23242424, 24242424, 'student'),
(10093, 'nickcalathes', @default_password, 'Nick', 'Calathes', 'st10434092@upnet.gr', 2105863247, 6945218947, 'student'),
(10094, 'donaldtrump', @default_password, 'Donald', 'Trump', 'st10434093@upnet.gr', 2024561111, 2024561414, 'student');

INSERT INTO student (id, student_number, street, street_number, city, postcode, father_name) VALUES
(10000, 10433999, 'test street', 45, 'test city', 39955, 'Orestis'),
(10001, 10434000, 'Ermou', 18, 'Athens', 10431, 'George'),
(10002, 10434001, 'Adrianou', 20, 'Thessaloniki', 54248, 'Giannis'),
(10003, 10434002, 'str', 1, 'patra', 26222, 'father'),
(10004, 10434003, 'Fascination', 17, 'London', 1989, 'Alex'),
(10005, 10434004, 'Cretaceous', 2, 'Laramidia', 54321, 'Daspletosaurus'),
(10006, 10434005, 'Smith Str.', 33, 'New York ', 59, 'Paul'),
(10007, 10434006, 'Johnson', 90, 'New York ', 70, 'José '),
(10008, 10434007, 'Sortef', 29, 'New York', 26, 'Douglas'),
(10009, 10434008, 'Groove Str.', 23, 'Los Angeles', 1, 'none'),
(10010, 10434009, 'Magic Str. ', 8, 'New Orleans', 35, 'Jess '),
(10011, 10434010, 'Substance Str.', 25, 'Los Angeles ', 7, 'Paul'),
(10012, 10434011, 'Pearl Str. ', 4, 'Michigan', 8, 'Lee'),
(10013, 10434012, 'Midsommar Str. l', 1, 'Away', 24, '-'),
(10014, 10434013, 'Lonely Str.', 27, 'Bridport', -7, 'Ray'),
(10015, 10434014, 'Almadovar', 55, 'Madrid', 23, 'Eduardo '),
(10016, 10434015, 'Poor Str.', 3, 'Paris ', 34, 'none'),
(10017, 10434016, 'Mpouat Str.', 23, 'Athens', 10, 'Basil'),
(10018, 10434017, 'Desperado Str. ', 24, 'Madrid ', 656, 'Sami'),
(10019, 10434018, 'Before Str.', 36, 'Paris', 567, 'Kieślowski'),
(10020, 10434019, 'Trypes Str.', 3, 'Athens', 2354, 'Theos'),
(10021, 10434020, 'Entexno Str. ', 2, 'Athens', 345, 'Kosmos'),
(10022, 10434021, 'Pagkrati Str.', 25, 'Athens', 2456, 'Gates'),
(10023, 10434022, 'Mpouat Str.', 24, 'Athens', 5749, 'Ellhniko'),
(10024, 10434023, 'Boiler Room St', 365, 'New York', 360, 'Jon'),
(10025, 10434024, 'Dragon St', 2021, 'Kings Landing', 2021, 'Viserys'),
(10026, 10434025, 'Colon Str.', 124, 'NY', 11045, 'Carlos'),
(10027, 10434026, 'Korinthou', 266, 'Patras', 26223, 'Ioannis'),
(10028, 10434027, 'Nosferatu Str.', 34, 'London', 567, 'Roger'),
(10029, 10434028, 'Kanakari', 135, 'Patra', 26440, 'Baek Yi Jin'),
(10030, 10434029, 'Kolokotroni', 6, 'Athens', 34754, 'George'),
(10031, 10434030, 'Triton', 12, 'Salamina', 12216, 'Giannis'),
(10032, 10434031, 'Jason ', 33, 'London', 44391, 'Tasos'),
(10033, 10434032, 'Masalias', 4, 'Sparti', 32095, 'Giannis'),
(10034, 10434033, 'Athinon', 4, 'Athens', 28482, 'Petros'),
(10035, 10434034, 'korinthou', 56, 'patras', 56892, 'nikos'),
(10036, 10434035, 'Othonos kai Amalias ', 100, 'Patras', 26500, 'None'),
(10037, 10434036, 'vanizelou', 36, 'Patras', 26500, 'Pfloutsou'),
(10038, 10434037, 'kolokotroni', 12, 'Patras', 26500, 'mauragkas'),
(10039, 10434038, 'Alexandras Ave', 12, 'Athens', 11521, 'Iman'),
(10040, 10434039, 'Panepisthmiou', 69, 'Patras', 26441, 'Prafit'),
(10041, 10434040, 'karaiskakis', 69, 'tilted tower', 4747, 'epic games'),
(10042, 10434041, 'Novi', 25, 'Athens', 20033, 'Kleft'),
(10043, 10434042, 'Britpop', 7, 'London', 2021, 'PC Music'),
(10044, 10434043, 'Mouratidi', 4, 'New York', 25486, 'Paparizou'),
(10045, 10434044, 'Ag Kiriakis', 11, 'Papaou', 50501, 'Aelakis'),
(10046, 10434045, 'Wall Street', 69, 'Jerusalem', 478, 'Mike Oxlong'),
(10047, 10434046, 'Krasopotirou', 69, 'Colarato', 14121, 'Adolf Heisenberg'),
(10048, 10434047, 'Achilleos', 21, 'Athens', 10437, 'Dimitris'),
(10049, 10434048, 'Adrianou ', 65, 'Athens', 10556, 'Nikos'),
(10050, 10434049, 'Chaonias ', 54, 'Athens', 10441, 'Petros'),
(10051, 10434050, 'Chomatianou', 32, 'Athens', 10439, 'Giorgos'),
(10052, 10434051, 'Dafnidos', 4, 'Athens', 11364, 'Pavlos'),
(10053, 10434052, 'Danais', 9, 'Athens', 11631, 'Kostas'),
(10054, 10434053, 'novi lane', 33, 'Patras', 26478, 'Stoiximan'),
(10055, 10434054, 'Ermou', 24, 'Athens', 10563, 'Nikolaos'),
(10056, 10434055, 'Kyprou', 42, 'Patra', 26441, 'Kwstas'),
(10057, 10434056, 'Kolokotroni', 10, 'Larissa', 41222, 'Petros'),
(10058, 10434057, 'Zakunthou', 36, 'Volos', 10654, 'Apostolos'),
(10059, 10434058, 'pelopidas ', 52, 'patra', 28746, 'george'),
(10060, 10434059, 'anapafseos', 34, 'patra', 26503, 'takis'),
(10061, 10434060, 'Ermou', 34, 'Patras', 29438, 'Giorgos'),
(10062, 10434061, 'Grove', 12, 'San Andreas', 123456, NULL),
(10063, 10434062, 'Niktolouloudias ', 123, 'Chalkida', 23456, 'George'),
(10064, 10434063, 'Vatomourias', 55, 'Pano Raxoula', 2345, 'Mixail'),
(10065, 10434064, 'Patnanasis', 45, 'Patra', 26440, 'Menelaos'),
(10066, 10434065, 'AGIOUIOANNNIRENTI', 7, 'PEIRAIAS', 47200, 'PETROS'),
(10067, 10434066, 'OAKA', 25, 'ATHENS', 666, 'GIANNAKOPOULOS'),
(10068, 10434067, 'EnjoyTheSilence', 1990, 'London', 1990, 'Dave'),
(10069, 10434068, 'yourmom', 69, 'mom', 15584, 'father'),
(10070, 10434069, 'nikoskosmopoulos', 12, 'Giotopoli', 69420, 'Greg'),
(10071, 10434070, 'arispoupis', 10, 'Kolonia', 12345, 'Mpamias'),
(10072, 10434071, 'gerrybanana', 12, 'tilted', 26500, 'johnesy'),
(10073, 10434072, 'grekotsiparthenios', 69, 'thessaloniki', 20972, 'mourlo'),
(10074, 10434073, 'mochimon', 55, 'Maxxwin', 99999, 'Drake'),
(10075, 10434074, 'nikolaosserraios', 12, 'Patra', 26222, 'Georgios'),
(10076, 10434075, 'xaralambosmbarmaksizoglou', 32, 'Athens', 16524, 'Eugenios'),
(10077, 10434076, 'kyriakospareena', 23, 'patras', 23444, 'lebron'),
(10078, 10434077, 'tortelinodiagrafino', 69, 'empa', 5432, 'kaae'),
(10079, 10434078, 'mariadb', 3, 'Patras', 26441, 'sql'),
(10080, 10434079, 'bombardrirocrocodilo', 69, 'Athens', 15344, 'Lirili Larila'),
(10081, 10434080, 'balerinacappucinna', 4, 'lalalala', 23861, 'balerinno lololo'),
(10082, 10434081, 'ntinoskonstantinos', 1, 'patras', 26225, 'Nikolaos'),
(10083, 10434082, 'xarageorgiou', 12, 'Patras', 26225, 'Giorgos'),
(10084, 10434083, 'marioskonstantinou', 1, 'Patras', 26225, 'Foivos'),
(10085, 10434084, 'minaminopoulou', 13, 'patras', 12345, 'makis'),
(10086, 10434085, 'sakisrouvas', 45, 'Piece', 123, 'Gol'),
(10087, 10434086, 'shinjiikari', 4, 'Tokyo-3', 192, 'Gendo Ikari'),
(10088, 10434087, 'alexistsipras', 13, 'patra', 26441, 'Kostaw'),
(10089, 10434088, 'tasoskolokotronhs', 69, 'Igoumenitsa', 24463, 'Theodoros'),
(10090, 10434089, 'minasminaroglou', 36, 'Moon city', 245643, 'Manolis'),
(10091, 10434090, 'lapolizia', 46, 'Sideria', 164542, 'Klavdios'),
(10092, 10434091, 'manousosdlabiras', 47, 'Tripoli', 23100, 'Georgios'),
(10093, 10434092, 'nickcalathes', 28, 'Athens', 10551, 'Giorgos'),
(10094, 10434093, 'donaldtrump', 911, 'Washington ', 2049, 'Fred');

-- Insert statements for the 'user' and 'professor' tables
INSERT INTO user (id, username, password, name, surname, email, landline, mobile, role) VALUES
(100, 'andreaskomninos', @default_password, 'Andreas', 'Komninos', 'akomninos@ceid.upatras.gr', 2610996915, 6977998877, 'professor'),
(101, 'vasilisfoukaras', @default_password, 'Vasilis', 'Foukaras', 'vasfou@ceid.upatras.gr', 2610885511, 6988812345, 'professor'),
(102, 'basiliskarras', @default_password, 'Basilis', 'Karras', 'karras@nterti.com', 23, 545, 'professor'),
(103, 'elenivoyiatzaki', @default_password, 'Eleni', 'Voyiatzaki', 'eleni@ceid.gr', 34, 245, 'professor'),
(104, 'andrewhozierbyrne', @default_password, 'Andrew', 'Hozier Byrne', 'hozier@ceid.upatras.gr', 2610170390, 6917031990, 'professor'),
(105, 'nikoskorobos', @default_password, 'Nikos', 'Korobos', 'nikos.korobos12@gmail.com', 2610324365, 6978530352, 'professor'),
(106, 'kostaskaranikolos', @default_password, 'Kostas', 'Karanikolos', 'kostkaranik@gmail.com', 2610324242, 6934539920, 'professor'),
(107, 'mpampissougias', @default_password, 'Mpampis', 'Sougias', 'mpampis123@gmail.com', 2610945934, 6947845334, 'professor'),
(108, 'daskalosmakaveli', @default_password, 'Daskalos', 'Makaveli', 'makavelibet@gmail.com', 2310231023, 6929349285, 'professor'),
(109, 'mariapalami', @default_password, 'Maria', 'Palami', 'palam@upatras.gr', 1234567890, 6988223322, 'professor'),
(110, 'menitalaiporimeni', @default_password, 'Meni', 'Talaiporimeni', 'meniT@upatras.gr', 2610333999, 6999990999, 'professor'),
(111, 'tzoulialexandratou', @default_password, 'Tzouli', 'Alexandratou', 'tzouli.ax@upatras.gr', 2264587412, 6996116921, 'professor'),
(112, 'karikhsraftel', @default_password, 'Karikhs', 'Raftel', 'karikhs@yahoo.gr', 69, 6945258923, 'professor'),
(113, 'vlasisrestas', @default_password, 'Vlasis', 'Restas', 'toxrusoftiari@funerals.gr', 78696910, 69696964, 'professor'),
(114, 'fatbanker', @default_password, 'Fat ', 'Banker', 'fatbanker@kapitalas.gr', 6942014121, 6969784205, 'professor'),
(115, 'hamzemohamed', @default_password, 'Hamze', 'Mohamed', 'info@hamzat.gr', 1245789513, 1456983270, 'professor'),
(116, 'stefanianikolaou', @default_password, 'Stefania', 'Nikolaou', 'snikolaou@upatras.gr', 2106723456, 6942323452, 'professor'),
(117, 'petrosdanezis', @default_password, 'Petros', 'Danezis', 'pdanezis@upatras.gr', 2610908888, 6971142424, 'professor'),
(118, 'papadopouloseustathios', @default_password, 'Papadopoulos ', 'Eustathios', 'eustratiospap@gmail.com', 2101234567, 6901234567, 'professor'),
(119, 'konstantinoumaria', @default_password, 'Konstantinou', 'Maria', 'mariakon@gmail.com', 23107654321, 6947654321, 'professor'),
(120, 'jimnikolaou', @default_password, 'Jim', 'Nikolaou', 'jimnik@gmail.com', 26109876543, 6979876543, 'professor'),
(121, 'sophiamichailidi', @default_password, 'Sophia', 'Michailidi', 'sophiamich@gmail.com', 23105432109, 6985432109, 'professor'),
(122, 'michaelpapadreou', @default_password, 'Michael ', 'Papadreou', 'michaelpap@gmail.com', 26104455667, 6974455667, 'professor'),
(123, 'elonmusk', @default_password, 'Elon', 'Musk', 'elonmusk@gmail.com', 18885183752, NULL, 'professor'),
(124, 'kostaskalantas', @default_password, 'Kostas', 'Kalantas', 'abcdef@example.com', 2610121212, 6912121212, 'professor'),
(125, 'giorgisfousekis', @default_password, 'Giorgis', 'Fousekis', 'abcdefg@example.com', NULL, NULL, 'professor'),
(126, 'nikoskoukosprof', @default_password, 'Nikos', 'Koukos', 'exxample@example.com', NULL, NULL, 'professor'),
(127, 'patrickxrusopsaros', @default_password, 'patrick', 'xrusopsaros', 'patric@xrusopsaros.com', 2610567917, 6952852742, 'professor'),
(128, 'paraskevaskoutsikos', @default_password, 'Paraskevas', 'koutsikos', 'paraskevas@kobres.ath', 2298042035, 6969696969, 'professor'),
(129, 'ezioauditore', @default_password, 'Ezio', 'Auditore da Firenze', 'masterassassin@upatras.ceid.gr', NULL, NULL, 'professor'),
(130, 'sotirispanikas', @default_password, 'Sotiris', 'Panaikas', 'spana@hotmail.com', 1235654899, 2310521010, 'professor'),
(131, 'anittawynn', @default_password, 'Anitta', 'Wynn', 'anittamaxwynn@cashmoney.com', 2610486396, 698888884, 'professor'),
(132, 'joseluismendilibar', @default_password, 'Jose Luis', 'Mendilibar', 'goatmanager@thrylos.gr', 2105555555, 6922222222, 'professor'),
(133, 'liampayne', @default_password, 'Liam', 'Payne', 'liampayne@ceid.upatras.gr', 2462311345, 6980847234, 'professor'),
(134, 'zaynmalik', @default_password, 'Zayn', 'Malik', 'zaynmalik@gmail.com', 2310221234, 6971006355, 'professor'),
(135, 'nikospapas', @default_password, 'Nikos ', 'Papas', 'papas2@yahoo.gr', NULL, 69854512, 'professor'),
(136, 'oikoumenikosprasinos', @default_password, 'Oikoumenikos', 'Prasinos', 'mavros@bbs.af', 987546123, 696969, 'professor'),
(137, 'severussnape', @default_password, 'Severus', 'Snape', 'ihatepotter@hocusmail.com', 2621026441, 6926626226, 'professor'),
(138, 'tungtungsahur', @default_password, 'Tung Tung', 'Sahur', 'tungtungtung@itbr.com', 2101425735, 69434619363, 'professor'),
(139, 'mariapapadopoulou', @default_password, 'Maria', 'Papadopoulou', 'up1084561@ac.upatras.gr', 2610123456, 6912345678, 'professor'),
(140, 'nikosgeorgiou', @default_password, 'Nikos', 'Georgiou', 'up1234567@ac.upatras.gr', 2610111111, 6911111111, 'professor'),
(141, 'maribro', @default_password, 'MARI', 'BRO', 'mari-bro@beast.com', 666, 666, 'professor'),
(142, 'ggoat', @default_password, '<a href="https://www.youtube.com">G</a>', 'Goat', 'goat@messi.cr', 666, 666, 'professor'),
(143, 'brainrot', @default_password, 'Brain', 'Rot', 'capucapu@ccino.assassino', 9, 6, 'professor'),
(144, 'giannissinsidis', @default_password, 'Giannis ', 'Sinsidis', 'johnusins@upatras.gr', 2610645698, 697878787, 'professor'),
(145, 'giorgosfragkofonias', @default_password, 'Giorgos', 'Fragkofonias', 'georgeNofragka@utsipis.gr', 2610546132, 697878787, 'professor'),
(146, 'ioannistsilis', @default_password, 'Ioannis', 'Tsilis', 'tsilis@tsilliuniversity.gr', 2610212121, 6921212121, 'professor'),
(147, 'prasinosfrouros', @default_password, 'Prasinos ', 'Frouros', 'prasinosfrouros@gmail.com', 261056458, 698778788, 'professor'),
(148, 'giorgiobonassera', @default_password, 'Giorgio ', 'Bonassera', 'Gbonassera@gmail.com', 23131131, 6575754, 'professor'),
(149, 'giorgosbartzokas', @default_password, 'Giorgos', 'Bartzokas', 'GBar@gmail.com', 2108743265, 6932178542, 'professor');

INSERT INTO professor (id, topic, department, university) VALUES
(100, 'Network-centric systems', 'CEID', 'University of Patras'),
(101, 'Integrated Systems', 'CEID', 'University of Patras'),
(102, 'Artificial Intelligence', 'CEID', 'University of Patras'),
(103, 'WEB', 'CEID', 'University of Patras'),
(104, 'Artificial Intelligence', 'CEID', 'University of Patras'),
(105, 'Data Engineering', 'IT', 'University of Patras'),
(106, 'informatics', 'CEID', 'University of Patras'),
(107, 'Arxeologia', 'Arxeologias', 'UOI'),
(108, 'Business', 'Economics', 'UOA'),
(109, 'SQL injections', 'Engineering', 'University of SKG'),
(110, 't', 'CEID', 'UoP'),
(111, 'Big Data', 'CEID', 'University of Patras'),
(112, 'Pharmaceutical Drugs', 'Chemistry', 'University of Streets'),
(113, 'Nekro8aftiki', 'Nekro8aftikis', 'University Of Ohio'),
(114, 'kippah', 'Froutemporiki', 'University of Israel'),
(115, 'Logistics', 'Social Rehabitation', 'University of UAE'),
(116, 'Information Theory', 'ECE', 'University of Patras'),
(117, 'Telecommunication Electronics', 'ECE', 'University of Patras'),
(118, 'Physics', 'Physics', 'National and Kapodistrian University of Athens'),
(119, 'Statistics and Probability', 'Mathematics', 'Aristotle University of Thessaloniki'),
(120, 'Artificial Intelligence', 'Computer Science', 'University of Patras'),
(121, 'Economic Theory', 'Economics', 'Athens University of Economics and Business'),
(122, 'Renewable Energy Systems', 'Electrical Engineering', 'University of Ioannina'),
(123, 'Electric Vehicles', 'Department of Physics', 'University of Pennsylvania, Philadelphia'),
(124, 'AI', 'department', 'University'),
(125, 'topic', 'dep', 'university'),
(126, 'top', 'de', 'university'),
(127, 'thalasioi ipopotamoi', 'Solomos', 'Nemo'),
(128, 'Provata', 'Ktinotrofia', 'University of Methana'),
(129, 'assassinations', 'Monterigioni', 'University of Assasinos'),
(130, 'Bet Predictions', 'opap', 'London'),
(131, 'Probability', 'Computer Engineering', 'University of Beegwean'),
(132, 'Sentres', 'Conference League', 'Uni of Olympiacos'),
(133, 'Cryptography', 'CEID', 'University of Patras'),
(134, 'Oriented programing', 'CEID', 'University of Patras'),
(135, 'manas', 'Hastle', 'Hastle University'),
(136, 'Nikolakos', 'Ougantiani Filosofia', 'Nation University Of Pakistan'),
(137, 'math 2', 'ceid', 'University of Patras'),
(138, 'Graphs', 'CEID', 'University of Patras'),
(139, 'Computer science', 'CEID', 'University of Patras'),
(140, 'Physics', 'CEID', 'University of Patras'),
(141, 'Life', 'no', 'University of Brain'),
(142, 'no', 'No', 'University of Goats'),
(143, 'no', 'Brainrot', '<a href="https://www.youtube.com/watch?v=nxSbhVnwdFw&t=1121s">Crocodilo</a>'),
(144, 'Ypsiloikardiakoipalmoi', 'Palindromikis kiniseos', 'University of Makias'),
(145, 'oikonomia tou tsipi', 'Real Economics ', 'University Of Empty Pocket'),
(146, 'Iliopoulos to fainomeno', 'Tsili Kafeneio', 'University of the Road'),
(147, 'alafouzo poula', 'Panathinaiki agwgh', 'University of tears'),
(148, 'spagetti aldente', 'cuccina italiana', 'Carbonara University'),
(149, 'Basketball Strategy', 'SEF', 'University of Gate 7');

-- ================================
-- Thesis examples (one per status)
-- ================================
INSERT INTO thesis (id, title, description, student_id, supervisor_id, member1_id, member2_id, thesis_status) VALUES
-- under-assignment (only 1 member is OK)
(1, 'Edge Computing for IoT', 'Optimizing IoT devices with edge computing.', 10000, 101, 103, NULL, 'under-assignment'),

-- active (2 members required)
(2, 'Smart Agriculture Sensors', 'IoT-based monitoring for precision farming.', 10001, 102, 101, 146, 'active'),

-- under-review (2 members required)
(3, 'AI in Cybersecurity', 'AI-driven threat detection and prevention systems.', 10002, 103, 101, 146, 'under-review'),

-- canceled (2 members required)
(4, 'Blockchain in Supply Chain', 'Enhancing transparency using blockchain.', 10004, 101, 103, 146, 'canceled'),


(6, 'Testing', 'Enhancing transparency using blockchain.', 10006, 146, 103, NULL, 'under-assignment');


INSERT INTO thesis (
    id, title, description, student_id, supervisor_id, member1_id, member2_id, thesis_status,
    pdf, draft, exam_datetime, exam_mode, exam_location, final_repository_link, submission_date, grade
) VALUES
-- completed thesis with all fields
(5,
 'Machine Learning in Healthcare',
 'Improving diagnostics with ML algorithms.',
 10003,
 146,   -- supervisor_id
 102,   -- member1_id
 103,   -- member2_id
 'completed',
 'ml_healthcare_supervisor.pdf',      -- professor-uploaded PDF
 'ml_healthcare_student_draft.pdf',   -- student-submitted draft
 '2025-09-15 10:00:00',               -- exam_datetime
 'in-person',                         -- exam_mode
 'Room 203, CS Building',             -- exam_location
 'https://nemertes.library.upatras.gr/repo/ml_healthcare',  -- final_repository_link
 CURRENT_TIMESTAMP,                   -- submission_date
 9.25                                  -- grade
);


-- =========================================
-- Matching committee invitations (aligned)
-- =========================================
INSERT INTO committee_invitation (thesis_id, professor_id, status, sent_at, replied_at) VALUES
-- Thesis 1: under-assignment (only member1=103 is fixed, others may still be pending)
(1, 102, 'pending',  '2025-09-01 10:00:00', NULL),
(1, 103, 'accepted', '2025-09-01 10:00:00', '2025-09-02 09:30:00'),

-- Thesis 2: active (members 101 and 146 → must be accepted)
(2, 101, 'accepted', '2025-09-01 11:00:00', '2025-09-01 15:45:00'),
(2, 146, 'accepted', '2025-09-01 11:00:00', '2025-09-01 16:10:00'),

-- Thesis 3: under-review (members 101 and 146 → must be accepted)
(3, 101, 'accepted', '2025-09-02 12:15:00', '2025-09-02 13:45:00'),
(3, 146, 'accepted', '2025-09-02 12:15:00', '2025-09-02 14:05:00'),

-- Thesis 4: completed (members 102 and 103 → must be accepted)
(4, 102, 'accepted', '2025-08-30 09:00:00', '2025-08-30 10:30:00'),
(4, 103, 'accepted', '2025-08-30 09:00:00', '2025-08-30 11:00:00'),

-- Thesis 5: canceled (members 103 and 146 → must be accepted)
(5, 103, 'accepted', '2025-08-29 14:20:00', '2025-08-29 15:15:00'),
(5, 146, 'accepted', '2025-08-29 14:20:00', '2025-08-29 15:40:00'),

-- Thesis 5: canceled (members 103 and 146 → must be accepted)
(6, 103, 'accepted', '2025-08-29 14:20:00', '2025-08-29 15:15:00'),
(6, 101, 'pending', '2025-08-29 14:20:00', NULL);